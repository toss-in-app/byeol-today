import { LABEL_PRESETS, normalizeLabel } from './state';

/** 이름표 고르기 상태: 없음 / 추천 칩 / 직접 입력 (LabelPicker 가 그려요) */
export type LabelChoice = { kind: 'none' } | { kind: 'preset'; label: (typeof LABEL_PRESETS)[number] } | { kind: 'custom'; text: string };

export const NO_LABEL: LabelChoice = { kind: 'none' };
export const ME_LABEL: LabelChoice = { kind: 'preset', label: '나' };

/** 첫 등록은 '나'가 기본, 그다음부터는 이름표 없음 */
export function defaultLabel(mineCount: number): LabelChoice {
  return mineCount === 0 ? ME_LABEL : NO_LABEL;
}

/** 저장할 이름표 문자열(없으면 null) */
export function labelOf(choice: LabelChoice): string | null {
  if (choice.kind === 'preset') return choice.label;
  if (choice.kind === 'custom') return normalizeLabel(choice.text);
  return null;
}
