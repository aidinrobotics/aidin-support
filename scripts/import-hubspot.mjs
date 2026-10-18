// HubSpot 파일함의 '고객지원센터 자료실' 폴더를 읽어 자료실 목록을 만듭니다.
// 마케팅은 HubSpot에 파일을 올리거나 지우기만 하면 됩니다. (15분마다 사이트에 반영)
//
// 폴더 규칙
//   고객지원센터 자료실/            ← 맨 위 폴더 (이름은 HUBSPOT_DOWNLOADS_FOLDER 로 바꿀 수 있음)
//     01 브로슈어 | Brochures/      ← 하위 폴더 = 자료 종류. 앞 숫자는 순서, '|' 뒤는 영문 이름
//     02 리플렛 | Leaflets/
//     ...
//   파일 이름이 그대로 자료명이 됩니다. 예) AFT200 리플렛 (KO, 26.06).pdf
//   괄호 안의 KO·EN·CN 은 언어, 26.06 같은 숫자는 개정일로 표시됩니다.
//
// 토큰(HUBSPOT_TOKEN)이 없거나 HubSpot 연결에 실패하면 아무것도 바꾸지 않고
// 기존 방식(깃북 자료실 표)을 그대로 씁니다. 사이트 배포는 멈추지 않습니다.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/data/hubspot-downloads.json');
const TOKEN = process.env.HUBSPOT_TOKEN;
const FOLDER = process.env.HUBSPOT_DOWNLOADS_FOLDER || '고객지원센터 자료실';
const API = 'https://api.hubapi.com/files/v3';

fs.rmSync(OUT, { force: true });
if (!TOKEN) {
  console.log('HubSpot 토큰 없음 → 깃북 자료실 표를 그대로 사용');
  process.exit(0);
}

async function get(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
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

// '01 브로슈어 | Brochures' → { order: 1, ko: '브로슈어', en: 'Brochures' }
function parseFolderName(name) {
  const m = name.match(/^\s*(\d+)[.\s_-]*(.*)$/);
  const order = m ? Number(m[1]) : 999;
  const rest = (m ? m[2] : name).trim();
  const [ko, en] = rest.split('|').map((s) => s.trim());
  return { order, ko, en: en || ko };
}

// 파일 이름 → 자료명·언어·개정일
function parseFileName(name) {
  let title = name.replace(/\[AIDIN ROBOTICS\]\s*/gi, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  const langs = [...new Set((title.match(/\b(KO|KOR|EN|ENG|CN|CHN|JP|JPN)\b/gi) || []).map((l) => l.toUpperCase().slice(0, 2)))];
  const rev = (title.match(/(\d{2}\.\d{2})(?:\s*updated?)?/i) || [])[1] || '';
  // 언어·개정일은 따로 보여주니 자료명에서는 뺌: 'Catalog KO(26.02 updated)' → 'Catalog'
  const clean = title
    .replace(/\(([^()]*)\)/g, (m, inner) => (/\b(KO|KOR|EN|ENG|CN|CHN|JP|JPN)\b|\d{2}\.\d{2}|update/i.test(inner) ? ' ' : m))
    .replace(/\b(KO|KOR|EN|ENG|CN|CHN|JP|JPN)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s,·-]+$/, '')
    .trim();
  return { title: clean || title, sub: langs.join(' · '), rev };
}

try {
  const folders = await all(`${API}/folders/search`);
  const root = folders.find((f) => f.name === FOLDER && !f.archived);
  if (!root) throw new Error(`'${FOLDER}' 폴더를 찾지 못했습니다`);
  const cats = folders
    .filter((f) => String(f.parentFolderId) === String(root.id) && !f.archived)
    .map((f) => ({ id: f.id, ...parseFolderName(f.name) }))
    .sort((a, b) => a.order - b.order || a.ko.localeCompare(b.ko, 'ko'));

  const result = [];
  for (const c of cats) {
    const files = (await all(`${API}/files/search?parentFolderIds=${c.id}`))
      .filter((f) => String(f.parentFolderId) === String(c.id) && !f.archived && !f.hidden)
      .filter((f) => !f.access || String(f.access).startsWith('PUBLIC'))
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    result.push({
      ko: c.ko,
      en: c.en,
      files: files.map((f) => ({
        ...parseFileName(f.name),
        format: (f.extension || '').toUpperCase(),
        url: f.url || f.defaultHostingUrl,
        updatedAt: f.updatedAt,
      })),
    });
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ folder: FOLDER, categories: result }, null, 2));
  console.log(`HubSpot 자료실: ${result.length}종류, ${result.reduce((n, c) => n + c.files.length, 0)}개 파일`);
} catch (e) {
  console.warn('HubSpot 자료실을 불러오지 못해 깃북 표를 그대로 사용:', e.message);
  fs.rmSync(OUT, { force: true });
}
