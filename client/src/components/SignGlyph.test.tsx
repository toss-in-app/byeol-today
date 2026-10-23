import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CONSTELLATIONS } from '../lib/constellations';
import { MoonIcon } from './MoonIcon';
import { NightBlock } from './NightBlock';
import { SignGlyph, SignIcon } from './SignGlyph';

describe('SignGlyph', () => {
  it('별마다 원 하나(가장 밝은 별은 빛 번짐까지 둘), 선마다 line 하나', () => {
    const { container } = render(<SignGlyph sign="leo" size={96} label="사자자리 별자리 그림" />);
    const leo = CONSTELLATIONS.leo;
    expect(screen.getByRole('img', { name: '사자자리 별자리 그림' })).toBeInTheDocument();
    expect(container.querySelectorAll('line')).toHaveLength(leo.lines.length);
    expect(container.querySelectorAll('circle')).toHaveLength(leo.stars.length + 1);
  });

  it('이름이 없으면 꾸밈으로 숨기고, 아이콘은 남색 원 안에 작게', () => {
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

  it('달 아이콘과 밤하늘 블록', () => {
    const { container } = render(
      <NightBlock aria-label="오늘 하늘">
        <MoonIcon illumination={62} phase="first-quarter" size={32} />
        <span>안의 글</span>
      </NightBlock>,
    );
    expect(screen.getByLabelText('오늘 하늘')).toHaveTextContent('안의 글');
    const path = container.querySelector('path')!;
    expect(path.getAttribute('d')).toContain('A 15 15 0 0 1 16 31');
  });
});
