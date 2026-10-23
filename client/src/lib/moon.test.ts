import { describe, expect, it } from 'vitest';

import { isWaxing, moonLitPath } from './moon';

describe('moon', () => {
  it('차는 달 판별', () => {
    expect(isWaxing('new')).toBe(true);
    expect(isWaxing('waxing-gibbous')).toBe(true);
    expect(isWaxing('full')).toBe(false);
    expect(isWaxing('waning-crescent')).toBe(false);
  });

  it('밝기 0 은 빈 path, 100 은 원 전체', () => {
    expect(moonLitPath(0, true, 10)).toBe('');
    expect(moonLitPath(100, false, 10)).toBe('M 10 0 A 10 10 0 1 1 10 20 A 10 10 0 1 1 10 0 Z');
  });

  it('반달은 경계가 직선(타원 x 반지름 0), 차는 달은 오른쪽·기우는 달은 왼쪽이 밝아요', () => {
    expect(moonLitPath(50, true, 10)).toBe('M 10 0 A 10 10 0 0 1 10 20 A 0 10 0 0 0 10 0 Z');
    expect(moonLitPath(50, false, 10)).toBe('M 10 0 A 10 10 0 0 0 10 20 A 0 10 0 0 1 10 0 Z');
  });

  it('반 넘게 밝으면 경계가 어두운 쪽으로 볼록, 아니면 밝은 쪽으로', () => {
    // 차오르는 달 88%: 오른쪽 가장자리 반원(sweep 1) + 경계도 시계 방향(왼쪽으로 볼록)
    expect(moonLitPath(88, true, 10)).toBe('M 10 0 A 10 10 0 0 1 10 20 A 7.6 10 0 0 1 10 0 Z');
    // 초승달 12%: 경계가 반시계(오른쪽으로 볼록)
    expect(moonLitPath(12, true, 10)).toBe('M 10 0 A 10 10 0 0 1 10 20 A 7.6 10 0 0 0 10 0 Z');
  });
});
