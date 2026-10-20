import { describe, expect, it } from 'vitest';

import { addDays, formatDateLabel, formatTimeKo, kstDateKey } from './date';

describe('한국 날짜', () => {
  it('UTC 15시 이후는 한국 다음 날', () => {
    expect(kstDateKey(new Date('2026-10-19T14:59:00Z'))).toBe('2026-10-19');
    expect(kstDateKey(new Date('2026-10-19T15:00:00Z'))).toBe('2026-10-20');
  });

  it('날짜 더하기·표시', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(formatDateLabel('2026-10-20')).toBe('10월 20일 화요일');
  });

  it('시각 표시', () => {
    expect(formatTimeKo('21:35')).toBe('오후 9시 35분');
    expect(formatTimeKo('08:00')).toBe('오전 8시');
    expect(formatTimeKo('00:10')).toBe('오전 12시 10분');
    expect(formatTimeKo('12:05')).toBe('오후 12시 5분');
  });
});
