// 빌드된 사이트의 제품 매뉴얼 페이지를 PDF로 저장합니다 (build/pdf/<모델>.pdf, build/en/pdf/<모델>.pdf)
// 사용: npm run build && node scripts/make-pdf.mjs
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const ROOT = path.resolve('build');
const BASE = (process.env.BASE_URL || '/').replace(/\/$/, '');
const nav = JSON.parse(fs.readFileSync('src/data/nav.json', 'utf8'));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.woff2': 'font/woff2', '.json': 'application/json' };

// build 폴더를 BASE_URL 경로에 그대로 띄우는 간단한 서버
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (BASE && u.startsWith(BASE)) u = u.slice(BASE.length) || '/';
  let f = path.join(ROOT, u);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  else if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const origin = `http://127.0.0.1:${server.address().port}${BASE}`;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
let count = 0;
for (const [locale, prefix, outDir] of [['ko', '', 'pdf'], ['en', '/en', 'en/pdf']]) {
  for (const [slug, p] of Object.entries(nav[locale]?.pages || {})) {
    if (!p.isManual || !p.pdf) continue;
    await page.goto(`${origin}${prefix}${slug}`, { waitUntil: 'networkidle' });
    // 이미지·수식 글꼴이 다 불러와질 때까지 대기
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
    });
    const out = path.join(ROOT, outDir, path.basename(p.pdf));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.pdf({
      path: out, format: 'A4', printBackground: true,
      margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:8px;width:100%;padding:0 16mm;color:#999;">AIDIN ROBOTICS · ${p.title.replace(/</g, '&lt;')}</div>`,
      footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#999;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    });
    count++;
    console.log('PDF', out.replace(ROOT, 'build'));
  }
}
await browser.close();
server.close();
console.log(`PDF ${count}개 생성`);
