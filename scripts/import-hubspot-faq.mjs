// HubSpot 파일함의 FAQ 엑셀을 읽어 고객지원센터 [자주 묻는 질문]을 만듭니다.
// 마케팅은 HubSpot '에이딘 자주묻는질문' 폴더의 엑셀만 고치면 됩니다. (15분마다 사이트에 반영)
//
// 엑셀 구성
//   시트 '국문' · '영문' — 칸: 분류 | 질문 | 답변 | 공개(O/X)
//   - 분류가 사이트의 탭이 됩니다. 처음 나온 순서대로 탭이 놓입니다.
//   - 공개가 X 이거나 질문이 _ 로 시작하면 사이트에 올리지 않습니다.
//   - 폴더에 엑셀이 여러 개면 가장 최근에 수정한 파일 하나만 씁니다. (이름이 _ 로 시작하는 파일은 무시)
//
// 동작
//   GitBook 원고(.src/ko, .src/en)의 FAQ 페이지와 목차(SUMMARY.md)의 FAQ 부분을
//   엑셀 내용으로 바꿔 쓴 다음, import-gitbook.mjs 가 평소처럼 사이트 문서로 변환합니다.
//   (원고 저장소 자체는 건드리지 않습니다. 빌드할 때 받아 온 복사본만 바꿉니다.)
//
// 토큰(HUBSPOT_TOKEN)이 없거나 파일을 못 읽으면 아무것도 바꾸지 않고 깃북 FAQ를 그대로 씁니다.
// 폴더 이름을 바꾸려면 저장소 Variables 에 HUBSPOT_FAQ_FOLDER 를 넣으면 됩니다.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const FOLDER = process.env.HUBSPOT_FAQ_FOLDER || '에이딘 자주묻는질문';
const TOKEN = process.env.HUBSPOT_TOKEN;
const API = 'https://api.hubapi.com/files/v3';
const SRC = { ko: path.resolve(process.env.FAQ_SRC_KO || '.src/ko'), en: path.resolve(process.env.FAQ_SRC_EN || '.src/en') };
const SHEETS = { ko: /국문|KO|한국/i, en: /영문|EN|영어/i };
const INTRO = {
  ko: { description: '고객님들이 자주 문의하신 질문과 답변입니다.', lead: '고객님들이 자주 문의하신 질문과 답변입니다.<br />항목을 누르면 답변을 확인하실 수 있습니다.' },
  en: { description: 'Answers to the questions our customers ask most often.', lead: 'Answers to the questions our customers ask most often.<br />Select a question to see the answer.' },
};

// ── 작은 xlsx 읽기 (zip → 시트 XML). 패키지를 더 설치하지 않으려고 직접 읽음 ─────────
function unzip(buf) {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('엑셀(zip) 형식이 아닙니다');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = {};
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nameLen).toString('utf8');
    const lStart = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const data = buf.slice(lStart, lStart + size);
    files[name] = method === 0 ? data : zlib.inflateRawSync(data);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const xmlText = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
// <si> 안의 모든 <t> (서식이 섞인 글자 포함)를 이어 붙임
const allT = (xml) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g)].map((m) => xmlText(m[1] || '')).join('');

