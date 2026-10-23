/**
 * 오늘의 행운(색·물건·숫자) — 콘텐츠의 행운 목록(content.lucky)에서 별자리와 날짜로 정해지는 값이에요.
 * 같은 별자리·같은 날이면 늘 같은 값(기기·사용자와 무관), 별자리마다 다르게 어긋나게 골라요. 근거 문헌은 1.1 RAG 에서.
 */
import type { Content } from '../content';
import { signIndex, type SignId } from '../sky';

export interface Lucky {
  color: string;
  item: string;
  /** 1~9 */
  number: number;
}

/** 'YYYY-MM-DD' → 그 해의 몇 번째 날(1~366) */
export function dayOfYear(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  const start = Date.UTC(y, 0, 1);
  const today = Date.UTC(y, m - 1, d);
  return Math.floor((today - start) / 86_400_000) + 1;
}

export function luckyFor(content: Content, sign: SignId, today: string): Lucky {
  const day = dayOfYear(today);
  const s = signIndex(sign);
  const { colors, items } = content.lucky;
  return {
    color: colors[(day + s * 3) % colors.length],
    item: items[(day * 2 + s * 5) % items.length],
    number: ((day + s * 7) % 9) + 1,
  };
}
