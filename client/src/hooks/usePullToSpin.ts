import { useRef, useState, type TouchEvent } from 'react';

/** 당긴 만큼 화면이 내려오는 최대(px)·'놓으면 실행' 문턱(px). 손가락 이동의 45% 만 따라와요 */
export const PULL_MAX = 60;
export const PULL_THRESHOLD = 34;
const FOLLOW = 0.45;

export interface PullToSpin {
  /** 화면을 내릴 px */
  offset: number;
  /** 손가락이 닿아 당기는 중인지(이때는 전환 효과 없이 바로 따라와요) */
  pulling: boolean;
  /** 0~1, 문턱에 닿으면 1 */
  progress: number;
  handlers: {
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
  };
}

/**
 * 홈 맨 위에서 아래로 당기면(네이티브 당겨서 새로 고침은 config 에서 꺼 두었어요) 진행률을 돌려주고,
 * 문턱을 넘긴 채 놓으면 onPull 을 한 번 불러요. 손가락 하나·스크롤이 맨 위일 때만.
 */
export function usePullToSpin(onPull: () => void): PullToSpin {
  const startY = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [pulling, setPulling] = useState(false);

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1 || window.scrollY > 0) {
      startY.current = null;
      return;
    }
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (startY.current === null || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) {
      setOffset(0);
      setPulling(false);
      return;
    }
    setPulling(true);
    setOffset(Math.min(PULL_MAX, dy * FOLLOW));
  };
  const onTouchEnd = () => {
    if (startY.current === null) return;
    const reached = offset >= PULL_THRESHOLD;
    startY.current = null;
    setPulling(false);
    setOffset(0);
    if (reached) onPull();
  };

  return { offset, pulling, progress: Math.min(1, offset / PULL_THRESHOLD), handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd } };
}
