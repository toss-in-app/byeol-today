import { useCallback, useEffect, useRef, useState } from 'react';

import { type SignId } from '../sky';
import { addMine, EMPTY_MINE, loadMine, removeMine, saveMine, type AddMineResult, type MineItem, type MineState } from '../lib/state';

export interface MineApi {
  /** 홈 순서(등록 순) */
  items: MineItem[];
  /** 저장소를 읽기 전에는 false — 그동안 '내 별자리 찾기' 행을 깜빡이지 않게 비워 둬요 */
  ready: boolean;
  add: (sign: SignId, label: string | null) => Promise<AddMineResult>;
  remove: (id: string) => Promise<void>;
  has: (sign: SignId) => boolean;
}

/** 내 별자리 목록을 Storage 와 맞춰 들고 있어요. 저장은 바뀔 때마다 통째로(최대 5개라 작아요) */
export function useMine(): MineApi {
  const [state, setState] = useState<MineState>(EMPTY_MINE);
  const [ready, setReady] = useState(false);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    let alive = true;
    loadMine().then((loaded) => {
      if (!alive) return;
      setState(loaded);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const commit = useCallback(async (next: MineState) => {
    latest.current = next;
    setState(next);
    await saveMine(next);
  }, []);

  const add = useCallback(
    async (sign: SignId, label: string | null) => {
      const result = addMine(latest.current, sign, label);
      if (result.ok) await commit(result.state);
      return result;
    },
    [commit],
  );

  const remove = useCallback((id: string) => commit(removeMine(latest.current, id)), [commit]);
  const has = useCallback((sign: SignId) => state.items.some((item) => item.sign === sign), [state.items]);

  return { items: state.items, ready, add, remove, has };
}
