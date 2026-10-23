# byeol-today — 오늘의 별자리 운세 (앱인토스 미니앱)

오늘 달이 지나는 별자리('오늘 하늘')로 12별자리 운세를 모두 보여 주고, 등록한 별자리들(나·가족·친구)을 맨 위에 모아 아침 알림으로 챙겨 보게 하는 미니앱이에요.
서버·로그인 없음. 저장은 기기 로컬(`Storage`), 콘텐츠는 정적 JSON(GitHub Pages), 오늘 하늘은 빌드 때 계산한 표. 워크플로우 카드는 `~/Desktop/toss/apps/byeol-today.md`, 설계는 `steps/3-design/wireframes/byeol-today-flow.md`.

## 실행

```bash
npm install                 # 루트: 계약 검증(ajv) · 오늘 하늘 계산(astronomy-engine)
npm run content             # content/content.source.json 검증(스키마·이모지·금칙어·중복) → static/content.json + client/src/content/bundled.json
npm run sky                 # 오늘 하늘 표(2026-10-01~2028-12-31)·별자리 경계 표(1930~2030) → client/src/sky/*.json + static/sky-YYYY.json
cd client && npm install
npm run dev                 # AIT Devtools 가 브릿지를 모킹
npm run typecheck && npm test && npm run build   # tsc · vitest · vite build && ait build → client/byeol-today.ait
```

## 검사
- `npm run contract` — 콘텐츠 3벌(원본·번들·static)·오늘 하늘 표·경계 표·상태 샘플 ↔ `contract/*.schema.json`.
- `npm run check` — 계약 → 타입 → 린트 → 테스트 → 출시 번들 빌드.

## 구조

```
contract/                  # 계약 v1 (3단계 승인본). 바뀌면 CHANGELOG.md 에 한 줄
├── content.schema.json    #   별자리 12 · 집 12 · 오늘 하늘 문장 144 · 달 모양 8 · 행운 · 궁합 · 설명
├── sky.schema.json        #   오늘 하늘 표(아침 8시 달 별자리·머무는 날·모양·밝기)
├── sun-ingress.schema.json#   생일로 찾기용 태양 별자리 경계(연도별)
├── state.schema.json      #   Storage 키 2개: zodiac.mine.v1 · zodiac.settings.v1
├── events.md              #   분석 이벤트·광고 그룹·알림 템플릿·공유 링크 이름표
└── samples/
content/content.source.json  # 콘텐츠 원본(사람이 검수)
scripts/                     # build-content · build-sky · check-contract
static/                      # GitHub Pages: content.json · sky-YYYY.json · index · terms · privacy (8단계에서 배포)
client/                      # 미니앱 (React 18 + Vite + TDS + @apps-in-toss/web-framework 3.2.0)
└── src/
    ├── content/             #   번들 콘텐츠·원격 로더
    ├── sky/                 #   오늘 하늘 표·경계 표·집 계산·생일로 찾기
    ├── lib/                 #   라우터(pushState)·Storage·한국 날짜
    └── screens/             #   Home · Sign (4단계 골격), 찾기·내 별자리·궁합·설정은 5단계
```

## 단계 현황
- 1~3단계 완료(2026-10-20): 채택·기획·설계 승인. 4단계 골격(2026-10-20): 홈·별자리 자세히가 번들 콘텐츠·오늘 하늘 표로 그려지고 `.ait` 빌드. 콘솔 앱 등록(appName 확정)·원격 저장소는 사용자 확인 뒤.
