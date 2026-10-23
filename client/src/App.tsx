import { useToast } from '@toss/tds-mobile';
import { useEffect } from 'react';

import { bundledContent } from './content';
import { useMine } from './hooks/useMine';
import { useSettings } from './hooks/useSettings';
import { kstDateKey } from './lib/date';
import { isMatchDetailUnlocked, withMatchDetailUnlocked } from './lib/match';
import { goBack, navigate, useRoute } from './lib/router';
import { AGREEMENT_MESSAGES, ALREADY_AGREED_HINT, notificationAvailable, requestNotificationAgreement } from './notification/agreement';
import { FindScreen } from './screens/FindScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MatchScreen } from './screens/MatchScreen';
import { MineScreen } from './screens/MineScreen';
import { SettingsScreen } from './screens/SettingsScreen';
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
  const openMatch = (a?: SignId) => navigate(a ? { name: 'match', a } : { name: 'match' });

  /** 궁합 자세히 — ⑥에서 리워드 광고를 거쳐요. 지금은 바로 열어요(출시 전에 광고로 바꿔요) */
  const unlockMatchDetail = async (a: SignId, b: SignId) => {
    await updateSettings((current) => withMatchDetailUnlocked(current, today, a, b));
    return true;
  };

  /** 알림 행은 내 별자리가 있고, 아직 묻지 않았고, 이 토스앱이 지원할 때만. 거부했으면 설정에서만 다시 */
  const notificationReady = notificationAvailable();
  const notificationPrompt = settingsReady && settings.notification === 'unknown' && notificationReady;

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
          onOpenMatch={() => openMatch()}
          onOpenSettings={() => navigate({ name: 'settings' })}
        />
      );
    case 'sign':
      return (
        <SignScreen
          content={content}
          today={today}
          sign={route.sign}
          inMine={mine.has(route.sign)}
          mineCount={mine.items.length}
          onRegister={mine.add}
          onOpenMatch={() => openMatch(route.sign)}
        />
      );
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
      return (
        <MatchScreen
          key={`${route.a ?? ''}-${route.b ?? ''}`}
          content={content}
          today={today}
          mine={mine.items}
          initialA={route.a}
          initialB={route.b}
          isDetailUnlocked={(a, b) => isMatchDetailUnlocked(settings, today, a, b)}
          onUnlockDetail={unlockMatchDetail}
        />
      );
    case 'settings':
      return (
        <SettingsScreen
          content={content}
          notification={settings.notification}
          notificationAvailable={notificationReady}
          mineCount={mine.items.length}
          onNotification={() => void askNotification()}
          onManageMine={() => navigate({ name: 'mine' })}
        />
      );
  }
}
