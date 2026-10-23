import { NIGHT } from '../lib/constellations';
import { isWaxing, moonLitPath } from '../lib/moon';
import type { PhaseId } from '../sky';

/** 오늘 달 모양(꾸밈 — 이름·밝기는 옆 글에 있어요). 어두운 바탕 위에서 금색으로 */
export function MoonIcon({ illumination, phase, size = 32 }: { illumination: number; phase: PhaseId; size?: number }) {
  const r = size / 2 - 1;
  const c = size / 2;
  return (
    <svg aria-hidden viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', flex: 'none' }}>
      <circle cx={c} cy={c} r={r} fill="rgba(243, 241, 232, 0.16)" />
      <path d={moonLitPath(illumination, isWaxing(phase), r, c, c)} fill={NIGHT.gold} />
    </svg>
  );
}
