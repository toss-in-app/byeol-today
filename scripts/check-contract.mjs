// 계약 검증: 콘텐츠 3벌(원본·번들·static)·오늘 하늘 표·경계 표·상태 샘플이 contract/*.schema.json 을 통과하는지.
// 실패하면 종료 코드 1. 사용: npm run contract (프로젝트 루트)
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
const problems = [];
const ok = (label) => console.log(`  ok  ${label}`);
const fail = (label, errors) => {
  problems.push(label);
  console.error(`  FAIL ${label}`);
  for (const e of (errors ?? []).slice(0, 10)) console.error(`       ${e.instancePath || '/'} ${e.message}`);
};

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const v = {
  content: ajv.compile(read('contract/content.schema.json')),
  sky: ajv.compile(read('contract/sky.schema.json')),
  ingress: ajv.compile(read('contract/sun-ingress.schema.json')),
  state: ajv.compile(read('contract/state.schema.json')),
};
const check = (kind, label, json) => (v[kind](json) ? ok(label) : fail(label, v[kind].errors));

console.log('콘텐츠 계약');
const copies = {
  'content/content.source.json': read('content/content.source.json'),
  'client/src/content/bundled.json': read('client/src/content/bundled.json'),
  'static/content.json': read('static/content.json'),
};
for (const [label, json] of Object.entries(copies)) check('content', `${label} (contentVersion ${json.contentVersion})`, json);
const [a, b, c] = Object.values(copies).map((j) => JSON.stringify(j));
if (a === b && a === c) ok('원본·번들·static 세 벌이 같음');
else fail('원본·번들·static 이 다름 — npm run content 로 다시 만들기');
check('content', 'contract/samples/content.sample.json', read('contract/samples/content.sample.json'));

console.log('오늘 하늘·경계 표');
const sky = read('client/src/sky/sky.json');
check('sky', `client/src/sky/sky.json (${sky.from}~${sky.to}, ${sky.days.length}일)`, sky);
for (const f of readdirSync(resolve(root, 'static')).filter((n) => /^sky-\d{4}\.json$/.test(n))) check('sky', `static/${f}`, read(`static/${f}`));
check('sky', 'contract/samples/sky.sample.json', read('contract/samples/sky.sample.json'));
const ingress = read('client/src/sky/sun-ingress.json');
check('ingress', `client/src/sky/sun-ingress.json (${Object.keys(ingress.years).length}년)`, ingress);
check('ingress', 'contract/samples/sun-ingress.sample.json', read('contract/samples/sun-ingress.sample.json'));
// 날짜가 하루도 빠지지 않고 이어지는지
const gaps = sky.days.filter((d, i) => i > 0 && Date.parse(d.date) - Date.parse(sky.days[i - 1].date) !== 864e5);
gaps.length ? fail(`오늘 하늘 표 날짜 빠짐 ${gaps.length}곳`) : ok('오늘 하늘 표 날짜 연속');

console.log('상태 계약');
check('state', 'contract/samples/state.sample.json', read('contract/samples/state.sample.json'));

if (!existsSync(resolve(root, 'client/package.json'))) console.log('  (client 아직 없음)');
if (problems.length) {
  console.error(`\n계약 검증 실패 ${problems.length}건`);
  process.exit(1);
}
console.log('\n계약 검증 통과');
