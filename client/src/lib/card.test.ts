import { describe, expect, it, vi } from 'vitest';

import { bundledContent } from '../content';
import { skyDay } from '../sky';
import { cardFileName, formatCardDate, layoutCard, prepareCardFonts, renderCard, wrapText } from './card';

const measure = (text: string) => text.length * 10;

describe('card', () => {
  it('문구 계산: 날짜·별자리·오늘 하늘·집·차트 12칸·영역 4·워터마크', () => {
    const day = skyDay('2026-10-20')!;
    const layout = layoutCard({ content: bundledContent, sign: 'leo', today: '2026-10-20', day });
    expect(layout.caption).toBe('오늘의 별자리 운세 · 2026년 10월 20일');
    expect(layout.sign).toBe('leo');
    expect(layout.moon).toBe('aquarius');
    expect(layout.houseNumber).toBe(7);
    expect(layout.ringLabels).toEqual(['사자', '처녀', '천칭', '전갈', '사수', '염소', '물병', '물고기', '양', '황소', '쌍둥이', '게']);
    expect(layout.title).toBe('사자자리');
    expect(layout.sky).toBe('오늘 달은 물병자리에 있어요 · 상현달');
    expect(layout.house).toBe("나의 7번째 집 '짝과 관계'");
    expect(layout.sections.map((s) => s.label)).toEqual(['총운', '사랑', '일', '돈']);
    expect(layout.sections[0].text).toBe(bundledContent.readings['7'].total.enter);
    expect(layout.footer).toBe('오늘의 별자리 운세 · 토스에서 검색');
    expect(formatCardDate('2026-01-05')).toBe('2026년 1월 5일');
    expect(cardFileName('leo', '2026-10-20')).toBe('byeol-today-leo-2026-10-20.png');
  });

  it('wrapText: 띄어쓰기에서 끊고, 줄 수를 넘으면 … ', () => {
    expect(wrapText(measure, '사람과 함께할 때 일이 잘 풀리는 날이에요.', 90, 3)).toEqual(['사람과 함께할 때', '일이 잘 풀리는', '날이에요.']);
    const cut = wrapText(measure, '가나다라마바사아자차카타파하', 50, 2);
    expect(cut).toHaveLength(2);
    expect(cut[1].endsWith('…')).toBe(true);
    expect(wrapText(measure, '  ', 50, 2)).toEqual([]);
  });

  it('캔버스를 못 쓰면 null (jsdom), 캔버스가 있으면 PNG base64 — 차트(고리·칸·달)까지 그려요', () => {
    const day = skyDay('2026-10-20')!;
    expect(renderCard({ content: bundledContent, sign: 'leo', today: '2026-10-20', day })).toBeNull();
    const fakeCtx = {
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText: () => ({ width: 10 }),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
    };
    const canvas = { width: 0, height: 0, getContext: () => fakeCtx, toDataURL: () => 'data:image/png;base64,QUJD' };
    const doc = { createElement: () => canvas } as unknown as Document;
    expect(renderCard({ content: bundledContent, sign: 'leo', today: '2026-10-20', day }, doc)).toEqual({ dataUrl: 'data:image/png;base64,QUJD', base64: 'QUJD' });
    // 고리 3 + 칸 음영 2 + 달 고리·점 2 = arc 7, 경계선 12 + 눈금 36 + 달 점선 1 = 선 49
    expect(fakeCtx.arc).toHaveBeenCalledTimes(7);
    expect(fakeCtx.lineTo).toHaveBeenCalledTimes(49);
    expect(fakeCtx.setLineDash).toHaveBeenCalledWith([]);
    const texts = fakeCtx.fillText.mock.calls.map((c) => c[0]);
    expect(texts).toEqual(expect.arrayContaining(['사자', '물병', '달', '사자자리', '오늘 달 · 물병자리 · 7번째 집', '도식 · 실제 하늘과 다름']));
  });

  it('세리프 준비는 document.fonts 가 없어도(jsdom) 조용히 끝나요', async () => {
    const day = skyDay('2026-10-20')!;
    await expect(prepareCardFonts(layoutCard({ content: bundledContent, sign: 'leo', today: '2026-10-20', day }))).resolves.toBeUndefined();
    const loaded = vi.fn(async () => []);
    await prepareCardFonts(layoutCard({ content: bundledContent, sign: 'leo', today: '2026-10-20', day }), { fonts: { load: loaded, check: () => true } } as unknown as Document);
    expect(loaded).toHaveBeenCalledWith('600 20px "Noto Serif KR"', expect.stringContaining('사자자리'));
  });
});
