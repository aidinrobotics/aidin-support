import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useNav, useT, SECTION_ORDER } from './i18n';
import { Icon } from './Icons';

// 현재 주소에서 언어·baseUrl을 뺀 경로
export function useSlug() {
  const { siteConfig } = useDocusaurusContext();
  const { pathname } = useLocation();
  const base = siteConfig.baseUrl.replace(/\/$/, '');
  let p = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  p = p.replace(/\/$/, '') || '/';
  return p;
}

export function useCurrentPage() {
  const nav = useNav();
  const slug = useSlug();
  const page = nav.pages[slug] || null;
  const section = page ? page.section : SECTION_ORDER.find((s) => slug === `/${s}` || slug.startsWith(`/${s}/`));
  return { slug, page, section, nav };
}

function Chevron() {
  return <Icon name="chevron" size={16} />;
}

// 메뉴 바의 드롭다운 칸 (홈페이지 location1·location2와 같은 구조)
function DropCell({ label, items, current }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="aidin-cell" onMouseLeave={() => setOpen(false)}>
      <button type="button" className="aidin-cell__btn" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{label}</span>
        <Chevron />
      </button>
      {open && (
        <ul className="aidin-cell__menu">
          {items.map((it) => (
            <li key={it.path}>
              <Link to={it.path} className={it.path === current ? 'is-active' : undefined} onClick={() => setOpen(false)}>
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionDropdown({ current }) {
  const nav = useNav();
  const sec = nav.sections[current];
  const items = SECTION_ORDER.filter((s) => nav.sections[s]).map((s) => ({ path: nav.sections[s].path, label: nav.sections[s].title }));
  return <DropCell label={sec ? sec.title : ''} items={items} current={sec?.path} />;
}

// 두 번째 칸: 탭이 있는 메뉴는 탭 목록, 제품별 매뉴얼은 제품군 목록
function SubDropdown({ section, slug, page, nav }) {
  const t = useT();
  if (section === 'manual') {
    const fams = Object.entries(nav.pages)
      .filter(([path, p]) => p.section === 'manual' && !p.family && path !== '/manual' && path.split('/').length === 3)
      .map(([path, p]) => ({ path, label: p.label || p.title }));
    if (!fams.length) return null;
    const cur = page?.family ? fams.find((f) => f.label === page.family) : fams.find((f) => f.path === slug);
    const items = [{ path: '/manual', label: t.all }, ...fams];
    return <DropCell label={cur ? cur.label : items[0].label} items={items} current={cur ? cur.path : '/manual'} />;
  }
  const tabs = nav.sections[section]?.tabs || [];
  if (tabs.length < 2) return null;
  const cur = tabs.find((tb) => tb.path === slug) || tabs[0];
  return <DropCell label={cur.label} items={tabs.map((tb) => ({ path: tb.path, label: tb.label }))} current={cur.path} />;
}

export function SubVisual({ variant = 'section', description }) {
  const t = useT();
  const { slug, section, nav, page } = useCurrentPage();
  const history = useHistory();
  const [q, setQ] = useState('');
  const searchPath = useBaseUrl('/search');
  const tabs = section && nav.sections[section] ? nav.sections[section].tabs : [];
  return (
    <section className={`aidin-visual${variant === 'search' ? '' : ' aidin-visual--sub'}`}>
      <div className="aidin-container aidin-visual__inner">
        {variant !== 'search' && <div className="aidin-visual__eyebrow">{t.eyebrow}</div>}
        <div className="aidin-visual__title">{variant === 'search' || !nav.sections[section] ? t.center : nav.sections[section].title}</div>
        {description && <p className="aidin-visual__desc">{description}</p>}
        {variant === 'search' ? (
          <form
            className="aidin-bar aidin-bar--search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              history.push(`${searchPath}?q=${encodeURIComponent(q)}`);
            }}>
            <Icon name="search" size={20} />
            <label htmlFor="aidin-q" className="sr-only">
              {t.search}
            </label>
            <input id="aidin-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPh} />
            <button type="submit" className="aidin-btn aidin-btn--red">
              {t.search}
            </button>
          </form>
        ) : (
          <div className="aidin-bar">
            <Link to="/" className="aidin-bar__home" aria-label={t.home}>
              <Icon name="home" size={20} />
            </Link>
            <span className="aidin-bar__sep" aria-hidden="true" />
            <SectionDropdown current={section} />
            {(section === 'manual' || tabs.length > 1) && <span className="aidin-bar__sep" aria-hidden="true" />}
            <SubDropdown section={section} slug={slug} page={page} nav={nav} />
            <span className="aidin-bar__spacer" />
          </div>
        )}
      </div>
    </section>
  );
}

export function TitleSection({ title, description, children }) {
  const t = useT();
  return (
    <section className="aidin-title">
      <div className="aidin-container">
        <h1 className="aidin-title__h">{title}</h1>
        {description && <p className="aidin-title__desc">{description}</p>}
        {children}
      </div>
    </section>
  );
}

// 모든 페이지 하단 공통 (A/S 신청 페이지 제외) — 푸터 바로 위
export function SupportBand() {
  const t = useT();
  return (
    <section className="aidin-container aidin-cta">
      <div className="aidin-cta__box">
        <span className="aidin-cta__ic"><Icon name="headset" size={26} stroke={1.7} /></span>
        <div className="aidin-cta__text">
          <strong>{t.ctaTitle}</strong>
          <span>{t.ctaText}</span>
        </div>
        <div className="aidin-cta__btns">
          <Link to="/faq" className="aidin-btn aidin-btn--line">{t.ctaFaq}</Link>
          <Link to="/as" className="aidin-btn aidin-btn--red">{t.ctaAs} <Icon name="arrowRight" size={18} /></Link>
        </div>
      </div>
    </section>
  );
}

export function QuickMenu() {
  const t = useT();
  const { siteConfig } = useDocusaurusContext();
  const [open, setOpen] = useState(false);
  // 홈페이지와 동일: 300px 넘게 내려가면 위로가기 버튼이 나타나고 바로가기 버튼이 그 위로 올라감
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const check = () => {
      const on = window.scrollY > 300;
      setScrolled(on);
      // 홈페이지와 동일: 위로 올라와 버튼이 숨겨질 때 열려 있던 바로가기는 닫음
      if (!on) setOpen(false);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);
  return (
    <div className="aidin-quick">
      <div className={`aidin-quick__box${open ? ' is-open' : ''}${scrolled ? ' is-show' : ''}`}>
        <ul className="aidin-quick__list" aria-hidden={!open}>
          <li>
            <Link to="/" tabIndex={open ? 0 : -1}>
              <span className="lb">{t.qSupport}</span>
              <span className="ic"><Icon name="group" size={21} /></span>
            </Link>
          </li>
          <li>
            <Link to="/as" tabIndex={open ? 0 : -1}>
              <span className="lb">{t.qContact}</span>
              <span className="ic"><Icon name="pen" size={21} /></span>
            </Link>
          </li>
          <li className="key">
            <a href={siteConfig.customFields.SHOP_URL} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
              <span className="lb">{t.qShop}</span>
              <span className="ic"><Icon name="cart" size={21} /></span>
            </a>
          </li>
        </ul>
        <button type="button" className="aidin-quick__btn" aria-expanded={open} aria-label={t.qOpen} onClick={() => setOpen(!open)}>
          <span className="ic-open"><Icon name="cart" size={25} /></span>
          <span className="ic-close"><Icon name="close" size={24} /></span>
        </button>
      </div>
      <button type="button" className={`aidin-quick__top${scrolled ? ' is-on' : ''}`} tabIndex={scrolled ? 0 : -1} aria-label={t.toTop} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <Icon name="arrowUp" size={22} />
      </button>
    </div>
  );
}
