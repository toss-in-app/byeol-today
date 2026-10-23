import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { bundledContent, signInfo } from '../content';
import { CONSTELLATIONS } from '../lib/constellations';
import { MoonIcon } from './MoonIcon';
import { PaperBlock } from './PaperBlock';
import { SignGlyph, SignIcon } from './SignGlyph';
import { SkyChart } from './SkyChart';

describe('SignGlyph', () => {
  it('별마다 원 하나(가장 밝은 별은 빛 번짐까지 둘), 선마다 line 하나', () => {
    const { container } = render(<SignGlyph sign="leo" size={96} label="사자자리 별자리 그림" />);
    const leo = CONSTELLATIONS.leo;
    expect(screen.getByRole('img', { name: '사자자리 별자리 그림' })).toBeInTheDocument();
    expect(container.querySelectorAll('line')).toHaveLength(leo.lines.length);
    expect(container.querySelectorAll('circle')).toHaveLength(leo.stars.length + 1);
  });

  it('이름이 없으면 꾸밈으로 숨기고, 아이콘은 종이색 원 안에 작게', () => {
    const { container } = render(<SignIcon sign="aquarius" size={40} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('width')).toBe('27');
  });

  it('작은 크기에서도 보통 별은 1px 넘는 점으로', () => {
    const { container } = render(<SignGlyph sign="cancer" size={27} />);
    const circles = [...container.querySelectorAll('circle')].map((c) => Number(c.getAttribute('r')));
    // r 은 viewBox 단위(100/27 배) — 화면에선 1.1px 이상
    for (const r of circles) expect(r * (27 / 100)).toBeGreaterThanOrEqual(1.1);
  });

  it('달 아이콘(잉크)과 종이 블록', () => {
    const { container } = render(
      <PaperBlock aria-label="오늘 하늘">
        <MoonIcon illumination={62} phase="first-quarter" size={32} />
        <span>안의 글</span>
      </PaperBlock>,
    );
    expect(screen.getByLabelText('오늘 하늘')).toHaveTextContent('안의 글');
    const path = container.querySelector('path')!;
    expect(path.getAttribute('d')).toContain('A 14.5 14.5 0 0 1 16 30.5');
  });
});

describe('SkyChart', () => {
  const nameOf = (id: Parameters<typeof signInfo>[1]) => signInfo(bundledContent, id).name;

  it('큰 차트: 12칸 글자(꼭대기 = 내 별자리, 붉게)·달 표시·가운데 글', () => {
    const { container } = render(<SkyChart top="leo" moon="pisces" nameOf={nameOf} size={320} label="천체도" center={{ title: '사자자리', sub: '오늘 달 · 물고기자리 · 8번째 집' }} />);
    expect(screen.getByRole('img', { name: '천체도' })).toBeInTheDocument();
    const texts = [...container.querySelectorAll('text')].map((t) => t.textContent);
    expect(texts.slice(0, 12)).toEqual(['사자', '처녀', '천칭', '전갈', '사수', '염소', '물병', '물고기', '양', '황소', '쌍둥이', '게']);
    expect(texts).toContain('달');
    expect(texts).toContain('사자자리');
    // 꼭대기 칸 글자는 강조색, 달은 8번째 칸(물고기) 쪽
    expect(container.querySelector('text')!.getAttribute('fill')).toBe('#B5453A');
    expect(container.querySelectorAll('path')).toHaveLength(1); // 꼭대기 칸 음영
  });

  it('작은 차트: 글자·눈금 없이 고리·경계선·달 표시만', () => {
    const { container } = render(<SkyChart top="aries" moon="pisces" nameOf={nameOf} size={64} highlightTop={false} />);
    expect(container.querySelectorAll('text')).toHaveLength(0);
    expect(container.querySelectorAll('path')).toHaveLength(0);
    expect(container.querySelectorAll('line')).toHaveLength(13); // 경계선 12 + 달 선 1
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });
});
