import { Device } from '@apps-in-toss/web-framework';

import { withTimeout } from './async';

const BRIDGE_TIMEOUT_MS = 1500;

/** 약관·개인정보처리방침 같은 바깥 페이지 열기. 브릿지가 없으면(브라우저) 새 탭 */
export async function openUrl(url: string): Promise<void> {
  try {
    await withTimeout(Device.openURL(url), BRIDGE_TIMEOUT_MS);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}
