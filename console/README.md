# console/ — 콘솔 앱 정보 자료 (9·11단계 입력값)

앱 관련 자료는 워크플로우 `steps/` 가 아니라 이 프로젝트 폴더 안에 둔다(2026-10-19 사용자 지시). 콘솔 입력은 사용자가 콘솔 웹에서 한다(최초 등록 전 앱은 MCP 로 앱 정보 수정·검토 요청 불가).

| 파일 | 쓰는 곳 |
|------|--------|
| `app-info.md` | 앱 정보: 영문명 후보·부제·상세 설명·카테고리·키워드·고객문의·입력표(맨 아래) |
| `logo-draft.png` | 앱 로고 초안 600×600 RGB(밤하늘 + 금색 초승달 + 양자리 선 그림). `node scripts/build-logo.mjs` 로 다시 만듦. 채택하면 `logo.png` 로 복사 |
| `screenshots/` | 세로 스크린샷 636×1048 초안(Devtools 캡처). 10단계 실기기 캡처로 바꾸는 게 좋음 |
| `features.md` | 주요 기능 3개(국문/영문/intoss 링크/라우터 매핑) |
| `policies/terms.md`·`privacy.md` | 이용약관·개인정보처리방침 md 사본 — 서빙본은 `static/terms/`·`static/privacy/`(GitHub Pages, 2026-10-23 라이브) |
| `release-notes.md` | 11단계 검토 요청 때 작성 |
| OG 이미지 | `static/og.png` 하나만 둔다(`node scripts/build-og.mjs`) |
