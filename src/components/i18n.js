import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import nav from '@site/src/data/nav.json';

const S = {
  ko: {
    center: '고객지원센터',
    eyebrow: 'Customer Support',
    home: '고객지원센터 홈',
    allMenu: '전체 메뉴',
    searchPh: '제품명, 모델명, 키워드로 검색',
    search: '검색',
    supportMenu: '지원 메뉴',
    popular: '자주 찾는 제품',
    pdf: 'PDF 다운로드',
    edit: 'GitHub에서 수정',
    related: '관련 자료',
    filterModel: '모델명으로 찾기',
    allProducts: '전체 제품',
    bandEyebrow: 'TECHNICAL SUPPORT',
    bandTitle: '기술 지원 · A/S 접수',
    bandText: '문서로 해결되지 않는 문제는 담당자가 확인 후 회신드립니다. 평일 09:00–18:00 (KST)',
    bandAs: 'A/S 신청',
    bandFaq: '자주 묻는 질문',
    qSupport: '고객지원',
    qContact: '문의하기',
    qShop: '쇼핑몰',
    qOpen: '바로가기 메뉴 열기',
    toTop: '맨 위로 이동',
    lang: '언어 선택',
    cards: {
      manual: '사양, 체결, 배선, 통신, 샘플 코드까지 제품군별로 담았습니다.',
      install: '로봇 키트 장착부터 통신 연동까지 영상으로 안내합니다.',
      downloads: '브로슈어, 도면, 3D STEP 파일, 인증서를 내려받으실 수 있습니다.',
      faq: '실제 접수된 문의를 제품별로 정리했습니다.',
      as: '제품 수리·점검이나 기술 문의를 접수합니다.',
    },
  },
  en: {
    center: 'Support Center',
    eyebrow: 'Customer Support',
    home: 'Support Center home',
    allMenu: 'All menus',
    searchPh: 'Search by product, model or keyword',
    search: 'Search',
    supportMenu: 'Support Menu',
    popular: 'Popular products',
    pdf: 'Download PDF',
    edit: 'Edit on GitHub',
    related: 'Related resources',
    filterModel: 'Find by model',
    allProducts: 'All products',
    bandEyebrow: 'TECHNICAL SUPPORT',
    bandTitle: 'Technical Support · Repair Request',
    bandText: 'If the documents do not solve your issue, our team will get back to you. Weekdays 09:00–18:00 (KST)',
    bandAs: 'Contact Support',
    bandFaq: 'FAQ',
    qSupport: 'Support',
    qContact: 'Contact',
    qShop: 'Shop',
    qOpen: 'Open quick menu',
    toTop: 'Back to top',
    lang: 'Language',
    cards: {
      manual: 'Specs, mounting, wiring, communication and sample code by product family.',
      install: 'Video guides from mounting the robot kit to communication setup.',
      downloads: 'Brochures, drawings, 3D STEP files and certificates.',
      faq: 'Real customer questions, organized by product.',
      as: 'Request repair, inspection or technical help.',
    },
  },
};

export function useLocale() {
  const { i18n } = useDocusaurusContext();
  return i18n.currentLocale === 'en' ? 'en' : 'ko';
}
export function useT() {
  return S[useLocale()];
}
export function useNav() {
  return nav[useLocale()];
}
export const SECTION_ORDER = ['manual', 'install', 'downloads', 'faq', 'as'];
