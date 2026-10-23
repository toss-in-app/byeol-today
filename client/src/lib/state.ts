/**
 * 기기 저장 상태 (계약: contract/state.schema.json).
 *  - zodiac.mine.v1     내 별자리 최대 5개(별자리 id·이름표·등록 시각). 생일·태어난 해는 저장하지 않아요.
 *  - zodiac.settings.v1 알림 상태, 전면 광고 마지막 날짜, 리워드로 연 것, 본 콘텐츠 버전, 처음 연 시각.
 * 모양이 다르면 빈 값으로 시작해요(흐름 문서 '실패·예외').
 */
import { isSignId, type SignId } from '../sky';
import { readJson, writeJson } from './storage';

export const MINE_KEY = 'zodiac.mine.v1';
export const SETTINGS_KEY = 'zodiac.settings.v1';
export const MAX_MINE = 5;
export const LABEL_MAX = 8;
/** 이름표 추천(찾기 화면·등록 시트의 칩). '직접 입력'은 따로 */
export const LABEL_PRESETS = ['나', '엄마', '아빠', '친구'] as const;

export interface MineItem {
  id: string;
  sign: SignId;
  /** 1~8자, 없으면 null */
  label: string | null;
  addedAt: number;
}

export interface MineState {
  version: 1;
  items: MineItem[];
}

export type NotificationState = 'unknown' | 'agreed' | 'declined';

export interface DayUnlock {
  date: string | null;
  keys: string[];
}

export interface SettingsState {
  version: 1;
  notification: NotificationState;
  ads: { lastInterstitialDate: string | null };
  unlocks: { tomorrow: DayUnlock; matchDetail: DayUnlock };
  seenContentVersion: number | null;
  firstOpenAt: number | null;
}

export const EMPTY_MINE: MineState = { version: 1, items: [] };

export function defaultSettings(): SettingsState {
  return {
    version: 1,
    notification: 'unknown',
    ads: { lastInterstitialDate: null },
    unlocks: { tomorrow: { date: null, keys: [] }, matchDetail: { date: null, keys: [] } },
    seenContentVersion: null,
    firstOpenAt: null,
  };
}

const ID_RE = /^[a-z0-9]{8,32}$/;
const DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

/** 이름표 정리: 앞뒤 공백을 빼고 8자까지. 비면 null */
export function normalizeLabel(raw: string | null | undefined): string | null {
  const text = (raw ?? '').trim();
  if (!text) return null;
  return [...text].slice(0, LABEL_MAX).join('');
}

function isMineItem(value: unknown): value is MineItem {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    ID_RE.test(v.id) &&
    isSignId(v.sign) &&
    (v.label === null || (typeof v.label === 'string' && v.label.length >= 1 && v.label.length <= LABEL_MAX)) &&
    typeof v.addedAt === 'number' &&
    Number.isInteger(v.addedAt) &&
    v.addedAt >= 0
  );
}

/** 저장된 값을 계약 모양으로. 조금이라도 다르면 빈 값(가짜로 고치지 않아요) */
export function normalizeMine(value: unknown): MineState {
  if (!value || typeof value !== 'object') return EMPTY_MINE;
  const v = value as Record<string, unknown>;
  if (v.version !== 1 || !Array.isArray(v.items) || v.items.length > MAX_MINE) return EMPTY_MINE;
  if (!v.items.every(isMineItem)) return EMPTY_MINE;
  const ids = new Set(v.items.map((item) => item.id));
  if (ids.size !== v.items.length) return EMPTY_MINE;
  return { version: 1, items: v.items.map((item) => ({ id: item.id, sign: item.sign, label: item.label, addedAt: item.addedAt })) };
}

function isDayUnlock(value: unknown): value is DayUnlock {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    (v.date === null || (typeof v.date === 'string' && DATE_RE.test(v.date))) &&
    Array.isArray(v.keys) &&
    v.keys.every((k) => typeof k === 'string' && /^[a-z]+(-[a-z]+)?$/.test(k))
  );
}

export function normalizeSettings(value: unknown): SettingsState {
  const fallback = defaultSettings();
  if (!value || typeof value !== 'object') return fallback;
  const v = value as Record<string, unknown>;
  if (v.version !== 1) return fallback;
  const ads = v.ads as Record<string, unknown> | undefined;
  const unlocks = v.unlocks as Record<string, unknown> | undefined;
  if (
    !(v.notification === 'unknown' || v.notification === 'agreed' || v.notification === 'declined') ||
    !ads ||
    !(ads.lastInterstitialDate === null || (typeof ads.lastInterstitialDate === 'string' && DATE_RE.test(ads.lastInterstitialDate))) ||
    !unlocks ||
    !isDayUnlock(unlocks.tomorrow) ||
    !isDayUnlock(unlocks.matchDetail) ||
    !(v.seenContentVersion === null || (typeof v.seenContentVersion === 'number' && Number.isInteger(v.seenContentVersion) && v.seenContentVersion >= 1)) ||
    !(v.firstOpenAt === null || (typeof v.firstOpenAt === 'number' && Number.isInteger(v.firstOpenAt) && v.firstOpenAt >= 0))
  ) {
    return fallback;
  }
  return {
    version: 1,
    notification: v.notification,
    ads: { lastInterstitialDate: ads.lastInterstitialDate as string | null },
    unlocks: {
      tomorrow: { date: unlocks.tomorrow.date, keys: [...unlocks.tomorrow.keys] },
      matchDetail: { date: unlocks.matchDetail.date, keys: [...unlocks.matchDetail.keys] },
    },
    seenContentVersion: v.seenContentVersion as number | null,
    firstOpenAt: v.firstOpenAt as number | null,
  };
}

/** 소문자·숫자 16자 id (계약 ^[a-z0-9]{8,32}$). 기기 안에서만 구분하면 돼요 */
export function newId(random: () => number = Math.random): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 16; i += 1) id += chars[Math.floor(random() * chars.length) % chars.length];
  return id;
}

export type AddMineResult = { ok: true; state: MineState; item: MineItem } | { ok: false; reason: 'full' };

/** 내 별자리 추가. 5개가 차 있으면 거절(찾기 화면이 안내해요). 같은 별자리도 이름표가 다르면 여러 번 가능 */
export function addMine(state: MineState, sign: SignId, label: string | null, now: number = Date.now(), id: string = newId()): AddMineResult {
  if (state.items.length >= MAX_MINE) return { ok: false, reason: 'full' };
  const item: MineItem = { id, sign, label: normalizeLabel(label), addedAt: now };
  return { ok: true, state: { version: 1, items: [...state.items, item] }, item };
}

export function removeMine(state: MineState, id: string): MineState {
  return { version: 1, items: state.items.filter((item) => item.id !== id) };
}

/** 홈·관리 화면에 보이는 한 줄 이름: '나 · 물병자리' 또는 '물병자리' */
export function mineTitle(item: MineItem, signName: string): string {
  return item.label ? `${item.label} · ${signName}` : signName;
}

export async function loadMine(): Promise<MineState> {
  return normalizeMine(await readJson(MINE_KEY));
}

export function saveMine(state: MineState): Promise<void> {
  return writeJson(MINE_KEY, state);
}

export async function loadSettings(): Promise<SettingsState> {
  return normalizeSettings(await readJson(SETTINGS_KEY));
}

export function saveSettings(state: SettingsState): Promise<void> {
  return writeJson(SETTINGS_KEY, state);
}
