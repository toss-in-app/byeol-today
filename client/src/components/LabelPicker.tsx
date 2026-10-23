import { colors } from '@toss/tds-colors';
import { Chip, ChipItem, Text, TextField } from '@toss/tds-mobile';

import { NO_LABEL, type LabelChoice } from '../lib/label';
import { LABEL_MAX, LABEL_PRESETS } from '../lib/state';

export interface LabelPickerProps {
  value: LabelChoice;
  onChange: (next: LabelChoice) => void;
}

/**
 * 이름표(선택): [없음] [나] [엄마] [아빠] [친구] [직접 입력]. 직접 입력을 고르면 그 자리에 8자 칸이 열려요.
 * 찾기 화면과 별자리 자세히의 등록 시트에서 같이 써요.
 */
export function LabelPicker({ value, onChange }: LabelPickerProps) {
  return (
    <div>
      <Text display="block" typography="t6" fontWeight="bold" color={colors.grey800} style={{ margin: '0 24px 8px' }}>
        이름표 <span style={{ color: colors.grey500, fontWeight: 'normal' }}>(선택)</span>
      </Text>
      <Chip kind="select" wrap aria-label="이름표">
        <ChipItem selected={value.kind === 'none'} onClick={() => onChange(NO_LABEL)}>
          없음
        </ChipItem>
        {LABEL_PRESETS.map((label) => (
          <ChipItem key={label} selected={value.kind === 'preset' && value.label === label} onClick={() => onChange({ kind: 'preset', label })}>
            {label}
          </ChipItem>
        ))}
        <ChipItem selected={value.kind === 'custom'} onClick={() => onChange({ kind: 'custom', text: value.kind === 'custom' ? value.text : '' })}>
          직접 입력
        </ChipItem>
      </Chip>
      {value.kind === 'custom' ? (
        <div style={{ margin: '8px 24px 0' }}>
          <TextField
            variant="box"
            aria-label="이름표 직접 입력"
            placeholder="예: 동생"
            value={value.text}
            maxLength={LABEL_MAX}
            help={`${LABEL_MAX}자까지 쓸 수 있어요`}
            onChange={(e) => onChange({ kind: 'custom', text: (e.target as HTMLInputElement).value })}
          />
        </div>
      ) : null}
    </div>
  );
}
