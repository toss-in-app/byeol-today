import { colors } from '@toss/tds-colors';
import { BottomSheet, Text } from '@toss/tds-mobile';

import type { Content } from '../content';
import { SKY_RANGE } from '../sky';

export interface SkyInfoSheetProps {
  content: Content;
  open: boolean;
  onClose: () => void;
}

/** '오늘 하늘이란?' — 콘텐츠의 설명 5개(sky.intro·houses·phase·boundary·basis). 홈 카드와 설정에서 누를 때만 열어요 */
export function SkyInfoSheet({ content, open, onClose }: SkyInfoSheetProps) {
  const items: [string, string][] = [
    ['오늘 하늘', content.sky.intro],
    ['집', content.sky.houses],
    ['달 모양', content.sky.phase],
    ['별자리 날짜', content.sky.boundary],
    ['기준 시각', `${content.sky.basis} 지금 표는 ${SKY_RANGE.to.replace(/-/g, '.')}까지 들어 있어요.`],
  ];
  return (
    <BottomSheet open={open} onClose={onClose} header={<BottomSheet.Header>오늘 하늘이란?</BottomSheet.Header>}>
      <div style={{ padding: '0 24px 8px' }}>
        {items.map(([title, body]) => (
          <div key={title} style={{ marginBottom: 14 }}>
            <Text display="block" typography="t6" fontWeight="bold" color={colors.grey800}>
              {title}
            </Text>
            <Text display="block" typography="t6" color={colors.grey700} style={{ marginTop: 2 }}>
              {body}
            </Text>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
