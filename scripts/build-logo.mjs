// 콘솔 로고 초안 600×600 → console/logo-draft.png (9단계). 비주얼 '천체도': 미색 종이(투명 아님·모서리 각짐) + 잉크 12칸 고리 + 붉은 달 표시 + 가운데 잉크 초승달.
// 달 모양은 클라와 같은 client/src/lib/moon.ts(Node 의 타입 제거 import). 그리기는 로컬 Chrome 헤드리스 스크린샷.
// 사용: node scripts/build-logo.mjs  (macOS, Google Chrome 설치 필요)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { moonLitPath } from '../client/src/lib/moon.ts';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = fileURLToPath(new URL('../console/logo-draft.png', import.meta.url));
const S = 600;
const PAPER = { paper: '#F3EEE3', ink: '#1F2340', accent: '#B5453A', accentSoft: 'rgba(181,69,58,0.18)' };
const polar = (cx, cy, r, deg) => ({ x: cx + r * Math.cos((deg * Math.PI) / 180), y: cy + r * Math.sin((deg * Math.PI) / 180) });
const houseAngle = (house) => -90 + (house - 1) * 30;
const f = (n) => n.toFixed(2);

const cx = 300;
const cy = 300;
const rO = 238;
const rI = 188;
const parts = [];
parts.push(`<rect width="${S}" height="${S}" fill="${PAPER.paper}"/>`);
parts.push(`<circle cx="${cx}" cy="${cy}" r="${rO}" fill="none" stroke="${PAPER.ink}" stroke-width="8"/>`);
parts.push(`<circle cx="${cx}" cy="${cy}" r="${rI}" fill="none" stroke="${PAPER.ink}" stroke-width="5"/>`);
// 꼭대기 칸(내 별자리) 음영
const s = houseAngle(1) - 15;
const o1 = polar(cx, cy, rO, s);
const o2 = polar(cx, cy, rO, s + 30);
const i1 = polar(cx, cy, rI, s + 30);
const i2 = polar(cx, cy, rI, s);
parts.push(`<path d="M ${f(o1.x)} ${f(o1.y)} A ${rO} ${rO} 0 0 1 ${f(o2.x)} ${f(o2.y)} L ${f(i1.x)} ${f(i1.y)} A ${rI} ${rI} 0 0 0 ${f(i2.x)} ${f(i2.y)} Z" fill="${PAPER.accentSoft}"/>`);
for (let h = 1; h <= 12; h += 1) {
  const a = polar(cx, cy, rI, houseAngle(h) - 15);
  const b = polar(cx, cy, rO, houseAngle(h) - 15);
  parts.push(`<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${PAPER.ink}" stroke-width="5"/>`);
}
for (let deg = 0; deg < 360; deg += 10) {
  if (deg % 30 === 15) continue;
  const a = polar(cx, cy, rO - 6, deg);
  const b = polar(cx, cy, rO - 22, deg);
  parts.push(`<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${PAPER.ink}" stroke-width="4" opacity="0.75"/>`);
}
// 달 표시(8번째 칸) + 가운데 잉크 초승달
const m = polar(cx, cy, 140, houseAngle(8));
parts.push(`<line x1="${cx}" y1="${cy}" x2="${f(m.x)}" y2="${f(m.y)}" stroke="${PAPER.accent}" stroke-width="6" stroke-dasharray="10 12" opacity="0.9"/>`);
parts.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="26" fill="${PAPER.paper}" stroke="${PAPER.accent}" stroke-width="7"/>`);
parts.push(`<circle cx="${f(m.x)}" cy="${f(m.y)}" r="11" fill="${PAPER.ink}"/>`);
parts.push(`<circle cx="${cx}" cy="${cy}" r="62" fill="${PAPER.paper}" stroke="${PAPER.ink}" stroke-width="4"/>`);
parts.push(`<path d="${moonLitPath(30, true, 40, cx, cy)}" fill="${PAPER.ink}"/>`);

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>html,body{margin:0;width:${S}px;height:${S}px;overflow:hidden;background:${PAPER.paper}}</style></head>
<body><svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${parts.join('')}</svg></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'byeol-logo-'));
const src = join(dir, 'logo.html');
writeFileSync(src, html);
execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${S},${S}`, `--screenshot=${OUT}`, `file://${src}`], { stdio: 'ignore', timeout: 60_000 });
console.log(`console/logo-draft.png ${statSync(OUT).size} bytes (${S}×${S})`);
