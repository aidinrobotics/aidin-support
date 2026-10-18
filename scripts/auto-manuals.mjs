// 새 제품 매뉴얼을 메뉴와 목록 페이지에 자동으로 붙입니다.
//
// 연구원 매뉴얼 저장소는 aidin-docs(국문)·aidin-docs-en(영문)의 manual/<폴더>/README.md 로 모입니다.
// 이 스크립트는 빌드할 때 그 폴더들을 살펴보고, 아직 메뉴에 없는 매뉴얼이 있으면
//   1) 목차(SUMMARY.md)의 알맞은 제품군 아래
//   2) 제품군 소개 페이지(manual-ft-README.md 등)의 제품 목록
//   3) '제품별 매뉴얼' 첫 화면 표(index-manual.md)의 알맞은 칸
// 에 한 줄씩 넣습니다. 이미 들어 있는 제품은 건드리지 않습니다.
// (원고 저장소 자체는 바꾸지 않고, 빌드할 때 받아 온 복사본만 바꿉니다.)
//
// 제품군은 폴더 이름(모델명)으로 정합니다.
//   3ft…                      → 3축 힘/토크 센서
//   aft20 · aft50 · aft100 …  → 초소형 힘·토크 센서
//   그 밖의 aft…              → 6축 힘/토크 센서
//   ats…                      → 관절 토크 센서
//   att…                      → 택타일 센서
//   ah… · hand… · gen…        → 인간형 로봇핸드
// 규칙에 맞지 않는 새 제품군이면 로그에 남기고 건너뜁니다. (아래 FAMILIES 에 규칙을 추가하면 됨)
// 메뉴에 보이는 이름은 폴더 이름을 대문자로 바꾼 것입니다. (예: manual/atsc → ATSC)

import fs from 'node:fs';
import path from 'node:path';

const SRC = { ko: path.resolve(process.env.DOCS_SRC_KO || '.src/ko'), en: path.resolve(process.env.DOCS_SRC_EN || '.src/en') };

// 순서대로 검사 (먼저 맞는 규칙 적용). table/col = index-manual.md 의 몇 번째 표, 몇 번째 칸
const FAMILIES = [
  { re: /^3ft/i, file: 'manual-3axis-README.md', table: 0, col: 1 },
  { re: /^aft-?(20|50|100)(?!\d)|^aft-?mini/i, file: 'manual-mini-README.md', table: 0, col: 2 },
  { re: /^aft/i, file: 'manual-ft-README.md', table: 0, col: 0 },
  { re: /^ats/i, file: 'manual-torque-README.md', table: 1, col: 0 },
  { re: /^att/i, file: 'manual-tactile-README.md', table: 1, col: 1 },
  { re: /^(ah|hand|aidin-?hand|gen)/i, file: 'manual-hand-README.md', table: 1, col: 2 },
];

const indent = (l) => l.match(/^\s*/)[0].replace(/\t/g, '  ').length;

function addToSummary(dir, entry, fam) {
  const file = path.join(dir, 'SUMMARY.md');
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const top = lines.findIndex((l) => l.includes(`](${fam.file})`));
  if (top < 0) return false;
  let end = top + 1;
  while (end < lines.length && lines[end].trim() && indent(lines[end]) > indent(lines[top])) end++;
  lines.splice(end, 0, `${' '.repeat(indent(lines[top]) + 2)}* [${entry.title}](${entry.link})`);
  fs.writeFileSync(file, lines.join('\n'));
  return true;
}

function addToFamilyPage(dir, entry, fam) {
  const file = path.join(dir, fam.file);
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').replace(/\s+$/, '').split('\n');
  let last = -1;
  lines.forEach((l, i) => { if (/^\s*[*-]\s+\[.*\]\(.*\)/.test(l)) last = i; });
  const line = `* [${entry.title}](${entry.link})`;
  if (last >= 0) lines.splice(last + 1, 0, line);
  else lines.push('', line);
  fs.writeFileSync(file, lines.join('\n') + '\n');
}

function addToIndexTable(dir, entry, fam) {
  const file = path.join(dir, 'index-manual.md');
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const cells = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  // 표 찾기: 머리줄 + 구분줄(| --- |)
  const tables = [];
  for (let i = 0; i < lines.length - 1; i++) {
    if (/^\s*\|/.test(lines[i]) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      let j = i + 2;
      while (j < lines.length && /^\s*\|/.test(lines[j])) j++;
      tables.push({ head: i, start: i + 2, end: j });
      i = j - 1;
    }
  }
  const t = tables[fam.table];
  if (!t) return;
  const width = cells(lines[t.head]).length;
  const link = `[${entry.title}](${entry.link})`;
  for (let r = t.start; r < t.end; r++) {
    const row = cells(lines[r]);
    while (row.length < width) row.push('');
    if (!row[fam.col]) {
      row[fam.col] = link;
      lines[r] = `| ${row.join(' | ')} |`;
      fs.writeFileSync(file, lines.join('\n'));
      return;
    }
  }
  const row = Array(width).fill('');
  row[fam.col] = link;
  lines.splice(t.end, 0, `| ${row.join(' | ')} |`);
  fs.writeFileSync(file, lines.join('\n'));
}

function run(locale) {
  const dir = SRC[locale];
  const manualDir = path.join(dir, 'manual');
  if (!fs.existsSync(path.join(dir, 'SUMMARY.md')) || !fs.existsSync(manualDir)) return [];
  const summary = fs.readFileSync(path.join(dir, 'SUMMARY.md'), 'utf8');
  const added = [];
  for (const name of fs.readdirSync(manualDir).sort()) {
    if (/^[._]/.test(name)) continue; // 숨김·보조 폴더는 제외
    const link = `manual/${name}/README.md`;
    if (!fs.existsSync(path.join(dir, link)) || summary.includes(`](${link})`)) continue;
    const fam = FAMILIES.find((f) => f.re.test(name));
    if (!fam) {
      console.warn(`[${locale}] 제품군을 정하지 못해 메뉴에 넣지 않음: ${link} (scripts/auto-manuals.mjs 의 FAMILIES 에 규칙 추가 필요)`);
      continue;
    }
    const entry = { title: name.toUpperCase(), link };
    if (!addToSummary(dir, entry, fam)) {
      console.warn(`[${locale}] 목차에 제품군(${fam.file})이 없어 건너뜀: ${link}`);
      continue;
    }
    addToFamilyPage(dir, entry, fam);
    addToIndexTable(dir, entry, fam);
    added.push(entry.title);
  }
  return added;
}

for (const loc of ['ko', 'en']) {
  try {
    const added = run(loc);
    console.log(`새 매뉴얼 자동 추가 [${loc}]: ${added.length ? added.join(', ') : '없음'}`);
  } catch (e) {
    console.warn(`새 매뉴얼 자동 추가 실패 [${loc}] → 원고 그대로 사용:`, e.message);
  }
}
