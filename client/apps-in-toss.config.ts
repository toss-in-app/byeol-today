import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 콘솔 appName (계획: zodiac-today → daily-zodiac → byeol-today, 콘솔 등록 때 확정). intoss://zodiac-today 로 열려요. 등록 후에는 바꿀 수 없어요.
  appName: 'zodiac-today',
  brand: {
    // 밤하늘 남색 — 흰 글자 대비 5:1 이상
    primaryColor: '#4C5FD5',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: false,
    theme: 'light',
  },
  webView: {
    pullToRefreshEnabled: false,
    bounces: false,
  },
  permissions: [],
  webBundleDir: 'dist',
});
