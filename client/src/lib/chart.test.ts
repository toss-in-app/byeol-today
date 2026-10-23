import { describe, expect, it } from 'vitest';

import { divisionLines, houseAngle, houseLabelPoints, polar, sectorPath, shortName, signAtHouse, ticks } from './chart';

describe('chart', () => {
  it('1번 집이 꼭대기, 시계 방향으로 30°씩', () => {
    expect(houseAngle(1)).toBe(-90);
    expect(houseAngle(4)).toBe(0); // 3시
    expect(houseAngle(7)).toBe(90); // 6시
    const top = polar(160, 160, 100, houseAngle(1));
    expect(top.x).toBeCloseTo(160);
    expect(top.y).toBeCloseTo(60);
  });

  it('꼭대기 별자리에서 N번째 칸의 별자리', () => {
    expect(signAtHouse('leo', 1)).toBe('leo');
    expect(signAtHouse('leo', 8)).toBe('pisces'); // 2026-10-23 달 물고기자리 = 사자자리의 8번째 집
    expect(signAtHouse('pisces', 2)).toBe('aries');
  });

  it('칸 조각·경계선·눈금·글자 자리 개수와 모양', () => {
    expect(sectorPath(160, 160, 140, 112, 1)).toMatch(/^M [\d.]+ [\d.]+ A 140 140 0 0 1 .* L .* A 112 112 0 0 0 .* Z$/);
    expect(divisionLines(160, 160, 140, 112)).toHaveLength(12);
    expect(ticks(160, 160, 136, 6)).toHaveLength(36);
    const labels = houseLabelPoints(160, 160, 126);
    expect(labels).toHaveLength(12);
    expect(labels[0]).toMatchObject({ house: 1 });
    expect(labels[0].y).toBeCloseTo(34);
  });

  it('칸 글자는 자리를 뗀 이름', () => {
    expect(shortName('사자자리')).toBe('사자');
    expect(shortName('물고기자리')).toBe('물고기');
  });
});
