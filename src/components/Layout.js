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

function SectionDropdown({ current }) {
  const nav = useNav();
  const [open, setOpen] = useState(false);
  const sec = nav.sections[current];
  return (
    <div className="aidin-cell" onMouseLeave={() => setOpen(false)}>
      <button type="button" className="aidin-cell__btn" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{sec ? sec.title : ''}</span>
        <Chevron />
      </button>
      {open && (
        <ul className="aidin-cell__menu">
          {SECTION_ORDER.filter((s) => nav.sections[s]).map((s) => (
            <li key={s}>
              <Link to={nav.sections[s].path} className={s === current ? 'is-active' : undefined}>
                {nav.sections[s].title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SubVisual({ variant = 'section' }) {
  const t = useT();
  const { slug, section, nav } = useCurrentPage();
  const history = useHistory();
  const [q, setQ] = useState('');
  const searchPath = useBaseUrl('/search');
  const tabs = section && nav.sections[section] ? nav.sections[section].tabs : [];
  return (
    <section className="aidin-visual">
      <div className="aidin-container aidin-visual__inner">
        <div className="aidin-visual__title">{t.center}</div>
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
            <span className="aidin-bar__spacer" />
            {tabs.length > 1 && (
              <nav className="aidin-tabs" aria-label="tabs">
                {tabs.map((tb) => (
                  <Link key={tb.path} to={tb.path} className={tb.path === slug ? 'is-active' : undefined}>
                    {tb.label}
                  </Link>
                ))}
              </nav>
            )}
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
        <div className="aidin-eyebrow">{t.eyebrow}</div>
        <h1 className="aidin-title__h">{title}</h1>
        {description && <p className="aidin-title__desc">{description}</p>}
        {children}
      </div>
    </section>
  );
}

export function SupportBand() {
  const t = useT();
  return (
    <section className="aidin-container aidin-band-wrap">
      <div className="aidin-band">
        <div className="aidin-band__text">
          <div className="aidin-band__eyebrow">{t.bandEyebrow}</div>
          <h2 className="aidin-band__title">{t.bandTitle}</h2>
          <p>{t.bandText}</p>
        </div>
        <div className="aidin-band__btns">
          <Link to="/as" className="aidin-btn aidin-btn--red aidin-btn--lg">
            {t.bandAs}
          </Link>
          <Link to="/faq" className="aidin-btn aidin-btn--ghost aidin-btn--lg">
            {t.bandFaq}
          </Link>
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
