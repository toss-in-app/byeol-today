# byeol-today — 콘솔 '주요 기능' 초안 (2026-10-23, 9단계 3번)

규칙: 최대 3개, 한글 10자 이내(`:` `.` 만 허용, 앱 이름과 같을 수 없음), 영문 15자 이내(단어마다 대문자 시작), "~하기"·명사형, 서비스가 드러나게. 주소는 `intoss://byeol-today/<path>`. **검색에는 1번만 잡힌다** → 이름에 '별자리 운세' 포함. 접속 안 되면 반려.

| # | 한글 (≤10자) | 영문 (≤15자) | 주소 | 화면 | 클라 라우터 매핑 |
|---|------|------|------|------|------|
| 1 | 별자리 운세 보기 (8자) | Daily Horoscope (15자) | `intoss://byeol-today` | 홈 | `routeFromSchemeUrl` → home(오늘 하늘 + 내 별자리 + 12별자리) |
| 2 | 내 별자리 찾기 (7자) | Find My Sign (12자) | `intoss://byeol-today/find` | 찾기 | `parseRoute('#/find')` → 생일로 찾기 / 목록에서 고르기 → 등록 |
| 3 | 별자리 궁합 보기 (8자) | Zodiac Match (12자) | `intoss://byeol-today/match` | 궁합 | `routeFromSchemeUrl` → match(a = 내 별자리 첫 번째, b 는 고르기). `?a=&b=` 가 붙으면 결과까지 |

- 라우터 테스트(`client/src/lib/router.test.ts`)가 세 path 의 매핑을 확인한다. 딥링크로 들어온 화면은 히스토리 바닥이라 뒤로가기 = 종료(설계 '뒤로가기' 절). 딥링크 첫 화면엔 전면 광고를 띄우지 않는다(⑥).
- 영문 대안: 1 "Today Horoscope" (15), 2 "Find Star Sign" (14), 3 "Sign Match" (10).
- 2·3번은 로그인 없이 바로 열린다(토스 로그인 없음). 3번을 내 별자리 없이 열면 두 자리 모두 '고르기'.
