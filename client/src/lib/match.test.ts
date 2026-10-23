import { describe, expect, it } from 'vitest';

import { bundledContent } from '../content';
import { isMatchDetailUnlocked, matchFor, matchUnlockKey, pairKey, todayMatchLine, withMatchDetailUnlocked } from './match';
import { defaultSettings } from './state';

describe('match', () => {
  it('원소 짝 키는 순서와 상관없이 콘텐츠 키 순서로', () => {
    expect(pairKey('air', 'fire')).toBe('fire-air');
    expect(pairKey('fire', 'air')).toBe('fire-air');
    expect(pairKey('water', 'earth')).toBe('earth-water');
    expect(pairKey('water', 'water')).toBe('water-water');
  });

  it('물병자리 × 사자자리 = 공기 × 불, 오늘 달 원소 한 줄', () => {
    const m = matchFor(bundledContent, 'aquarius', 'leo');
    expect(m.key).toBe('fire-air');
    expect(m.elements).toEqual(['air', 'fire']);
    expect(m.summary).toBe(bundledContent.match.pairs['fire-air'].summary);
    expect(todayMatchLine(bundledContent, 'aquarius')).toBe(bundledContent.match.today.air);
  });

  it('자세히 잠금은 그날·그 쌍만', () => {
    let s = defaultSettings();
    expect(matchUnlockKey('leo', 'aquarius')).toBe('aquarius-leo');
    expect(isMatchDetailUnlocked(s, '2026-10-23', 'leo', 'aquarius')).toBe(false);
    s = withMatchDetailUnlocked(s, '2026-10-23', 'leo', 'aquarius');
    expect(isMatchDetailUnlocked(s, '2026-10-23', 'aquarius', 'leo')).toBe(true);
    expect(isMatchDetailUnlocked(s, '2026-10-23', 'aries', 'leo')).toBe(false);
    expect(isMatchDetailUnlocked(s, '2026-10-24', 'leo', 'aquarius')).toBe(false);
    // 날이 바뀌면 이전 쌍은 버려요
    s = withMatchDetailUnlocked(s, '2026-10-24', 'aries', 'leo');
    expect(s.unlocks.matchDetail).toEqual({ date: '2026-10-24', keys: ['aries-leo'] });
    expect(withMatchDetailUnlocked(s, '2026-10-24', 'leo', 'aries')).toBe(s);
  });
});
