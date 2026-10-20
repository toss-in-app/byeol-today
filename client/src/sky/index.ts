/**
 * 오늘 하늘 (계약: contract/sky.schema.json · sun-ingress.schema.json, 표는 scripts/build-sky.mjs 가 만들어요).
 *  - 오늘 칸: 한국 날짜로 표에서 찾아요(아침 8시의 달 별자리·머무는 날·모양·밝기)
 *  - 집: 내 별자리부터 세어 오늘 달이 몇 번째 별자리에 있는지(1~12) → 운세 문장을 골라요
 *  - 생일로 찾기: 해마다 태양이 별자리에 들어온 시각으로 정확히, 해를 모르면 경계일은 두 별자리 중 고르게
 */
import type { Content } from '../content';
import skyJson from './sky.json';
import ingressJson from './sun-ingress.json';

export const SIGN_IDS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;
export type SignId = (typeof SIGN_IDS)[number];
export type Transit = 'enter' | 'stay' | 'leave';
export type PhaseId =
  | 'new'
  | 'waxing-crescent'
  | 'first-quarter'
  | 'waxing-gibbous'
  | 'full'
  | 'waning-gibbous'
  | 'last-quarter'
  | 'waning-crescent';

export interface SkyDay {
  date: string;
  moon: SignId;
  transit: Transit;
  phase: PhaseId;
  illumination: number;
  nextSign?: SignId;
  changeAt?: string;
}

interface SkyTable {
  from: string;
  to: string;
  days: SkyDay[];
}

interface IngressEvent {
  sign: SignId;
  /** 'MM-DDTHH:MM' 한국 시간 */
  at: string;
}

const table = skyJson as unknown as SkyTable;
const byDate = new Map(table.days.map((day) => [day.date, day]));
const ingress = (ingressJson as unknown as { years: Record<string, IngressEvent[]> }).years;

export const SKY_RANGE = { from: table.from, to: table.to };

export function isSignId(value: unknown): value is SignId {
  return typeof value === 'string' && (SIGN_IDS as readonly string[]).includes(value);
}

export function signIndex(sign: SignId): number {
  return SIGN_IDS.indexOf(sign);
}

const nextSign = (sign: SignId): SignId => SIGN_IDS[(signIndex(sign) + 1) % 12];
const prevSign = (sign: SignId): SignId => SIGN_IDS[(signIndex(sign) + 11) % 12];

/** 그날(한국 날짜)의 하늘. 표 밖이면 null — 가짜 하늘로 채우지 않아요 */
export function skyDay(dateKey: string): SkyDay | null {
  return byDate.get(dateKey) ?? null;
}

/** 내 별자리부터 세어 오늘 달이 몇 번째 별자리에 있는지 (1~12) */
export function houseOf(sign: SignId, moon: SignId): number {
  return ((signIndex(moon) - signIndex(sign) + 12) % 12) + 1;
}

export interface Reading {
  house: number;
  transit: Transit;
  total: string;
  love: string;
  work: string;
  money: string;
  phaseLine: string;
}

export function readingFor(content: Content, sign: SignId, day: SkyDay): Reading {
  const house = houseOf(sign, day.moon);
  const r = content.readings[String(house)];
  return {
    house,
    transit: day.transit,
    total: r.total[day.transit],
    love: r.love[day.transit],
    work: r.work[day.transit],
    money: r.money[day.transit],
    phaseLine: content.phases.find((p) => p.id === day.phase)?.line ?? '',
  };
}

export type FindResult =
  | { kind: 'one'; sign: SignId }
  /** 경계일: 해를 모르면 해에 따라, 해를 알면 태어난 시각(changeAt 전·뒤)에 따라 갈려요 */
  | { kind: 'cusp'; signs: [SignId, SignId]; changeAt?: string }
  | { kind: 'invalid' };

const pad = (n: number) => String(n).padStart(2, '0');
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

function signOnDate(year: number, md: string): { sign: SignId } | { cusp: [SignId, SignId]; changeAt: string } {
  const events = ingress[String(year)];
  const sameDay = events.find((e) => e.at.slice(0, 5) === md);
  if (sameDay) return { cusp: [prevSign(sameDay.sign), sameDay.sign], changeAt: sameDay.at.slice(6) };
  let current: SignId = 'capricorn'; // 1월 초(물병자리 전)는 전해 12월에 들어온 염소자리
  for (const e of events) if (e.at.slice(0, 5) < md) current = e.sign;
  return { sign: current };
}

/** 생일(월·일, 태어난 해는 선택)로 별자리 찾기. 생일은 저장하지 않아요 */
export function findSign(month: number, day: number, year?: number): FindResult {
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1) return { kind: 'invalid' };
  const maxDay = month === 2 ? (year === undefined || isLeap(year) ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;
  if (day > maxDay) return { kind: 'invalid' };
  const md = `${pad(month)}-${pad(day)}`;

  if (year !== undefined && ingress[String(year)]) {
    const r = signOnDate(year, md);
    return 'sign' in r ? { kind: 'one', sign: r.sign } : { kind: 'cusp', signs: r.cusp, changeAt: r.changeAt };
  }

  // 해를 모르거나 표 밖(1930~2030 밖)이면 모든 해를 겹쳐 봐요
  const seen = new Set<SignId>();
  for (const y of Object.keys(ingress).map(Number)) {
    if (md === '02-29' && !isLeap(y)) continue;
    const r = signOnDate(y, md);
    if ('sign' in r) seen.add(r.sign);
    else r.cusp.forEach((s) => seen.add(s));
  }
  const signs = [...seen];
  if (signs.length === 1) return { kind: 'one', sign: signs[0] };
  if (signs.length === 2) {
    const [a, b] = signs;
    return { kind: 'cusp', signs: nextSign(a) === b ? [a, b] : [b, a] };
  }
  return { kind: 'invalid' };
}
