import { useCallback, useEffect, useState } from 'react';

import { skyDay } from '../sky';
import { ensureSkyFor } from '../sky/remote';

export interface SkyApi {
  /** "표가 바뀐 횟수" — 화면이 skyDay() 를 다시 읽게 하는 신호예요 */
  tick: number;
  /** 오늘이 표에 없으면 연장분을 받아 덧붙여요(당겨서 새로 고침에서도 불러요). 덧붙였으면 true */
  refresh: () => Promise<boolean>;
}

/** 오늘이 번들 표에 없으면(표 끝 뒤) 연장분을 받아 덧붙이고 화면을 다시 그려요. 보통은 아무것도 안 해요. */
export function useSky(today: string): SkyApi {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(async () => {
    if (skyDay(today)) return false;
    const extended = await ensureSkyFor(today);
    if (extended) setTick((n) => n + 1);
    return extended;
  }, [today]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { tick, refresh };
}
