// 공유 링크 미리보기(OG) 이미지 1200×600 → static/og.png (8단계). 비주얼 '밤 별자리': 남색 하늘 + 사자자리 선 그림 + 제목.
// 선 그림 자료는 클라와 같은 client/src/lib/constellations.ts(Node 의 타입 제거 import). 그리기는 로컬 Chrome 헤드리스 스크린샷.
// 사용: node scripts/build-og.mjs  (macOS, Google Chrome 설치 필요)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CONSTELLATIONS, NIGHT } from '../client/src/lib/constellations.ts';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = fileURLToPath(new URL('../static/og.png', import.meta.url));
const W = 1200;
const H = 600;
const RADIUS = { 0: 2.2, 1: 4.6, 2: 6.4, 3: 10 };

/** 별자리 선 그림 SVG 조각 — (x, y)부터 size 한 변 */
function glyph(sign, x, y, size, opacity = 1) {
  const { stars, lines } = CONSTELLATIONS[sign];
  const k = size / 100;
  const px = (v) => (x + v * k).toFixed(1);
  const py = (v) => (y + v * k).toFixed(1);
  const parts = [`<g opacity="${opacity}">`];
  for (const [a, b] of lines) {
    parts.push(`<line x1="${px(stars[a][0])}" y1="${py(stars[a][1])}" x2="${px(stars[b][0])}" y2="${py(stars[b][1])}" stroke="rgba(232,197,106,0.85)" stroke-width="${(2.4 * k).toFixed(2)}" stroke-linecap="round"/>`);
  }
  for (const [sx, sy, mag] of stars) {
    const r = RADIUS[mag] * (size / 440);
    if (mag === 3) parts.push(`<circle cx="${px(sx)}" cy="${py(sy)}" r="${(r * 2.4).toFixed(1)}" fill="rgba(232,197,106,0.25)"/>`);
    parts.push(`<circle cx="${px(sx)}" cy="${py(sy)}" r="${r.toFixed(1)}" fill="${mag === 3 ? NIGHT.gold : NIGHT.star}"/>`);
  }
  parts.push('</g>');
  return parts.join('');
}

/** 흩어진 별 — 늘 같은 하늘이 나오게 정해진 의사난수 */
function starField(count) {
  let seed = 20261023;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push(`<circle cx="${(rand() * W).toFixed(1)}" cy="${(rand() * H).toFixed(1)}" r="${(0.7 + rand() * 1.5).toFixed(2)}" fill="${NIGHT.star}" opacity="${(0.2 + rand() * 0.5).toFixed(2)}"/>`);
  }
  return out.join('');
}

const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<style>
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${NIGHT.sky};color:${NIGHT.star};font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif}
  .sky{position:absolute;inset:0}
  .text{position:absolute;left:84px;top:150px;width:560px}
  .eyebrow{font-size:22px;letter-spacing:0.14em;color:${NIGHT.muted}}
  .title{margin-top:18px;font-size:72px;font-weight:700;letter-spacing:-0.02em;line-height:1.1}
  .sub{margin-top:22px;font-size:28px;line-height:1.5;color:${NIGHT.dim}}
  .foot{position:absolute;left:84px;bottom:52px;font-size:20px;letter-spacing:0.06em;color:${NIGHT.muted}}
</style></head>
<body>
  <svg class="sky" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${starField(140)}
    ${glyph('leo', 700, 70, 440)}
    ${glyph('pisces', 560, 400, 170, 0.55)}
  </svg>
  <div class="text">
    <div class="eyebrow">토스 미니앱</div>
    <div class="title">오늘의<br>별자리 운세</div>
    <div class="sub">오늘 달이 지나는 별자리로 보는<br>12별자리 운세와 궁합</div>
  </div>
  <div class="foot">토스 앱에서 '오늘의 별자리 운세' 검색</div>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'byeol-og-'));
const src = join(dir, 'og.html');
writeFileSync(src, html);
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${W},${H}`, `--screenshot=${OUT}`, `file://${src}`], { stdio: 'ignore', timeout: 60_000 });
console.log(`static/og.png ${statSync(OUT).size} bytes (${W}×${H})`);
