// content/content.source.json → (검증) → static/content.json + client/src/content/bundled.json
// 검증 통과한 것만 올린다. 스키마: contract/content.schema.json (JSON Schema 2020-12)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));

const schema = read('contract/content.schema.json');
const source = read('content/content.source.json');

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const problems = [];
if (!validate(source)) {
  for (const e of validate.errors) problems.push(`${e.instancePath || '/'} ${e.message}`);
}

// 스키마에 못 넣은 규칙: 이모지 금지, 금칙어(투자·사행성·의료·불안 조성), 운세 문장 중복
const EMOJI = /\p{Extended_Pictographic}/u;
// 오픈 정책(투자 자문·가상자산·사행성·의료)과 메시지 가이드(불안 조성) — 2단계 결정 '재물운·건강운 금칙'
const BANNED = /주식|종목|코인|비트코인|가상\s?화폐|암호\s?화폐|투자|대출|복권|로또|도박|베팅|병원|질병|진료|처방|수술|사망|죽음|사고를|사고가|사고 조심|불행|재앙/;
const walk = (v, path) => {
  if (typeof v === 'string') {
    if (EMOJI.test(v)) problems.push(`${path}: 이모지 금지 — "${v}"`);
    const m = v.match(BANNED);
    if (m) problems.push(`${path}: 금칙어 "${m[0]}" — "${v}"`);
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}/${i}`));
  else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, `${path}/${k}`));
};
walk(source, '');
const seen = new Map();
for (const [house, areas] of Object.entries(source.readings ?? {})) {
  for (const [area, days] of Object.entries(areas)) {
    for (const [day, text] of Object.entries(days)) {
      const at = `readings/${house}/${area}/${day}`;
      if (seen.has(text)) problems.push(`${at}: ${seen.get(text)} 와 같은 문장 — "${text}"`);
      else seen.set(text, at);
    }
  }
}

if (problems.length) {
  console.error(`콘텐츠 검증 실패 (${problems.length})`);
  for (const p of problems) console.error(' -', p);
  process.exit(1);
}

const json = JSON.stringify(source, null, 2) + '\n';
mkdirSync(resolve(root, 'static'), { recursive: true });
mkdirSync(resolve(root, 'client/src/content'), { recursive: true });
writeFileSync(resolve(root, 'static/content.json'), json);
writeFileSync(resolve(root, 'client/src/content/bundled.json'), json);
console.log(`ok: contentVersion ${source.contentVersion}, minClientVersion ${source.minClientVersion}, 문장 ${seen.size} → static/content.json, client/src/content/bundled.json`);
