import { colors } from '@toss/tds-colors';
import { List, ListHeader, ListRow, Text, Top } from '@toss/tds-mobile';

import { signInfo, type Content } from '../content';
import { formatDateLabel, formatTimeKo } from '../lib/date';
import { readingFor, SIGN_IDS, skyDay, type SignId } from '../sky';

export interface HomeScreenProps {
  content: Content;
  /** 한국 날짜 YYYY-MM-DD */
  today: string;
  onOpenSign: (sign: SignId) => void;
}

/**
 * 첫 화면(주요 기능 1): 오늘 하늘 카드 + 12별자리 오늘 한 줄.
 * 4단계 골격 — 내 별자리·알림·광고 안내·궁합·설정 행은 5단계 기능과 함께(흐름: steps/3-design/wireframes/byeol-today-flow.md).
 */
export function HomeScreen({ content, today, onOpenSign }: HomeScreenProps) {
  const day = skyDay(today);
  const phase = day ? content.phases.find((p) => p.id === day.phase) : undefined;

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>오늘의 별자리 운세</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={17}>{formatDateLabel(today)}</Top.SubtitleParagraph>}
      />

      <section aria-label="오늘 하늘" style={{ margin: '0 20px 12px', padding: '16px 18px', borderRadius: 16, background: colors.grey50 }}>
        {day ? (
          <>
            <Text display="block" typography="t5" fontWeight="bold" color={colors.grey900}>
              오늘 달은 {signInfo(content, day.moon).name}에 있어요
            </Text>
            <Text display="block" typography="t6" color={colors.grey700} style={{ marginTop: 4 }}>
              {phase?.name ?? ''} · 밝기 {day.illumination}%
            </Text>
            {day.nextSign && day.changeAt ? (
              <Text display="block" typography="t7" color={colors.grey600} style={{ marginTop: 4 }}>
                {formatTimeKo(day.changeAt)}부터 {signInfo(content, day.nextSign).name}
              </Text>
            ) : null}
          </>
        ) : (
          <Text display="block" typography="t6" color={colors.grey700}>
            오늘 하늘 정보가 아직 없어요. 앱을 업데이트해 주세요.
          </Text>
        )}
      </section>

      <ListHeader
        title={
          <ListHeader.TitleParagraph typography="t5" fontWeight="bold" color={colors.grey800}>
            12별자리 오늘 운세
          </ListHeader.TitleParagraph>
        }
      />
      <List>
        {SIGN_IDS.map((id) => {
          const sign = signInfo(content, id);
          const line = day ? readingFor(content, id, day).total : sign.trait;
          return (
            <ListRow
              key={id}
              withArrow
              onClick={() => onOpenSign(id)}
              contents={<ListRow.Texts type="2RowTypeA" top={`${sign.name} · ${sign.dates}`} bottom={line} />}
            />
          );
        })}
      </List>
    </>
  );
}
