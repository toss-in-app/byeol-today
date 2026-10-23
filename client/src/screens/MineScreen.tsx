import { colors } from '@toss/tds-colors';
import { List, ListRow, Text, TextButton, Top, useDialog } from '@toss/tds-mobile';
import type { MouseEvent } from 'react';

import { NotificationPromptRow } from '../components/NotificationPromptRow';
import { SignIcon } from '../components/SignGlyph';
import { signInfo, type Content } from '../content';
import { eulReul } from '../lib/josa';
import { MAX_MINE, mineTitle, type MineItem } from '../lib/state';
import { readingFor, skyDay, type SignId } from '../sky';

export interface MineScreenProps {
  content: Content;
  today: string;
  items: MineItem[];
  /** 아직 알림을 묻지 않았을 때만(거부했으면 설정에서만) */
  notificationPrompt: boolean;
  onOpenSign: (sign: SignId) => void;
  onAdd: () => void;
  onRemove: (id: string) => Promise<void>;
  onAskNotification: () => void;
}

/** 내 별자리(주요 기능 2): 등록 순 목록(오늘 한 줄), 행 오른쪽 삭제(확인 창, 왼쪽 '닫기'), 5개 미만이면 추가, 아침 알림 행 */
export function MineScreen({ content, today, items, notificationPrompt, onOpenSign, onAdd, onRemove, onAskNotification }: MineScreenProps) {
  const day = skyDay(today);
  const { openConfirm } = useDialog();

  const confirmRemove = async (item: MineItem) => {
    const title = mineTitle(item, signInfo(content, item.sign).name);
    const ok = await openConfirm({
      title: `${eulReul(title)} 지울까요?`,
      description: '홈의 내 별자리 목록에서 빠져요. 다시 등록할 수 있어요.',
      cancelButton: '닫기',
      confirmButton: '삭제',
    });
    if (ok) await onRemove(item.id);
  };

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>내 별자리</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={17}>{items.length === 0 ? '아직 등록한 별자리가 없어요' : `${items.length}개 · ${MAX_MINE}개까지`}</Top.SubtitleParagraph>}
      />
      <List>
        {items.map((item) => {
          const sign = signInfo(content, item.sign);
          const line = day ? readingFor(content, item.sign, day).total : sign.trait;
          return (
            <ListRow
              key={item.id}
              onClick={() => onOpenSign(item.sign)}
              left={<SignIcon sign={item.sign} />}
              contents={<ListRow.Texts type="2RowTypeA" top={mineTitle(item, sign.name)} bottom={line} />}
              right={
                <TextButton
                  size="small"
                  color={colors.grey600}
                  aria-label={`${mineTitle(item, sign.name)} 삭제`}
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    void confirmRemove(item);
                  }}
                >
                  삭제
                </TextButton>
              }
            />
          );
        })}
        {items.length > 0 && notificationPrompt ? <NotificationPromptRow onClick={onAskNotification} /> : null}
        {items.length < MAX_MINE ? (
          <ListRow withArrow onClick={onAdd} contents={<ListRow.Texts type="2RowTypeA" top="내 별자리 추가" bottom="생일로 찾거나 목록에서 골라요" />} />
        ) : (
          <Text display="block" typography="t7" color={colors.grey600} style={{ margin: '12px 24px 0' }}>
            {MAX_MINE}개가 다 찼어요. 하나를 지우면 다른 별자리를 등록할 수 있어요.
          </Text>
        )}
      </List>
    </>
  );
}
