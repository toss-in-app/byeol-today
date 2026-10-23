import { colors } from '@toss/tds-colors';
import { BottomSheet, List, ListRow, Text } from '@toss/tds-mobile';

import { signInfo, type Content } from '../content';
import { mineTitle, type MineItem } from '../lib/state';
import { SIGN_IDS, type SignId } from '../sky';
import { SignIcon } from './SignGlyph';

export interface SignPickerSheetProps {
  content: Content;
  open: boolean;
  title: string;
  /** 내 별자리가 있으면 맨 위에 이름표와 함께 */
  mine: MineItem[];
  selected: SignId | null;
  onPick: (sign: SignId) => void;
  onClose: () => void;
}

/** 별자리 하나 고르는 시트(궁합의 두 자리에서 써요). 내 별자리 → 12별자리 순 */
export function SignPickerSheet({ content, open, title, mine, selected, onPick, onClose }: SignPickerSheetProps) {
  const row = (key: string, sign: SignId, top: string, bottom: string) => (
    <ListRow
      key={key}
      onClick={() => onPick(sign)}
      left={<SignIcon sign={sign} size={36} />}
      contents={<ListRow.Texts type="2RowTypeA" top={top} bottom={bottom} />}
      right={
        selected === sign ? (
          <Text typography="t6" fontWeight="bold" color={colors.blue500}>
            선택
          </Text>
        ) : null
      }
    />
  );
  return (
    <BottomSheet open={open} onClose={onClose} header={<BottomSheet.Header>{title}</BottomSheet.Header>}>
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <List>
          {mine.map((item) => row(`mine-${item.id}`, item.sign, mineTitle(item, signInfo(content, item.sign).name), '내 별자리'))}
          {SIGN_IDS.map((id) => {
            const sign = signInfo(content, id);
            return row(id, id, sign.name, sign.dates);
          })}
        </List>
      </div>
    </BottomSheet>
  );
}