function readXlsx(buf) {
  const z = unzip(buf);
  const str = (n) => (z[n] ? z[n].toString('utf8') : '');
  const shared = [...str('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => allT(m[1]));
  const rels = Object.fromEntries([...str('xl/_rels/workbook.xml.rels').matchAll(/<Relationship\b[^>]*>/g)].map((m) => [
    (m[0].match(/Id="([^"]+)"/) || [])[1], (m[0].match(/Target="([^"]+)"/) || [])[1],
  ]));
  const sheets = {};
  for (const m of str('xl/workbook.xml').matchAll(/<sheet\b[^>]*>/g)) {
    const name = xmlText((m[0].match(/name="([^"]*)"/) || [])[1] || '');
    const rid = (m[0].match(/r:id="([^"]+)"/) || [])[1];
    let target = rels[rid] || '';
    target = target.startsWith('/') ? target.slice(1) : 'xl/' + target.replace(/^\.\//, '');
    const xml = str(target);
    const rows = [];
    for (const r of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
      const row = [];
      for (const c of r[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const ref = (c[1].match(/r="([A-Z]+)\d+"/) || [])[1] || '';
        const col = [...ref].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
        const type = (c[1].match(/t="([^"]+)"/) || [])[1];
        const inner = c[2] || '';
        let v = '';
        if (type === 's') v = shared[+((inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1])] ?? '';
        else if (type === 'inlineStr') v = allT(inner);
        else v = xmlText((inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || '');
        row[col >= 0 ? col : row.length] = v;
      }
      rows.push(Array.from(row, (x) => (x ?? '').toString()));
    }
    sheets[name] = rows;
  }
  return sheets;
}

// 시트 → [{ cat, items: [{ q, a }] }] (분류는 처음 나온 순서대로)
function toCategories(rows) {
  const head = (rows[0] || []).map((h) => h.trim());
  const col = (re, d) => { const i = head.findIndex((h) => re.test(h)); return i >= 0 ? i : d; };
  const cCat = col(/분류|category/i, 0), cQ = col(/질문|question/i, 1), cA = col(/답변|answer/i, 2), cPub = col(/공개|public|show/i, 3);
  const cats = [];
  for (const r of rows.slice(1)) {
    const cat = (r[cCat] || '').replace(/[[\]]/g, '').trim(), q = (r[cQ] || '').trim(), a = (r[cA] || '').trim();
    const pub = (r[cPub] || '').trim().toUpperCase();
    if (!cat || !q || !a || q.startsWith('_') || ['X', 'N', 'NO', '비공개'].includes(pub)) continue;
    let c = cats.find((x) => x.cat === cat);
    if (!c) cats.push((c = { cat, items: [] }));
    c.items.push({ q, a });
  }
  return cats;
}

// ── GitBook 원고 복사본 바꿔 쓰기 ─────────────────────────────
// 엑셀에 < > { } 가 들어가도 사이트 빌드가 깨지지 않게 글자로 바꿈 (링크 [글자](주소)는 그대로)
const esc = (s) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
function pageMd(locale, title, items) {
  const { description, lead } = INTRO[locale];
  const blocks = items.map(({ q, a }) => {
    const body = esc(a).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join('\n\n');
    return `<details>\n\n<summary>${esc(q)}</summary>\n\n${body}\n\n</details>`;
  });
  return `---\ndescription: ${JSON.stringify(description)}\n---\n\n# ${esc(title)}\n\n${lead}\n\n${blocks.join('\n\n')}\n`;
}

function rewriteLocale(locale, cats) {
  const dir = SRC[locale];
  const sumFile = path.join(dir, 'SUMMARY.md');
  if (!fs.existsSync(sumFile) || !cats.length) return 0;
  const lines = fs.readFileSync(sumFile, 'utf8').split('\n');
  const ind = (l) => l.match(/^\s*/)[0].replace(/\t/g, '  ').length;
  const top = lines.findIndex((l) => /\]\(index-faq\.md\)/.test(l));
  if (top < 0) throw new Error(`[${locale}] 목차에 자주 묻는 질문(index-faq.md)이 없습니다`);
  // 기존 FAQ 하위 항목: 들여쓰기가 더 깊은 줄, 또는 (평평한 목차라면) faq-*.md 줄
  let end = top + 1;
  while (end < lines.length && lines[end].trim() && (ind(lines[end]) > ind(lines[top]) || /\]\(faq-[^)]*\.md\)/.test(lines[end]))) end++;
  const old = lines.slice(top + 1, end).map((l) => {
    const m = l.match(/\[(.+?)\]\((faq-[^)]+\.md)\)/);
    return m && { title: m[1].trim(), file: m[2] };
  }).filter(Boolean);
  const pad = lines[top + 1] && end > top + 1 ? lines[top + 1].match(/^\s*/)[0] : ' '.repeat(ind(lines[top]) + 2);
  const used = new Set();
  const entries = cats.map((c, i) => {
    // 기존 분류와 이름이 같으면 같은 주소(faq-common 등)를 그대로 씀
    let file = (old.find((o) => o.title === c.cat) || {}).file;
    if (!file || used.has(file)) file = `faq-hs-${i + 1}.md`;
    used.add(file);
    fs.writeFileSync(path.join(dir, file), pageMd(locale, c.cat, c.items));
    return `${pad}* [${c.cat}](${file})`;
  });
  lines.splice(top + 1, end - top - 1, ...entries);
  fs.writeFileSync(sumFile, lines.join('\n'));
  return cats.reduce((n, c) => n + c.items.length, 0);
}

// ── HubSpot에서 파일 찾기 ─────────────────────────────────────
async function get(url, raw) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  return raw ? Buffer.from(await res.arrayBuffer()) : res.json();
}
async function all(base) {
  const out = [];
  let after;
  for (let i = 0; i < 50; i++) {
    const u = new URL(base);
    u.searchParams.set('limit', '100');
    if (after) u.searchParams.set('after', after);
    const j = await get(u.toString());
    out.push(...(j.results || []));
    after = j.paging?.next?.after;
    if (!after) break;
  }
  return out;
}
async function download(file) {
  const tryUrl = async (u) => {
    const res = await fetch(u);
    if (!res.ok) throw new Error(`${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  };
  try {
    if (file.url) return await tryUrl(file.url);
  } catch { /* 비공개 파일이면 아래 임시 주소로 */ }
  const s = await get(`${API}/files/${file.id}/signed-url`);
  return tryUrl(s.url);
}

async function main(localFile) {
  let buf;
  if (localFile) buf = fs.readFileSync(localFile); // 테스트용: node import-hubspot-faq.mjs <파일.xlsx>
  else {
    if (!TOKEN) return console.log('HubSpot 토큰 없음 → 깃북 FAQ를 그대로 사용');
    const folders = (await all(`${API}/folders/search`)).filter((f) => !f.archived);
    const root = folders.find((f) => f.name === FOLDER || f.path === FOLDER || f.path === `/${FOLDER}`);
    if (!root) return console.log(`HubSpot 폴더 없음(${FOLDER}) → 깃북 FAQ를 그대로 사용`);
    const files = (await all(`${API}/files/search?parentFolderIds=${root.id}`))
      .filter((f) => String(f.parentFolderId) === String(root.id) && !f.archived && /^xlsx$/i.test(f.extension || '') && !String(f.name || '').startsWith('_'))
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    if (!files.length) return console.log(`'${FOLDER}' 폴더에 엑셀 파일 없음 → 깃북 FAQ를 그대로 사용`);
    buf = await download(files[0]);
    console.log(`HubSpot FAQ 파일: ${files[0].name}.${files[0].extension} (수정 ${files[0].updatedAt})`);
  }
  const sheets = readXlsx(buf);
  const result = {};
  for (const loc of ['ko', 'en']) {
    const name = Object.keys(sheets).find((n) => SHEETS[loc].test(n));
    result[loc] = name ? toCategories(sheets[name]) : [];
  }
  if (!result.ko.length) throw new Error("'국문' 시트에서 질문을 하나도 찾지 못했습니다");
  // 모두 읽은 뒤에 한꺼번에 씀 (중간에 실패하면 원고를 건드리지 않음)
  const counts = Object.fromEntries(['ko', 'en'].map((loc) => [loc, rewriteLocale(loc, result[loc])]));
  console.log(`HubSpot FAQ: 국문 ${counts.ko}개(${result.ko.map((c) => c.cat).join(', ')}), 영문 ${counts.en}개`);
}

try {
  await main(process.argv[2]);
} catch (e) {
  console.warn('HubSpot FAQ를 불러오지 못해 깃북 FAQ를 그대로 사용:', e.message);
}
