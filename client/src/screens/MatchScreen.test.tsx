import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bundledContent } from '../content';
import type { MineItem } from '../lib/state';
import type { SignId } from '../sky';
import { MatchScreen } from './MatchScreen';

const ME: MineItem = { id: 'aaaaaaaaaaaaaaaa', sign: 'aquarius', label: '나', addedAt: 1 };

function renderMatch(props: { mine?: MineItem[]; initialA?: SignId; initialB?: SignId; unlocked?: boolean; adsFree?: boolean } = {}) {
  const onUnlockDetail = vi.fn(async () => true);
  const isDetailUnlocked = vi.fn(() => props.unlocked ?? false);
  const onShareLink = vi.fn(async () => {});
  render(
    <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
      <MatchScreen
        content={bundledContent}
        today="2026-10-20"
        mine={props.mine ?? []}
        initialA={props.initialA}
        initialB={props.initialB}
        isDetailUnlocked={isDetailUnlocked}
        onUnlockDetail={onUnlockDetail}
        adsFree={props.adsFree ?? false}
        onShareLink={onShareLink}
      />
    </TDSMobileAITProvider>,
  );
  return { onUnlockDetail, isDetailUnlocked, onShareLink };
}

describe('MatchScreen', () => {
  it('내 별자리가 있으면 첫 자리에, 상대를 고르면 원소 짝 요약과 오늘 달 원소 한 줄', async () => {
    renderMatch({ mine: [ME] });
    expect(screen.getByRole('button', { name: '첫 번째 별자리: 물병자리' })).toBeInTheDocument();
    expect(screen.getByText('상대 별자리를 골라 주세요.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '두 번째 별자리: 고르기' }));
    expect(await screen.findByText('두 번째 별자리')).toBeInTheDocument();
    fireEvent.click(screen.getByText('사자자리'));
    await waitFor(() => expect(screen.getByText(bundledContent.match.pairs['fire-air'].summary)).toBeInTheDocument());
    expect(screen.getByText('공기 × 불')).toBeInTheDocument();
    // 2026-10-20 달 물병자리(공기)
    expect(screen.getByText(bundledContent.match.today.air)).toBeInTheDocument();
  });

  it('딥링크로 두 별자리가 오면 바로 결과, 자세히는 잠겨 있고 AD 표시가 있어요', () => {
    const { onUnlockDetail } = renderMatch({ initialA: 'taurus', initialB: 'scorpio' });
    expect(screen.getByText(bundledContent.match.pairs['earth-water'].summary)).toBeInTheDocument();
    expect(screen.queryByText(bundledContent.match.pairs['earth-water'].detail)).not.toBeInTheDocument();
    const button = screen.getByRole('button', { name: '광고 보고 궁합 자세히' });
    expect(button).toHaveTextContent('AD');
    fireEvent.click(button);
    expect(onUnlockDetail).toHaveBeenCalledWith('taurus', 'scorpio');
  });

  it('열린 쌍은 자세한 글을 바로 보여 줘요', () => {
    renderMatch({ initialA: 'taurus', initialB: 'scorpio', unlocked: true });
    expect(screen.getByText(bundledContent.match.pairs['earth-water'].detail)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '광고 보고 궁합 자세히' })).not.toBeInTheDocument();
  });

  it('아무것도 없으면 둘 다 고르라고 해요', () => {
    renderMatch();
    expect(screen.getByText('두 별자리를 골라 주세요.')).toBeInTheDocument();
  });

  it('링크로 궁합 보내기는 두 별자리로', async () => {
    const { onShareLink } = renderMatch({ initialA: 'taurus', initialB: 'scorpio' });
    fireEvent.click(screen.getByRole('button', { name: '링크로 궁합 보내기' }));
    await waitFor(() => expect(onShareLink).toHaveBeenCalledWith('taurus', 'scorpio'));
  });

  it('광고 없이 여는 중이면 AD 표시와 광고 안내가 빠져요', () => {
    renderMatch({ initialA: 'taurus', initialB: 'scorpio', adsFree: true });
    const button = screen.getByRole('button', { name: '궁합 자세히' });
    expect(button).not.toHaveTextContent('AD');
    expect(screen.getByText('이 두 별자리의 자세한 글을 오늘 하루 볼 수 있어요.')).toBeInTheDocument();
  });

  it('내 별자리가 저장소에서 늦게 와도 첫 자리에 채워요', () => {
    const props = { content: bundledContent, today: '2026-10-20', isDetailUnlocked: () => false, onUnlockDetail: async () => true, adsFree: false, onShareLink: async () => {} };
    const { rerender } = render(
      <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
        <MatchScreen {...props} mine={[]} />
      </TDSMobileAITProvider>,
    );
    expect(screen.getByText('두 별자리를 골라 주세요.')).toBeInTheDocument();
    rerender(
      <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
        <MatchScreen {...props} mine={[ME]} />
      </TDSMobileAITProvider>,
    );
    expect(screen.getByRole('button', { name: '첫 번째 별자리: 물병자리' })).toBeInTheDocument();
    expect(screen.getByText('상대 별자리를 골라 주세요.')).toBeInTheDocument();
  });
});
