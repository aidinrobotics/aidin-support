// GitBook 저장소(aidin-docs, aidin-docs-en)를 Docusaurus 문서로 변환합니다.
// 원본 저장소는 건드리지 않고, 빌드할 때마다 복사·변환만 합니다.
//
// 사용법: node scripts/import-gitbook.mjs --ko <국문 저장소 경로> --en <영문 저장소 경로>

import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []),
);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = { ko: path.resolve(args.ko || '.src/ko'), en: path.resolve(args.en || '.src/en') };
const OUT = {
  ko: path.join(ROOT, 'docs'),
  en: path.join(ROOT, 'i18n/en/docusaurus-plugin-content-docs/current'),
};

// ── 설정 ───────────────────────────────────────────────
// 사이트에서 뺄 항목 (경로에 이 문자열이 들어가면 그 항목과 하위 항목을 모두 제외)
const EXCLUDE = ['manual-controller'];

// 상위 메뉴 → 섹션
const SECTIONS = {
  'index-manual.md': 'manual',
  'index-install.md': 'install',
  'index-downloads.md': 'downloads',
  'index-faq.md': 'faq',
  'support-as-request.md': 'as',
};

// 제품 매뉴얼 원본 저장소 (aidin-docs/.github/workflows/sync-manuals.yml 과 같은 목록)
// 'GitHub에서 수정' 버튼이 연구원이 실제로 고치는 저장소로 바로 가도록 씁니다.
const MANUAL_REPOS = {
  ko: {
    'manual/aft200-d80-c': 'AFT200-D80-C-Manual-Kor',
    'manual/aft200-d80-en': 'AFT200-D80-EN-Manual-Kor',
    'manual/aft200-d80-ec': 'AFT200-D80-EC-Manual-Kor',
    'manual/aft150-d50-c': 'AFT150-D50-C-Manual-Kor',
    'manual/3ft2000-d65-c': '3FT2000-D65-C-Manual-Kor',
    'manual/aft100-d20-c': 'AFT100-D20-C-Manual-Kor',
    'manual/aft20-50-d15': 'AFT20-50-D15-Manual-Kor',
    'manual/atsb': 'ATSB-Manual-Kor',
    'manual/att': 'ATT-Manual-Kor',
  },
  en: {},
};
const DOCS_REPO = { ko: 'aidin-docs', en: 'aidin-docs-en' };
const ORG = 'aidinrobotics';
// ──────────────────────────────────────────────────────

const warnings = [];
const warn = (m) => warnings.push(m);

function parseSummary(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const root = { children: [] };
  const stack = [{ depth: -1, node: root }];
  for (const line of lines) {
    const m = line.match(/^(\s*)[*-]\s+\[(.+?)\]\((.+?)\)\s*$/);
    if (!m) continue;
    const depth = m[1].replace(/\t/g, '  ').length / 2;
    const node = { title: m[2].trim(), file: decodeURI(m[3].trim()), children: [] };
    while (stack.at(-1).depth >= depth) stack.pop();
    stack.at(-1).node.children.push(node);
    stack.push({ depth, node });
  }
  return root.children;
}

function splitFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, body: src };
  const fm = {};
  for (const l of m[1].split('\n')) {
    const mm = l.match(/^(description|title):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].replace(/^["']|["']$/g, '');
  }
  return { fm, body: src.slice(m[0].length) };
}

const HINT = { info: 'info', warning: 'warning', danger: 'danger', success: 'tip', tip: 'tip' };

function youtubeId(url) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m && m[1];
}

// 탭에는 짧은 이름만 (예: '6축 F/T 센서 뉴로메카 키트' → '뉴로메카 키트')
const tabLabel = (t) => t.replace(/^(6축\s*F\/T\s*센서|6-axis\s*F\/T\s*sensor)\s+/i, '').trim();

const TITLE_OVERRIDE = { en: { as: 'Service Request' } };

