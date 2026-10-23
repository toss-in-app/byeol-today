# byeol-today 1.1 — AI(RAG) 운세 생성 아키텍처 초안 (2026-10-23, 사용자 "아키텍처 어떻게 하는데?")

전제(2026-10-23 결정 "1-B, 2-A, 나머지 기본안"): 1.0 은 AI 없이 출시, 1.1 에서 **하루 1회 서버 미리 생성(비대화형, 모두 같은 문장)**. 범위는 오늘 운세 4영역·궁합 자세히·행운. 소개 12·'오늘 하늘이란?'·알림 문구는 고정 유지. 정식 설계는 12단계 출시 뒤 3단계에서 — 이 문서는 그때 쓸 밑그림.

## 한 장 그림

```
[매일 05:30 KST 스케줄]
   │
   ▼
[생성 작업 1개 — daily-readings]
   1. 오늘 하늘: 달의 별자리·집 전이(enter/stay/leave)·달 모양  ← 1.0 과 같은 astronomy-engine 계산(sky 표와 동일)
   2. 근거 검색(키 검색, 벡터 없음): corpus 표에서
        집 1~12 의미 · 달이 집을 지날 때 · 택일 宜(오늘 하기 좋은 일) · 달 모양 · 원소 짝 10 · 색/수 대응
      → 별자리마다 구절 4~6개
   3. 프롬프트 = 문장 가이드(해요체·길이·금칙·1.0 문장 144 중 톤 예시 3개) + 근거 구절 + 오늘 하늘
        → claude-sonnet-5-5 → JSON (12별자리 × 총운·사랑·일·돈 + 궁합 10쌍 자세히 + 행운 색·물건·숫자)
        호출 약 14회/일(별자리 12 + 궁합 1 + 행운 1), 출력 짧음 → 월 수천 원
   4. 자동 검사: 금칙어(종목·코인·복권·질병·사고·죽음…)·길이·해요체·불안 조성 표현·형식
        → 걸린 칸만 1.0 고정 문장으로 대체하고 기록
   5. 발행: readings/<YYYY-MM-DD>.json (+ latest.json) 을 공개 HTTPS 에 올림, 생성 기록은 표에 남김
   │
   ▼
[앱 1.1]  하루 1회 GET readings/<오늘>.json (ETag, 3초 제한)
   있으면 → AI 문장 + 'AI' 배지 + 자세히 하단 "AI 가 쓴 글이에요 · 참고 문헌"
   없거나 실패·검사 실패 → 지금처럼 content.json / 번들 문장 144 (화면 구조 동일)
   첫 펼침 1회 안내 시트(진입 즉시가 아니라 운세를 처음 펼칠 때), 설정 > 참고 문헌(출처·CC BY-SA)
   분석 이벤트에 reading_source = ai | fixed 한 칸 추가
```

핵심은 **앱이 '정적 JSON 하루 1회' 구조를 그대로 쓴다**는 점이에요. 1.0 의 content.json 경로(원격 → 검증 → 실패 시 번들)에 파일 하나(readings)가 더 붙는 것뿐이라, 서버가 죽어도 앱은 1.0 처럼 돌아가요.

## 두 가지 실행 방식 — 어디서 돌리나

| | A. Supabase Edge Function (2단계 기본안) | B. GitHub Actions 스케줄 (대안) |
|---|---|---|
| 돌리는 곳 | mandalartplan 과 같은 Supabase 프로젝트(서울), pg_cron → Edge Function `daily-readings` | 비공개 저장소 `byeol-today-corpus` 의 워크플로(`schedule: cron`), Node 스크립트 |
| 코퍼스 | Postgres 표 `corpus_passages`(키 열: house·transit·phase·element·topic) | 같은 비공개 저장소 안의 JSON/MD 파일(키는 front-matter) |
| 발행 | Supabase Storage 공개 버킷 `readings/` (CORS *, CDN) | 공개 저장소 `byeol-today` 의 `static/readings/` 에 커밋 → 기존 Pages 워크플로가 배포 |
| 기록 | 표 `readings`(date·payload·model·prompt_version·checks) | 커밋 이력 + Actions 로그 + `static/readings/_log.json` |
| 비밀 | ANTHROPIC_API_KEY 는 Supabase secret | ANTHROPIC_API_KEY·배포 토큰은 Actions secret |
| 장점 | 이미 쓰는 인프라, DB 에서 샘플 검수·통계가 쉬움 | 서버·DB 없음, 결과가 content.json 과 같은 호스트·같은 CORS/ETag 경로, 무료 플랜 '7일 미사용 정지' 걱정 없음 |
| 단점 | 무료 플랜 정지 위험(매일 돌면 자연히 유지), 함수 25초 제한 안에 14회 호출 → 별자리별 분할 호출 필요 | 스케줄이 최대 10~15분 늦을 수 있음, 하루 한 번 커밋이 저장소 이력에 쌓임, 검수는 파일로 |

