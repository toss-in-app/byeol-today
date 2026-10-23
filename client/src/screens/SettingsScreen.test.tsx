import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bundledContent } from '../content';
import type { NotificationState } from '../lib/state';
import { SettingsScreen } from './SettingsScreen';

function renderSettings(notification: NotificationState = 'unknown', available = true, mineCount = 2) {
  const handlers = { onNotification: vi.fn(), onManageMine: vi.fn() };
  render(
    <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
      <SettingsScreen content={bundledContent} notification={notification} notificationAvailable={available} mineCount={mineCount} {...handlers} />
    </TDSMobileAITProvider>,
  );
  return handlers;
}

describe('SettingsScreen', () => {
  it('알림 상태 표시와 행 동작', () => {
    const { onNotification } = renderSettings('unknown');
    expect(screen.getByText('받기')).toBeInTheDocument();
    fireEvent.click(screen.getByText('매일 아침 8시 운세 알림'));
    expect(onNotification).toHaveBeenCalled();
  });

  it('받는 중 · 꺼짐 라벨', () => {
    renderSettings('agreed');
    expect(screen.getByText('받는 중')).toBeInTheDocument();
  });

  it('템플릿 코드가 없으면 준비 중, 눌리지 않아요', () => {
    const { onNotification } = renderSettings('declined', false);
    expect(screen.getByText('준비 중')).toBeInTheDocument();
    fireEvent.click(screen.getByText('매일 아침 8시 운세 알림'));
    expect(onNotification).not.toHaveBeenCalled();
  });

  it('내 별자리 관리 · 오늘 하늘이란? 시트 · 버전', async () => {
    const { onManageMine } = renderSettings('unknown', true, 3);
    fireEvent.click(screen.getByText('내 별자리 관리'));
    expect(onManageMine).toHaveBeenCalled();
    expect(screen.getByText('3개 등록')).toBeInTheDocument();
    fireEvent.click(screen.getByText('오늘 하늘이란?'));
    expect(await screen.findByText(bundledContent.sky.intro)).toBeInTheDocument();
    expect(screen.getByText(/앱 버전 .* 문구 버전 1/)).toBeInTheDocument();
  });
});
