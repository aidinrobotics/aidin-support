import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAlternatePageUtils } from '@docusaurus/theme-common/internal';

// 국문·영문 두 언어만 있으므로 지구본 드롭다운 대신 KO | EN 라운드 스위치
const LABEL = { ko: 'KO', en: 'EN' };

export default function LangSwitch() {
  const { i18n } = useDocusaurusContext();
  const { createUrl } = useAlternatePageUtils();
  return (
    <div className="navbar__item aidin-lang" role="group" aria-label="Language">
      {i18n.locales.map((loc) => {
        const active = loc === i18n.currentLocale;
        return (
          <a
            key={loc}
            href={createUrl({ locale: loc, fullyQualified: false })}
            className={active ? 'is-active' : undefined}
            aria-current={active ? 'true' : undefined}
            lang={loc}
            target="_self">
            {LABEL[loc] || loc.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
}
