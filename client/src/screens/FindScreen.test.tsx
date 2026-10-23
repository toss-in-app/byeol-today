import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { bundledContent } from '../content';
import type { AddMineResult } from '../lib/state';
import { FindScreen } from './FindScreen';

function renderFind(mineCount = 0, result: AddMineResult = { ok: true, state: { version: 1, items: [] }, item: { id: 'aaaaaaaaaaaaaaaa', sign: 'leo', label: null, addedAt: 0 } }) {
  const onRegister = vi.fn(async () => result);
  const onDone = vi.fn();
  render(
    <TDSMobileAITProvider brandPrimaryColor="#4C5FD5">
      <FindScreen content={bundledContent} mineCount={mineCount} onRegister={onRegister} onDone={onDone} />
    </TDSMobileAITProvider>,
  );
  return { onRegister, onDone };
}

const type = (placeholder: string, value: string) => fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
const cta = () => screen.getByRole('button', { name: /등록/ });

describe('FindScreen — 생일로 찾기', () => {
  it('월·일만 넣어도 별자리를 알려 주고, 첫 등록은 이름표 "나"가 기본이에요', () => {
    renderFind();
    expect(cta()).toBeDisabled();
    type('월', '2');
    type('일', '1');
    expect(screen.getByText('물병자리예요')).toBeInTheDocument();
    expect(cta()).toBeEnabled();
    expect(cta()).toHaveTextContent('물병자리 · 나 등록');
  });

  it('경계일인데 해를 모르면 두 별자리 중 고르게 해요', () => {
    renderFind();
    type('월', '1');
    type('일', '20');
    expect(screen.getByText(/태어난 해에 따라 염소자리 또는 물병자리예요/)).toBeInTheDocument();
    expect(cta()).toBeDisabled();
    fireEvent.click(screen.getByText('물병자리'));
    expect(cta()).toBeEnabled();
    expect(cta()).toHaveTextContent('물병자리 · 나 등록');
  });

  it('경계일에 해를 넣으면 바뀌는 시각으로 앞뒤를 고르게 해요', () => {
    renderFind();
    type('월', '1');
    type('일', '20');
    type('태어난 해(선택)', '2026');
    expect(screen.getByText(/이날 오전 10시 44분에 물병자리로 바뀌어요/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('그 전 · 염소자리'));
    expect(cta()).toHaveTextContent('염소자리 · 나 등록');
  });

  it('없는 날짜면 안내해요', () => {
    renderFind();
    type('월', '2');
    type('일', '30');
    expect(screen.getByText('날짜를 확인해 주세요.')).toBeInTheDocument();
    expect(cta()).toBeDisabled();
  });

  it('숫자가 아니면 지우고, 해는 4자리까지만', () => {
    renderFind();
    type('월', '1a');
    expect((screen.getByPlaceholderText('월') as HTMLInputElement).value).toBe('1');
    type('태어난 해(선택)', '19901');
    expect((screen.getByPlaceholderText('태어난 해(선택)') as HTMLInputElement).value).toBe('1990');
  });
});

describe('FindScreen — 목록에서 고르기 · 등록', () => {
  it('목록에서 고른 별자리를 이름표와 함께 등록하고 이전 화면으로 돌아가요', async () => {
    const { onRegister, onDone } = renderFind(1);
    fireEvent.click(screen.getByText('목록에서 고르기'));
    fireEvent.click(screen.getByText('사자자리'));
    expect(screen.getByText('선택')).toBeInTheDocument();
    expect(cta()).toHaveTextContent('사자자리 등록'); // 두 번째 등록부터는 이름표 없음이 기본
    fireEvent.click(screen.getByText('엄마'));
    fireEvent.click(cta());
    await waitFor(() => expect(onRegister).toHaveBeenCalledWith('leo', '엄마'));
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it('직접 입력한 이름표는 8자까지 다듬어서 넘겨요', async () => {
    const { onRegister } = renderFind(1);
    fireEvent.click(screen.getByText('목록에서 고르기'));
    fireEvent.click(screen.getByText('처녀자리'));
    fireEvent.click(screen.getByText('직접 입력'));
    fireEvent.change(screen.getByPlaceholderText('예: 동생'), { target: { value: ' 우리 막내 동생 ' } });
    fireEvent.click(cta());
    await waitFor(() => expect(onRegister).toHaveBeenCalledWith('virgo', '우리 막내 동생'));
  });

  it('5개가 차 있으면 등록 대신 안내 창을 띄워요', async () => {
    const { onRegister, onDone } = renderFind(5);
    fireEvent.click(screen.getByText('목록에서 고르기'));
    fireEvent.click(screen.getByText('사자자리'));
    fireEvent.click(cta());
    expect(await screen.findByText('내 별자리는 5개까지예요')).toBeInTheDocument();
    expect(screen.getByText('하나를 지우고 등록해 주세요.')).toBeInTheDocument();
    expect(onRegister).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });
});
