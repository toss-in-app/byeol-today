/** 별자리 자세히의 하단 등록 알약 — ✕로 닫으면 이 앱 세션 동안(화면을 오가도) 다시 띄우지 않아요. 저장하지 않아 다음 실행엔 다시 떠요 */
let dismissed = false;

export function isSignCtaDismissed(): boolean {
  return dismissed;
}

export function dismissSignCta(): void {
  dismissed = true;
}

export function resetSignCtaForTests(): void {
  dismissed = false;
}
