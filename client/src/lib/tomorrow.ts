/**
 * '내일 운세 미리 보기'(리워드 rewarded-tomorrow): 오늘 하늘 표의 내일 칸으로 계산한 그 별자리의 운세.
 * 열림은 settings.unlocks.tomorrow(그날·그 별자리만, 계약 state.schema dayUnlock).
 */
import type { Content } from '../content';
import { addDays } from './date';
import type { SettingsState } from './state';
import { readingFor, skyDay, type Reading, type SignId, type SkyDay } from '../sky';

export function tomorrowKey(today: string): string {
  return addDays(today, 1);
}

/** 내일 칸이 표에 있을 때만(표 끝이면 null → 버튼을 숨겨요) */
export function tomorrowReading(content: Content, sign: SignId, today: string): { day: SkyDay; reading: Reading } | null {
  const day = skyDay(tomorrowKey(today));
  if (!day) return null;
  return { day, reading: readingFor(content, sign, day) };
}

export function isTomorrowUnlocked(settings: SettingsState, today: string, sign: SignId): boolean {
  const u = settings.unlocks.tomorrow;
  return u.date === today && u.keys.includes(sign);
}

/** 그날 연 별자리에 추가(날이 바뀌면 이전 목록은 버려요) */
export function withTomorrowUnlocked(settings: SettingsState, today: string, sign: SignId): SettingsState {
  const u = settings.unlocks.tomorrow;
  const keys = u.date === today ? u.keys : [];
  if (keys.includes(sign)) return settings;
  return { ...settings, unlocks: { ...settings.unlocks, tomorrow: { date: today, keys: [...keys, sign] } } };
}
