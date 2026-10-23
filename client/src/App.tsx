import { useToast } from '@toss/tds-mobile';
import { useEffect, useState } from 'react';

import { AD_GROUPS, fullScreenAdsEnabled } from './ads/config';
import { AD_MESSAGES, interstitialEligible } from './ads/rules';
import { useInterstitial } from './ads/useInterstitial';
import { useRewardedAd } from './ads/useRewardedAd';
import { bundledContent } from './content';
import { useMine } from './hooks/useMine';
import { useSettings } from './hooks/useSettings';
import { kstDateKey } from './lib/date';
import { isMatchDetailUnlocked, withMatchDetailUnlocked } from './lib/match';
import { goBack, navigate, useRoute } from './lib/router';
import { isTomorrowUnlocked, withTomorrowUnlocked } from './lib/tomorrow';
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
  const [adBusy, setAdBusy] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  /*
   * 광고 (계약 contract/events.md '광고 그룹'). 전면은 홈·내 별자리에 있는 동안 차례인 날만 미리 불러오고,
   * 리워드 둘은 그 화면에 있는 동안만 미리 불러와요(그룹마다 하나씩, 동시 중복 로딩 없음).
   */
  const interstitialReady = settingsReady && interstitialEligible(settings, today);
  const interstitial = useInterstitial(AD_GROUPS.interstitialSign, (route.name === 'home' || route.name === 'mine') && interstitialReady);
  const tomorrowAd = useRewardedAd(AD_GROUPS.rewardedTomorrow, route.name === 'sign');
  const matchAd = useRewardedAd(AD_GROUPS.rewardedMatchDetail, route.name === 'match');
  const adsFree = !fullScreenAdsEnabled();

  /** 홈·내 별자리 행 → 자세히. 전면 광고 차례면(미리 불러온 것만) 보여준 뒤 이동, 없으면 바로 이동 */
  const openSign = async (sign: SignId) => {
    if (interstitial.upcoming && !adBusy) {
      setAdBusy(true);
      try {
        const result = await interstitial.show();
        if (result === 'shown') await updateSettings((current) => ({ ...current, ads: { ...current.ads, lastInterstitialDate: today } }));
      } finally {
        setAdBusy(false);
      }
    }
    navigate({ name: 'sign', sign });
  };
  const openMatch = (a?: SignId) => navigate(a ? { name: 'match', a } : { name: 'match' });

  /** 내일 운세 미리 보기: 리워드 광고 → userEarnedReward 일 때만 그날 그 별자리를 열어요 */
  const unlockTomorrow = async (sign: SignId) => {
    const outcome = await tomorrowAd.watch();
    if (outcome === 'rewarded') {
      await updateSettings((current) => withTomorrowUnlocked(current, today, sign));
      return;
    }
    toast.openToast(outcome === 'dismissed' ? AD_MESSAGES.dismissedTomorrow : AD_MESSAGES.unavailable);
  };

  /** 궁합 자세히: 리워드 광고 → 보상이면 그날 그 쌍을 열어요 */
  const unlockMatchDetail = async (a: SignId, b: SignId) => {
    const outcome = await matchAd.watch();
    if (outcome === 'rewarded') {
      await updateSettings((current) => withMatchDetailUnlocked(current, today, a, b));
      return true;
    }
    toast.openToast(outcome === 'dismissed' ? AD_MESSAGES.dismissedMatch : AD_MESSAGES.unavailable);
    return false;
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
          interstitialUpcoming={interstitial.upcoming}
          adBusy={adBusy}
          onOpenSign={(sign) => void openSign(sign)}
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
          tomorrowUnlocked={isTomorrowUnlocked(settings, today, route.sign)}
          onUnlockTomorrow={() => unlockTomorrow(route.sign)}
          adsFree={adsFree}
          bannerAdGroupId={AD_GROUPS.bannerSign || null}
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
          onOpenSign={(sign) => void openSign(sign)}
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
          adsFree={adsFree}
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
