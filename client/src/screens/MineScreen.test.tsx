import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bundledContent } from '../content';
import type { MineItem } from '../lib/state';
import { MineScreen } from './MineScreen';

const ME: MineItem = { id: 'aaaaaaaaaaaaaaaa', sign: 'aquarius', label: '나', addedAt: 1 };
const MOM: MineItem = { id: 'bbbbbbbbbbbbbbbb', sign: 'leo', label: '엄마', addedAt: 2 };

function renderMine(items: MineItem[]) {
  const handlers = { onOpenSign: vi.fn(), onAdd: vi.fn(), onRemove: vi.fn(async () => {}) };
  render(
    <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
      <MineScreen content={bundledContent} today="2026-10-20" items={items} {...handlers} />
    </TDSMobileAITProvider>,
  );
  return handlers;
}

describe('MineScreen', () => {
  it('등록 순으로 이름표·오늘 한 줄을 보여 주고, 행을 누르면 자세히로', () => {
    const { onOpenSign, onAdd } = renderMine([ME, MOM]);
    expect(screen.getByText('2개 · 5개까지')).toBeInTheDocument();
    expect(screen.getByText('나 · 물병자리')).toBeInTheDocument();
    expect(screen.getByText(bundledContent.readings['1'].total.enter)).toBeInTheDocument();
    fireEvent.click(screen.getByText('엄마 · 사자자리'));
    expect(onOpenSign).toHaveBeenCalledWith('leo');
    fireEvent.click(screen.getByText('내 별자리 추가'));
    expect(onAdd).toHaveBeenCalled();
  });

  it('삭제는 확인 창(왼쪽 닫기)을 거쳐요', async () => {
    const { onRemove, onOpenSign } = renderMine([ME, MOM]);
    fireEvent.click(screen.getByRole('button', { name: '엄마 · 사자자리 삭제' }));
    expect(onOpenSign).not.toHaveBeenCalled();
    expect(await screen.findByText('엄마 · 사자자리를 지울까요?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    await waitFor(() => expect(screen.queryByText('엄마 · 사자자리를 지울까요?')).not.toBeInTheDocument());
    expect(onRemove).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '엄마 · 사자자리 삭제' }));
    fireEvent.click(await screen.findByRole('button', { name: '삭제' }));
    await waitFor(() => expect(onRemove).toHaveBeenCalledWith('bbbbbbbbbbbbbbbb'));
  });

  it('비어 있으면 안내, 5개면 추가 행 대신 안내 문장', () => {
    renderMine([]);
    expect(screen.getByText('아직 등록한 별자리가 없어요')).toBeInTheDocument();
    expect(screen.getByText('내 별자리 추가')).toBeInTheDocument();
  });

  it('5개가 차면 추가 행이 사라져요', () => {
    const five = ['aries', 'taurus', 'gemini', 'cancer', 'leo'].map((sign, i) => ({ ...ME, id: `cccccccccccccc${i}c`, sign }) as MineItem);
    renderMine(five);
    expect(screen.queryByText('내 별자리 추가')).not.toBeInTheDocument();
    expect(screen.getByText(/5개가 다 찼어요/)).toBeInTheDocument();
  });
});
