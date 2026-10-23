import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bundledContent } from '../content';
import type { MineItem } from '../lib/state';
import { HomeScreen } from './HomeScreen';

const ME: MineItem = { id: 'aaaaaaaaaaaaaaaa', sign: 'aquarius', label: '나', addedAt: 1 };
const MOM: MineItem = { id: 'bbbbbbbbbbbbbbbb', sign: 'leo', label: '엄마', addedAt: 2 };

function renderHome(today: string, options: { mine?: MineItem[]; mineReady?: boolean; notificationPrompt?: boolean } = {}) {
  const handlers = { onOpenSign: vi.fn(), onFind: vi.fn(), onEditMine: vi.fn(), onAskNotification: vi.fn() };
  render(
    <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
      <HomeScreen
        content={bundledContent}
        today={today}
        mine={options.mine ?? []}
        mineReady={options.mineReady ?? true}
        notificationPrompt={options.notificationPrompt ?? false}
        {...handlers}
      />
    </TDSMobileAITProvider>,
  );
  return handlers;
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
    const { onOpenSign } = renderHome('2026-10-20');
    fireEvent.click(screen.getByText('사자자리 · 7월 23일 ~ 8월 22일'));
    expect(onOpenSign).toHaveBeenCalledWith('leo');
  });

  it('표 밖 날짜면 업데이트 안내, 문장 대신 성향', () => {
    renderHome('2030-01-01');
    expect(screen.getByText('오늘 하늘 정보가 아직 없어요. 앱을 업데이트해 주세요.')).toBeInTheDocument();
    expect(screen.getAllByText(bundledContent.signs[0].trait).length).toBeGreaterThan(0);
  });

  it('내 별자리가 없으면 찾기 행, 편집은 없어요', () => {
    const { onFind } = renderHome('2026-10-20');
    fireEvent.click(screen.getByText('내 별자리 찾기'));
    expect(onFind).toHaveBeenCalled();
    expect(screen.queryByText('편집')).not.toBeInTheDocument();
  });

  it('내 별자리는 맨 위에 이름표와 오늘 한 줄로, 편집은 관리 화면으로', () => {
    const { onOpenSign, onEditMine } = renderHome('2026-10-20', { mine: [ME, MOM] });
    // 2026-10-20 달 물병자리: 물병자리는 1번째 집, 사자자리는 7번째 집(들어온 날)
    expect(screen.getByText('나 · 물병자리')).toBeInTheDocument();
    expect(screen.getByText('엄마 · 사자자리')).toBeInTheDocument();
    expect(screen.getAllByText(bundledContent.readings['7'].total.enter).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('내 별자리 찾기')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('엄마 · 사자자리'));
    expect(onOpenSign).toHaveBeenCalledWith('leo');
    fireEvent.click(screen.getByText('편집'));
    expect(onEditMine).toHaveBeenCalled();
  });

  it('아침 알림 행은 내 별자리가 있고 아직 묻지 않았을 때만, 누른 뒤에 동의를 요청해요', () => {
    const { onAskNotification } = renderHome('2026-10-20', { mine: [ME], notificationPrompt: true });
    fireEvent.click(screen.getByText('매일 아침 8시 운세 알림 받기'));
    expect(onAskNotification).toHaveBeenCalled();
  });

  it('내 별자리가 없거나 이미 물었으면 알림 행이 없어요', () => {
    renderHome('2026-10-20', { notificationPrompt: true });
    expect(screen.queryByText('매일 아침 8시 운세 알림 받기')).not.toBeInTheDocument();
    cleanup();
    renderHome('2026-10-20', { mine: [ME], notificationPrompt: false });
    expect(screen.queryByText('매일 아침 8시 운세 알림 받기')).not.toBeInTheDocument();
  });

  it('저장소를 읽기 전에는 내 별자리 구역을 그리지 않아요', () => {
    renderHome('2026-10-20', { mineReady: false });
    expect(screen.queryByText('내 별자리 찾기')).not.toBeInTheDocument();
    expect(screen.getByText('12별자리 오늘 운세')).toBeInTheDocument();
  });
});
