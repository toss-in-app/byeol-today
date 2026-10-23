import { describe, expect, it } from 'vitest';

import { defaultSettings } from '../lib/state';
import { interstitialEligible } from './rules';

const KST_2026_10_22_09 = Date.UTC(2026, 9, 22, 0, 0); // 2026-10-22 09:00 KST

describe('interstitialEligible (전면: 하루 1회, 처음 연 날 없음)', () => {
  it('처음 연 날은 없고, 다음 날부터 오늘 아직 안 봤을 때만', () => {
    const base = { ...defaultSettings(), firstOpenAt: KST_2026_10_22_09 };
    expect(interstitialEligible(base, '2026-10-22')).toBe(false); // 처음 연 날
    expect(interstitialEligible(base, '2026-10-23')).toBe(true);
    const shown = { ...base, ads: { lastInterstitialDate: '2026-10-23' } };
    expect(interstitialEligible(shown, '2026-10-23')).toBe(false);
    expect(interstitialEligible(shown, '2026-10-24')).toBe(true);
  });

  it('처음 연 시각을 아직 모르면(읽기 전) 없음', () => {
    expect(interstitialEligible(defaultSettings(), '2026-10-23')).toBe(false);
  });

  it('한국 날짜 기준: 한국 10-22 23:30 에 처음 열었으면 10-23 은 다음 날', () => {
    const lateNight = { ...defaultSettings(), firstOpenAt: Date.UTC(2026, 9, 22, 14, 30) }; // 2026-10-22 23:30 KST
    expect(interstitialEligible(lateNight, '2026-10-22')).toBe(false);
    expect(interstitialEligible(lateNight, '2026-10-23')).toBe(true);
  });
});
