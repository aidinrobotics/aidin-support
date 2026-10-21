import React from 'react';
import Layout from '@theme-original/DocRoot/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { SubVisual, TitleSection, useCurrentPage } from '@site/src/components/Layout';
import { useT } from '@site/src/components/i18n';
import { useHistory } from '@docusaurus/router';
import { Icon } from '@site/src/components/Icons';

// 모바일에서는 왼쪽 메뉴 대신 제품 선택 상자를 보여줌
function MobileManualNav({ nav, slug }) {
  const history = useHistory();
  const base = useBaseUrl('/');
  const groups = [];
  for (const [path, p] of Object.entries(nav.pages)) {
    if (p.section !== 'manual' || path === '/manual') continue;
    if (!p.family) groups.push({ title: p.label, items: [] });
    else (groups.find((g) => g.title === p.family) || groups[groups.push({ title: p.family, items: [] }) - 1]).items.push([path, p.label]);
  }
  return (
    <div className="aidin-mnav">
      <select value={nav.pages[slug] ? slug : ''} onChange={(e) => e.target.value && history.push(base.replace(/\/$/, '') + e.target.value)} aria-label="model">
        <option value="">{nav.sections.manual?.title}</option>
        {groups.filter((g) => g.items.length).map((g) => (
          <optgroup key={g.title} label={g.title}>
            {g.items.map(([path, label]) => <option key={path} value={path}>{label}</option>)}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export default function LayoutWrapper(props) {
  const t = useT();
  const { page, section, nav, slug } = useCurrentPage();
  const isManual = section === 'manual';
  const title = page?.title;
  const description = page?.description;
  const pdfUrl = useBaseUrl(page?.pdf || '/');
  // 내려받는 파일 이름: 에이딘로보틱스_모델명.pdf (영문 사이트는 AIDIN-ROBOTICS_모델명.pdf)
  const pdfName = `${pdfUrl.includes('/en/') ? 'AIDIN-ROBOTICS' : '에이딘로보틱스'}_${(page?.pdf || '').split('/').pop().replace(/\.pdf$/i, '').toUpperCase()}.pdf`;
  // 탭으로 고르는 메뉴(자료실·FAQ·설치 가이드)와 '전체' 페이지는 제목을 상단 띠에서 한 번만
  const tabbed = ['downloads', 'faq', 'install'].includes(section);
  // A/S·문의는 A/S 신청과 제품 문의하기 모두 본문 위에 가운데 제목을 보여줌
  const dup = tabbed || (section !== 'as' && !!title && title === nav.sections[section]?.title);
  const bandDesc = tabbed ? nav.pages[nav.sections[section]?.path]?.description || description : description;
  return (
    <>
      {/* 페이지 제목이 메뉴 이름과 같으면(전체 페이지 등) 상단 띠에서 한 번만 보여줌 */}
      <SubVisual description={dup ? bandDesc : undefined} />
      {/* 제품 매뉴얼: 왼쪽 제품군·제품명, 오른쪽 PDF 버튼을 한 줄로 */}
      {!dup && page?.isManual && (
        <section className="aidin-phead">
          <div className="aidin-container">
            <div className="aidin-phead__in">
            <div className="aidin-phead__txt">
              {page.family && <span className="aidin-phead__fam">{page.family}</span>}
              <h1 className="aidin-phead__h">{title}</h1>
            </div>
            <a className="aidin-btn aidin-btn--red aidin-phead__pdf" href={pdfUrl} download={pdfName}>
              <Icon name="download" size={18} /> {t.pdf}
            </a>
            </div>
          </div>
        </section>
      )}
      {!dup && !page?.isManual && <TitleSection title={title} description={description} />}

      <div className={`aidin-docs aidin-docs--${section || 'none'} aidin-docs--hide-h1${page?.isManual ? ' aidin-docs--product' : ''}${dup ? ' aidin-docs--dup' : ''}${slug === '/manual' ? ' aidin-docs--landing' : ''}`}>
        <Layout {...props} />
      </div>
    </>
  );
}
void Link;
