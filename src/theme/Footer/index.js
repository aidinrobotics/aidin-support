import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import { useLocale } from '@site/src/components/i18n';
import { SupportBand, QuickMenu, useSlug } from '@site/src/components/Layout';

// 홈페이지 푸터에서 사이트맵을 뺀 슬림 버전 (주소 · 연락처 · 사업자 정보 · 하단 바)
const L = {
  ko: { ir: 'IR 정보', media: '미디어룸', news: '최신 뉴스', blog: '블로그', support: '고객지원', sup: [['브로슈어 · 리플렛', '/downloads'], ['3D 파일 · 도면', '/downloads/step'], ['제품 인증서', '/downloads/certificate'], ['제품 매뉴얼', '/manual'], ['설치 · 사용 가이드', '/install']], hq: '연구소 · 본사', fac: '생산공장', addrHq: '경기도 안양시 동안구 시민대로327번길 12-20, 4, 5층', addrFac: '경기도 안양시 동안구 시민대로327번길 12-20, 3층', tel: '대표번호', sales: '영업', biz: '기업문의', hr: '채용문의', pr: '홍보·마케팅', corp: '법인명', ceo: '대표자', brn: '사업자등록번호', mail: '통신판매업신고번호', corpName: '(주)에이딘로보틱스', ceoName: '최혁렬, 이윤행', mailNo: '제 2023-안양동안-1570호', privacy: '개인정보처리방침', terms: '이용약관', sitemap: '사이트맵' },
  en: { ir: 'IR', media: 'Media', news: 'News', blog: 'Blog', support: 'Support', sup: [['Brochures & Leaflets', '/downloads'], ['3D CAD & Drawings', '/downloads/step'], ['Certificates', '/downloads/certificate'], ['Product Manuals', '/manual'], ['Installation Guides', '/install']], hq: 'Headquarters & R&D Center', fac: 'Manufacturing Facility', addrHq: '4F & 5F, 12-20 Simin-daero 327beon-gil, Dongan-gu, Anyang-si, Gyeonggi-do', addrFac: '3F, 12-20 Simin-daero 327beon-gil, Dongan-gu, Anyang-si, Gyeonggi-do', tel: 'Main Line', sales: 'Sales', biz: 'General Inquiries', hr: 'Careers', pr: 'PR & Marketing', corp: 'Company', ceo: 'CEO', brn: 'Business Registration No.', mail: 'E-commerce Registration No.', corpName: 'AIDIN ROBOTICS Inc.', ceoName: 'Hyouk Ryeol Choi, Yoon Haeng Lee', mailNo: '2023-Anyang Dongan-1570', privacy: 'Privacy Policy', terms: 'Terms of Use', sitemap: 'Sitemap' },
};

export default function Footer() {
  const { siteConfig } = useDocusaurusContext();
  const H = siteConfig.customFields.HOMEPAGE_URL;
  const loc = useLocale();
  const l = L[loc];
  const slug = useSlug();
  const showBand = slug !== '/as' && !slug.startsWith('/search');
  const { pathname } = useLocation();
  // 매뉴얼 본문: 설명 없는 그림에 '제품명 그림 N' 대체 텍스트, 화면보다 넓은 표는 표 안에서만 옆으로 넘기기
  React.useEffect(() => {
    const run = () => {
      const h = document.querySelector('.aidin-phead__h, .theme-doc-markdown h1, h1');
      const name = h ? h.textContent.trim() : '';
      const fig = loc === 'en' ? 'figure' : '그림';
      document.querySelectorAll('.theme-doc-markdown img:not([alt])').forEach((img, i) => img.setAttribute('alt', `${name} ${fig} ${i + 1}`.trim()));
      document.querySelectorAll('.theme-doc-markdown table').forEach((tb) => {
        tb.classList.remove('is-wide');
        if (tb.parentElement && tb.scrollWidth > tb.parentElement.clientWidth + 1) tb.classList.add('is-wide');
      });
    };
    const id = setTimeout(run, 300);
    window.addEventListener('resize', run);
    return () => { clearTimeout(id); window.removeEventListener('resize', run); };
  }, [pathname, loc]);
  return (
    <>
      {showBand && <SupportBand />}
      <footer className="aidin-footer">
        <div className="aidin-container aidin-footer__body">
          <div className="aidin-footer__addr">
            <dl>{loc === 'en' && <dt className="en">R&amp;D &amp; HQ</dt>}<dt className="ko">{l.hq}</dt><dd>{l.addrHq}</dd></dl>
            <dl>{loc === 'en' && <dt className="en">FACTORY</dt>}<dt className="ko">{l.fac}</dt><dd>{l.addrFac}</dd></dl>
          </div>
          <div className="aidin-footer__info">
            <dl>
              <dt>{loc === 'en' ? 'CONTACT' : '연락처'}</dt>
              <dd>
                <span><em>{l.tel}</em>+82-31-360-7926</span>
                {/* 이메일은 둘째 줄부터 (PC) */}
                <span className="aidin-footer__br" aria-hidden="true" />
                <span><em>{l.sales}</em>sales@aidinrobotics.co.kr</span>
                <span><em>{l.biz}</em>info@aidinrobotics.co.kr</span>
                <span><em>{l.hr}</em>hr@aidinrobotics.co.kr</span>
                <span><em>{l.pr}</em>pr@aidinrobotics.co.kr</span>
              </dd>
            </dl>
            <dl>
              <dt>{loc === 'en' ? 'BUSINESS' : '사업자 정보'}</dt>
              <dd>
                <span><em>{l.corp}</em>{l.corpName}</span>
                <span><em>{l.ceo}</em>{l.ceoName}</span>
                <span><em>{l.brn}</em>355-87-01439</span>
                <span><em>{l.mail}</em>{l.mailNo}</span>
              </dd>
            </dl>
          </div>
        </div>
        <div className="aidin-footer__bottom">
          <div className="aidin-container">
            <strong>{l.corpName}</strong>
            <span className="bar" aria-hidden="true" />
            <a href={H}>{l.privacy}</a>
            <span className="bar light" aria-hidden="true" />
            <a href={H}>{l.terms}</a>
            <span className="bar light" aria-hidden="true" />
            <a href={H}>{l.sitemap}</a>
            <span className="bar light" aria-hidden="true" />
            <span className="copy">© {new Date().getFullYear()} AIDIN ROBOTICS Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
      <QuickMenu />
    </>
  );
}
