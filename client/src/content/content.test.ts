import { describe, expect, it } from 'vitest';

import { SIGN_IDS } from '../sky';
import { bundledContent, compareVersions, isUsableContent } from '.';

// 전체 스키마 검증은 프로젝트 루트 `npm run contract`(ajv). 여기서는 클라가 기대는 모양만.
describe('번들 콘텐츠', () => {
  it('별자리 12(양자리부터 순서대로), 집 12, 달 모양 8', () => {
    expect(bundledContent.signs.map((s) => s.id)).toEqual([...SIGN_IDS]);
    expect(bundledContent.houses.map((h) => h.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(bundledContent.phases).toHaveLength(8);
  });

  it('운세 문장 144개가 모두 있고 서로 다름', () => {
    const lines: string[] = [];
    for (let house = 1; house <= 12; house += 1) {
      const r = bundledContent.readings[String(house)];
      for (const area of ['total', 'love', 'work', 'money'] as const) for (const day of ['enter', 'stay', 'leave'] as const) lines.push(r[area][day]);
    }
    expect(lines).toHaveLength(144);
    expect(lines.every((l) => l.length > 0 && l.length <= 60)).toBe(true);
    expect(new Set(lines).size).toBe(144);
  });
});

describe('원격 콘텐츠 받아들이기', () => {
  it('minClientVersion 이 클라보다 크면 버림', () => {
    expect(isUsableContent(bundledContent, '1.0.0')).toBe(true);
    expect(isUsableContent({ ...bundledContent, minClientVersion: '1.1.0' }, '1.0.0')).toBe(false);
    expect(isUsableContent({ ...bundledContent, signs: [] }, '1.0.0')).toBe(false);
    expect(isUsableContent(null, '1.0.0')).toBe(false);
  });

  it('버전 비교', () => {
    expect(compareVersions('1.10.0', '1.2.0')).toBeGreaterThan(0);
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('0.9.9', '1.0.0')).toBeLessThan(0);
  });
});
