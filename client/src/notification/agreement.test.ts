import { beforeEach, describe, expect, it, vi } from 'vitest';

type Params = { options: { templateCode: string }; onEvent: (r: { type: string }) => void; onError: (e: unknown) => void };
const mock = vi.hoisted(() => ({ supported: true, impl: null as null | ((p: Params) => () => void) }));

vi.mock('@apps-in-toss/web-framework', () => ({
  Notification: {
    requestAgreement: Object.assign((p: Params) => (mock.impl ? mock.impl(p) : () => {}), { isSupported: () => mock.supported }),
  },
}));

import { notificationAvailable, requestNotificationAgreement } from './agreement';

describe('requestNotificationAgreement', () => {
  beforeEach(() => {
    mock.supported = true;
    mock.impl = null;
  });

  it('동의·이미 동의·거부를 결과로 바꿔요', async () => {
    for (const [type, expected] of [
      ['newAgreement', 'agreed'],
      ['alreadyAgreed', 'alreadyAgreed'],
      ['agreementRejected', 'declined'],
      ['something', 'failed'],
    ] as const) {
      mock.impl = (p) => {
        expect(p.options.templateCode).toBe('byeol-today-daily-sky');
        setTimeout(() => p.onEvent({ type }), 0);
        return () => {};
      };
      await expect(requestNotificationAgreement('byeol-today-daily-sky')).resolves.toBe(expected);
    }
  });

  it('미지원 버전·오류·코드 없음', async () => {
    mock.supported = false;
    expect(notificationAvailable()).toBe(false);
    await expect(requestNotificationAgreement('byeol-today-daily-sky')).resolves.toBe('unsupported');
    mock.supported = true;
    mock.impl = (p) => {
      setTimeout(() => p.onError({ code: 'UNSUPPORTED_APP_VERSION' }), 0);
      return () => {};
    };
    await expect(requestNotificationAgreement('byeol-today-daily-sky')).resolves.toBe('unsupported');
    mock.impl = () => {
      throw new Error('bridge down');
    };
    await expect(requestNotificationAgreement('byeol-today-daily-sky')).resolves.toBe('failed');
    await expect(requestNotificationAgreement('')).resolves.toBe('unsupported');
  });

  it('첫 결과만 쓰고 해제 함수를 불러요', async () => {
    const cleanup = vi.fn();
    mock.impl = (p) => {
      setTimeout(() => {
        p.onEvent({ type: 'newAgreement' });
        p.onEvent({ type: 'agreementRejected' });
      }, 0);
      return cleanup;
    };
    await expect(requestNotificationAgreement('byeol-today-daily-sky')).resolves.toBe('agreed');
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
