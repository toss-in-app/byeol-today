import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bundledContent } from '../content';
import type { AddMineResult } from '../lib/state';
import { SignScreen } from './SignScreen';

const OK: AddMineResult = { ok: true, state: { version: 1, items: [] }, item: { id: 'aaaaaaaaaaaaaaaa', sign: 'leo', label: null, addedAt: 0 } };

const onOpenMatch = vi.fn();

function renderSign(inMine = false, mineCount = 1, result: AddMineResult = OK) {
  const onRegister = vi.fn(async () => result);
  render(
    <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
      <SignScreen content={bundledContent} today="2026-10-20" sign="leo" inMine={inMine} mineCount={mineCount} onRegister={onRegister} onOpenMatch={onOpenMatch} />
    </TDSMobileAITProvider>,
  );
  return onRegister;
}

describe('SignScreen — 내 별자리로 등록', () => {
  it('오늘 하늘 근거와 영역 4 + 달 모양을 그려요', () => {
    renderSign();
    expect(screen.getByText(/나의 7번째 집 '짝과 관계'를 지나요/)).toBeInTheDocument();
    expect(screen.getByText(bundledContent.readings['7'].love.enter)).toBeInTheDocument();
  });

  it('등록 버튼 → 이름표 시트 → 고른 이름표로 등록해요', async () => {
    const onRegister = renderSign();
    fireEvent.click(screen.getByRole('button', { name: '내 별자리로 등록' }));
    expect(await screen.findByText('사자자리를 내 별자리로 등록해요')).toBeInTheDocument();
    fireEvent.click(screen.getByText('엄마'));
    fireEvent.click(screen.getByRole('button', { name: '등록' }));
    await waitFor(() => expect(onRegister).toHaveBeenCalledWith('leo', '엄마'));
  });

  it('이미 내 별자리면 버튼 대신 표시, 궁합 보기는 항상', () => {
    renderSign(true);
    expect(screen.getByText('내 별자리에 있어요')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '내 별자리로 등록' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '궁합 보기' }));
    expect(onOpenMatch).toHaveBeenCalled();
  });

  it('5개가 차 있으면 시트 대신 안내 창', async () => {
    const onRegister = renderSign(false, 5);
    fireEvent.click(screen.getByRole('button', { name: '내 별자리로 등록' }));
    expect(await screen.findByText('내 별자리는 5개까지예요')).toBeInTheDocument();
    expect(onRegister).not.toHaveBeenCalled();
  });
});
