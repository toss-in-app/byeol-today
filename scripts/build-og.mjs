// 공유 링크 미리보기(OG) 이미지 1200×600 → static/og.png (8단계). 비주얼 '천체도': 미색 종이 + 12칸 원형 차트 + 세리프 제목.
// 차트 기하는 client/src/lib/chart.ts 와 같은 계산(여기서는 sky 표 JSON import 를 피하려고 작은 함수를 그대로 적음).
// 글꼴은 Google Fonts(Noto Serif KR 600) — 화면 번들과 같은 글꼴. 그리기는 로컬 Chrome 헤드리스 스크린샷(가상 시간 6초로 글꼴을 기다림).
// 사용: node scripts/build-og.mjs  (macOS, Google Chrome 설치 필요)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = fileURLToPath(new URL('../static/og.png', import.meta.url));
const W = 1200;
const H = 600;
const PAPER = { paper: '#F3EEE3', ink: '#1F2340', accent: '#B5453A', accentSoft: 'rgba(181,69,58,0.16)', muted: '#6B6F7E' };
const SHORT = ['양', '황소', '쌍둥이', '게', '사자', '처녀', '천칭', '전갈', '사수', '염소', '물병', '물고기'];

const polar = (cx, cy, r, deg) => ({ x: cx + r * Math.cos((deg * Math.PI) / 180), y: cy + r * Math.sin((deg * Math.PI) / 180) });
const houseAngle = (house) => -90 + (house - 1) * 30;
const f = (n) => n.toFixed(2);

/** 12칸 차트 SVG 조각 — top 별자리(0~11)가 꼭대기, 달은 house 칸 */
function chart(cx, cy, k, topIndex, house, title) {
  const rO = 140 * k;
  const rI = 112 * k;
  const parts = [];
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${rO}" fill="none" stroke="${PAPER.ink}" stroke-width="${1.2 * k}"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${rI}" fill="none" stroke="${PAPER.ink}" stroke-width="${0.9 * k}"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${60 * k}" fill="none" stroke="${PAPER.ink}" stroke-width="${0.7 * k}" opacity="0.6"/>`);
  const s = houseAngle(1) - 15;
  const o1 = polar(cx, cy, rO, s);
  const o2 = polar(cx, cy, rO, s + 30);
  const i1 = polar(cx, cy, rI, s + 30);
  const i2 = polar(cx, cy, rI, s);
  parts.push(`<path d="M ${f(o1.x)} ${f(o1.y)} A ${rO} ${rO} 0 0 1 ${f(o2.x)} ${f(o2.y)} L ${f(i1.x)} ${f(i1.y)} A ${rI} ${rI} 0 0 0 ${f(i2.x)} ${f(i2.y)} Z" fill="${PAPER.accentSoft}"/>`);
  for (let h = 1; h <= 12; h += 1) {
    const a = polar(cx, cy, rI, houseAngle(h) - 15);
    const b = polar(cx, cy, rO, houseAngle(h) - 15);
    parts.push(`<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${PAPER.ink}" stroke-width="${0.9 * k}"/>`);
  }
  for (let deg = 0; deg < 360; deg += 10) {
    const a = polar(cx, cy, rO - 2 * k, deg);
    const b = polar(cx, cy, rO - 7 * k, deg);
    parts.push(`<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${PAPER.ink}" stroke-width="${0.8 * k}" opacity="0.7"/>`);
  }
  for (let h = 1; h <= 12; h += 1) {
    const p = polar(cx, cy, 126 * k, houseAngle(h));
    const name = SHORT[(topIndex + h - 1) % 12];
    parts.push(`<text x="${f(p.x)}" y="${f(p.y)}" font-size="${11 * k}" font-weight="${h === 1 ? 600 : 400}" fill="${h === 1 ? PAPER.accent : PAPER.ink}" text-anchor="middle" dominant-baseline="middle">${name}</text>`);
  }
  const m = polar(cx, cy, 86 * k, houseAngle(house));
  const ml = polar(cx, cy, 106 * k, houseAngle(house) + 14);
  parts.push(`<line x1="${cx}" y1="${cy}" x2="${f(m.x)}" y2="${f(m.y)}" stroke="${PAPER.accent}" stroke-width="${0.9 * k}" stroke-dasharray="${2 * k} ${3 * k}" opacity="0.85"/>`);
  parts.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="${10 * k}" fill="none" stroke="${PAPER.accent}" stroke-width="${k}"/>`);
  parts.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="${5 * k}" fill="${PAPER.ink}"/>`);
  parts.push(`<text x="${f(ml.x)}" y="${f(ml.y)}" font-size="${9 * k}" fill="${PAPER.accent}" text-anchor="middle" dominant-baseline="middle">달</text>`);
  parts.push(`<text x="${cx}" y="${cy - 6 * k}" font-size="${15 * k}" font-weight="600" fill="${PAPER.ink}" text-anchor="middle" dominant-baseline="middle">${title}</text>`);
  parts.push(`<text x="${cx}" y="${cy + 13 * k}" font-size="${8.5 * k}" fill="${PAPER.muted}" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system, 'Apple SD Gothic Neo', sans-serif">오늘 달 · ${SHORT[(topIndex + house - 1) % 12]}자리 · ${house}번째 집</text>`);
  return parts.join('');
}

const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@600&display=block">
<style>
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${PAPER.paper};color:${PAPER.ink};font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif}
  .text{position:absolute;left:84px;top:140px;width:560px}
  .eyebrow{font-size:20px;letter-spacing:0.16em;color:${PAPER.muted}}
  .title{margin-top:18px;font-family:"Noto Serif KR",serif;font-size:72px;font-weight:600;letter-spacing:-0.01em;line-height:1.12}
  .sub{margin-top:22px;font-size:27px;line-height:1.5;color:#3A3E55}
  .foot{position:absolute;left:84px;bottom:52px;font-size:20px;letter-spacing:0.06em;color:${PAPER.muted}}
  svg text{font-family:"Noto Serif KR",serif}
</style></head>
<body>
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${chart(920, 300, 1.7, 4, 8, '사자자리')}</svg>
  <div class="text">
    <div class="eyebrow">토스 미니앱</div>
    <div class="title">오늘의<br>별자리 운세</div>
    <div class="sub">오늘 달이 지나는 별자리로 보는<br>12별자리 운세와 궁합</div>
  </div>
  <div class="foot">토스 앱에서 '오늘의 별자리 운세' 검색 · 도식</div>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'byeol-og-'));
const src = join(dir, 'og.html');
writeFileSync(src, html);
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--virtual-time-budget=6000', `--window-size=${W},${H}`, `--screenshot=${OUT}`, `file://${src}`], { stdio: 'ignore', timeout: 90_000 });
console.log(`static/og.png ${statSync(OUT).size} bytes (${W}×${H})`);
