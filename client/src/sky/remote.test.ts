import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetSkyTableForTests, skyDay, SKY_RANGE } from '.';
import { ensureSkyFor, isSkyTable, SKY_CACHE_KEY } from './remote';

const day2029 = { date: '2029-01-01', moon: 'leo', transit: 'stay', phase: 'full', illumination: 99 };
const table2029 = { version: 1, days: [day2029, { ...day2029, date: '2029-01-02', transit: 'leave', nextSign: 'virgo', changeAt: '13:20' }] };
const jsonResponse = (body: unknown, status = 200) => ({ ok: status === 200, status, json: async () => body }) as unknown as Response;

describe('오늘 하늘 표 연장', () => {
  const fetchMock = vi.fn<(url: string) => Promise<Response>>();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    resetSkyTableForTests();
  });
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    resetSkyTableForTests();
  });

  it('모양 검사: 날짜·별자리·상태·달 모양이 맞아야 해요', () => {
    expect(isSkyTable(table2029)).toBe(true);
    expect(isSkyTable({ version: 1, days: [] })).toBe(false);
    expect(isSkyTable({ version: 1, days: [{ ...day2029, moon: 'dragon' }] })).toBe(false);
    expect(isSkyTable({ version: 1, days: [{ ...day2029, changeAt: '9시' }] })).toBe(false);
  });

  it('번들에 있는 날은 아무것도 안 하고, 없는 날은 받아서 덧붙이고 캐시해요', async () => {
    expect(await ensureSkyFor(SKY_RANGE.to)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValue(jsonResponse(table2029));
    expect(skyDay('2029-01-02')).toBeNull();
    expect(await ensureSkyFor('2029-01-02')).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe('https://toss-in-app.github.io/byeol-today/sky-2029.json');
    expect(skyDay('2029-01-02')?.nextSign).toBe('virgo');
    const cached = JSON.parse(window.localStorage.getItem(`__ait_storage:${SKY_CACHE_KEY}`) ?? window.localStorage.getItem(SKY_CACHE_KEY) ?? 'null');
    expect(cached?.tables?.['2029']?.days).toHaveLength(2);

    // 다음엔 캐시로
    resetSkyTableForTests();
    fetchMock.mockReset();
    expect(await ensureSkyFor('2029-01-01')).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('404·형식 오류면 덧붙이지 않아요', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: true }, 404));
    expect(await ensureSkyFor('2030-05-05')).toBe(false);
    fetchMock.mockResolvedValue(jsonResponse({ version: 1, days: [{ date: '2030-05-05' }] }));
    expect(await ensureSkyFor('2030-05-05')).toBe(false);
    expect(skyDay('2030-05-05')).toBeNull();
  });
});
