/**
 * 알림 동의 (Notification.requestAgreement) — 콘솔 푸시알림(기능성 정기 발송 "오늘 운세", 매일 08:00)에 연결된 동의문을 띄워요.
 * 설계(흐름 문서 '알림 동의 흐름'): 진입·뒤로가기·이탈 때는 절대 묻지 않고, 내 별자리를 등록한 뒤 홈·내 별자리·설정의 행을 사용자가 누른 뒤에만.
 * 결과는 settings.notification(agreed/declined)에 남기고, 거부하면 설정에서만 다시 켤 수 있어요. mandalartplan 과 같은 방식이에요.
 */
import { Notification } from '@apps-in-toss/web-framework';

/**
 * 콘솔 → 푸시알림 → 기능성 탭의 발송 코드(= 동의문이 연결된 템플릿 코드). 반드시 `byeol-today-` 로 시작해요(공식 규칙, contract/events.md).
 * 콘솔에서 템플릿을 만들면 `.env` 의 VITE_NOTIFICATION_TEMPLATE_CODE 에 넣어요. 개발 빌드에서만 설계상의 코드로 대신하고,
 * 출시 빌드에 코드가 없으면 알림 기능 자체를 숨겨요.
 */
export const NOTIFICATION_TEMPLATE_CODE: string =
  (import.meta.env.VITE_NOTIFICATION_TEMPLATE_CODE ?? '').trim() || (import.meta.env.DEV ? 'byeol-today-daily-sky' : '');

/** 알림 동의 기능을 쓸 수 있는지: 템플릿 코드가 있고 토스앱 버전(5.255.0+)이 지원할 때 */
export function notificationAvailable(): boolean {
  if (!NOTIFICATION_TEMPLATE_CODE) return false;
  try {
    return Notification.requestAgreement.isSupported();
  } catch {
    return false;
  }
}

export type AgreementResult = 'agreed' | 'alreadyAgreed' | 'declined' | 'unsupported' | 'failed';

/** 사용자가 동의 화면에서 고르는 시간. 그 안에 결과가 없으면 실패로 봐요 */
const AGREEMENT_TIMEOUT_MS = 120_000;

/** 알림 동의 화면을 띄우고 결과를 기다려요. 던지지 않아요. */
export function requestNotificationAgreement(templateCode: string = NOTIFICATION_TEMPLATE_CODE): Promise<AgreementResult> {
  return new Promise((resolve) => {
    if (!templateCode) {
      resolve('unsupported');
      return;
    }
    let settled = false;
    // 실기기에서 반환값이 함수가 아닌 경우가 있어요(mandalartplan Devtools 메모) → 함수일 때만 해제해요
    let cleanup: unknown = null;
    const finish = (result: AgreementResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (typeof cleanup === 'function') {
        try {
          (cleanup as () => void)();
        } catch {
          /* 무시 */
        }
      }
      resolve(result);
    };
    const timer = setTimeout(() => finish('failed'), AGREEMENT_TIMEOUT_MS);
    const codeOf = (error: unknown) => (error as { code?: unknown } | null)?.code;
    try {
      if (!Notification.requestAgreement.isSupported()) {
        finish('unsupported');
        return;
      }
      cleanup = Notification.requestAgreement({
        options: { templateCode },
        onEvent: (result) => {
          switch (result.type) {
            case 'newAgreement':
              finish('agreed');
              break;
            case 'alreadyAgreed':
              finish('alreadyAgreed');
              break;
            case 'agreementRejected':
              finish('declined');
              break;
            default:
              finish('failed');
          }
        },
        onError: (error: unknown) => {
          finish(codeOf(error) === 'UNSUPPORTED_APP_VERSION' ? 'unsupported' : 'failed');
        },
      });
    } catch (error) {
      finish(codeOf(error) === 'UNSUPPORTED_APP_VERSION' ? 'unsupported' : 'failed');
    }
  });
}

/** 결과별 토스트 문구(해요체). 설정 화면에서도 같은 문구를 써요 */
export const AGREEMENT_MESSAGES: Record<AgreementResult, string> = {
  agreed: '매일 아침 8시에 운세 알림을 보내요',
  alreadyAgreed: '이미 알림을 받고 있어요',
  declined: '알림을 받지 않아요. 설정에서 다시 켤 수 있어요',
  unsupported: '알림은 토스앱을 업데이트하면 설정할 수 있어요',
  failed: '알림을 설정하지 못했어요. 잠시 뒤에 다시 해 주세요',
};
export const ALREADY_AGREED_HINT = '알림은 토스 앱의 알림 설정에서 끌 수 있어요';
