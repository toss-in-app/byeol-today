# byeol-today 이름표 — 분석 이벤트·광고 그룹·알림 템플릿·공유 링크 (계약 v1, 2026-10-20 초안)

개인정보는 어떤 이벤트에도 싣지 않는다. 생일·태어난 해·이름표('나'·'엄마')는 보내지 않고 별자리 id 만.

## 분석 이벤트 (`Analytics.log`)

| 이름 | 언제 | 파라미터 |
|------|------|----------|
| `home_view` | 홈이 보일 때(세션당 1회) | `mine`(내 별자리 수 0~5), `from`(direct/push/link) |
| `sky_info_open` | '오늘 하늘이란?' 시트를 열 때 | - |
| `sign_view` | 별자리 자세히가 보일 때 | `sign`, `house`(1~12), `from`(list/mine/link/match) |
| `find_open` | 내 별자리 찾기 화면 | `from`(home/mine) |
| `find_result` | 별자리를 찾았을 때 | `method`(birthday/pick), `withYear`(true/false), `cusp`(경계일이라 두 개 중 골랐는지) |
| `mine_add` | 내 별자리 등록 | `sign`, `count`(등록 뒤 개수) |
| `mine_remove` | 내 별자리 삭제 | `count` |
| `notification_prompt_view` | 알림 받기 행이 처음 보일 때 | - |
| `notification_agree` | 알림 동의 결과 | `result`(agreed/declined/error/unsupported) |
| `tomorrow_unlock` | 내일 운세 미리 보기 리워드 결과 | `sign`, `result`(rewarded/dismissed/unavailable) |
| `match_view` | 궁합 결과가 보일 때 | `pair`(예: `air-fire`, 원소 쌍), `from`(app/link) |
| `match_detail_unlock` | 궁합 자세히 리워드 결과 | `result`(rewarded/dismissed/unavailable) |
| `card_save` | 오늘 카드 이미지 저장 | `sign`, `result`(saved/denied/error) |
| `share_link` | 공유 링크 보냄 | `kind`(sign/match) |
| `ad_interstitial` | 전면 광고 시도 | `result`(shown/skipped/failed) |
| `ad_banner` | 배너 결과 | `result`(rendered/nofill/failed) |

**핵심 지표 후보(9단계 콘솔 등록)**: 활성 = `sign_view` · 전환 = `mine_add`(대표), `notification_agree`(agreed), `share_link`.

## 광고 그룹 (콘솔 인앱 광고 — 4단계 등록 뒤 ID)

| 이름 | 유형 | 지점 | 규칙 |
|------|------|------|------|
| `interstitial-sign` | 전면 | 홈 목록·내 별자리 → 별자리 자세히 | 하루 1회(한국 날짜, `settings.ads.lastInterstitialDate`), **처음 연 날은 없음**(`firstOpenAt`), 딥링크로 바로 들어온 첫 화면엔 없음. 차례인 날은 홈 목록 위에 안내 한 줄. 미리 불러 두고 실패하면 그냥 이동 |
| `rewarded-tomorrow` | 리워드 | 별자리 자세히 '내일 운세 미리 보기' | 보상 = 그 별자리의 내일 운세(오늘 하늘 표의 내일 칸으로 계산), 이름 "내일 운세" 1. `userEarnedReward` 에서만, 그날 동안 열림(`unlocks.tomorrow`) |
| `rewarded-match-detail` | 리워드 | 궁합 결과 '궁합 자세히' | 보상 = 원소 쌍의 자세한 글, 이름 "궁합 자세히" 1. 그날 동안 그 쌍은 열림(`unlocks.matchDetail`) |
| `banner-sign` | 배너 | 별자리 자세히 맨 아래(스크롤 화면) 1개 | refresh 없음, 실패하면 자리 숨김 |

광고를 못 불러오면 리워드 콘텐츠는 열리지 않고 "지금은 광고를 불러올 수 없어요. 잠시 뒤에 다시 해 주세요." 안내. 전면·리워드 지면 신규 생성 오류 공지(54047)가 아직 열려 있으면 그룹 생성 전에 `notice_list` 로 복구를 확인한다.

## 알림 (기능성 정기 발송 1개 — 콘솔에서 만들기 전에 사용자 확인)

| 항목 | 값 |
|------|----|
| 동의문 | 정기(SCHEDULED)·매일(DAILY) 08:00, purpose "오늘 운세" → 동의 화면 제목 "매일 오늘 운세 알림을 보내드릴까요?" |
| 템플릿 | REGULAR · FUNCTIONAL, 발송 코드 `byeol-today-daily-sky`(콘솔이 `{appName}-` 접두), 제목 **"오늘 운세"**(5자), 본문 **"오늘 하늘로 본 별자리 운세가 왔어요."**(21자), 링크 `intoss://byeol-today` |
| 앱 흐름 | 내 별자리를 처음 등록한 뒤에만 홈·내 별자리 화면에 "매일 아침 8시 운세 알림 받기" 행 → `Notification.requestAgreement`. 거부하면 홈에서 숨기고 설정에서만 다시. 진입 즉시·뒤로가기 때 묻지 않음 |
| 개인화 | 모두에게 같은 문구(변수는 이름뿐). 별자리별 문장은 앱에서 — 알림을 누르면 홈 맨 위에 내 별자리 |

## 공유

- **오늘 카드 이미지**: 1080×1350 PNG — 날짜, 별자리 이름·기호, 총운 한 줄, 오늘 하늘 한 줄(달의 별자리·모양), 워터마크 "오늘의 별자리 운세 · 토스에서 검색". `File.saveBase64`(photos 권한, 저장 버튼을 누를 때만 요청). 거부해도 링크 공유는 됨.
- **링크**: `Share.createLink({ path, ogImageUrl })`
  - 별자리: `intoss://byeol-today/sign/<id>` → 받은 사람은 그 별자리 자세히(첫 화면, 뒤로가기 = 종료, 전면 광고 없음)
  - 궁합: `intoss://byeol-today/match?a=<id>&b=<id>` → 받은 사람은 그 궁합 결과(요약까지, 자세히는 리워드)
  - OG 이미지: 정적 `og.png` 1200×600
- 공유 리워드(토스 포인트)는 쓰지 않음(2026-10-23 종료, 공지 53433).

## 앱 내 기능 (콘솔 등록, 9단계)
1. 오늘의 별자리 운세 — `intoss://byeol-today`
2. 내 별자리 — `intoss://byeol-today/mine`
3. 별자리 궁합 — `intoss://byeol-today/match`
