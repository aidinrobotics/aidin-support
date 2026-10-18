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
  { ko: '6축 F/T 센서 (손목형)', en: '6-Axis F/T Sensor (Wrist-Mount)', re: /AFT150/i },
  { ko: '6축 F/T 센서', en: '6-Axis F/T Sensor', re: /AFT200/i },
  { ko: '3축 F/T 센서', en: '3-Axis F/T Sensor', re: /3FT/i },
  { ko: '관절 토크 센서', en: 'Joint Torque Sensor', re: /ATS/i },
  { ko: '택타일 센서', en: 'Tactile Sensor', re: /\bATT\b|택타일|tactile/i },
  { ko: '인간형 로봇핸드', en: 'Humanoid Robot Hand', re: /Gen2|로봇핸드|robot hand/i },
  { ko: '솔루션', en: 'Solutions', re: /AIRO|OrthoForce|Panoradar|SusGrip/i },
];
const PER_PAGE = 12;

// 파일 이름의 언어 표기(KO·EN·CN·JP)를 '언어' 칸에 보여 줄 이름으로
const LANG_NAME = { KO: ['국문', 'Korean'], KR: ['국문', 'Korean'], EN: ['영문', 'English'], CN: ['중문', 'Chinese'], ZH: ['중문', 'Chinese'], JP: ['일문', 'Japanese'] };
const LANG_CODE = /^(KO|KOR|KR|EN|ENG|CN|CHN|ZH|JP|JPN)$/i;
// 3D STEP 파일·제품 도면·제품 인증은 언어·개정 칸을 쓰지 않음
const NO_META = /STEP|도면|인증|Drawing|Certific/i;
const plain = (it) => NO_META.test(it.cat || '');
const LANG_ORDER = (code) => {
  const i = ['KO', 'KR', 'EN', 'CN', 'ZH', 'JP'].findIndex((c) => code.startsWith(c));
  return i < 0 ? 9 : i;
};
// 사이트에 보일 자료명 [국문, 영문] — 파일 이름(언어·날짜 뺀 것) 기준. 국문 이름이 같은 것끼리는 한 줄로 묶음
const TITLE_NAME = {
  'Catalog AIDIN ROBOTICS': ['에이딘로보틱스 제품 카탈로그', 'AIDIN ROBOTICS Product Catalog'],
  'AIRO-One Solution for Surface Finishing': ['AIRO-One 표면가공 솔루션', 'AIRO-One Solution for Surface Finishing'],
  'AIRO-One Solution for Logistics Leaflet': ['AIRO-One 물류피킹 솔루션', 'AIRO-One Solution for Logistics'],
  '3-axis FT sensor': ['3축 힘/토크 센서 (3FT2000)', '3-Axis F/T Sensor (3FT2000)'],
  'AFT-Mini Flyer': ['초소형 6축 힘/토크 센서 (AFT20-D15)', 'Miniature 6-Axis F/T Sensor (AFT20-D15)'],
  'AFT200+MINI': ['6축 힘/토크 센서 (AFT-MINI, AFT200)', '6-Axis F/T Sensor (AFT-MINI, AFT200)'],
  'AFT MINI+AFT200 leaflet': ['6축 힘/토크 센서 (AFT-MINI, AFT200)', '6-Axis F/T Sensor (AFT-MINI, AFT200)'],
  'AIDIN-Hand leaflet': ['로봇핸드 (AIDIN ROBOTICS Hand Gen1)', 'Robot Hand (AIDIN ROBOTICS Hand Gen1)'],
  'ATSB Series Flyer': ['초박형 관절 토크 센서 (ATSB 시리즈)', 'Ultra-Thin Joint Torque Sensor (ATSB Series)'],
  'ATSB leaflet': ['관절 토크 센서 (ATSB)', 'Joint Torque Sensor (ATSB)'],
  'ATS FLYER': ['관절 토크 센서 (ATS 시리즈)', 'Joint Torque Sensor (ATS Series)'],
  '6-axis FT Sensor KIT Leaflet 2': ['6축 힘/토크 센서 키트 (AFT200 kit)', '6-Axis F/T Sensor Kit (AFT200 Kit)'],
  'AFT200-Kit': ['6축 힘/토크 센서 키트 (AFT200 kit)', '6-Axis F/T Sensor Kit (AFT200 Kit)'],
  'AFT200-KIT-NRMK leaflet': ['AFT200 뉴로메카 키트', 'AFT200 Neuromeka Kit'],
  'AFT200-KIT-RB leaflet': ['AFT200 레인보우 키트', 'AFT200 Rainbow Robotics Kit'],
  'Tactile Sensor Leaflet': ['택타일 센서 (ATT)', 'Tactile Sensor (ATT)'],
  '6-axis Force torque sensor(Wrist)': ['6축 힘/토크 센서 (AFT150-D50)', '6-Axis F/T Sensor (AFT150-D50)'],
  '치아교정장비 리플렛': ['치아교정장비 (OrthoForce)', 'Orthodontic Device (OrthoForce)'],
  'ARC Flyer': ['모션 컨트롤러 (ARC 시리즈)', 'Motion Controller (ARC Series)'],
  'Panoradar+Smart Gripper Flyer': ['Panoradar + 스마트 그리퍼', 'Panoradar + Smart Gripper'],
};
const showTitle = (title, en) => (TITLE_NAME[title] ? TITLE_NAME[title][en ? 1 : 0] : title);
function splitLang(sub, en) {
  const parts = (sub || '').split(/[\s·,/]+/).filter(Boolean);
  if (parts.length && parts.every((x) => LANG_CODE.test(x))) {
    const names = [...new Set(parts.map((x) => LANG_NAME[x.toUpperCase().slice(0, 2)][en ? 1 : 0]))];
    return { lang: names.join(' · '), rest: '' };
  }
  return { lang: '', rest: sub || '' };
}

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
  const inCat = tagged.filter((it) => isAll || it.catPath === slug);
  const products = PRODUCTS.filter((p) => inCat.some((it) => it.tags.includes(p.ko)));
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list = inCat.filter(
    (it) =>
      (!prod || it.tags.includes(prod)) &&
      words.every((w) => `${it.cat} ${it.title} ${showTitle(it.title, false)} ${showTitle(it.title, true)} ${it.sub} ${it.format}`.toLowerCase().includes(w)),
  );
  // 같은 자료(분류·자료명이 같은 것)는 한 줄로 묶고, 언어별로 가장 최신 파일 하나만 내려받기 버튼으로
  const groups = [];
  const byKey = {};
  const revOf = (it) => (/^\d{2}\.\d{2}$/.test(it.rev || '') ? it.rev : '');
  list.forEach((it) => {
    const L = splitLang(it.sub, loc === 'en');
    const key = plain(it) || !L.lang ? `${it.url}` : `${it.cat}|${showTitle(it.title, false)}|${L.rest}`;
    if (!byKey[key]) {
      byKey[key] = { ...it, rest: L.rest, files: [] };
      groups.push(byKey[key]);
    }
    const file = { url: it.url, lang: plain(it) ? '' : L.lang, code: (it.sub || '').toUpperCase(), rev: revOf(it) };
    const same = byKey[key].files.findIndex((f) => f.lang === file.lang);
    if (same < 0) byKey[key].files.push(file);
    else if (file.rev > byKey[key].files[same].rev) byKey[key].files[same] = file;
  });
  groups.forEach((g) => g.files.sort((a, b) => LANG_ORDER(a.code) - LANG_ORDER(b.code)));
  const pages = Math.max(1, Math.ceil(groups.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = groups.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const reset = (fn) => (e) => {
    fn(e.target.value);
    setPage(1);
  };

  if (!sec) return null;
  return (
    <div className="aidin-board">
      <div className="aidin-board__bar">
        <p className="aidin-board__count">{loc === 'en' ? <><b>{groups.length}</b> {t.board.total(groups.length).replace(/^\d+ /, '')}</> : <>총 <b>{groups.length}</b>건</>}</p>
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
            <th className="c-dl">{t.board.download}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((it, k) => (
            <tr key={`${it.url}-${it.i}`}>
              <td className="c-no">{groups.length - ((cur - 1) * PER_PAGE + k)}</td>
              <td className="c-cat"><span className="aidin-badge">{it.cat}</span></td>
              <td className="c-title">
                <a href={it.files[0].url} target="_blank" rel="noopener noreferrer">
                  <strong>{showTitle(it.title, loc === 'en')}</strong>
                  {it.rest && <span>{it.rest}</span>}
                </a>
              </td>
              <td className="c-fmt">{it.format}</td>
              <td className="c-dl">
                <div className="aidin-dlset">
                  {it.files.map((f) => (
                    <a key={f.url} className="aidin-dlbtn" href={f.url} target="_blank" rel="noopener noreferrer">
                      <Icon name="download" size={17} /> {f.lang || t.board.dl}
                    </a>
                  ))}
                </div>
              </td>
            </tr>
          ))}
          {!shown.length && (
            <tr>
              <td colSpan={5} className="aidin-board__empty">{t.board.empty}</td>
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
