import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useNav, useT, SECTION_ORDER, CARD_LABEL } from '@site/src/components/i18n';
import { Icon } from '@site/src/components/Icons';

// 자주 찾는 제품 (검색창 아래 바로가기)
const POPULAR = [
  ['AFT200-D80', '/manual/aft200-d80-c'],
  ['AFT150-D50', '/manual/aft150-d50-c'],
  ['3FT2000-D65', '/manual/3ft2000-d65-c'],
  ['ATSB', '/manual/atsb'],
  ['ATT', '/manual/att'],
];

// 카드 안 하위 메뉴: 매뉴얼은 제품군, 나머지는 각 메뉴의 탭(깃허브 SUMMARY 순서 그대로)
function useSubLinks(section) {
  const nav = useNav();
  if (section === 'manual') {
    return Object.entries(nav.pages)
      .filter(([path, p]) => p.section === 'manual' && !p.family && path !== '/manual' && path.split('/').length === 3)
      .map(([path, p]) => ({ path, label: p.label || p.title }));
  }
  const sec = nav.sections[section];
  return (sec?.tabs || []).filter((tb) => tb.path !== sec.path).map((tb) => ({ path: tb.path, label: tb.label }));
}

function Card({ section, index }) {
  const t = useT();
  const nav = useNav();
  const sec = nav.sections[section];
  const links = useSubLinks(section);
  const isAs = section === 'as';
  // 문의하기: A/S 섹션의 하위 페이지(없으면 /as/inquiry)
  const inquiryPath = (sec.tabs || []).find((tb) => tb.path !== sec.path)?.path || `${sec.path}/inquiry`;
  return (
    <div className={`aidin-mcard${isAs ? ' aidin-mcard--dark' : ''}`}>
      <Link to={sec.path} className="aidin-mcard__head">
        <span className="aidin-mcard__top">
          <span className="aidin-mcard__label"><b>{String(index + 1).padStart(2, '0')}</b>{CARD_LABEL[section]}</span>
          <span className="aidin-mcard__arrow"><Icon name="arrowRight" size={34} stroke={1.6} /></span>
        </span>
        <span className="aidin-mcard__title">{isAs ? t.asCardTitle : sec.title}</span>
      </Link>
      {isAs && <p className="aidin-mcard__desc">{t.asCardDesc}</p>}
      {!isAs && links.length > 0 && (
        <ul className="aidin-mcard__list">
          {links.map((l) => (
            <li key={l.path}>
              <Link to={l.path}>{l.label}<Icon name="chevronRight" size={14} stroke={2} /></Link>
            </li>
          ))}
        </ul>
      )}
      {isAs ? (
        <div className="aidin-mcard__btns">
          <Link to={sec.path} className="aidin-mcard__btn is-red">{t.asCardAs} <Icon name="arrowRight" size={18} /></Link>
          <Link to={inquiryPath} className="aidin-mcard__btn is-ghost">{t.asCardInquiry} <Icon name="arrowRight" size={18} /></Link>
        </div>
      ) : (
        <Link to={sec.path} className="aidin-mcard__btn">{t.viewAll[section]}</Link>
      )}
    </div>
  );
}

export default function Home() {
  const t = useT();
  const nav = useNav();
  const history = useHistory();
  const [q, setQ] = useState('');
  const searchPath = useBaseUrl('/search');
  return (
    <Layout description={t.shareDesc}>
      <section className="aidin-hero">
        <div className="aidin-container aidin-hero__inner">
          <h1 className="aidin-hero__title">{t.heroTitle}</h1>
          <p className="aidin-hero__sub">{t.heroSub}</p>
          <form
            className="aidin-hero__search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              history.push(`${searchPath}?q=${encodeURIComponent(q)}`);
            }}>
            <Icon name="search" size={22} />
            <label htmlFor="aidin-q" className="sr-only">{t.search}</label>
            <input id="aidin-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPh} />
            <button type="submit">{t.search}</button>
          </form>
          <div className="aidin-hero__chips">
            <span>{t.popular}</span>
            {POPULAR.filter(([, to]) => nav.pages[to]).map(([label, to]) => (
              <Link key={to} to={to}>{label}</Link>
            ))}
          </div>
        </div>
      </section>
      <section className="aidin-container aidin-mcards">
        {SECTION_ORDER.filter((s) => nav.sections[s]).map((s, i) => (
          <Card key={s} section={s} index={i} />
        ))}
      </section>
    </Layout>
  );
}