let LINK_MAP = {};
function transform(body, fromFile) {
  let out = body;
  // 개정 이력(Revision History) 단락은 고객 사이트에서 뺌 — 다음 같은 수준 제목 전까지 삭제
  out = out.replace(/^(#{1,4})\s*(Revision History|개정\s*이력)\s*$[\s\S]*?(?=^#{1,4}\s|(?![\s\S]))/gim, (m, h) => '');
  // 모션 제어기(ARC6) 관련 표 행은 국문·영문 모두 제외
  out = out.replace(/^\|[^\n]*(모션\s*제어기|Motion Controller|ARC6)[^\n]*\|\s*$\n?/gim, '');
  // GitBook 섹션 첫 화면(index-*.md)·전체보기(README.md) 링크를 새 사이트 경로로 바꿈
  out = out.replace(/\]\(([^)\s]+\.md)(#[^)]*)?\)/g, (all, target, hash = '') => {
    const abs = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), decodeURI(target)));
    if (LINK_MAP[abs] === undefined) return all;
    const to = LINK_MAP[abs];
    if (to.startsWith('/')) return `](pathname://${to}${hash})`;
    const rel = path.posix.relative(path.posix.dirname(fromFile), to);
    return `](${rel.startsWith('.') ? rel : './' + rel}${hash})`;
  });
  // {% hint %} → admonition
  out = out.replace(/\{%\s*hint\s+style="(\w+)"\s*%\}\s*\n([\s\S]*?)\n\s*\{%\s*endhint\s*%\}/g, (_, s, inner) =>
    `\n:::${HINT[s] || 'info'}\n\n${inner.trim()}\n\n:::\n`);
  // {% embed %}
  out = out.replace(/\{%\s*embed\s+url="([^"]+)"\s*%\}/g, (_, url) => {
    const yt = youtubeId(url);
    if (yt) {
      return `<div class="aidin-video"><iframe src="https://www.youtube-nocookie.com/embed/${yt}" title="YouTube" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
    }
    if (/hsforms\.com/.test(url)) {
      return `<div class="aidin-form"><iframe src="${url}" title="A/S" loading="lazy"></iframe></div>`;
    }
    return `[${url}](${url})`;
  });
  // GitBook 전용 표 속성(data-view 등)은 HTML 그대로 두어도 무방
  return out;
}

function yaml(obj) {
  return (
    '---\n' +
    Object.entries(obj)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`)
      .join('\n') +
    '\n---\n\n'
  );
}

function copyAssets(srcDir, outDir) {
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      const rel = path.relative(srcDir, p);
      if (e.isDirectory()) {
        if (['.git', '.github', 'node_modules'].includes(e.name)) continue;
        walk(p);
      } else if (!/\.md$/i.test(e.name)) {
        if (EXCLUDE.some((x) => rel.includes(x))) continue;
        const dest = path.join(outDir, rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(p, dest);
      }
    }
  };
  walk(srcDir);
}

function slugPart(file) {
  // manual-ft-README.md → ft , install-neuromeka-kit.md → neuromeka-kit , manual/aft200-d80-c/README.md → aft200-d80-c
  if (/\/README\.md$/i.test(file)) return path.basename(path.dirname(file));
  return path
    .basename(file, '.md')
    .replace(/-README$/i, '')
    .replace(/^(manual|install|downloads|faq)-/, '');
}

