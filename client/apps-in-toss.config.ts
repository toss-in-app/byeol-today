import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 콘솔 appName (2026-10-23 등록 확정. zodiac-today·daily-zodiac 은 쓸 수 없어 세 번째 후보로). intoss://byeol-today 로 열려요. 등록 후에는 바꿀 수 없어요.
  appName: 'byeol-today',
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
