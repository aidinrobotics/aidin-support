import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import Link from '@docusaurus/Link';
import { useCurrentPage } from '@site/src/components/Layout';
import { useT, useLocale } from '@site/src/components/i18n';

const REL = {
  ko: [['제품 도면', '/downloads/drawing'], ['3D STEP 파일', '/downloads/step'], ['자주 묻는 질문', '/faq'], ['A/S 신청', '/as']],
  en: [['Product Drawings', '/downloads/drawing'], ['3D STEP Files', '/downloads/step'], ['FAQ', '/faq'], ['Contact Support', '/as']],
};

export default function FooterWrapper(props) {
  const t = useT();
  const loc = useLocale();
  const { page, nav } = useCurrentPage();
  return (
    <>
      {page?.isManual && (
        <div className="aidin-related">
          <h3>{t.related}</h3>
          <div className="aidin-related__grid">
            {REL[loc].filter(([, to]) => nav.pages[to] || nav.sections[to.slice(1)]).map(([label, to]) => (
              <Link key={to} to={to}>
                {label}
                <span aria-hidden="true">›</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      <Footer {...props} />
    </>
  );
}
