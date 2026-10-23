/**
 * 오늘 하늘 표 연장(계약 sky.schema · state.schema v2 `zodiac.sky.v1`): 번들 표 범위 밖 날짜가 되면 `sky-YYYY.json` 을 받아 표에 덧붙여요.
 * 캐시에 있으면 네트워크 없이 바로. 모양이 다르면 버려요 — 가짜 하늘로 채우지 않아요.
 */
import { skyUrl } from '../content';
import { withTimeout } from '../lib/async';
import { readJson, writeJson } from '../lib/storage';
import { extendSkyTable, isSignId, skyDay, type SkyDay } from '.';

export const SKY_CACHE_KEY = 'zodiac.sky.v1';
const FETCH_TIMEOUT_MS = 3000;
const PHASES = new Set(['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 'full', 'waning-gibbous', 'last-quarter', 'waning-crescent']);
const DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const HM_RE = /^[0-9]{2}:[0-9]{2}$/;

interface SkyTableJson {
  version: 1;
  days: SkyDay[];
}

function isSkyDay(value: unknown): value is SkyDay {
  if (!value || typeof value !== 'object') return false;
  const d = value as Record<string, unknown>;
  return (
    typeof d.date === 'string' &&
    DATE_RE.test(d.date) &&
    isSignId(d.moon) &&
    (d.transit === 'enter' || d.transit === 'stay' || d.transit === 'leave') &&
    typeof d.phase === 'string' &&
    PHASES.has(d.phase) &&
    typeof d.illumination === 'number' &&
    (d.nextSign === undefined || isSignId(d.nextSign)) &&
    (d.changeAt === undefined || (typeof d.changeAt === 'string' && HM_RE.test(d.changeAt)))
  );
}

/** sky-YYYY.json 모양인지 (전체 스키마는 빌드 스크립트가, 여기서는 클라가 기대는 것만) */
export function isSkyTable(value: unknown): value is SkyTableJson {
  if (!value || typeof value !== 'object') return false;
  const t = value as Record<string, unknown>;
  return t.version === 1 && Array.isArray(t.days) && t.days.length > 0 && t.days.every(isSkyDay);
}

interface SkyCache {
  version: 1;
  tables: Record<string, SkyTableJson>;
}

function normalizeSkyCache(value: unknown): SkyCache {
  const empty: SkyCache = { version: 1, tables: {} };
  if (!value || typeof value !== 'object') return empty;
  const v = value as Record<string, unknown>;
  if (v.version !== 1 || !v.tables || typeof v.tables !== 'object') return empty;
  const tables: Record<string, SkyTableJson> = {};
  for (const [year, table] of Object.entries(v.tables as Record<string, unknown>)) if (/^[0-9]{4}$/.test(year) && isSkyTable(table)) tables[year] = table;
  return { version: 1, tables };
}

export async function fetchSkyTable(year: number): Promise<SkyTableJson | null> {
  try {
    const response = await withTimeout(fetch(skyUrl(year), { headers: { Accept: 'application/json' } }), FETCH_TIMEOUT_MS);
    if (!response.ok) return null;
    const json: unknown = await response.json();
    return isSkyTable(json) ? json : null;
  } catch {
    return null;
  }
}

/**
 * 오늘이 표에 없으면 그 해의 연장분을 캐시 → 네트워크 순으로 찾아 표에 덧붙여요. 덧붙였으면 true.
 * 표에 이미 있으면 아무것도 하지 않아요(번들 표가 보통 1~2년 치라 거의 안 불려요).
 */
export async function ensureSkyFor(dateKey: string): Promise<boolean> {
  if (skyDay(dateKey)) return false;
  const year = dateKey.slice(0, 4);
  const cache = normalizeSkyCache(await readJson(SKY_CACHE_KEY));
  let table: SkyTableJson | null = cache.tables[year] ?? null;
  if (!table) {
    table = await fetchSkyTable(Number(year));
    if (!table) return false;
    await writeJson(SKY_CACHE_KEY, { version: 1, tables: { ...cache.tables, [year]: table } });
  }
  extendSkyTable(table.days);
  return skyDay(dateKey) !== null;
}
