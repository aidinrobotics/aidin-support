import React, { useEffect, useRef, useState } from 'react';
import Content from '@theme-original/DocItem/Content';
import { useCurrentPage } from '@site/src/components/Layout';
import { useT } from '@site/src/components/i18n';

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

export default function ContentWrapper(props) {
  const { section } = useCurrentPage();
  const ref = useRef(null);
  return (
    <div ref={ref}>
      {section === 'downloads' && <ModelFilter root={ref} />}
      <Content {...props} />
    </div>
  );
}
