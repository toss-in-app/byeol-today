import { useToast } from '@toss/tds-mobile';
import { useEffect } from 'react';

import { bundledContent } from './content';
import { useMine } from './hooks/useMine';
import { useSettings } from './hooks/useSettings';
import { kstDateKey } from './lib/date';
import { goBack, navigate, useRoute } from './lib/router';
import { AGREEMENT_MESSAGES, ALREADY_AGREED_HINT, notificationAvailable, requestNotificationAgreement } from './notification/agreement';
import { FindScreen } from './screens/FindScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MineScreen } from './screens/MineScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { SignScreen } from './screens/SignScreen';
import type { SignId } from './sky';

export default function App() {
  const route = useRoute();
  const today = kstDateKey();
  const content = bundledContent;
  const mine = useMine();
  const { settings, ready: settingsReady, update: updateSettings } = useSettings();
  const toast = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const openSign = (sign: SignId) => navigate({ name: 'sign', sign });

  /** 알림 행은 내 별자리가 있고, 아직 묻지 않았고, 이 토스앱이 지원할 때만. 거부했으면 설정에서만 다시 */
  const notificationPrompt = settingsReady && settings.notification === 'unknown' && notificationAvailable();

  /** 홈·내 별자리·설정 행을 사용자가 누른 뒤에만 동의 화면. 결과는 settings.notification 에 남겨요 */
  const askNotification = async () => {
    if (settings.notification === 'agreed') {
      toast.openToast(ALREADY_AGREED_HINT);
      return;
    }
    const result = await requestNotificationAgreement();
    if (result === 'agreed' || result === 'alreadyAgreed') {
      await updateSettings((current) => ({ ...current, notification: 'agreed' }));
    } else if (result === 'declined') {
      await updateSettings((current) => ({ ...current, notification: 'declined' }));
    }
    toast.openToast(AGREEMENT_MESSAGES[result]);
  };

  switch (route.name) {
    case 'home':
      return (
        <HomeScreen
          content={content}
          today={today}
          mine={mine.items}
          mineReady={mine.ready}
          notificationPrompt={notificationPrompt}
          onOpenSign={openSign}
          onFind={() => navigate({ name: 'find' })}
          onEditMine={() => navigate({ name: 'mine' })}
          onAskNotification={() => void askNotification()}
        />
      );
    case 'sign':
      return <SignScreen content={content} today={today} sign={route.sign} inMine={mine.has(route.sign)} mineCount={mine.items.length} onRegister={mine.add} />;
    case 'find':
      return <FindScreen content={content} mineCount={mine.items.length} onRegister={mine.add} onDone={goBack} />;
    case 'mine':
      return (
        <MineScreen
          content={content}
          today={today}
          items={mine.items}
          notificationPrompt={notificationPrompt}
          onOpenSign={openSign}
          onAdd={() => navigate({ name: 'find' })}
          onRemove={mine.remove}
          onAskNotification={() => void askNotification()}
        />
      );
    case 'match':
      return <PlaceholderScreen title="별자리 궁합" />;
    case 'settings':
      return <PlaceholderScreen title="설정" />;
  }
}
