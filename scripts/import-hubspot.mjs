// HubSpot 파일함의 자료 폴더를 읽어 고객지원센터 자료실 목록을 만듭니다.
// 마케팅은 아래 HubSpot 폴더에 파일을 올리거나 지우기만 하면 됩니다. (15분마다 사이트에 반영)
//
//   HubSpot 폴더        → 자료실 분류
//   에이딘 브로슈어      → 브로슈어
//   에이딘 리플렛        → 리플렛
//   에이딘 스텝파일      → 3D STEP 파일
//   에이딘 도면          → 제품 도면
//   에이딘 인증          → 제품 인증
//
// 규칙
//   - 공개(Public) 파일만 올라갑니다. 비공개로 바꾸면 사이트에서 빠집니다.
//   - 파일 이름 맨 앞에 _ 를 붙이면 사이트에 올리지 않습니다. (예: _구버전 카탈로그.pdf)
//   - 파일 이름이 그대로 자료명이 됩니다. 괄호 안 KO·EN·CN 은 언어, 26.06 같은 숫자는 개정일로 표시됩니다.
//   - 폴더 안에 하위 폴더를 만들어도 함께 읽습니다.
//
// 폴더 구성을 바꾸려면 저장소 Settings → Variables 에 HUBSPOT_DOWNLOADS_FOLDERS 를
// 아래 FOLDERS 와 같은 형식(JSON)으로 넣으면 됩니다.
//
// 토큰(HUBSPOT_TOKEN)이 없거나 HubSpot 연결에 실패하면 아무것도 바꾸지 않고
// 기존 방식(깃북 자료실 표)을 그대로 씁니다. 사이트 배포는 멈추지 않습니다.

import fs from 'node:fs';
import path from 'node:path';

const FOLDERS = [
  { folder: '에이딘 브로슈어', ko: '브로슈어', en: 'Brochure' },
  { folder: '에이딘 리플렛', ko: '리플렛', en: 'Leaflets' },
  { folder: '에이딘 스텝파일', ko: '3D STEP 파일', en: '3D STEP Files' },
  { folder: '에이딘 도면', ko: '제품 도면', en: 'Product Drawings' },
  { folder: '에이딘 인증', ko: '제품 인증', en: 'Product Certification' },
];

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/data/hubspot-downloads.json');
const TOKEN = process.env.HUBSPOT_TOKEN;
const API = 'https://api.hubapi.com/files/v3';

fs.rmSync(OUT, { force: true });
if (!TOKEN) {
  console.log('HubSpot 토큰 없음 → 깃북 자료실 표를 그대로 사용');
  process.exit(0);
}

let config = FOLDERS;
try {
  if (process.env.HUBSPOT_DOWNLOADS_FOLDERS) config = JSON.parse(process.env.HUBSPOT_DOWNLOADS_FOLDERS);
} catch {
  console.warn('HUBSPOT_DOWNLOADS_FOLDERS 형식이 잘못돼 기본 폴더 구성을 사용');
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

const LANG = /\b(KO|KOR|EN|ENG|CN|CHN|JP|JPN)\b/gi;

// 파일 이름 → 자료명·언어·개정일
function parseFileName(name) {
  const base = name
    .replace(/\[AIDIN ROBOTICS\]\s*/gi, '')
    .replace(/\.(step|stp|pdf|zip|dwg|dxf)$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const langs = [...new Set((base.match(LANG) || []).map((l) => l.toUpperCase().slice(0, 2)))];
  const rev = (base.match(/(\d{2}\.\d{2})(?:\s*updated?)?/i) || [])[1] || '';
  // 언어·개정일은 따로 보여주니 자료명에서는 뺌: 'Catalog KO(26.02 updated)' → 'Catalog'
  const title = base
    .replace(/\(([^()]*)\)/g, (m, inner) => (/\b(KO|KOR|EN|ENG|CN|CHN|JP|JPN)\b|\d{2}\.\d{2}|update/i.test(inner) ? ' ' : m))
    .replace(LANG, ' ')
    .replace(/\s*(배포\s*최종본|배포용|최종본)\s*/g, ' ')
    .replace(/\.(step|stp)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/[\s,·-]+$/, '')
    .trim();
  return { title: title || base, sub: langs.join(' · '), rev };
}

try {
  const folders = (await all(`${API}/folders/search`)).filter((f) => !f.archived);
  const childrenOf = (id) => folders.filter((f) => String(f.parentFolderId) === String(id));
  const result = [];
  for (const c of config) {
    const root = folders.find((f) => f.name === c.folder || f.path === c.folder || f.path === `/${c.folder}`);
    if (!root) {
      console.warn(`HubSpot 폴더 없음, 건너뜀: ${c.folder}`);
      result.push({ ko: c.ko, en: c.en || c.ko, files: [] });
      continue;
    }
    // 하위 폴더까지 함께 읽음
    const ids = [];
    const walk = (f) => { ids.push(f.id); childrenOf(f.id).forEach(walk); };
    walk(root);
    const files = [];
    for (const id of ids) {
      const list = await all(`${API}/files/search?parentFolderIds=${id}`);
      files.push(...list.filter((f) => String(f.parentFolderId) === String(id)));
    }
    const shown = files
      .filter((f) => !f.archived && !f.hidden && !String(f.name || '').startsWith('_'))
      .filter((f) => !f.access || String(f.access).startsWith('PUBLIC'))
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    result.push({
      ko: c.ko,
      en: c.en || c.ko,
      files: shown.map((f) => ({
        ...parseFileName(f.name),
        format: (f.extension || '').toUpperCase(),
        url: f.url || f.defaultHostingUrl,
        updatedAt: f.updatedAt,
      })),
    });
  }
  const total = result.reduce((n, c) => n + c.files.length, 0);
  if (!total) throw new Error('불러온 파일이 하나도 없습니다');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ categories: result }, null, 2));
  console.log(`HubSpot 자료실: ${result.map((c) => `${c.ko} ${c.files.length}`).join(', ')} (총 ${total}개)`);
} catch (e) {
  console.warn('HubSpot 자료실을 불러오지 못해 깃북 표를 그대로 사용:', e.message);
  fs.rmSync(OUT, { force: true });
}
