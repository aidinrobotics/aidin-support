import React, { useEffect, useRef, useState } from 'react';
import Content from '@theme-original/DocSidebar/Desktop/Content';
import { useT } from '@site/src/components/i18n';
import { Icon } from '@site/src/components/Icons';

// 매뉴얼 왼쪽 목록 위 '모델명으로 찾기'
export default function ContentWrapper(props) {
  const t = useT();
  const ref = useRef(null);
  const [q, setQ] = useState('');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const k = q.trim().toLowerCase();
    el.querySelectorAll('.theme-doc-sidebar-item-link').forEach((li) => {
      li.hidden = !!k && !li.textContent.toLowerCase().includes(k);
    });
    el.querySelectorAll('.theme-doc-sidebar-item-category').forEach((cat) => {
      const any = [...cat.querySelectorAll('.theme-doc-sidebar-item-link')].some((x) => !x.hidden);
      const self = cat.querySelector('.menu__list-item-collapsible')?.textContent.toLowerCase().includes(k);
      cat.hidden = !!k && !any && !self;
    });
  }, [q]);
  return (
    <div ref={ref} className="aidin-sidebar">
      <div className="aidin-sidebar__search">
        <Icon name="search" size={16} />
        <label htmlFor="aidin-ps" className="sr-only">{t.filterModel}</label>
        <input id="aidin-ps" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.filterModel} />
      </div>
      <Content {...props} />
    </div>
  );
}
