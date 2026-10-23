import { describe, expect, it } from 'vitest';

import { bundledContent } from '../content';
import { SIGN_IDS } from '../sky';
import { dayOfYear, luckyFor } from './lucky';

describe('lucky', () => {
  it('그 해의 몇 번째 날', () => {
    expect(dayOfYear('2026-01-01')).toBe(1);
    expect(dayOfYear('2026-03-01')).toBe(60);
    expect(dayOfYear('2026-12-31')).toBe(365);
    expect(dayOfYear('2028-12-31')).toBe(366);
  });

  it('별자리·날짜로 정해지고 목록 안의 값, 숫자는 1~9', () => {
    const a = luckyFor(bundledContent, 'leo', '2026-10-23');
    expect(a).toEqual(luckyFor(bundledContent, 'leo', '2026-10-23'));
    expect(bundledContent.lucky.colors).toContain(a.color);
    expect(bundledContent.lucky.items).toContain(a.item);
    expect(a.number).toBeGreaterThanOrEqual(1);
    expect(a.number).toBeLessThanOrEqual(9);
    // 같은 날 12별자리가 전부 같은 색은 아니에요
    const colors = new Set(SIGN_IDS.map((id) => luckyFor(bundledContent, id, '2026-10-23').color));
    expect(colors.size).toBeGreaterThan(3);
    // 날이 바뀌면 바뀌어요
    expect(luckyFor(bundledContent, 'leo', '2026-10-24')).not.toEqual(a);
  });
});
