import { kstDateKey } from '../lib/date';
import type { SettingsState } from '../lib/state';

/** 결과별 안내 문구(해요체). 리워드 두 곳이 같이 써요 */
export const AD_MESSAGES = {
  unavailable: '지금은 광고를 불러올 수 없어요. 잠시 뒤에 다시 해 주세요.',
  dismissedTomorrow: '광고를 끝까지 보면 내일 운세가 열려요.',
  dismissedMatch: '광고를 끝까지 보면 궁합 자세히가 열려요.',
  /** 홈 목록 위, 전면 광고 차례인 날만 */
  interstitialNotice: '별자리를 처음 자세히 볼 때 광고가 한 번 나와요. 오늘은 그 뒤로 광고 없이 볼 수 있어요.',
} as const;

/**
 * 전면 광고를 보여줄 수 있는 조건(계약 interstitial-sign): 오늘 아직 안 보여줌 · 처음 연 날이 아님(firstOpenAt 의 한국 날짜 ≠ 오늘).
 * 딥링크로 바로 들어온 첫 화면에는 전면이 없어요 — 전면은 홈·내 별자리에서 행을 누를 때만 띄우니 자연히 그래요.
 * 사전 로딩·표시 실패·미지원은 훅(useInterstitial)이 따로 건너뛰어요.
 */
export function interstitialEligible(settings: SettingsState, today: string): boolean {
  if (settings.ads.lastInterstitialDate === today) return false;
  if (settings.firstOpenAt === null) return false; // 아직 읽기 전이거나 처음 여는 중
  return kstDateKey(new Date(settings.firstOpenAt)) !== today;
}
