import { colors } from '@toss/tds-colors';
import { List, ListHeader, ListRow, Text, TextButton, Top } from '@toss/tds-mobile';
import { useState } from 'react';

import { NotificationPromptRow } from '../components/NotificationPromptRow';
import { SkyInfoSheet } from '../components/SkyInfoSheet';
import { signInfo, type Content } from '../content';
import { formatDateLabel, formatTimeKo } from '../lib/date';
import { mineTitle, type MineItem } from '../lib/state';
import { readingFor, SIGN_IDS, skyDay, type SignId } from '../sky';

export interface HomeScreenProps {
  content: Content;
  /** 한국 날짜 YYYY-MM-DD */
  today: string;
  /** 내 별자리(등록 순). 저장소를 읽기 전(mineReady=false)에는 찾기 행을 아직 그리지 않아요 */
  mine: MineItem[];
  mineReady: boolean;
  /** 내 별자리를 등록했고 아직 알림을 묻지 않았을 때만 true — 행을 누른 뒤에만 동의 화면 */
  notificationPrompt: boolean;
  onOpenSign: (sign: SignId) => void;
  onFind: () => void;
  onEditMine: () => void;
  onAskNotification: () => void;
  onOpenMatch: () => void;
  onOpenSettings: () => void;
}

/**
 * 첫 화면(주요 기능 1): 오늘 하늘 카드 + 내 별자리(맨 위) + 아침 알림 행 + 12별자리 오늘 한 줄 + 궁합·설정 행.
 * 광고 안내는 ⑥에서(흐름: steps/3-design/wireframes/byeol-today-flow.md).
 */
export function HomeScreen({ content, today, mine, mineReady, notificationPrompt, onOpenSign, onFind, onEditMine, onAskNotification, onOpenMatch, onOpenSettings }: HomeScreenProps) {
  const day = skyDay(today);
  const phase = day ? content.phases.find((p) => p.id === day.phase) : undefined;
  const lineFor = (sign: SignId) => (day ? readingFor(content, sign, day).total : signInfo(content, sign).trait);
  const [skyOpen, setSkyOpen] = useState(false);

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
        <div style={{ marginTop: 8 }}>
          <TextButton size="small" color={colors.grey600} onClick={() => setSkyOpen(true)}>
            오늘 하늘이란? ›
          </TextButton>
        </div>
      </section>
      <SkyInfoSheet content={content} open={skyOpen} onClose={() => setSkyOpen(false)} />

      {mineReady ? (
        <section aria-label="내 별자리">
          <ListHeader
            title={
              <ListHeader.TitleParagraph typography="t5" fontWeight="bold" color={colors.grey800}>
                내 별자리
              </ListHeader.TitleParagraph>
            }
            right={mine.length > 0 ? <ListHeader.RightText onClick={onEditMine}>편집</ListHeader.RightText> : undefined}
          />
          <List>
            {mine.map((item) => (
              <ListRow
                key={item.id}
                withArrow
                onClick={() => onOpenSign(item.sign)}
                contents={<ListRow.Texts type="2RowTypeA" top={mineTitle(item, signInfo(content, item.sign).name)} bottom={lineFor(item.sign)} />}
              />
            ))}
            {mine.length === 0 ? (
              <ListRow withArrow onClick={onFind} contents={<ListRow.Texts type="2RowTypeA" top="내 별자리 찾기" bottom="생일로 찾거나 목록에서 골라요" />} />
            ) : null}
            {mine.length > 0 && notificationPrompt ? <NotificationPromptRow onClick={onAskNotification} /> : null}
          </List>
        </section>
      ) : null}

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
          return (
            <ListRow
              key={id}
              withArrow
              onClick={() => onOpenSign(id)}
              contents={<ListRow.Texts type="2RowTypeA" top={`${sign.name} · ${sign.dates}`} bottom={lineFor(id)} />}
            />
          );
        })}
      </List>

      <List style={{ marginTop: 16, marginBottom: 24 }}>
        <ListRow withArrow onClick={onOpenMatch} contents={<ListRow.Texts type="2RowTypeA" top="별자리 궁합" bottom="두 별자리의 원소 짝과 오늘 하늘로 봐요" />} />
        <ListRow withArrow onClick={onOpenSettings} contents={<ListRow.Texts type="1RowTypeA" top="설정" />} />
      </List>
    </>
  );
}
