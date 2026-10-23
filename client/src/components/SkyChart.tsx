import type { CSSProperties } from 'react';

import { divisionLines, houseAngle, houseLabelPoints, PAPER, polar, sectorPath, shortName, signAtHouse, ticks } from '../lib/chart';
import { houseOf, type SignId } from '../sky';

export const SERIF_FONT = '"Noto Serif KR", "Apple SD Gothic Neo", serif';

export interface SkyChartProps {
  /** 꼭대기(1번 집) 별자리 — 자세히·카드에선 내 별자리, 홈에선 양자리 */
  top: SignId;
  /** 오늘 달이 있는 별자리 → houseOf(top, moon) 칸에 표시 */
  moon: SignId;
  /** 별자리 id → 이름('사자자리'). 칸 글자는 '자리'를 뗀 것 */
  nameOf: (id: SignId) => string;
  /** 한 변(px) */
  size?: number;
  /** 12칸 글자를 보일지(작으면 끔) */
  labels?: boolean;
  /** 꼭대기 칸을 붉게 칠할지(내 별자리 표시) */
  highlightTop?: boolean;
  /** 가운데 글자(큰 것·작은 것) */
  center?: { title?: string; sub?: string };
  /** 있으면 role="img" 로 읽히고, 없으면 꾸밈 */
  label?: string;
  style?: CSSProperties;
}

const C = 160;
const R_OUTER = 140;
const R_INNER = 112;
const R_CENTER = 60;
const R_LABEL = 126;
const R_MOON = 86;

/** 천체도 — 12칸 고리 + 눈금 + 달 표시. 자료 계산은 lib/chart(카드와 공유) */
export function SkyChart({ top, moon, nameOf, size = 120, labels = size >= 200, highlightTop = true, center, label, style }: SkyChartProps) {
  const house = houseOf(top, moon);
  const moonAt = polar(C, C, R_MOON, houseAngle(house));
  const moonLabel = polar(C, C, R_MOON + 20, houseAngle(house) + 14);
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  const compact = size < 100;
  return (
    <svg {...a11y} viewBox="0 0 320 320" width={size} height={size} style={{ display: 'block', flex: 'none', fontFamily: SERIF_FONT, ...style }}>
      <circle cx={C} cy={C} r={R_OUTER} fill="none" stroke={PAPER.ink} strokeWidth={compact ? 2.4 : 1.2} />
      <circle cx={C} cy={C} r={R_INNER} fill="none" stroke={PAPER.ink} strokeWidth={compact ? 1.6 : 0.9} />
      {compact ? null : <circle cx={C} cy={C} r={R_CENTER} fill="none" stroke={PAPER.ink} strokeWidth={0.7} opacity={0.6} />}
      {highlightTop ? <path d={sectorPath(C, C, R_OUTER, R_INNER, 1)} fill={PAPER.accentSoft} /> : null}
      {divisionLines(C, C, R_OUTER, R_INNER).map(([a, b], i) => (
        <line key={`d${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={PAPER.ink} strokeWidth={compact ? 1.6 : 0.9} />
      ))}
      {compact
        ? null
        : ticks(C, C, R_OUTER - 2, 5).map(([a, b], i) => <line key={`t${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={PAPER.ink} strokeWidth={0.8} opacity={0.7} />)}
      {labels
        ? houseLabelPoints(C, C, R_LABEL).map((p) => (
            <text key={p.house} x={p.x} y={p.y} fontSize={11} fontWeight={p.house === 1 ? 600 : 400} fill={p.house === 1 ? PAPER.accent : PAPER.ink} textAnchor="middle" dominantBaseline="middle">
              {shortName(nameOf(signAtHouse(top, p.house)))}
            </text>
          ))
        : null}
      <line x1={C} y1={C} x2={moonAt.x} y2={moonAt.y} stroke={PAPER.accent} strokeWidth={compact ? 1.8 : 0.9} strokeDasharray={compact ? '3 3' : '2 3'} opacity={0.85} />
      <circle cx={moonAt.x} cy={moonAt.y} r={compact ? 14 : 10} fill="none" stroke={PAPER.accent} strokeWidth={compact ? 2.4 : 1} />
      <circle cx={moonAt.x} cy={moonAt.y} r={compact ? 7 : 5} fill={PAPER.ink} />
      {compact || !labels ? null : (
        <text x={moonLabel.x} y={moonLabel.y} fontSize={9} fill={PAPER.accent} textAnchor="middle" dominantBaseline="middle">
          달
        </text>
      )}
      {center?.title ? (
        <text x={C} y={center.sub ? C - 6 : C} fontSize={compact ? 64 : 15} fontWeight={600} fill={PAPER.ink} textAnchor="middle" dominantBaseline="middle">
          {center.title}
        </text>
      ) : null}
      {center?.sub && !compact ? (
        <text x={C} y={C + 13} fontSize={8.5} fill={PAPER.muted} textAnchor="middle" dominantBaseline="middle">
          {center.sub}
        </text>
      ) : null}
    </svg>
  );
}
