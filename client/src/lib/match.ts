/**
 * 별자리 궁합(주요 기능 3): 두 별자리의 원소 짝(10가지) + 오늘 달의 원소 한 줄. 콘텐츠 계약 content.match.
 * 자세히(detail)는 리워드 광고로 그날만 열려요 — settings.unlocks.matchDetail(계약: 'aries-leo' 처럼 이름 순 쌍).
 */
import { signInfo, type Content, type Element } from '../content';
import type { DayUnlock, SettingsState } from './state';
import type { SignId } from '../sky';

/** 콘텐츠의 쌍 키 순서(fire-earth, fire-air … air-water) */
const ELEMENT_ORDER: Element[] = ['fire', 'earth', 'air', 'water'];
const ELEMENT_NAME: Record<Element, string> = { fire: '불', earth: '흙', air: '공기', water: '물' };

export function elementOf(content: Content, sign: SignId): Element {
  return signInfo(content, sign).element;
}

export function elementName(element: Element): string {
  return ELEMENT_NAME[element];
}

/** 'air' × 'fire' → 'fire-air' (콘텐츠 키 순서) */
export function pairKey(a: Element, b: Element): string {
  const [x, y] = [a, b].sort((p, q) => ELEMENT_ORDER.indexOf(p) - ELEMENT_ORDER.indexOf(q));
  return `${x}-${y}`;
}

export interface MatchResult {
  key: string;
  elements: [Element, Element];
  summary: string;
  detail: string;
}

export function matchFor(content: Content, a: SignId, b: SignId): MatchResult {
  const ea = elementOf(content, a);
  const eb = elementOf(content, b);
  const key = pairKey(ea, eb);
  const pair = content.match.pairs[key] ?? { summary: '', detail: '' };
  return { key, elements: [ea, eb], summary: pair.summary, detail: pair.detail };
}

/** 오늘 달이 있는 별자리의 원소로 고른 한 줄 */
export function todayMatchLine(content: Content, moon: SignId): string {
  return content.match.today[elementOf(content, moon)] ?? '';
}

/** 리워드로 연 쌍의 키 — 별자리 id 이름 순(계약 state.schema dayUnlock) */
export function matchUnlockKey(a: SignId, b: SignId): string {
  return [a, b].sort().join('-');
}

function todayKeys(unlock: DayUnlock, today: string): string[] {
  return unlock.date === today ? unlock.keys : [];
}

export function isMatchDetailUnlocked(settings: SettingsState, today: string, a: SignId, b: SignId): boolean {
  return todayKeys(settings.unlocks.matchDetail, today).includes(matchUnlockKey(a, b));
}

/** 그날 열린 쌍에 추가(날이 바뀌면 이전 목록은 버려요) */
export function withMatchDetailUnlocked(settings: SettingsState, today: string, a: SignId, b: SignId): SettingsState {
  const key = matchUnlockKey(a, b);
  const keys = todayKeys(settings.unlocks.matchDetail, today);
  if (keys.includes(key)) return settings;
  return { ...settings, unlocks: { ...settings.unlocks, matchDetail: { date: today, keys: [...keys, key] } } };
}
