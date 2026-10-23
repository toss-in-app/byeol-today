import { describe, expect, it } from 'vitest';

import { bundledContent } from '../content';
import { defaultSettings } from './state';
import { isTomorrowUnlocked, tomorrowReading, withTomorrowUnlocked } from './tomorrow';

describe('tomorrow', () => {
  it('내일 칸으로 계산하고, 표 끝이면 null', () => {
    const t = tomorrowReading(bundledContent, 'aries', '2026-10-20');
    expect(t?.day.date).toBe('2026-10-21');
    expect(t?.reading.house).toBe(11); // 10-21 달 물병자리(나가는 날) → 양자리 11번째 집
    expect(t?.reading.transit).toBe('leave');
    expect(tomorrowReading(bundledContent, 'aries', '2028-12-31')).toBeNull();
  });

  it('열림은 그날·그 별자리만, 날이 바뀌면 초기화', () => {
    let s = defaultSettings();
    expect(isTomorrowUnlocked(s, '2026-10-23', 'leo')).toBe(false);
    s = withTomorrowUnlocked(s, '2026-10-23', 'leo');
    expect(isTomorrowUnlocked(s, '2026-10-23', 'leo')).toBe(true);
    expect(isTomorrowUnlocked(s, '2026-10-23', 'aries')).toBe(false);
    expect(isTomorrowUnlocked(s, '2026-10-24', 'leo')).toBe(false);
    expect(withTomorrowUnlocked(s, '2026-10-23', 'leo')).toBe(s);
    s = withTomorrowUnlocked(s, '2026-10-24', 'aries');
    expect(s.unlocks.tomorrow).toEqual({ date: '2026-10-24', keys: ['aries'] });
  });
});
