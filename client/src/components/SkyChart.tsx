import type { CSSProperties, KeyboardEvent } from 'react';

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
  /** 뜰 때 움직임(고리가 그려지고 달이 꼭대기에서 제 칸까지 돌아감). 기본 켬, 줄이기 설정이면 CSS 가 끔 */
  animate?: boolean;
  /** 달 고리의 맥동(천천히 커지며 옅어지는 고리, 반복). 기본 켬 */
  pulse?: boolean;
  /** 있으면 12칸이 눌러지고(천체도 시트), 고른 칸에 테두리 */
  onSelectHouse?: (house: number) => void;
  selectedHouse?: number;
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
const OUTER_LEN = Math.round(2 * Math.PI * R_OUTER);
const INNER_LEN = Math.round(2 * Math.PI * R_INNER);

/** 천체도 — 12칸 고리 + 눈금 + 달 표시. 자료 계산은 lib/chart(카드와 공유) */
export function SkyChart({ top, moon, nameOf, size = 120, labels = size >= 200, highlightTop = true, center, animate = true, pulse = true, onSelectHouse, selectedHouse, label, style }: SkyChartProps) {
  const house = houseOf(top, moon);
  const moonLabel = polar(C, C, R_MOON + 20, houseAngle(house) + 14);
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  const compact = size < 100;
  const fade = (delay: number): { className?: string; style?: CSSProperties } => (animate ? { className: 'byeol-fade', style: { animationDelay: `${delay}ms` } } : {});
  const draw = (len: number, delay: number): { className?: string; style?: CSSProperties } =>
    animate ? { className: 'byeol-draw', style: { '--len': len, animationDelay: `${delay}ms` } as CSSProperties } : {};
  const pressKey = (h: number) => (e: KeyboardEvent<SVGPathElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectHouse?.(h);
    }
  };
  return (
    <svg {...a11y} viewBox="0 0 320 320" width={size} height={size} style={{ display: 'block', flex: 'none', fontFamily: SERIF_FONT, overflow: 'visible', ...style }}>
      <circle cx={C} cy={C} r={R_OUTER} fill="none" stroke={PAPER.ink} strokeWidth={compact ? 2.4 : 1.2} strokeDasharray={OUTER_LEN} {...draw(OUTER_LEN, 0)} />
      <circle cx={C} cy={C} r={R_INNER} fill="none" stroke={PAPER.ink} strokeWidth={compact ? 1.6 : 0.9} strokeDasharray={INNER_LEN} {...draw(INNER_LEN, 120)} />
      {compact ? null : <circle cx={C} cy={C} r={R_CENTER} fill="none" stroke={PAPER.ink} strokeWidth={0.7} opacity={0.6} {...fade(400)} />}
      {highlightTop ? <path d={sectorPath(C, C, R_OUTER, R_INNER, 1)} fill={PAPER.accentSoft} {...fade(250)} /> : null}
      {divisionLines(C, C, R_OUTER, R_INNER).map(([a, b], i) => (
        <line key={`d${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={PAPER.ink} strokeWidth={compact ? 1.6 : 0.9} {...fade(150 + i * 35)} />
      ))}
      {compact
        ? null
        : ticks(C, C, R_OUTER - 2, 5).map(([a, b], i) => (
            <line key={`t${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={PAPER.ink} strokeWidth={0.8} opacity={0.7} {...fade(300 + i * 8)} />
          ))}
      {labels
        ? houseLabelPoints(C, C, R_LABEL).map((p) => (
            <text key={p.house} x={p.x} y={p.y} fontSize={11} fontWeight={p.house === 1 ? 600 : 400} fill={p.house === 1 ? PAPER.accent : PAPER.ink} textAnchor="middle" dominantBaseline="middle" {...fade(500 + p.house * 30)}>
              {shortName(nameOf(signAtHouse(top, p.house)))}
            </text>
          ))
        : null}
      {/* 달: 꼭대기(1번 집)에서 제 칸까지 시계 방향으로 돌아가요 — 그룹을 돌려서 점선·고리·점이 같이 움직임 */}
      <g className={animate ? 'byeol-sweep' : undefined} style={{ transform: `rotate(${houseAngle(house) + 90}deg)`, transformOrigin: `${C}px ${C}px`, animationDelay: animate ? '350ms' : undefined }}>
        <line x1={C} y1={C} x2={C} y2={C - R_MOON} stroke={PAPER.accent} strokeWidth={compact ? 1.8 : 0.9} strokeDasharray={compact ? '3 3' : '2 3'} opacity={0.85} />
        {pulse ? (
          <circle className="byeol-pulse" cx={C} cy={C - R_MOON} r={compact ? 14 : 10} fill="none" stroke={PAPER.accent} strokeWidth={compact ? 2 : 1} style={{ animationDelay: animate ? '1300ms' : '0ms' }} />
        ) : null}
        <circle cx={C} cy={C - R_MOON} r={compact ? 14 : 10} fill="none" stroke={PAPER.accent} strokeWidth={compact ? 2.4 : 1} />
        <circle cx={C} cy={C - R_MOON} r={compact ? 7 : 5} fill={PAPER.ink} />
      </g>
      {compact || !labels ? null : (
        <text x={moonLabel.x} y={moonLabel.y} fontSize={9} fill={PAPER.accent} textAnchor="middle" dominantBaseline="middle" {...fade(1150)}>
          달
        </text>
      )}
      {center?.title ? (
        <text x={C} y={center.sub ? C - 6 : C} fontSize={compact ? 64 : 15} fontWeight={600} fill={PAPER.ink} textAnchor="middle" dominantBaseline="middle" {...fade(1000)}>
          {center.title}
        </text>
      ) : null}
      {center?.sub && !compact ? (
        <text x={C} y={C + 13} fontSize={8.5} fill={PAPER.muted} textAnchor="middle" dominantBaseline="middle" {...fade(1000)}>
          {center.sub}
        </text>
      ) : null}
      {onSelectHouse
        ? Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <path
              key={`s${h}`}
              className="byeol-sector"
              role="button"
              tabIndex={0}
              aria-label={`${h}번째 집 ${nameOf(signAtHouse(top, h))}`}
              aria-pressed={selectedHouse === h}
              d={sectorPath(C, C, R_OUTER, R_INNER, h)}
              fill="transparent"
              stroke={selectedHouse === h ? PAPER.accent : 'none'}
              strokeWidth={2}
              onClick={() => onSelectHouse(h)}
              onKeyDown={pressKey(h)}
            />
          ))
        : null}
    </svg>
  );
}
