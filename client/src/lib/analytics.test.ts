import { afterEach, describe, expect, it, vi } from 'vitest';

const log = vi.hoisted(() => vi.fn<(p: unknown) => Promise<void>>());
vi.mock('@apps-in-toss/web-framework', () => ({ Analytics: { log } }));

import { logEvent, logEventOnce, resetAnalyticsForTests } from './analytics';

describe('analytics', () => {
  afterEach(() => {
    log.mockReset();
    resetAnalyticsForTests();
  });

  it('값은 문자열로, null·undefined 는 빼고, 화면 이벤트는 screen 으로', () => {
    log.mockResolvedValue();
    logEvent('sign_view', { sign: 'leo', house: 7, from: 'list', nothing: null, missing: undefined });
    expect(log).toHaveBeenCalledWith({ log_name: 'sign_view', log_type: 'screen', params: { sign: 'leo', house: '7', from: 'list' } });
    logEvent('mine_add', { sign: 'leo', count: 2 });
    expect(log).toHaveBeenLastCalledWith({ log_name: 'mine_add', log_type: 'event', params: { sign: 'leo', count: '2' } });
  });

  it('브릿지가 던지거나 거부해도 조용히', async () => {
    log.mockImplementation(() => {
      throw new Error('no bridge');
    });
    expect(() => logEvent('home_view', { mine: 0 })).not.toThrow();
    log.mockRejectedValue(new Error('offline'));
    expect(() => logEvent('home_view', { mine: 0 })).not.toThrow();
    await Promise.resolve();
  });

  it('세션당 1회', () => {
    log.mockResolvedValue();
    logEventOnce('home_view', { mine: 1, from: 'direct' });
    logEventOnce('home_view', { mine: 1, from: 'direct' });
    expect(log).toHaveBeenCalledTimes(1);
  });
});
