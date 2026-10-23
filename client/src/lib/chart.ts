/**
 * 천체도(12칸 원형 차트) 기하 — 비주얼 '천체도'(steps/3-design/wireframes/byeol-today-visual-v2.md, 2026-10-23 시안 3 채택).
 * 화면 SVG(components/SkyChart)와 공유 카드 캔버스(lib/card)·OG·로고 스크립트가 같은 계산을 써요.
 * 1번 집(내 별자리)이 꼭대기, 시계 방향으로 2·3·…·12번 집. 달은 집 번호(houseOf)에 따라 그 칸 안에 표시해요.
 * 실제 하늘의 방향과는 달라요(도식) — 카드·설명에 '도식' 표시.
 */
import { SIGN_IDS, signIndex, type SignId } from '../sky';

export const SECTOR_DEG = 30;

/** 종이와 잉크 색 — 앱 화면은 TDS 라이트, 이 색은 카드·블록·아이콘·차트에만 */
export const PAPER = {
  paper: '#F3EEE3',
  paperDeep: '#E6DFCF',
  ink: '#1F2340',
  inkSoft: 'rgba(31, 35, 64, 0.55)',
  accent: '#B5453A',
  accentSoft: 'rgba(181, 69, 58, 0.16)',
  muted: '#6B6F7E',
} as const;

export interface Point {
  x: number;
  y: number;
}

/** 각도(도, 0 = 3시 방향, 시계 방향 +)의 점 */
export function polar(cx: number, cy: number, r: number, deg: number): Point {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** house(1~12) 칸의 가운데 각도 — 1번 집이 꼭대기(-90°) */
export function houseAngle(house: number): number {
  return -90 + (house - 1) * SECTOR_DEG;
}

/** 꼭대기 별자리(top)에서 house 번째 칸의 별자리 */
export function signAtHouse(top: SignId, house: number): SignId {
  return SIGN_IDS[(signIndex(top) + house - 1) % 12];
}

/** house 칸의 고리 조각(SVG path d). rOuter~rInner 사이 */
export function sectorPath(cx: number, cy: number, rOuter: number, rInner: number, house: number): string {
  const start = houseAngle(house) - SECTOR_DEG / 2;
  const end = start + SECTOR_DEG;
  const o1 = polar(cx, cy, rOuter, start);
  const o2 = polar(cx, cy, rOuter, end);
  const i1 = polar(cx, cy, rInner, end);
  const i2 = polar(cx, cy, rInner, start);
  const f = (n: number) => n.toFixed(2);
  return `M ${f(o1.x)} ${f(o1.y)} A ${rOuter} ${rOuter} 0 0 1 ${f(o2.x)} ${f(o2.y)} L ${f(i1.x)} ${f(i1.y)} A ${rInner} ${rInner} 0 0 0 ${f(i2.x)} ${f(i2.y)} Z`;
}

/** 12칸 경계선 양 끝점(꼭대기 칸의 왼쪽 경계부터 시계 방향) */
export function divisionLines(cx: number, cy: number, rOuter: number, rInner: number): [Point, Point][] {
  return Array.from({ length: 12 }, (_, i) => {
    const deg = houseAngle(i + 1) - SECTOR_DEG / 2;
    return [polar(cx, cy, rInner, deg), polar(cx, cy, rOuter, deg)];
  });
}

/** 눈금: step 도마다 rOuter 안쪽으로 len 만큼 */
export function ticks(cx: number, cy: number, rOuter: number, len: number, step = 10): [Point, Point][] {
  const out: [Point, Point][] = [];
  for (let deg = 0; deg < 360; deg += step) out.push([polar(cx, cy, rOuter, deg), polar(cx, cy, rOuter - len, deg)]);
  return out;
}

/** 12칸 글자 자리 — house 순서(1 = 꼭대기) */
export function houseLabelPoints(cx: number, cy: number, r: number): (Point & { house: number })[] {
  return Array.from({ length: 12 }, (_, i) => ({ ...polar(cx, cy, r, houseAngle(i + 1)), house: i + 1 }));
}

/** '사자자리' → '사자' (차트 칸 글자) */
export function shortName(name: string): string {
  return name.replace(/자리$/, '');
}
