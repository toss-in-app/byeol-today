import type { HTMLAttributes } from 'react';

import { NIGHT } from '../lib/constellations';

/** 바탕에 흩어진 작은 별(꾸밈). 위치는 % 라 블록 크기와 무관해요 */
const FIELD: [x: number, y: number, r: number, a: number][] = [
  [6, 18, 1.2, 0.6],
  [15, 72, 0.9, 0.45],
  [24, 10, 0.9, 0.5],
  [33, 88, 1.1, 0.45],
  [41, 30, 1.3, 0.65],
  [52, 8, 0.9, 0.5],
  [58, 62, 1.0, 0.4],
  [66, 20, 1.4, 0.7],
  [73, 84, 0.9, 0.45],
  [81, 44, 1.1, 0.55],
  [88, 12, 1.0, 0.5],
  [94, 70, 1.3, 0.6],
  [47, 95, 0.8, 0.35],
  [97, 32, 0.8, 0.4],
];

/** 밤하늘 블록 — 홈 '오늘 하늘'·별자리 자세히 머리에 쓰는 짙은 남색 둥근 상자. 안의 글은 NIGHT.star·NIGHT.muted 로 */
export function NightBlock({ children, style, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section {...rest} style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, background: NIGHT.sky, color: NIGHT.star, ...style }}>
      <svg aria-hidden width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {FIELD.map(([x, y, r, a], i) => (
          <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill={NIGHT.star} opacity={a} />
        ))}
      </svg>
      <div style={{ position: 'relative' }}>{children}</div>
    </section>
  );
}
