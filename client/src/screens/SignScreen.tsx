import { colors } from '@toss/tds-colors';
import { List, ListRow, Text, Top } from '@toss/tds-mobile';

import { signInfo, type Content } from '../content';
import { eulReul } from '../lib/josa';
import { houseOf, readingFor, skyDay, type SignId } from '../sky';

export interface SignScreenProps {
  content: Content;
  today: string;
  sign: SignId;
}

/** 별자리 자세히 — 4단계 골격(오늘 하늘 근거·영역 4·달 모양). 행운·내일 운세(리워드)·궁합·공유·배너는 5단계 */
export function SignScreen({ content, today, sign }: SignScreenProps) {
  const info = signInfo(content, sign);
  const day = skyDay(today);

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>{info.name}</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={17}>{info.dates}</Top.SubtitleParagraph>}
      />
      <Text display="block" typography="t6" color={colors.grey700} style={{ margin: '0 20px 12px' }}>
        {info.trait}
      </Text>
      {day ? (
        (() => {
          const reading = readingFor(content, sign, day);
          const house = content.houses[houseOf(sign, day.moon) - 1];
          return (
            <>
              <Text display="block" typography="t6" color={colors.grey800} style={{ margin: '0 20px 8px' }}>
                오늘 달은 {signInfo(content, day.moon).name}에 있어요. 나의 {reading.house}번째 집 {eulReul(`'${house.theme}'`)} 지나요.
              </Text>
              <List>
                <ListRow contents={<ListRow.Texts type="2RowTypeA" top="총운" bottom={reading.total} />} />
                <ListRow contents={<ListRow.Texts type="2RowTypeA" top="사랑" bottom={reading.love} />} />
                <ListRow contents={<ListRow.Texts type="2RowTypeA" top="일" bottom={reading.work} />} />
                <ListRow contents={<ListRow.Texts type="2RowTypeA" top="돈" bottom={reading.money} />} />
                <ListRow contents={<ListRow.Texts type="2RowTypeA" top="달 모양" bottom={reading.phaseLine} />} />
              </List>
            </>
          );
        })()
      ) : (
        <Text display="block" typography="t6" color={colors.grey700} style={{ margin: '0 20px' }}>
          오늘 하늘 정보가 아직 없어요. 앱을 업데이트해 주세요.
        </Text>
      )}
    </>
  );
}
