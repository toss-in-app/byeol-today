import { ListRow } from '@toss/tds-mobile';
import { useEffect } from 'react';

import { logEventOnce } from '../lib/analytics';

const NOTIFICATION_PROMPT_TITLE = '매일 아침 8시 운세 알림 받기';

/** 내 별자리를 등록한 뒤, 아직 묻지 않았을 때만 홈·내 별자리에 보이는 행. 누른 뒤에만 동의 화면이 떠요(바텀시트로 바로 묻지 않음) */
export function NotificationPromptRow({ onClick }: { onClick: () => void }) {
  useEffect(() => {
    logEventOnce('notification_prompt_view');
  }, []);
  return <ListRow withArrow onClick={onClick} contents={<ListRow.Texts type="2RowTypeA" top={NOTIFICATION_PROMPT_TITLE} bottom="오늘 하늘로 본 운세를 아침마다 알려 드려요" />} />;
}
