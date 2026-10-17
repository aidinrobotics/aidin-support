import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import { useNav, useT, useLocale } from './i18n';
import { Icon } from './Icons';

// 본문 위 분류 탭 (자료실·자주 묻는 질문·설치 가이드 공통)
export function SectionTabs({ section, slug, counts }) {
  const nav = useNav();
  const tabs = nav.sections[section]?.tabs || [];
  if (tabs.length < 2) return null;
  return (
    <nav className="aidin-ptabs" aria-label={nav.sections[section].title}>
      {tabs.map((tb) => (
        <Link key={tb.path} to={tb.path} className={tb.path === slug ? 'is-on' : undefined} aria-current={tb.path === slug ? 'page' : undefined}>
          {tb.label}
          {counts && counts[tb.path] != null && <b>{counts[tb.path]}</b>}
        </Link>
      ))}
    </nav>
  );
}

// 모델명으로 제품을 묶음 (원고 표기가 조금씩 달라도 같은 제품으로)
const PRODUCTS = [
  { ko: '초소형 6축 F/T 센서', en: 'Miniature 6-Axis F/T Sensor', re: /AFT(20|50|100)\b|AFT20-|AFT100-|AFT-?Mini|초소형|miniature/i },
  { ko: '6축 F/T 센서 (손목형)', en: '6-Axis F/T Sensor (Wrist)', re: /AFT150/i },
  { ko: '6축 F/T 센서', en: '6-Axis F/T Sensor', re: /AFT200/i },
  { ko: '3축 F/T 센서', en: '3-Axis F/T Sensor', re: /3FT/i },
  { ko: '관절 토크 센서', en: 'Joint Torque Sensor', re: /ATS/i },
  { ko: '택타일 센서', en: 'Tactile Sensor', re: /\bATT\b|택타일|tactile/i },
  { ko: '인간형 로봇핸드', en: 'Humanoid Robot Hand', re: /Gen2|로봇핸드|robot hand/i },
  { ko: '솔루션', en: 'Solutions', re: /AIRO|OrthoForce|Panoradar|SusGrip/i },
];
const PER_PAGE = 12;

export function DownloadBoard({ slug }) {
  const t = useT();
  const loc = useLocale();
  const nav = useNav();
  const sec = nav.sections.downloads;
  const all = sec?.items || [];
  const isAll = slug === sec?.path;
  const [prod, setProd] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const tagged = useMemo(
    () => all.map((it, i) => ({ ...it, i, tags: PRODUCTS.filter((p) => p.re.test(`${it.title} ${it.sub}`)).map((p) => p.ko) })),
    [all],
  );
  const counts = useMemo(() => {
    const c = { [sec?.path]: tagged.length };
    tagged.forEach((it) => (c[it.catPath] = (c[it.catPath] || 0) + 1));
    return c;
  }, [tagged, sec]);
  const inCat = tagged.filter((it) => isAll || it.catPath === slug);
  const products = PRODUCTS.filter((p) => inCat.some((it) => it.tags.includes(p.ko)));
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list = inCat.filter(
    (it) =>
      (!prod || it.tags.includes(prod)) &&
      words.every((w) => `${it.cat} ${it.title} ${it.sub} ${it.format}`.toLowerCase().includes(w)),
  );
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const reset = (fn) => (e) => {
    fn(e.target.value);
    setPage(1);
  };

  if (!sec) return null;
  return (
    <div className="aidin-board">
      <SectionTabs section="downloads" slug={slug} counts={counts} />
      <div className="aidin-board__bar">
        <p className="aidin-board__count">{loc === 'en' ? <><b>{list.length}</b> {t.board.total(list.length).replace(/^\d+ /, '')}</> : <>총 <b>{list.length}</b>건</>}</p>
        <div className="aidin-board__filters">
          {products.length > 1 && (
            <select value={prod} onChange={reset(setProd)} aria-label={t.allProducts} className="aidin-select">
              <option value="">{t.allProducts}</option>
              {products.map((p) => (
                <option key={p.ko} value={p.ko}>{loc === 'en' ? p.en : p.ko}</option>
              ))}
            </select>
          )}
          <label className="aidin-board__search">
            <Icon name="search" size={18} />
            <span className="sr-only">{t.board.search}</span>
            <input type="search" value={q} onChange={reset(setQ)} placeholder={t.board.search} />
          </label>
        </div>
      </div>
      <table className="aidin-board__table">
        <thead>
          <tr>
            <th className="c-no">{t.board.no}</th>
            <th className="c-cat">{t.board.cat}</th>
            <th>{t.board.title}</th>
            <th className="c-fmt">{t.board.format}</th>
            <th className="c-rev">{t.board.rev}</th>
            <th className="c-dl">{t.board.download}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((it, k) => (
            <tr key={`${it.url}-${it.i}`}>
              <td className="c-no">{list.length - ((cur - 1) * PER_PAGE + k)}</td>
              <td className="c-cat"><span className="aidin-badge">{it.cat}</span></td>
              <td className="c-title">
                <a href={it.url} target="_blank" rel="noopener noreferrer">
                  <strong>{it.title}</strong>
                  {it.sub && <span>{it.sub}</span>}
                </a>
              </td>
              <td className="c-fmt">{it.format}</td>
              <td className="c-rev">{it.rev && it.rev !== '—' && it.rev !== '-' ? it.rev : '—'}</td>
              <td className="c-dl">
                <a className="aidin-dlbtn" href={it.url} target="_blank" rel="noopener noreferrer">
                  <Icon name="download" size={17} /> {t.board.dl}
                </a>
              </td>
            </tr>
          ))}
          {!shown.length && (
            <tr>
              <td colSpan={6} className="aidin-board__empty">{t.board.empty}</td>
            </tr>
          )}
        </tbody>
      </table>
      {pages > 1 && (
        <nav className="aidin-pager">
          <button type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label={t.board.prev}>‹</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button type="button" key={n} className={n === cur ? 'is-on' : undefined} onClick={() => setPage(n)}>{n}</button>
          ))}
          <button type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label={t.board.next}>›</button>
        </nav>
      )}
    </div>
  );
}
