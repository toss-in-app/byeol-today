import type { CSSProperties } from 'react';

import { CONSTELLATIONS, NIGHT, starRadiusPx } from '../lib/constellations';
import type { SignId } from '../sky';

export interface SignGlyphProps {
  sign: SignId;
  /** 한 변(px) */
  size?: number;
  /** night = 어두운 바탕 위(기본), ink = 흰 바탕 위 */
  tone?: 'night' | 'ink';
  /** 있으면 role="img" 로 읽히고, 없으면 꾸밈(aria-hidden) */
  label?: string;
  style?: CSSProperties;
}

const TONES = {
  night: { star: NIGHT.star, line: 'rgba(232, 197, 106, 0.8)', bright: NIGHT.gold, glow: 'rgba(232, 197, 106, 0.22)' },
  ink: { star: NIGHT.sky, line: 'rgba(11, 16, 38, 0.5)', bright: '#9A7B2E', glow: 'rgba(154, 123, 46, 0.18)' },
} as const;

/** 별자리 선 그림(SVG). 자료는 lib/constellations, 카드(lib/card)도 같은 자료로 그려요 */
export function SignGlyph({ sign, size = 40, tone = 'night', label, style }: SignGlyphProps) {
  const { stars, lines } = CONSTELLATIONS[sign];
  const t = TONES[tone];
  const unit = 100 / size; // px → viewBox 단위
  const strokeWidth = size < 60 ? 1 : 1.4;
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  return (
    <svg {...a11y} viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block', flex: 'none', ...style }}>
      {lines.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]} stroke={t.line} strokeWidth={strokeWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      ))}
      {stars.map(([x, y, mag], i) => {
        const r = starRadiusPx(mag, size) * unit;
        return mag === 3 ? (
          <g key={i}>
            <circle cx={x} cy={y} r={r * 2.4} fill={t.glow} />
            <circle cx={x} cy={y} r={r} fill={t.bright} />
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r={r} fill={t.star} />
        );
      })}
    </svg>
  );
}

/** 목록 왼쪽용: 남색 원 안의 선 그림(꾸밈 — 이름은 옆 글에 있어요) */
export function SignIcon({ sign, size = 40 }: { sign: SignId; size?: number }) {
  return (
    <span aria-hidden style={{ display: 'inline-flex', width: size, height: size, borderRadius: '50%', background: NIGHT.sky, alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <SignGlyph sign={sign} size={Math.round(size * 0.68)} />
    </span>
  );
}
