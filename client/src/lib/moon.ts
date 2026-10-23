/** 달 모양 그림: 밝기(illumination)와 차는지·기우는지로 밝은 부분의 SVG path 를 만들어요(홈 하늘 블록 아이콘) */
import type { PhaseId } from '../sky';

/** 차는 달(새 달 → 보름 사이)이면 true. 북반구에서는 오른쪽부터 밝아져요 */
export function isWaxing(phase: PhaseId): boolean {
  return phase === 'new' || phase === 'waxing-crescent' || phase === 'first-quarter' || phase === 'waxing-gibbous';
}

/**
 * 반지름 r, 중심 (cx, cy)인 달의 밝은 부분. 밝기 0 이면 빈 문자열, 100 이면 원 전체.
 * 바깥 테두리 반원(밝은 쪽) + 명암 경계(타원 호): 반 넘게 밝으면 어두운 쪽으로, 아니면 밝은 쪽으로 볼록해요.
 */
export function moonLitPath(illumination: number, waxing: boolean, r: number, cx: number = r, cy: number = r): string {
  const f = Math.min(100, Math.max(0, illumination)) / 100;
  if (f <= 0.005) return '';
  const top = `${cx} ${cy - r}`;
  const bottom = `${cx} ${cy + r}`;
  if (f >= 0.995) return `M ${top} A ${r} ${r} 0 1 1 ${bottom} A ${r} ${r} 0 1 1 ${top} Z`;
  const rx = Math.round(Math.abs(2 * f - 1) * r * 100) / 100;
  const limbSweep = waxing ? 1 : 0;
  const terminatorSweep = f > 0.5 ? limbSweep : 1 - limbSweep;
  return `M ${top} A ${r} ${r} 0 0 ${limbSweep} ${bottom} A ${rx} ${r} 0 0 ${terminatorSweep} ${top} Z`;
}
