# byeol-today 정적 배포 런북 (GitHub Pages)

- 호스트: `https://toss-in-app.github.io/byeol-today/` — `content.json`(운세 문장·설명) · `sky-2026.json`·`sky-2027.json`·`sky-2028.json`(오늘 하늘 표 연장분) · `og.png`(공유 미리보기 1200×600) · `terms/` · `privacy/` · `/`(안내 페이지)
- 저장소 `toss-in-app/byeol-today`(**공개 유지** — 무료 조직 플랜은 비공개 저장소의 Pages 를 꺼요. mandalartplan 2026-10-20 장애)
- 배포: `.github/workflows/pages.yml` — `main` 에 `static/`·`content/`·`contract/`·`scripts/check-contract.mjs` 가 바뀌어 push 되면 `npm run contract` 통과 뒤 `static/` 을 Pages 로. 1~2분.
- 클라가 받는 방식: `content.json` 은 하루 한 번 `If-None-Match`(ETag), `contentVersion` 이 번들보다 낮지 않고 `minClientVersion` 이 클라 버전 이하일 때만 바꿔 씀. `sky-YYYY.json` 은 번들 표가 끝나 갈 때만. 실패하면 조용히 번들본.

## 갱신 (무심사 콘텐츠)
1. `content/content.source.json` 고치기. **`contentVersion` 을 1 올리기**(번들보다 낮으면 클라가 버려요). 화면 구조를 바꾸는 계약 변경이면 `minClientVersion` 도 올리되, 구 번들 사용자는 그때부터 번들본으로 보게 돼요.
2. `npm run content` — 스키마·이모지·금칙어·중복 검사 → `static/content.json` + `client/src/content/bundled.json`.
3. `npm run contract` — 세 벌(원본·번들·static)이 같은지와 표·상태 샘플까지.
4. `git add -A content static client/src/content/bundled.json && git commit -m "콘텐츠 vN: …" && git push origin main` → Actions 'Deploy static to GitHub Pages'.
5. 확인: `curl -sI https://toss-in-app.github.io/byeol-today/content.json | grep -i "^HTTP\|etag\|access-control-allow-origin"` → 200 · ETag · `*`. 내용: `curl -s …/content.json | python3 -c "import json,sys;print(json.load(sys.stdin)['contentVersion'])"`.
6. 번들본(`bundled.json`)은 다음 출시 번들에 실려요. 출시 번들을 새로 내지 않아도 클라는 원격본을 받아 바뀐 문장을 보여 줘요.

## 오늘 하늘 표 연장 (해마다 한 번, 가을쯤)
1. `scripts/build-sky.mjs` 의 범위 끝을 다음 해 12월 31일로 → `npm run sky` → `client/src/sky/sky.json`·`static/sky-YYYY.json`.
2. `npm run contract` → 커밋·push. 클라는 번들 표가 끝나 갈 때 `sky-<다음 해>.json` 을 받아 덧붙여요(`zodiac.sky.v1`). 번들 표도 다음 출시에 실어요.

## 롤백
- `git revert <커밋> && git push origin main` → Pages 가 다시 돌아요(1~2분). Pages 에는 "이전 배포로 되돌리기" 가 없어서 revert 가 유일한 길이에요.
- 클라는 `contentVersion` 이 번들보다 낮은 원격본을 버리니, 롤백한 판의 `contentVersion` 도 번들 이상이어야 해요.

## 동결
- **11단계 검토 요청 ~ 승인 사이에는 화면이 바뀌는 콘텐츠 갱신(공지 한 줄 포함)을 하지 않아요.** 오타는 승인 뒤에.

## 수동·복구
- 수동 배포: `gh workflow run pages.yml --repo toss-in-app/byeol-today`
- Pages 가 꺼졌을 때(저장소 비공개 전환 등으로 404): 저장소를 공개로 되돌린 뒤 `gh api -X POST repos/toss-in-app/byeol-today/pages -f build_type=workflow` → `gh workflow run pages.yml`
- OG 이미지 다시 만들기: `node scripts/build-og.mjs`(로컬 Chrome 헤드리스) → `static/og.png`
