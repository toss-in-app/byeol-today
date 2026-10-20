import { describe, expect, it } from 'vitest';

import { bundledContent } from '../content';
import { findSign, houseOf, readingFor, SIGN_IDS, SKY_RANGE, skyDay } from '.';

describe('오늘 하늘 표', () => {
  it('2026-10-20 아침 8시: 달은 물병자리, 들어온 날, 상현달 62%', () => {
    expect(skyDay('2026-10-20')).toEqual({ date: '2026-10-20', moon: 'aquarius', transit: 'enter', phase: 'first-quarter', illumination: 62 });
  });

  it('그날 8시 뒤에 별자리가 바뀌면 다음 별자리와 시각', () => {
    expect(skyDay('2026-10-21')).toMatchObject({ moon: 'aquarius', transit: 'leave', nextSign: 'pisces', changeAt: '21:35' });
  });

  it('표 밖이면 null (가짜 하늘로 채우지 않음)', () => {
    expect(SKY_RANGE).toEqual({ from: '2026-10-01', to: '2028-12-31' });
    expect(skyDay('2029-01-01')).toBeNull();
  });
});

describe('집 계산', () => {
  it('내 별자리부터 세어 달이 몇 번째 별자리에 있는지', () => {
    expect(houseOf('aquarius', 'aquarius')).toBe(1);
    expect(houseOf('aries', 'aquarius')).toBe(11);
    expect(houseOf('leo', 'aquarius')).toBe(7);
    expect(houseOf('pisces', 'aries')).toBe(2);
  });

  it('같은 날 12별자리는 모두 다른 집 → 문장이 모두 다름', () => {
    const day = skyDay('2026-10-20')!;
    const houses = new Set(SIGN_IDS.map((s) => houseOf(s, day.moon)));
    const lines = new Set(SIGN_IDS.map((s) => readingFor(bundledContent, s, day).total));
    expect(houses.size).toBe(12);
    expect(lines.size).toBe(12);
  });

  it('문장은 readings[집][영역][머무는 날]', () => {
    const day = skyDay('2026-10-20')!;
    const r = readingFor(bundledContent, 'aquarius', day);
    expect(r.house).toBe(1);
    expect(r.total).toBe(bundledContent.readings['1'].total.enter);
    expect(r.phaseLine).toBe('결정을 내리기 좋은 때예요. 미루던 선택을 해 보세요.');
  });
});

describe('생일로 찾기', () => {
  it('경계가 아닌 날은 하나', () => {
    expect(findSign(4, 1)).toEqual({ kind: 'one', sign: 'aries' });
    expect(findSign(12, 31)).toEqual({ kind: 'one', sign: 'capricorn' });
    expect(findSign(1, 5)).toEqual({ kind: 'one', sign: 'capricorn' });
  });

  it('해를 모르는 경계일은 두 별자리(순서대로)', () => {
    expect(findSign(1, 20)).toEqual({ kind: 'cusp', signs: ['capricorn', 'aquarius'] });
    expect(findSign(3, 21)).toEqual({ kind: 'cusp', signs: ['pisces', 'aries'] });
    expect(findSign(12, 22)).toEqual({ kind: 'cusp', signs: ['sagittarius', 'capricorn'] });
  });

  it('해를 알면 정확히, 들어온 당일이면 시각으로 갈림', () => {
    expect(findSign(1, 21, 1990)).toEqual({ kind: 'one', sign: 'aquarius' });
    expect(findSign(1, 19, 1990)).toEqual({ kind: 'one', sign: 'capricorn' });
    expect(findSign(1, 20, 1990)).toEqual({ kind: 'cusp', signs: ['capricorn', 'aquarius'], changeAt: '17:01' });
    expect(findSign(3, 20, 2026)).toEqual({ kind: 'cusp', signs: ['pisces', 'aries'], changeAt: '23:45' });
  });

  it('없는 날짜는 invalid, 2월 29일은 윤년만', () => {
    expect(findSign(2, 30)).toEqual({ kind: 'invalid' });
    expect(findSign(13, 1)).toEqual({ kind: 'invalid' });
    expect(findSign(2, 29, 2025)).toEqual({ kind: 'invalid' });
    expect(findSign(2, 29, 2024)).toEqual({ kind: 'one', sign: 'pisces' });
  });
});