function buildLocale(locale) {
  const src = SRC[locale];
  const out = OUT[locale];
  if (!fs.existsSync(path.join(src, 'SUMMARY.md'))) {
    warn(`[${locale}] SUMMARY.md 없음: ${src}`);
    return null;
  }
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  copyAssets(src, out);

  const tree = parseSummary(path.join(src, 'SUMMARY.md'));
  const prefix = ''; // 언어 경로(/en)는 Docusaurus가 자동으로 붙임
  LINK_MAP = { 'README.md': prefix + '/' };
  for (const top of tree) {
    const sec = SECTIONS[path.basename(top.file)];
    // 섹션 첫 화면 링크(index-downloads.md 등)는 '전체' 페이지로
    if (['install', 'downloads', 'faq'].includes(sec)) LINK_MAP[top.file] = `${sec}-all.md`;
  }
  const nav = { sections: {}, pages: {} };
  const sidebar = [];

  const writeDoc = (node, section, { slug, label, position, family, isLanding }) => {
    const file = path.join(src, node.file);
    if (!fs.existsSync(file)) {
      warn(`[${locale}] 파일 없음, 건너뜀: ${node.file}`);
      return false;
    }
    const raw = fs.readFileSync(file, 'utf8');
    const { fm, body } = splitFrontmatter(raw);
    const h1 = (body.match(/^#\s+(.+)$/m) || [])[1];
    const dir = path.dirname(node.file);
    const manualRepo = MANUAL_REPOS[locale][dir];
    const editUrl = manualRepo
      ? `https://github.com/${ORG}/${manualRepo}/edit/main/README.md`
      : `https://github.com/${ORG}/${DOCS_REPO[locale]}/edit/main/${node.file}`;
    const front = {
      id: undefined,
      slug,
      title: h1 || node.title,
      sidebar_label: label || node.title,
      sidebar_position: position,
      description: fm.description,
      custom_edit_url: editUrl,
      pagination_next: 'null',
      pagination_prev: 'null',
      hide_table_of_contents: section === 'manual' && !isLanding && /\/README\.md$/i.test(node.file) ? undefined : true,
    };
    const dest = path.join(out, node.file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, yaml(front).replace(/: "null"/g, ': null') + transform(body, node.file));
    nav.pages[prefix + slug] = {
      section,
      title: h1 || node.title,
      label: label || node.title,
      description: fm.description || '',
      family: family || null,
      isManual: section === 'manual' && /\/README\.md$/i.test(node.file),
      pdf: section === 'manual' && /\/README\.md$/i.test(node.file) ? `${prefix}/pdf/${slugPart(node.file)}.pdf` : null,
    };
    return true;
  };

  for (const top of tree) {
    const section = SECTIONS[path.basename(top.file)];
    if (!section) continue; // README(전체보기)는 사이트 첫 화면으로 대체
    if (EXCLUDE.some((x) => top.file.includes(x))) continue;
    const base = `/${section}`;
    // 영문 메뉴 이름은 미국식 표현으로 통일 (헤더 버튼 'Service Request'와 맞춤)
    const sec = { title: (TITLE_OVERRIDE[locale] || {})[section] || top.title, path: prefix + base, tabs: [] };
    nav.sections[section] = sec;

    if (section === 'as') {
      writeDoc(top, section, { slug: base });
      continue;
    }
    if (section === 'manual') {
      writeDoc(top, section, { slug: base, label: top.title, isLanding: true });
      const items = [{ type: 'doc', id: docId(top.file), label: top.title }];
      for (const fam of top.children) {
        if (EXCLUDE.some((x) => fam.file.includes(x))) continue;
        const famSlug = `${base}/${slugPart(fam.file)}`;
        if (!writeDoc(fam, section, { slug: famSlug, label: fam.title })) continue;
        const famItems = [];
        const walkKids = (kids) => {
          for (const k of kids) {
            if (EXCLUDE.some((x) => k.file.includes(x))) continue;
            if (writeDoc(k, section, { slug: `${base}/${slugPart(k.file)}`, label: k.title, family: fam.title })) {
              famItems.push({ type: 'doc', id: docId(k.file), label: k.title });
            }
            walkKids(k.children);
          }
        };
        walkKids(fam.children);
        items.push({
          type: 'category',
          label: fam.title,
          collapsible: false,
          collapsed: false,
          link: { type: 'doc', id: docId(fam.file) },
          items: famItems,
        });
      }
      sidebar.push(...items);
      continue;
    }
    // 하위 메뉴는 각자 주소를 갖고, 섹션 첫 주소(/downloads 등)는 모든 하위 메뉴를 한 페이지에 모은 '전체' 페이지
    const kids = [];
    for (const k of top.children) {
      if (EXCLUDE.some((x) => k.file.includes(x))) continue;
      const slug = `${base}/${slugPart(k.file)}`;
      if (writeDoc(k, section, { slug, label: k.title })) {
        sec.tabs.push({ label: section === 'install' ? tabLabel(k.title) : k.title, path: prefix + slug });
        kids.push(k);
        // 자료실: 원고 표의 각 줄을 게시판 목록 한 줄로 (나중에 허브스팟 HubDB로 바꿔도 같은 모양)
        if (section === 'downloads') {
          const { body } = splitFrontmatter(fs.readFileSync(path.join(src, k.file), 'utf8'));
          (sec.items = sec.items || []).push(...parseDownloadRows(body, k.title, prefix + slug));
        }
      }
    }
    if (kids.length) {
      const allLabel = locale === 'en' ? 'All' : '전체';
      const topRaw = fs.existsSync(path.join(src, top.file)) ? splitFrontmatter(fs.readFileSync(path.join(src, top.file), 'utf8')) : { fm: {}, body: '' };
      const parts = kids.map((k) => {
        const { body } = splitFrontmatter(fs.readFileSync(path.join(src, k.file), 'utf8'));
        // 원고에 H1이 없어도 항목 이름을 제목으로 넣음
        return demoteHeadings(`# ${k.title}\n\n` + transform(body, k.file).replace(/^#\s+.+$/m, ''));
      });
      const allFile = `${section}-all.md`;
      const front = {
        slug: base,
        title: sec.title,
        sidebar_label: allLabel,
        description: topRaw.fm.description,
        custom_edit_url: `https://github.com/${ORG}/${DOCS_REPO[locale]}/edit/main/${top.file}`,
        pagination_next: 'null',
        pagination_prev: 'null',
      };
      fs.writeFileSync(path.join(out, allFile), yaml(front).replace(/: "null"/g, ': null') + `# ${sec.title}\n\n` + parts.join('\n\n'));
      nav.pages[prefix + base] = { section, title: sec.title, label: allLabel, description: topRaw.fm.description || '', family: null, isManual: false, pdf: null, isAll: true };
      sec.tabs.unshift({ label: allLabel, path: prefix + base });
    }
  }
  return { nav, sidebar };
}

// 자료실 원고 표 → 게시판 줄. 내려받기 링크가 있는 표만 읽음 (KC 인증번호 표 등은 본문에 그대로 둠)
function parseDownloadRows(body, cat, catPath) {
  const lines = body.split('\n');
  const cells = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const plain = (x) => (x || '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim();
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*\|/.test(lines[i]) || !/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) continue;
    const head = cells(lines[i]);
    let j = i + 2;
    const data = [];
    while (j < lines.length && /^\s*\|/.test(lines[j])) data.push(cells(lines[j++]));
    i = j;
    const linkCol = head.findIndex((_, c) => data.some((r) => /\]\(([^)\s]+)\)/.test(r[c] || '')));
    if (linkCol < 0) continue;
    const fmtCol = head.findIndex((h) => /형식|format|type/i.test(h));
    const revCol = head.findIndex((h) => /개정|rev/i.test(h));
    const rest = head.map((_, c) => c).filter((c) => c !== linkCol && c !== fmtCol && c !== revCol);
    for (const r of data) {
      const url = ((r[linkCol] || '').match(/\]\(([^)\s]+)\)/) || [])[1];
      if (!url) continue;
      const ext = (url.split('?')[0].match(/\.([a-z0-9]+)$/i) || [])[1] || '';
      rows.push({
        cat,
        catPath,
        title: plain(r[rest[0]]),
        sub: plain(r[rest[1]]),
        format: fmtCol >= 0 ? plain(r[fmtCol]) : ext.toUpperCase(),
        rev: revCol >= 0 ? plain(r[revCol]) : '',
        url,
      });
    }
  }
  return rows;
}

