/**
 * 콘텐츠(계약: contract/content.schema.json).
 * 번들 동봉본(bundled.json)으로 즉시 그리고, 원격 content.json 은 하루 한 번 ETag 로 물어요(hooks/useContent).
 * 원격이 실패하거나 형식이 다르거나 minClientVersion 이 이 클라보다 크면 번들본을 써요.
 */
import { withTimeout } from '../lib/async';
import type { PhaseId, SignId, Transit } from '../sky';
import bundledJson from './bundled.json';

export const STATIC_BASE_URL = 'https://toss-in-app.github.io/byeol-today';
export const CONTENT_URL = `${STATIC_BASE_URL}/content.json`;
export const TERMS_URL = `${STATIC_BASE_URL}/terms/`;
export const PRIVACY_URL = `${STATIC_BASE_URL}/privacy/`;
/** 공유 링크 미리보기 이미지 1200×600 (9단계에 제작·배포) */
export const OG_IMAGE_URL = `${STATIC_BASE_URL}/og.png`;
/** 오늘 하늘 표 연장분(해마다 하나) */
export const skyUrl = (year: number): string => `${STATIC_BASE_URL}/sky-${year}.json`;
const FETCH_TIMEOUT_MS = 3000;

export type Area = 'total' | 'love' | 'work' | 'money';
export type Element = 'fire' | 'earth' | 'air' | 'water';

export interface ContentSign {
  id: SignId;
  name: string;
  dates: string;
  element: Element;
  trait: string;
}

export interface ContentHouse {
  n: number;
  name: string;
  theme: string;
}

export type HouseReadings = Record<Area, Record<Transit, string>>;

export interface ContentPhase {
  id: PhaseId;
  name: string;
  line: string;
}

export interface Content {
  contentVersion: number;
  minClientVersion: string;
  updatedAt: string;
  notice: string | null;
  signs: ContentSign[];
  houses: ContentHouse[];
  readings: Record<string, HouseReadings>;
  phases: ContentPhase[];
  lucky: { colors: string[]; items: string[] };
  match: { pairs: Record<string, { summary: string; detail: string }>; today: Record<Element, string> };
  sky: { intro: string; houses: string; phase: string; boundary: string; basis: string };
}

export const bundledContent = bundledJson as unknown as Content;

/** '1.2.0' 과 '1.10.0' 비교 — a 가 크면 양수 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** 원격 콘텐츠를 믿고 써도 되는지(자세한 검증은 빌드 스크립트·계약 테스트가 해요) */
export function isUsableContent(json: unknown, clientVersion: string): json is Content {
  if (!json || typeof json !== 'object') return false;
  const c = json as Partial<Content>;
  if (typeof c.contentVersion !== 'number' || typeof c.minClientVersion !== 'string') return false;
  if (compareVersions(c.minClientVersion, clientVersion) > 0) return false;
  if (!Array.isArray(c.signs) || c.signs.length !== 12) return false;
  if (!Array.isArray(c.houses) || c.houses.length !== 12) return false;
  if (!c.readings || typeof c.readings !== 'object') return false;
  for (let house = 1; house <= 12; house += 1) {
    const r = c.readings[String(house)];
    if (!r) return false;
    for (const area of ['total', 'love', 'work', 'money'] as const) {
      const byDay = r[area];
      if (!byDay || typeof byDay.enter !== 'string' || typeof byDay.stay !== 'string' || typeof byDay.leave !== 'string') return false;
    }
  }
  if (!Array.isArray(c.phases) || c.phases.length !== 8) return false;
  if (!c.match || typeof c.match !== 'object' || !c.match.pairs || !c.match.today) return false;
  if (!c.sky || typeof c.sky.intro !== 'string') return false;
  return c.notice === null || typeof c.notice === 'string';
}

export type RemoteContentResult = { status: 'ok'; content: Content; etag: string | null } | { status: 'notModified' } | { status: 'failed' };

/**
 * 원격 content.json 을 받아요. etag 가 있으면 If-None-Match 로 물어 304 면 'notModified'.
 * 네트워크·시간 초과·404·형식 오류·minClientVersion 초과는 모두 'failed'(호출한 쪽은 지금 것을 그대로 써요).
 */
export async function fetchRemoteContent(clientVersion: string = __APP_VERSION__, etag: string | null = null): Promise<RemoteContentResult> {
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (etag) headers['If-None-Match'] = etag;
    const response = await withTimeout(fetch(CONTENT_URL, { headers }), FETCH_TIMEOUT_MS);
    if (response.status === 304) return { status: 'notModified' };
    if (!response.ok) return { status: 'failed' };
    const json: unknown = await response.json();
    if (!isUsableContent(json, clientVersion)) return { status: 'failed' };
    return { status: 'ok', content: json, etag: response.headers.get('ETag') };
  } catch {
    return { status: 'failed' };
  }
}

export function signInfo(content: Content, id: SignId): ContentSign {
  return content.signs.find((s) => s.id === id) ?? content.signs[0];
}
