import { PAPER } from '../lib/chart';
import { NIGHT } from '../lib/constellations';
import { isWaxing, moonLitPath } from '../lib/moon';
import type { PhaseId } from '../sky';

/**
 * 오늘 달 모양(꾸밈 — 이름·밝기는 옆 글에 있어요).
 * ink = 종이 위 잉크(기본, 비주얼 '천체도'): 잉크 테두리 + 밝은 부분을 잉크로 채움. night = 어두운 바탕 위 금색.
 */
export function MoonIcon({ illumination, phase, size = 32, tone = 'ink' }: { illumination: number; phase: PhaseId; size?: number; tone?: 'ink' | 'night' }) {
  const r = size / 2 - 1.5;
  const c = size / 2;
  const d = moonLitPath(illumination, isWaxing(phase), r, c, c);
  return (
    <svg aria-hidden viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', flex: 'none' }}>
      {tone === 'ink' ? (
        <>
          <circle cx={c} cy={c} r={r} fill="none" stroke={PAPER.ink} strokeWidth={1.2} />
          <path d={d} fill={PAPER.ink} />
        </>
      ) : (
        <>
          <circle cx={c} cy={c} r={r} fill="rgba(243, 241, 232, 0.16)" />
          <path d={d} fill={NIGHT.gold} />
        </>
      )}
    </svg>
  );
}
