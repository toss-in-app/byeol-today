import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bundledContent, signInfo } from '../content';
import { CONSTELLATIONS } from '../lib/constellations';
import { skyDay } from '../sky';
import { ChartSheet } from './ChartSheet';
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

  it('뜰 때 달 그룹이 꼭대기에서 제 칸까지 돌아가고(회전 각도 = (집-1)×30°), animate=false 면 움직임 없음', () => {
    const { container, unmount } = render(<SkyChart top="leo" moon="pisces" nameOf={nameOf} size={96} />);
    const group = container.querySelector('g.byeol-sweep') as SVGGElement;
    expect(group.style.transform).toBe('rotate(210deg)'); // 8번째 집 = 7칸 × 30°
    expect(container.querySelectorAll('.byeol-draw')).toHaveLength(2);
    unmount();
    const still = render(<SkyChart top="leo" moon="pisces" nameOf={nameOf} size={96} animate={false} />);
    expect(still.container.querySelector('.byeol-sweep')).toBeNull();
    expect(still.container.querySelectorAll('.byeol-fade')).toHaveLength(0);
  });

  it('달 고리 맥동은 기본 켬(돌기가 끝난 뒤 시작), pulse=false 면 없음', () => {
    const { container, unmount } = render(<SkyChart top="leo" moon="pisces" nameOf={nameOf} size={96} />);
    const echo = container.querySelector('circle.byeol-pulse') as SVGCircleElement;
    expect(echo).not.toBeNull();
    expect(echo.style.animationDelay).toBe('1300ms');
    unmount();
    const quiet = render(<SkyChart top="leo" moon="pisces" nameOf={nameOf} size={96} pulse={false} />);
    expect(quiet.container.querySelector('.byeol-pulse')).toBeNull();
  });

  it('칸 누르기: onSelectHouse 가 있으면 12칸이 버튼이고 고른 칸에 테두리', () => {
    const onSelect = vi.fn();
    // 칸 버튼이 읽히려면 svg 자체가 aria-hidden 이 아니어야 해요(label 필수) — ChartSheet 가 그렇게 써요
    render(<SkyChart top="leo" moon="pisces" nameOf={nameOf} size={300} label="천체도" onSelectHouse={onSelect} selectedHouse={8} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(12);
    expect(buttons[0]).toHaveAttribute('aria-label', '1번째 집 사자자리');
    expect(buttons[7]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[7].getAttribute('stroke')).toBe('#B5453A');
    fireEvent.click(buttons[2]);
    expect(onSelect).toHaveBeenCalledWith(3);
    fireEvent.keyDown(buttons[4], { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(5);
  });
});

describe('ChartSheet', () => {
  it('처음엔 오늘 달의 집이 골라져 있고, 다른 칸을 누르면 그 집의 뜻으로 바뀌어요', async () => {
    const day = skyDay('2026-10-23')!; // 달 물고기자리 → 사자자리의 8번째 집
    render(
      <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
        <ChartSheet content={bundledContent} sign="leo" day={day} open onClose={() => {}} />
      </TDSMobileAITProvider>,
    );
    expect(await screen.findByText(/8번째 집 · .* · 오늘 달이 여기 있어요/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2번째 집 처녀자리' }));
    expect(screen.getByText(/^2번째 집 · 돈/)).toBeInTheDocument();
    expect(screen.getByText(/주제: 돈과 소유/)).toBeInTheDocument();
  });
});