추천: **B(Actions)** — 하루 14회 호출짜리 배치라 서버가 필요 없고, 앱 쪽 변경이 가장 작아요(지금 content.json 받는 코드에 readings 한 줄 추가). 코퍼스를 공개 저장소에 올리지 않는다는 원칙도 비공개 저장소로 지켜져요. A 는 1.1 설계 때 사용자별 생성(Q2-B)이나 대화형으로 갈 가능성이 보이면 그때 고르면 돼요. 어느 쪽이든 앱 계약(readings JSON 모양)은 같게 설계해요.

## 코퍼스(검색 대상) 만들기 — 1.1 설계 때 할 일
- 출처: `plans/rag-sources.md` 2절·7절(별자리) — Leo 『How to Judge a Nativity』·『Progressed Horoscope』(달이 집을 지날 때)·Heindel(집 의미)·Ramesey 『Astrologia Restaurata』(택일 宜)·Harley(달 모양)·Kirk·Butler(원소 궁합)·Agrippa(색·수)·Kunz(보석). 모두 PD 또는 CC0/CC BY-SA.
- 단위: 구절(passage) 80~300자, 키 태그 — `house:1..12`, `transit:enter|stay|leave`, `phase:8종`, `element:fire|earth|air|water` 및 쌍, `topic:택일|달모양|색수|궁합`. 태그는 로컬에서 한 번 LLM 보조로 붙이고 사람이 훑어요(수백 개 규모).
- 검색은 키 일치 → 최근 사용 적은 순(같은 구절만 반복 인용되지 않게). 벡터 검색은 코퍼스가 수천 개를 넘으면 2차.
- 라이선스 의무는 공개할 때만: 서버·비공개 저장소에 두고 AI 가 새로 쓴 문장만 내보내면 의무 없음. 참고 문헌 화면에는 출처 목록만(CC BY-SA 자료는 표시).

## 앱 계약(초안) — `readings/<date>.json`
```json
{ "date": "2026-11-01", "generatedAt": "2026-11-01T05:31:00+09:00", "model": "claude-sonnet-5-5", "promptVersion": 1,
  "signs": { "leo": { "total": "…", "love": "…", "work": "…", "money": "…", "sources": ["leo-judge-house8", "ramesey-day"] }, "…": {} },
  "match": { "fire-air": "…", "…": "…" },
  "lucky": { "colors": ["…"], "items": ["…"], "numbers": [3, 8] },
  "checks": { "replaced": ["virgo.money"] } }
```
- 앱 검증: date 가 오늘(한국 날짜)이고 12별자리 × 4영역이 모두 문자열이면 사용. 아니면 무시(1.0 문장). `replaced` 칸은 고정 문장을 보여 주고 AI 배지를 빼요.
- 계약 파일은 `contract/readings.schema.json` 으로 추가(v3), 샘플·ajv 검증은 기존 `npm run contract` 에 합류.

## 정책·고지(오픈 정책 2-4, 과태료 최대 3,000만 원)
- 첫 펼침 1회 안내: "오늘 운세 문장은 AI 가 고전 점성술 문헌을 참고해 써요. 참고와 재미로 봐 주세요." + 확인. 진입 즉시 바텀시트 금지 규칙 때문에 **운세를 처음 펼칠 때**.
- 문장마다 AI 배지, 자세히 하단 "AI 가 쓴 글이에요 · 참고 문헌 보기", 설정 > 참고 문헌.
- 개인정보처리방침: AI 생성 항목 추가(개인정보는 보내지 않음 — 입력이 '오늘 하늘'뿐이라 국외 이전 동의문은 불필요. 사용자별 생성(Q2-B)으로 가면 이름표 등이 가면 국외 이전 항목 필요).
- 비대화형이라 'AI 채팅·상담' 6요건은 해당 없음. 모델·프롬프트 변경은 배포 검토 대상이 아니지만 출시 노트에 적어요.

## 비용·운영
- Anthropic: 프로모션 크레딧(US$100) **2026-11-10 만료** → 1.1 착수 전 유료 충전·월 상한(예: US$5) 결정. 하루 14회 × (입력 ~3k·출력 ~1k 토큰) 수준.
- 실패 대응: 생성 실패·검사 실패 → 그날은 1.0 문장. 알림(메일)은 Actions 실패 알림(B) 또는 Supabase 함수 로그(A).
- 검수: 주 1회 샘플(파일 또는 표) + 앱 '문의' 신고. 금칙어 목록은 `content/` 의 기존 검사(이모지·금칙어)와 공유.

## 1.1 에서 바뀌는 단계
- 2단계: '서버·AI 없음' → '배치 생성, 사용자 데이터 없음'. 7단계 서버 항목은 B 면 없음(A 면 Supabase).
- 3단계: readings 계약·코퍼스 표·프롬프트·AI 표시 화면 설계 → 승인.
- 5단계: 생성 스크립트 + 앱 readings 경로 + AI 안내/배지/참고 문헌 화면. 6단계: 생성 결과 자동 검사 테스트. 8단계: 스케줄·비밀 설정. 11단계: 출시 노트에 'AI 생성 문장' 명시.
