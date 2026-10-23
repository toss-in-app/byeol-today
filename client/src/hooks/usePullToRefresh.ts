import { useEffect, useRef, useState, type TouchEvent } from 'react';

/** 당긴 만큼 화면이 내려오는 최대(px)·'놓으면 실행' 문턱(px)·새로 고침 중 잡아 두는 높이(px). 손가락 이동의 45% 만 따라와요 */
export const PULL_MAX = 60;
export const PULL_THRESHOLD = 34;
export const PULL_HOLD = 44;
const FOLLOW = 0.45;

export type PullPhase = 'idle' | 'pulling' | 'refreshing' | 'done';

export interface PullToRefresh {
  phase: PullPhase;
  /** 화면을 내릴 px */
  offset: number;
  /** 0~1, 문턱에 닿으면 1 */
  progress: number;
  handlers: {
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
  };
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * 당겨서 새로 고침(네이티브 것은 config 에서 꺼 두었어요 — 켜면 페이지가 통째로 다시 떠요).
 * 스크롤이 맨 위일 때 손가락 하나로 아래로 당기면 진행률을 돌려주고, 문턱을 넘긴 채 놓으면 onRefresh 를 기다린 뒤(최소 minSpinMs 동안 돌림)
 * '최신이에요' 를 doneMs 보여 주고 제자리로. 새로 고침 중에는 새 당김을 받지 않아요.
 */
export function usePullToRefresh(onRefresh: () => Promise<unknown>, minSpinMs = 600, doneMs = 500): PullToRefresh {
  const startY = useRef<number | null>(null);
  const alive = useRef(true);
  const [phase, setPhase] = useState<PullPhase>('idle');
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const run = async () => {
    setPhase('refreshing');
    setOffset(PULL_HOLD);
    const started = Date.now();
    try {
      await onRefresh();
    } catch {
      /* 결과 안내는 호출한 쪽(토스트)이 해요 */
    }
    const remain = minSpinMs - (Date.now() - started);
    if (remain > 0) await wait(remain);
    if (!alive.current) return;
    setPhase('done');
    await wait(doneMs);
    if (!alive.current) return;
    setPhase('idle');
    setOffset(0);
  };

  const onTouchStart = (e: TouchEvent) => {
    if (phase === 'refreshing' || phase === 'done' || e.touches.length !== 1 || window.scrollY > 0) {
      startY.current = null;
      return;
    }
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (startY.current === null || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) {
      setPhase('idle');
      setOffset(0);
      return;
    }
    setPhase('pulling');
    setOffset(Math.min(PULL_MAX, dy * FOLLOW));
  };
  const onTouchEnd = () => {
    if (startY.current === null) return;
    startY.current = null;
    if (offset < PULL_THRESHOLD) {
      setPhase('idle');
      setOffset(0);
      return;
    }
    void run();
  };

  return { phase, offset, progress: Math.min(1, offset / PULL_THRESHOLD), handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd } };
}
