// 오늘 하늘 표·태양 별자리 경계 표 만들기 (빌드 때 한 번, 결과는 커밋)
//  - 오늘 하늘: 날마다 한국 시간 아침 8시의 달 별자리·머무는 날·모양·밝기, 그날 8시 뒤 별자리가 바뀌면 다음 별자리·시각
//  - 경계: 1930~2030년 해마다 태양이 12별자리에 들어온 시각(한국 시간) — 생일로 찾기
// 계산: astronomy-engine(MIT). 스키마: contract/sky.schema.json, contract/sun-ingress.schema.json
// 사용: npm run sky [-- --from 2026-10-01 --to 2028-12-31]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Astronomy from 'astronomy-engine';
import Ajv2020 from 'ajv/dist/2020.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const FROM = arg('from', '2026-10-01');
const TO = arg('to', '2028-12-31');
const INGRESS_FROM = 1930;
const INGRESS_TO = 2030;

const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
const PHASES = ['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 'full', 'waning-gibbous', 'last-quarter', 'waning-crescent'];
const HOUR = 3600e3;
const KST = 9 * HOUR;
const pkg = read('package.json');
const source = `astronomy-engine ${pkg.devDependencies['astronomy-engine']}`;

/** 한국 날짜 y-m-d 의 h시(한국) 를 UTC Date 로 */
const kstDate = (y, m, d, h = 0, min = 0) => new Date(Date.UTC(y, m - 1, d, h, min) - KST);
const kstHM = (date) => new Date(date.getTime() + KST).toISOString().slice(11, 16);
const moonSign = (date) => Math.floor(Astronomy.EclipticGeoMoon(date).lon / 30) % 12;
const phaseId = (deg) => PHASES[Math.floor(((deg + 22.5) % 360) / 45)];

function skyDay(y, m, d) {
  const at8 = kstDate(y, m, d, 8);
  const prev = moonSign(new Date(at8.getTime() - 24 * HOUR));
  const cur = moonSign(at8);
  const next = moonSign(new Date(at8.getTime() + 24 * HOUR));
  const transit = prev !== cur ? 'enter' : next !== cur ? 'leave' : 'stay';
  const day = {
    date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    moon: SIGNS[cur],
    transit,
    phase: phaseId(Astronomy.MoonPhase(at8)),
    illumination: Math.round(Astronomy.Illumination(Astronomy.Body.Moon, at8).phase_fraction * 100),
  };
  // 그날 8시 뒤 자정 전에 다음 별자리로 옮겨 가면 분 단위 시각
  for (let h = 8; h < 24; h += 1) {
    const a = kstDate(y, m, d, h);
    const b = new Date(a.getTime() + HOUR);
    const sa = moonSign(a);
    if (sa !== moonSign(b)) {
      let lo = a.getTime();
      let hi = b.getTime();
      while (hi - lo > 30e3) {
        const mid = (lo + hi) / 2;
        if (moonSign(new Date(mid)) === sa) lo = mid;
        else hi = mid;
      }
      day.nextSign = SIGNS[moonSign(b)];
      day.changeAt = kstHM(new Date(hi));
      break;
    }
  }
  return day;
}

function buildSky(from, to) {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const days = [];
  for (let t = Date.UTC(fy, fm - 1, fd); t <= Date.UTC(ty, tm - 1, td); t += 24 * HOUR) {
    const u = new Date(t);
    days.push(skyDay(u.getUTCFullYear(), u.getUTCMonth() + 1, u.getUTCDate()));
  }
  return { version: 1, timezone: 'Asia/Seoul', sampleTime: '08:00', source, from, to, days };
}

function buildIngress(fromYear, toYear) {
  const years = {};
  for (let y = fromYear; y <= toYear; y += 1) {
    const start = kstDate(y, 1, 1);
    years[String(y)] = SIGNS.map((sign, k) => {
      const t = Astronomy.SearchSunLongitude(k * 30, start, 367);
      return { sign, at: new Date(t.date.getTime() + KST).toISOString().slice(5, 16) };
    }).sort((a, b) => a.at.localeCompare(b.at));
  }
  return { version: 1, timezone: 'Asia/Seoul', years };
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
const checkSky = ajv.compile(read('contract/sky.schema.json'));
const checkIngress = ajv.compile(read('contract/sun-ingress.schema.json'));
const fail = (label, errors) => {
  console.error(`${label} 검증 실패`);
  for (const e of errors.slice(0, 10)) console.error(' -', e.instancePath || '/', e.message);
  process.exit(1);
};

const sky = buildSky(FROM, TO);
if (!checkSky(sky)) fail('오늘 하늘 표', checkSky.errors);
const ingress = buildIngress(INGRESS_FROM, INGRESS_TO);
if (!checkIngress(ingress)) fail('경계 표', checkIngress.errors);

mkdirSync(resolve(root, 'client/src/sky'), { recursive: true });
writeFileSync(resolve(root, 'client/src/sky/sky.json'), JSON.stringify(sky) + '\n');
writeFileSync(resolve(root, 'client/src/sky/sun-ingress.json'), JSON.stringify(ingress) + '\n');
// 해마다 연장용 정적 파일(번들 표가 끝나 갈 때 앱이 받아 감)
const byYear = {};
for (const d of sky.days) (byYear[d.date.slice(0, 4)] ??= []).push(d);
for (const [year, days] of Object.entries(byYear)) {
  const part = { ...sky, from: days[0].date, to: days[days.length - 1].date, days };
  writeFileSync(resolve(root, `static/sky-${year}.json`), JSON.stringify(part) + '\n');
}
const changes = sky.days.filter((d) => d.changeAt).length;
console.log(`ok: 오늘 하늘 ${sky.days.length}일(${FROM}~${TO}, 그날 바뀜 ${changes}일), 경계 ${INGRESS_FROM}~${INGRESS_TO}년 → client/src/sky/{sky,sun-ingress}.json, static/sky-{${Object.keys(byYear).join(',')}}.json`);
