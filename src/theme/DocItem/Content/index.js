import React, { useEffect, useRef, useState } from 'react';
import Content from '@theme-original/DocItem/Content';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useCurrentPage } from '@site/src/components/Layout';
import { useT, useNav } from '@site/src/components/i18n';
import { Icon } from '@site/src/components/Icons';

// 자료실 표에 '모델' 열이 있으면 제품 선택 상자로 걸러 볼 수 있게 함 (원고는 그대로)
function ModelFilter({ root }) {
  const t = useT();
  const [models, setModels] = useState([]);
  const [value, setValue] = useState('');
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const found = new Set();
    el.querySelectorAll('table').forEach((tb) => {
      const heads = [...tb.querySelectorAll('thead th')].map((th) => th.textContent.trim());
      const idx = heads.findIndex((h) => /^(모델|Model)$/i.test(h));
      if (idx < 0) return;
      tb.dataset.modelCol = idx;
      tb.querySelectorAll('tbody tr').forEach((tr) => {
        const cell = tr.children[idx];
        if (!cell) return;
        const base = cell.textContent.trim().split(/[\s(]/)[0];
        if (base) found.add(base);
      });
    });
    setModels([...found]);
  }, [root]);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.querySelectorAll('table[data-model-col]').forEach((tb) => {
      const idx = +tb.dataset.modelCol;
      tb.querySelectorAll('tbody tr').forEach((tr) => {
        const txt = (tr.children[idx]?.textContent || '').trim();
        tr.hidden = !!value && !txt.startsWith(value);
      });
    });
  }, [value, root]);
  if (models.length < 2) return null;
  return (
    <div className="aidin-modelfilter">
      <label htmlFor="aidin-model" className="sr-only">{t.allProducts}</label>
      <select id="aidin-model" value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="">{t.allProducts}</option>
        {models.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}

// 제품별 매뉴얼 첫 화면·제품군 화면은 깃허브 목차(nav.json)로 카드를 그림 (원고 표 대신)
function useManualTree() {
  const nav = useNav();
  const entries = Object.entries(nav.pages).filter(([, p]) => p.section === 'manual');
  const families = entries
    .filter(([path, p]) => !p.family && path !== '/manual' && path.split('/').length === 3)
    .map(([path, p]) => ({
      path,
      title: p.label || p.title,
      description: p.description,
      products: entries.filter(([, q]) => q.family === (p.label || p.title)).map(([qp, q]) => ({ path: qp, ...q })),
    }));
  return families;
}

function FamilyCards() {
  const t = useT();
  const families = useManualTree();
  return (
    <div className="aidin-mgrid aidin-mgrid--fam">
      {families.map((f, i) => (
        <div key={f.path} className="aidin-mcard">
          <Link to={f.path} className="aidin-mcard__head">
            <span className="aidin-mcard__top">
              <span className="aidin-mcard__label"><b>{String(i + 1).padStart(2, '0')}</b>{t.models(f.products.length)}</span>
              <span className="aidin-mcard__arrow"><Icon name="arrowRight" size={30} stroke={1.6} /></span>
            </span>
            <span className="aidin-mcard__title">{f.title}</span>
          </Link>
          <ul className="aidin-mcard__list">
            {f.products.map((p) => (
              <li key={p.path}><Link to={p.path}>{p.label || p.title}<Icon name="chevronRight" size={14} stroke={2} /></Link></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ProductCard({ p }) {
  const t = useT();
  const pdf = useBaseUrl(p.pdf || '/');
  return (
    <div className="aidin-pcard">
      <Link to={p.path} className="aidin-pcard__name">{p.label || p.title}</Link>
      <div className="aidin-pcard__btns">
        <Link to={p.path} className="aidin-pcard__btn is-dark">{t.viewManual} <Icon name="arrowRight" size={16} /></Link>
        {p.pdf && <a href={pdf} download className="aidin-pcard__btn"><Icon name="download" size={16} /> PDF</a>}
      </div>
    </div>
  );
}

function ProductCards({ family }) {
  const families = useManualTree();
  const f = families.find((x) => x.path === family);
  if (!f) return null;
  return (
    <div className="aidin-mgrid aidin-mgrid--prod">
      {f.products.map((p) => <ProductCard key={p.path} p={p} />)}
    </div>
  );
}

export default function ContentWrapper(props) {
  const { section, slug, page } = useCurrentPage();
  const ref = useRef(null);
  if (section === 'manual' && slug === '/manual') return <FamilyCards />;
  if (section === 'manual' && page && !page.family && slug.split('/').length === 3) return <ProductCards family={slug} />;
  return (
    <div ref={ref}>
      {section === 'downloads' && <ModelFilter root={ref} />}
      <Content {...props} />
    </div>
  );
}
