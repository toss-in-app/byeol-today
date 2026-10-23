import { describe, expect, it } from 'vitest';

import { SIGN_IDS } from '../sky';
import { CONSTELLATIONS, starRadiusPx } from './constellations';

describe('constellations', () => {
  it('12별자리마다 별 4개 이상, 가장 밝은 별(3)은 하나, 좌표는 0~100 안', () => {
    for (const id of SIGN_IDS) {
      const c = CONSTELLATIONS[id];
      expect(c.stars.length, id).toBeGreaterThanOrEqual(4);
      expect(c.stars.filter(([, , mag]) => mag === 3), id).toHaveLength(1);
      for (const [x, y] of c.stars) {
        expect(x, id).toBeGreaterThanOrEqual(0);
        expect(x, id).toBeLessThanOrEqual(100);
        expect(y, id).toBeGreaterThanOrEqual(0);
        expect(y, id).toBeLessThanOrEqual(100);
      }
    }
  });

  it('선은 있는 별끼리만 잇고, 같은 별을 두 번 잇지 않아요', () => {
    for (const id of SIGN_IDS) {
      const c = CONSTELLATIONS[id];
      const seen = new Set<string>();
      for (const [a, b] of c.lines) {
        expect(a, id).not.toBe(b);
        expect(c.stars[a], `${id} ${a}`).toBeDefined();
        expect(c.stars[b], `${id} ${b}`).toBeDefined();
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        expect(seen.has(key), `${id} ${key}`).toBe(false);
        seen.add(key);
      }
      // 선이 하나도 안 닿는 별은 플레이아데스(밝기 0)뿐
      const linked = new Set(c.lines.flat());
      c.stars.forEach(([, , mag], i) => {
        if (mag > 0) expect(linked.has(i), `${id} star ${i}`).toBe(true);
      });
    }
  });

  it('별 반지름: 작은 아이콘에선 아래 한도, 크면 비례', () => {
    expect(starRadiusPx(1, 28)).toBeCloseTo(1.1);
    expect(starRadiusPx(3, 28)).toBeCloseTo(2.1);
    expect(starRadiusPx(1, 400)).toBeCloseTo(6.4);
    expect(starRadiusPx(3, 400)).toBeCloseTo(12.8);
  });
});
