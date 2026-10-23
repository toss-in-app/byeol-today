/**
 * 광고 그룹 ID (계약 contract/events.md '광고 그룹'). mandalartplan 과 같은 규칙이에요.
 * 라이브 ID 는 콘솔 인앱 광고에서 만든 광고 그룹의 groupId → `.env.production` 의 VITE_AD_GROUP_* (출시 빌드 `vite build` 가 읽어요).
 *
 * 출시 빌드(MODE=production)에는 테스트 ID 문자열이 한 글자도 들어가면 안 돼요 — 콘솔이 번들을 정적으로 검사해
 * 'ait-ad-test-…' 가 있으면 검토를 자동 반려해요(mandalartplan 2026-10-19 반려). 그래서 테스트 ID 는 production 이 아닌 모드
 * (개발 서버·vitest·`npm run build:test-ads`)에서만 코드에 남고, 출시 빌드에서는 아래 상수가 null 로 접혀 번들에서 사라져요.
 * `npm run build` 뒤 `scripts/check-release-bundle.mjs` 가 dist 를 다시 검사해요.
 * 개발·QR 테스트는 테스트 ID 로만 — 라이브 ID 로 테스트하면 정책 위반이에요.
 */
const IS_RELEASE_BUILD = import.meta.env.MODE === 'production';

/** 앱인토스 공식 테스트 광고 그룹 ID. 출시 빌드에서는 null. */
export const TEST_AD_GROUPS: { interstitial: string; rewarded: string; banner: string } | null = IS_RELEASE_BUILD
  ? null
  : {
      interstitial: 'ait-ad-test-interstitial-id',
      rewarded: 'ait-ad-test-rewarded-id',
      banner: 'ait-ad-test-banner-id',
    };

function pick(value: string | undefined, fallback: string | undefined): string {
  const v = (value ?? '').trim();
  return v.length > 0 ? v : (fallback ?? '');
}

export const AD_GROUPS = {
  /** `interstitial-sign`: 홈 목록·내 별자리 → 별자리 자세히 (전면, 하루 1회, 처음 연 날 없음) */
  interstitialSign: pick(import.meta.env.VITE_AD_GROUP_INTERSTITIAL_SIGN, TEST_AD_GROUPS?.interstitial),
  /** `rewarded-tomorrow`: 별자리 자세히 '내일 운세 미리 보기' (리워드, 그날 그 별자리만 열림) */
  rewardedTomorrow: pick(import.meta.env.VITE_AD_GROUP_REWARDED_TOMORROW, TEST_AD_GROUPS?.rewarded),
  /** `rewarded-match-detail`: 궁합 '궁합 자세히' (리워드, 그날 그 쌍만 열림) */
  rewardedMatchDetail: pick(import.meta.env.VITE_AD_GROUP_REWARDED_MATCH_DETAIL, TEST_AD_GROUPS?.rewarded),
  /** `banner-sign`: 별자리 자세히 맨 아래 (배너 1개) */
  bannerSign: pick(import.meta.env.VITE_AD_GROUP_BANNER_SIGN, TEST_AD_GROUPS?.banner),
} as const;

/** 하나라도 비어 있거나 테스트 ID 면 true. 출시 번들에서는 false 여야 해요. */
export const USING_TEST_AD_GROUPS = Object.values(AD_GROUPS).some(
  (id) => id.length === 0 || (TEST_AD_GROUPS !== null && (Object.values(TEST_AD_GROUPS) as string[]).includes(id)),
);

/**
 * 전면·리워드 광고를 띄울지 — `.env` 의 `VITE_FULL_SCREEN_ADS` 가 'on' 일 때만.
 * off 면 전면은 부르지 않고(홈에 AD 표시·사전 안내도 없음), 리워드 기능(내일 운세·궁합 자세히)은 광고 없이 바로 열어 줘요(AD 표시·'광고 보고' 문구도 빠져요). 배너는 그대로.
 * 배경: mandalartplan 3.0.1(2026-10-22) — 안드로이드 토스앱이 광고 이벤트를 늦게/안 보내 광고를 다 보고도 보상이 안 되던 동안 전면·리워드를 끈 선례.
 * 출시 때 on/off 는 사용자가 정해요(.env 만 바꾸고 빌드). 테스트는 vite.config 의 test.env 가 on 으로 덮어요.
 */
export function fullScreenAdsEnabled(): boolean {
  return import.meta.env.VITE_FULL_SCREEN_ADS === 'on';
}
