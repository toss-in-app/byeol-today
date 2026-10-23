import { describe, expect, it } from 'vitest';

import { addMine, defaultSettings, mineTitle, newId, normalizeLabel, normalizeMine, normalizeSettings, removeMine, type MineItem, type MineState } from './state';

/** 저장소에서 읽은 것처럼 모양이 느슨한 값(검증 테스트용) */
const item = (id: string, sign = 'leo', label: string | null = null) => ({ id, sign, label, addedAt: 1 });
const typed = (id: string, sign: MineItem['sign'], label: string | null = null): MineItem => ({ id, sign, label, addedAt: 1 });

describe('normalizeMine', () => {
  it('계약 모양이면 그대로, 아니면 빈 값', () => {
    expect(normalizeMine({ version: 1, items: [item('abcdefgh')] }).items).toHaveLength(1);
    expect(normalizeMine(null).items).toEqual([]);
    expect(normalizeMine({ version: 2, items: [] }).items).toEqual([]);
    expect(normalizeMine({ version: 1, items: [item('short')] }).items).toEqual([]);
    expect(normalizeMine({ version: 1, items: [item('abcdefgh', 'ophiuchus')] }).items).toEqual([]);
    expect(normalizeMine({ version: 1, items: [item('abcdefgh', 'leo', '아홉글자가넘는이름표')] }).items).toEqual([]);
  });

  it('6개 이상이거나 id 가 겹치면 빈 값', () => {
    const six = Array.from({ length: 6 }, (_, i) => item(`abcdefg${i}`));
    expect(normalizeMine({ version: 1, items: six }).items).toEqual([]);
    expect(normalizeMine({ version: 1, items: [item('abcdefgh'), item('abcdefgh')] }).items).toEqual([]);
  });
});

describe('addMine · removeMine', () => {
  const empty: MineState = { version: 1, items: [] };

  it('이름표는 다듬어서 넣고, 같은 별자리도 여러 번 등록돼요', () => {
    const first = addMine(empty, 'leo', '  나 ', 10, 'aaaaaaaaaaaaaaaa');
    expect(first.ok && first.item).toEqual({ id: 'aaaaaaaaaaaaaaaa', sign: 'leo', label: '나', addedAt: 10 });
    const second = first.ok ? addMine(first.state, 'leo', '', 11, 'bbbbbbbbbbbbbbbb') : first;
    expect(second.ok && second.state.items.map((i) => i.label)).toEqual(['나', null]);
  });

  it('5개가 차면 거절해요', () => {
    let state = empty;
    for (let i = 0; i < 5; i += 1) {
      const r = addMine(state, 'aries', null, i, `cccccccccccccc${i}c`);
      if (r.ok) state = r.state;
    }
    expect(state.items).toHaveLength(5);
    expect(addMine(state, 'aries', null)).toEqual({ ok: false, reason: 'full' });
    expect(removeMine(state, 'cccccccccccccc0c').items).toHaveLength(4);
  });

  it('저장량: 가장 긴 이름표로 5개를 채워도 1KB 안(Storage 상한과 무관)', () => {
    let state = empty;
    for (let i = 0; i < 5; i += 1) {
      const r = addMine(state, 'sagittarius', '우리 막내 동생', 1792732910097 + i, `dddddddddddddd${i}d`);
      if (r.ok) state = r.state;
    }
    expect(state.items).toHaveLength(5);
    expect(new TextEncoder().encode(JSON.stringify(state)).length).toBeLessThan(1024);
  });

  it('이름표 8자 제한, 제목 표기', () => {
    expect(normalizeLabel('우리 막내 동생의 별')).toBe('우리 막내 동생'); // 공백 포함 8자
    expect(mineTitle(typed('abcdefgh', 'leo', '엄마'), '사자자리')).toBe('엄마 · 사자자리');
    expect(mineTitle(typed('abcdefgh', 'leo'), '사자자리')).toBe('사자자리');
  });

  it('newId 는 계약 패턴', () => {
    expect(newId()).toMatch(/^[a-z0-9]{16}$/);
    expect(newId(() => 0)).toBe('aaaaaaaaaaaaaaaa');
  });
});

describe('normalizeSettings', () => {
  it('기본값과 복원', () => {
    expect(normalizeSettings(undefined)).toEqual(defaultSettings());
    const saved = { ...defaultSettings(), notification: 'agreed', ads: { lastInterstitialDate: '2026-10-23' } };
    expect(normalizeSettings(saved).notification).toBe('agreed');
    expect(normalizeSettings({ ...saved, ads: { lastInterstitialDate: '어제' } })).toEqual(defaultSettings());
    expect(normalizeSettings({ ...saved, unlocks: { tomorrow: { date: null, keys: ['aries-leo', 'LEO'] }, matchDetail: { date: null, keys: [] } } })).toEqual(defaultSettings());
  });
});
