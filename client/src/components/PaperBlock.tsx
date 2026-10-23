import type { HTMLAttributes } from 'react';

import { PAPER } from '../lib/chart';

/** 종이 블록 — 홈 '오늘 하늘'·별자리 자세히 머리에 쓰는 미색 둥근 상자(비주얼 '천체도'). 안의 글은 PAPER.ink·PAPER.muted 로 */
export function PaperBlock({ children, style, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section {...rest} style={{ position: 'relative', borderRadius: 18, background: PAPER.paper, color: PAPER.ink, border: '1px solid rgba(31, 35, 64, 0.16)', ...style }}>
      {children}
    </section>
  );
}
