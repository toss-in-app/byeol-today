import { colors } from '@toss/tds-colors';
import { Border, List, ListRow, Text, Top } from '@toss/tds-mobile';
import { useState } from 'react';

import { SkyInfoSheet } from '../components/SkyInfoSheet';
import { PRIVACY_URL, TERMS_URL, type Content } from '../content';
import { openUrl } from '../lib/bridge';
import type { NotificationState } from '../lib/state';

export interface SettingsScreenProps {
  content: Content;
  notification: NotificationState;
  /** 템플릿 코드가 있고 토스앱이 지원할 때만 알림 행이 눌려요 */
  notificationAvailable: boolean;
  mineCount: number;
  onNotification: () => void;
  onManageMine: () => void;
}

const NOTIFICATION_LABEL: Record<NotificationState, string> = {
  unknown: '받기',
  agreed: '받는 중',
  declined: '꺼짐 · 다시 받기',
};

/** 콘솔·약관에 적은 문의 주소와 같아요(카드 apps/byeol-today.md) */
const CONTACT_EMAIL = 'jmsmg1@me.com';

/**
 * 설정: 아침 알림(상태·다시 받기) · 내 별자리 관리 · 오늘 하늘이란? | 약관 · 개인정보처리방침 | 저장 안내 · 버전 · 계산 근거 · 문의.
 * 동의한 뒤 끄는 길은 토스 앱 알림 설정(철회 경로) — 행을 누르면 토스트로 안내해요(App.askNotification).
 */
export function SettingsScreen({ content, notification, notificationAvailable, mineCount, onNotification, onManageMine }: SettingsScreenProps) {
  const [skyOpen, setSkyOpen] = useState(false);
  const rightText = (text: string) => (
    <Text typography="t7" color={colors.grey600}>
      {text}
    </Text>
  );

  return (
    <>
      <Top title={<Top.TitleParagraph size={22}>설정</Top.TitleParagraph>} />

      <List>
        <ListRow
          onClick={notificationAvailable ? onNotification : undefined}
          disabled={!notificationAvailable}
          contents={<ListRow.Texts type="2RowTypeA" top="매일 아침 8시 운세 알림" bottom="오늘 하늘로 본 운세를 아침마다 알려 드려요" />}
          right={rightText(notificationAvailable ? NOTIFICATION_LABEL[notification] : '준비 중')}
        />
        <ListRow withArrow onClick={onManageMine} contents={<ListRow.Texts type="2RowTypeA" top="내 별자리 관리" bottom={mineCount === 0 ? '아직 등록한 별자리가 없어요' : `${mineCount}개 등록`} />} />
        <ListRow withArrow onClick={() => setSkyOpen(true)} contents={<ListRow.Texts type="2RowTypeA" top="오늘 하늘이란?" bottom="운세를 고르는 방식과 기준 시각" />} />
      </List>

      <Border variant="height16" />
      <List>
        <ListRow withArrow onClick={() => void openUrl(TERMS_URL)} contents={<ListRow.Texts type="1RowTypeA" top="이용약관" />} />
        <ListRow withArrow onClick={() => void openUrl(PRIVACY_URL)} contents={<ListRow.Texts type="1RowTypeA" top="개인정보처리방침" />} />
      </List>

      <div style={{ padding: '24px 24px 40px' }}>
        <Text typography="t7" color={colors.grey600} display="block">
          등록한 별자리와 설정은 이 기기에만 저장돼요. 생일과 태어난 해는 저장하지 않아요.
        </Text>
        <div style={{ height: 8 }} />
        <Text typography="t7" color={colors.grey600} display="block">
          앱 버전 {__APP_VERSION__} · 문구 버전 {content.contentVersion} ({content.updatedAt.split('-').map(Number).join('.')}) · 오늘 하늘 계산 astronomy-engine(MIT)
        </Text>
        <div style={{ height: 8 }} />
        <Text typography="t7" color={colors.grey600} display="block">
          문의 {CONTACT_EMAIL}
        </Text>
      </div>

      <SkyInfoSheet content={content} open={skyOpen} onClose={() => setSkyOpen(false)} />
    </>
  );
}
