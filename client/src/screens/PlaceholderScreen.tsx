import { colors } from '@toss/tds-colors';
import { Text, Top } from '@toss/tds-mobile';

/** 5단계에서 채울 화면 자리(찾기·내 별자리·궁합·설정). 출시 번들에는 남기지 않아요 */
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <>
      <Top title={<Top.TitleParagraph size={22}>{title}</Top.TitleParagraph>} />
      <Text display="block" typography="t6" color={colors.grey600} style={{ margin: '0 20px' }}>
        만드는 중이에요.
      </Text>
    </>
  );
}
