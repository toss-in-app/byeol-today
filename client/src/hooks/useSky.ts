import { useEffect, useState } from 'react';

import { skyDay } from '../sky';
import { ensureSkyFor } from '../sky/remote';

/**
 * 오늘이 번들 표에 없으면(표 끝 뒤) 연장분을 받아 덧붙이고 화면을 다시 그려요. 보통은 아무것도 안 해요.
 * 반환값은 "표가 바뀐 횟수" — 화면이 skyDay() 를 다시 읽게 하는 신호예요.
 */
export function useSky(today: string): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (skyDay(today)) return;
    let alive = true;
    void ensureSkyFor(today).then((extended) => {
      if (alive && extended) setTick((n) => n + 1);
    });
    return () => {
      alive = false;
    };
  }, [today]);
  return tick;
}