// 전체 페이지에 넣을 때 제목 단계를 한 단계씩 내림 (코드 블록 안은 건드리지 않음)
function demoteHeadings(md) {
  let fence = false;
  return md.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && /^#{1,5}\s/.test(line)) return '#' + line;
    return line;
  }).join('\n');
}

function docId(file) {
  return file.replace(/\.md$/i, '');
}

const ko = buildLocale('ko');
const en = buildLocale('en');
if (!ko) {
  console.error('국문 원고를 찾지 못했습니다.');
  process.exit(1);
}

// 영문 사이드바 라벨 번역 (같은 파일 경로 기준)
if (en) {
  const t = {};
  const enLabels = Object.fromEntries(
    Object.values(en.nav.pages).map((p) => [p.label, p.label]),
  );
  const koTree = parseSummary(path.join(SRC.ko, 'SUMMARY.md'));
  const enTree = parseSummary(path.join(SRC.en, 'SUMMARY.md'));
  const flat = (tr, acc = {}) => (tr.forEach((n) => ((acc[n.file] = n.title), flat(n.children, acc))), acc);
  const kf = flat(koTree);
  const ef = flat(enTree);
  for (const [file, title] of Object.entries(kf)) {
    if (ef[file]) t[`sidebar.manual.category.${title}`] = { message: ef[file] };
  }
  fs.mkdirSync(path.dirname(OUT.en), { recursive: true });
  fs.writeFileSync(path.join(path.dirname(OUT.en), 'current.json'), JSON.stringify(t, null, 2));
  void enLabels;
}

fs.mkdirSync(path.join(ROOT, 'src/data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'src/data/nav.json'), JSON.stringify({ ko: ko.nav, en: en ? en.nav : ko.nav }, null, 2));
fs.writeFileSync(path.join(ROOT, 'src/data/sidebar.json'), JSON.stringify({ manual: ko.sidebar }, null, 2));

console.log(`변환 완료: 국문 ${Object.keys(ko.nav.pages).length}쪽, 영문 ${en ? Object.keys(en.nav.pages).length : 0}쪽`);
if (warnings.length) console.log('참고:\n- ' + warnings.join('\n- '));
