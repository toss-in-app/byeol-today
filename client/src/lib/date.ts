/**
 * 날짜는 모두 한국 날짜(YYYY-MM-DD)로 다뤄요. 오늘 하늘 표가 한국 시간 아침 8시 기준이라,
 * 해외에 있어도 한국 날짜로 오늘을 정해요('오늘 하늘이란?'에 안내).
 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function kstDateKey(now: Date = new Date()): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  return new Date(Date.parse(`${key}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** '2026-10-20' → '10월 20일 화요일' */
export function formatDateLabel(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${WEEKDAYS[d.getUTCDay()]}요일`;
}

/** '21:35' → '오후 9시 35분', '08:00' → '오전 8시' */
export function formatTimeKo(hm: string): string {
  const [h, m] = hm.split(':').map(Number);
  const half = h < 12 ? '오전' : '오후';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${half} ${hour12}시` : `${half} ${hour12}시 ${m}분`;
}
