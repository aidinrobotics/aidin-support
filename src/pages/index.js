import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { SubVisual, TitleSection } from '@site/src/components/Layout';
import { useNav, useT, SECTION_ORDER } from '@site/src/components/i18n';
import { Icon } from '@site/src/components/Icons';

const ICON = { manual: 'book', install: 'plug', downloads: 'download', faq: 'help', as: 'wrench' };
// 자주 찾는 제품 (첫 화면 바로가기)
const POPULAR = [
  ['AFT200-D80', '/manual/aft200-d80-c'],
  ['AFT150-D50', '/manual/aft150-d50-c'],
  ['3FT2000-D65', '/manual/3ft2000-d65-c'],
  ['ATSB', '/manual/atsb'],
  ['ATT', '/manual/att'],
];

export default function Home() {
  const t = useT();
  const nav = useNav();
  return (
    <Layout title={t.center} description={t.cards.manual}>
      <SubVisual variant="search" />
      <TitleSection title={t.supportMenu}>
        <div className="aidin-chips">
          <span>{t.popular}</span>
          {POPULAR.filter(([, to]) => nav.pages[to]).map(([label, to]) => (
            <Link key={to} to={to}>{label}</Link>
          ))}
        </div>
      </TitleSection>
      <section className="aidin-container aidin-cards">
        {SECTION_ORDER.filter((s) => nav.sections[s]).map((s) => (
          <Link key={s} to={nav.sections[s].path} className="aidin-card">
            <span className="aidin-card__ic"><Icon name={ICON[s]} size={28} stroke={1.7} /></span>
            <span className="aidin-card__t">{nav.sections[s].title}</span>
            <span className="aidin-card__d">{t.cards[s]}</span>
          </Link>
        ))}
      </section>
    </Layout>
  );
}
