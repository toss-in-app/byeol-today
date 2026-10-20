import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bundledContent } from '../content';
import { HomeScreen } from './HomeScreen';

function renderHome(today: string, onOpenSign = vi.fn()) {
  render(
    <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
      <HomeScreen content={bundledContent} today={today} onOpenSign={onOpenSign} />
    </TDSMobileAITProvider>,
  );
  return onOpenSign;
}

describe('HomeScreen', () => {
  it('오늘 하늘과 12별자리 오늘 한 줄을 번들 콘텐츠로 그려요', () => {
    renderHome('2026-10-20');
    expect(screen.getByText('10월 20일 화요일')).toBeInTheDocument();
    expect(screen.getByText('오늘 달은 물병자리에 있어요')).toBeInTheDocument();
    expect(screen.getByText('상현달 · 밝기 62%')).toBeInTheDocument();
    // 양자리: 달이 11번째 집(친구)에 들어온 날
    expect(screen.getByText('양자리 · 3월 21일 ~ 4월 19일')).toBeInTheDocument();
    expect(screen.getByText(bundledContent.readings['11'].total.enter)).toBeInTheDocument();
    expect(screen.getAllByText(/자리 · /)).toHaveLength(12);
  });

  it('그날 달이 옮겨 가면 시각을 보여 줘요', () => {
    renderHome('2026-10-21');
    expect(screen.getByText('오후 9시 35분부터 물고기자리')).toBeInTheDocument();
  });

  it('별자리를 누르면 자세히로', () => {
    const onOpenSign = renderHome('2026-10-20');
    fireEvent.click(screen.getByText('사자자리 · 7월 23일 ~ 8월 22일'));
    expect(onOpenSign).toHaveBeenCalledWith('leo');
  });

  it('표 밖 날짜면 업데이트 안내, 문장 대신 성향', () => {
    renderHome('2030-01-01');
    expect(screen.getByText('오늘 하늘 정보가 아직 없어요. 앱을 업데이트해 주세요.')).toBeInTheDocument();
    expect(screen.getByText(bundledContent.signs[0].trait)).toBeInTheDocument();
  });
});
