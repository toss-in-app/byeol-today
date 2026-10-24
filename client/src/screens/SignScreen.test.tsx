import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bundledContent } from '../content';
import type { AddMineResult } from '../lib/state';
import { SignScreen } from './SignScreen';

const OK: AddMineResult = { ok: true, state: { version: 1, items: [] }, item: { id: 'aaaaaaaaaaaaaaaa', sign: 'leo', label: null, addedAt: 0 } };

const onOpenMatch = vi.fn();
const onUnlockTomorrow = vi.fn(async () => {});
const onShareLink = vi.fn(async () => {});
const onSaveCard = vi.fn(async () => {});

function renderSign(inMine = false, mineCount = 1, result: AddMineResult = OK, extra: { tomorrowUnlocked?: boolean; adsFree?: boolean; today?: string; noSave?: boolean } = {}) {
  const onRegister = vi.fn(async () => result);
  render(
    <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
      <SignScreen
        content={bundledContent}
        today={extra.today ?? '2026-10-20'}
        sign="leo"
        inMine={inMine}
        mineCount={mineCount}
        onRegister={onRegister}
        onOpenMatch={onOpenMatch}
        tomorrowUnlocked={extra.tomorrowUnlocked ?? false}
        onUnlockTomorrow={onUnlockTomorrow}
        adsFree={extra.adsFree ?? false}
        bannerAdGroupId={null}
        onShareLink={onShareLink}
        onSaveCard={extra.noSave ? null : onSaveCard}
        from="list"
      />
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

  it("'천체도 보기'를 누르면 12칸을 누를 수 있는 큰 천체도 시트", async () => {
    renderSign();
    fireEvent.click(screen.getByText('천체도 보기 ›'));
    expect(await screen.findByRole('button', { name: '1번째 집 사자자리' })).toBeInTheDocument();
    expect(screen.getByText(/7번째 집 · .* · 오늘 달이 여기 있어요/)).toBeInTheDocument();
  });

  it('등록 버튼 → 이름표 시트 → 고른 이름표로 등록해요', async () => {
    const onRegister = renderSign();
    fireEvent.click(screen.getByRole('button', { name: '내 별자리로 등록' }));
    expect(await screen.findByText('사자자리를 내 별자리로 등록해요')).toBeInTheDocument();
    fireEvent.click(screen.getByText('엄마'));
    fireEvent.click(screen.getByRole('button', { name: '등록' }));
    await waitFor(() => expect(onRegister).toHaveBeenCalledWith('leo', '엄마'));
  });

  it('이미 내 별자리면 주 버튼이 궁합 보기이고 글자 줄에 내 별자리 ✓, 등록 버튼은 없어요', () => {
    renderSign(true);
    expect(screen.getByText('내 별자리 ✓')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '내 별자리로 등록' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '궁합 보기' }));
    expect(onOpenMatch).toHaveBeenCalled();
  });

  it('등록 전엔 글자 줄의 궁합 보기로도 궁합에 가요', () => {
    renderSign();
    fireEvent.click(screen.getByRole('button', { name: '궁합 보기' }));
    expect(onOpenMatch).toHaveBeenCalled();
  });

  it('목록에 오늘의 행운(색 · 물건 · 숫자) 행이 있어요', () => {
    renderSign();
    expect(screen.getByText('오늘의 행운')).toBeInTheDocument();
    expect(screen.getByText(/^[가-힣]+ · [가-힣 ]+ · 숫자 [1-9]$/)).toBeInTheDocument();
  });

  it('내일 운세는 잠겨 있고 AD 표시 + 안내, 누르면 열기 요청', () => {
    renderSign();
    const button = screen.getByRole('button', { name: '광고 보고 내일 운세 미리 보기' });
    expect(button).toHaveTextContent('AD');
    expect(screen.getByText('광고를 한 번 보면 사자자리의 내일 운세가 오늘 하루 열려요.')).toBeInTheDocument();
    fireEvent.click(button);
    expect(onUnlockTomorrow).toHaveBeenCalled();
  });

  it('열리면 내일(10-21, 달 물병자리 → 사자자리 7번째 집 나가는 날) 운세를 보여 줘요', () => {
    renderSign(false, 1, OK, { tomorrowUnlocked: true });
    expect(screen.getByText('10월 21일 수요일 · 달은 물병자리에 있어요')).toBeInTheDocument();
    expect(screen.getByText(bundledContent.readings['7'].total.leave)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /내일 운세 미리 보기/ })).not.toBeInTheDocument();
  });

  it('광고 없이 여는 중이면 AD 표시와 광고 안내가 빠져요', () => {
    renderSign(false, 1, OK, { adsFree: true });
    const button = screen.getByRole('button', { name: '내일 운세 미리 보기' });
    expect(button).not.toHaveTextContent('AD');
    expect(screen.getByText('사자자리의 내일 운세를 오늘 하루 볼 수 있어요.')).toBeInTheDocument();
  });

  it('카드 저장·링크 공유 버튼, 저장 미지원이면 저장 버튼 없음', async () => {
    renderSign();
    fireEvent.click(screen.getByRole('button', { name: '링크 공유' }));
    await waitFor(() => expect(onShareLink).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: '카드 저장' }));
    await waitFor(() => expect(onSaveCard).toHaveBeenCalled());
    cleanup();
    renderSign(false, 1, OK, { noSave: true });
    expect(screen.queryByRole('button', { name: '카드 저장' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '링크 공유' })).toBeInTheDocument();
  });

  it('표 끝이면 내일 운세 구역이 없어요', () => {
    renderSign(false, 1, OK, { today: '2028-12-31' });
    expect(screen.queryByText('내일 운세 미리 보기')).not.toBeInTheDocument();
  });

  it('5개가 차 있으면 시트 대신 안내 창', async () => {
    const onRegister = renderSign(false, 5);
    fireEvent.click(screen.getByRole('button', { name: '내 별자리로 등록' }));
    expect(await screen.findByText('내 별자리는 5개까지예요')).toBeInTheDocument();
    expect(onRegister).not.toHaveBeenCalled();
  });
});
