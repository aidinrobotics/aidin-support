import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocale, useNav } from '@site/src/components/i18n';
import { SupportBand, QuickMenu, useSlug } from '@site/src/components/Layout';

// 홈페이지(거인소프트) 푸터와 같은 구성. 사이트맵 링크는 홈페이지로 연결됩니다.
const MAP = {
  ko: [
    ['회사소개', [['기업소개', '/kr/company/about.php'], ['기술소개', '/kr/company/technology.php'], ['인재채용', '/kr/company/recruit.php'], ['오시는 길', '/kr/company/location.php']]],
    ['제품 · 솔루션', [['센서 라인업', '/kr/product/?cate=sensor'], ['로봇핸드', '/kr/product/view.php?idx=10'], ['스마트 그리퍼', '/kr/product/view.php?idx=11'], ['표면 가공 솔루션', '/kr/product/view.php?idx=12'], ['물류 피킹 솔루션', '/kr/product/view.php?idx=13'], ['4족보행 로봇', '/kr/product/view.php?idx=14'], ['피지컬 AI 솔루션', '/kr/product/view.php?idx=15']]],
    ['적용분야', [['정밀 조립', '/kr/application/view.php?idx=1'], ['핸들링 · 피킹', '/kr/application/view.php?idx=2'], ['표면 가공', '/kr/application/view.php?idx=3'], ['평가 · 계측', '/kr/application/view.php?idx=4'], ['자율점검', '/kr/application/view.php?idx=5'], ['휴머노이드 · 피지컬 AI', '/kr/application/view.php?idx=7']]],
  ],
  en: [
    ['Company', [['About', '/kr/company/about.php'], ['Technology', '/kr/company/technology.php'], ['Careers', '/kr/company/recruit.php'], ['Location', '/kr/company/location.php']]],
    ['Products · Solutions', [['Sensors', '/kr/product/?cate=sensor'], ['Robot Hand', '/kr/product/view.php?idx=10'], ['Smart Gripper', '/kr/product/view.php?idx=11'], ['Surface Finishing', '/kr/product/view.php?idx=12'], ['Logistics Picking', '/kr/product/view.php?idx=13'], ['Quadruped Robot', '/kr/product/view.php?idx=14'], ['Physical AI', '/kr/product/view.php?idx=15']]],
    ['Applications', [['Precision Assembly', '/kr/application/view.php?idx=1'], ['Handling · Picking', '/kr/application/view.php?idx=2'], ['Surface Finishing', '/kr/application/view.php?idx=3'], ['Testing · Measurement', '/kr/application/view.php?idx=4'], ['Autonomous Inspection', '/kr/application/view.php?idx=5'], ['Humanoid · Physical AI', '/kr/application/view.php?idx=7']]],
  ],
};
const L = {
  ko: { ir: 'IR 정보', media: '미디어룸', news: '최신 뉴스', blog: '블로그', support: '고객지원', sup: [['브로슈어 · 리플렛', '/downloads'], ['3D 파일 · 도면', '/downloads/step'], ['제품 인증서', '/downloads/certificate'], ['제품 매뉴얼', '/manual'], ['설치 · 사용 가이드', '/install']], hq: '연구소 · 본사', fac: '생산공장', addrHq: '경기도 안양시 동안구 시민대로327번길 12-20, 4, 5층', addrFac: '경기도 안양시 동안구 시민대로327번길 12-20, 3층', tel: '대표번호', sales: '영업·마케팅', biz: '기업문의', hr: '채용문의', corp: '법인명', ceo: '대표자', brn: '사업자등록번호', mail: '통신판매업신고번호', corpName: '(주)에이딘로보틱스', ceoName: '최혁렬, 이윤행', mailNo: '제 2023-안양동안-1570호', privacy: '개인정보처리방침', terms: '이용약관', sitemap: '사이트맵' },
  en: { ir: 'IR', media: 'Media', news: 'News', blog: 'Blog', support: 'Support', sup: [['Brochures · Leaflets', '/downloads'], ['3D Files · Drawings', '/downloads/step'], ['Certificates', '/downloads/certificate'], ['Product Manuals', '/manual'], ['Installation Guides', '/install']], hq: 'R&D · HQ', fac: 'Factory', addrHq: '4F & 5F, 12-20 Simin-daero 327beon-gil, Dongan-gu, Anyang-si, Gyeonggi-do', addrFac: '3F, 12-20 Simin-daero 327beon-gil, Dongan-gu, Anyang-si, Gyeonggi-do', tel: 'Main', sales: 'Sales·Marketing', biz: 'Business', hr: 'Careers', corp: 'Company', ceo: 'CEO', brn: 'Business Reg. No.', mail: 'Mail-order Reg. No.', corpName: 'AIDIN ROBOTICS Inc.', ceoName: 'Hyouk Ryeol Choi, Yoon Haeng Lee', mailNo: '2023-Anyang Dongan-1570', privacy: 'Privacy Policy', terms: 'Terms of Use', sitemap: 'Sitemap' },
};

export default function Footer() {
  const { siteConfig } = useDocusaurusContext();
  const H = siteConfig.customFields.HOMEPAGE_URL;
  const loc = useLocale();
  const l = L[loc];
  const slug = useSlug();
  const nav = useNav();
  const showBand = slug !== '/as' && !slug.startsWith('/search');
  return (
    <>
      {showBand && <SupportBand />}
      <footer className="aidin-footer">
        <div className="aidin-container aidin-footer__body">
          <ul className="aidin-footer__map">
            {MAP[loc].map(([h, items]) => (
              <li key={h}>
                <h3>{h}</h3>
                <ul>
                  {items.map(([label, href]) => (
                    <li key={label}><a href={H + href}>{label}</a></li>
                  ))}
                </ul>
              </li>
            ))}
            <li>
              <h3><a href={H + '/kr/ir/why.php'}>{l.ir} ↗</a></h3>
              <h3 className="sub">{l.media}</h3>
              <ul className="dim">
                <li><a href={H + '/kr/media/news.php'}>{l.news}</a></li>
                <li><a href={H + '/kr/media/blog.php'}>{l.blog}</a></li>
              </ul>
            </li>
            <li>
              <h3>{l.support}</h3>
              <ul>
                {l.sup.filter(([, to]) => nav.pages[to] || nav.sections[to.slice(1)]).map(([label, to]) => (
                  <li key={label}><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </li>
          </ul>
          <div className="aidin-footer__addr">
            <dl><dt className="en">R&amp;D &amp; HQ</dt><dt className="ko">{l.hq}</dt><dd>{l.addrHq}</dd></dl>
            <dl><dt className="en">FACTORY</dt><dt className="ko">{l.fac}</dt><dd>{l.addrFac}</dd></dl>
          </div>
          <div className="aidin-footer__info">
            <dl>
              <dt>CONTACT</dt>
              <dd>
                <span><em>{l.tel}</em>+82-31-360-7926</span>
                <span><em>{l.sales}</em>sales@aidinrobotics.co.kr</span>
                <span><em>{l.biz}</em>info@aidinrobotics.co.kr</span>
                <span><em>{l.hr}</em>hr@aidinrobotics.co.kr</span>
              </dd>
            </dl>
            <dl>
              <dt>BUSINESS</dt>
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
