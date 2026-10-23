import { Analytics } from '@apps-in-toss/web-framework';

/** 분석 이벤트 이름 (contract/events.md 16개). 여기 없는 이름은 보내지 않아요. */
export type EventName =
  | 'home_view'
  | 'sky_info_open'
  | 'sign_view'
  | 'find_open'
  | 'find_result'
  | 'mine_add'
  | 'mine_remove'
  | 'notification_prompt_view'
  | 'notification_agree'
  | 'tomorrow_unlock'
  | 'match_view'
  | 'match_detail_unlock'
  | 'card_save'
  | 'share_link'
  | 'ad_interstitial'
  | 'ad_banner';

export type EventParams = Record<string, string | number | boolean | null | undefined>;

/** 화면 진입 이벤트는 SDK 의 `Analytics.screen` 과 같은 log_type 으로, 나머지는 'event' 로 보내요. */
const SCREEN_EVENTS: ReadonlySet<EventName> = new Set<EventName>(['home_view', 'sign_view', 'match_view']);

/** 세션당 1회만 보내는 이벤트의 기록 */
const sentOnce = new Set<EventName>();

/**
 * `Analytics.log` 로 이벤트를 보내요 (토스앱 5.208.0+, 샌드박스는 콘솔 출력만, 미지원 버전은 조용히 무시).
 * 계약대로 값은 문자열로 보내고, null·undefined 는 빼요. 개인정보는 넣지 않아요 — 생일·이름표 없이 별자리 id 만(events.md).
 * 실패해도 화면 흐름에 영향이 없도록 절대 던지지 않아요. (mandalartplan 과 같은 래퍼)
 */
export function logEvent(name: EventName, params: EventParams = {}): void {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    clean[key] = String(value);
  }
  try {
    void Promise.resolve(Analytics.log({ log_name: name, log_type: SCREEN_EVENTS.has(name) ? 'screen' : 'event', params: clean })).catch(() => {
      /* 브릿지 없음·네트워크 실패는 무시 */
    });
  } catch {
    /* 브릿지 자체가 없는 환경(일반 브라우저) */
  }
}

/** 세션당 1회(home_view·notification_prompt_view). 다시 켜면(새 세션) 다시 보내요 */
export function logEventOnce(name: EventName, params: EventParams = {}): void {
  if (sentOnce.has(name)) return;
  sentOnce.add(name);
  logEvent(name, params);
}

/** 테스트용 */
export function resetAnalyticsForTests(): void {
  sentOnce.clear();
}
