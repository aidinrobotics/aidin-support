import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import nav from '@site/src/data/nav.json';

// 영문은 미국식 영어(American English) 기준
const S = {
  ko: {
    center: '고객지원센터',
    eyebrow: 'CUSTOMER SUPPORT',
    home: '고객지원센터 홈',
    heroTitle: '무엇을 도와드릴까요?',
    heroSub: '에이딘로보틱스 고객지원센터에 오신 것을 환영합니다.',
    shareDesc: '제품 매뉴얼, 설치·연동 가이드, 자료 다운로드, A/S 신청을 한곳에서 확인하세요.',
    searchPh: '제품명, 모델명, 증상으로 검색 (예: AFT200 CAN 통신)',
    search: '검색',
    popular: '자주 찾는 제품',
    pdf: 'PDF 다운로드',
    edit: 'GitHub에서 수정',
    related: '관련 자료',
    filterModel: '모델명으로 찾기',
    allProducts: '전체 제품',
    ctaTitle: '찾으시는 내용이 없나요?',
    ctaText: '자주 묻는 질문을 먼저 확인해 보시고, 해결되지 않으면 문의하기를 작성해 주세요.',
    ctaFaq: '자주 묻는 질문',
    ctaAs: '문의하기',
    asButton: '바로가기',
    asCardTitle: 'A/S·문의',
    asCardDesc: '수리·점검이 필요하면 A/S 신청, 제품·견적이 궁금하면 문의하기를 이용해 주세요.',
    asCardAs: 'A/S 신청',
    asCardInquiry: '제품 문의하기',
    navInquiry: '문의하기',
    viewAll: { manual: '매뉴얼 전체 보기', install: '가이드 전체 보기', downloads: '자료실 전체 보기', faq: '질문 전체 보기' },
    qSupport: '고객지원',
    qContact: '문의하기',
    qShop: '쇼핑몰',
    qOpen: '바로가기 메뉴 열기',
    toTop: '맨 위로 이동',
    lang: '언어 선택',
    all: '전체',
    pick: { model: '모델 선택', manual: '제품군 선택', install: '가이드 선택', downloads: '자료 종류 선택', faq: '질문 분류 선택' },
    board: { total: (n) => `총 ${n}건`, no: '번호', cat: '분류', title: '자료명', format: '형식', lang: '언어', rev: '개정', download: '다운로드', dl: '내려받기', search: '모델명·자료명 검색', empty: '조건에 맞는 자료가 없습니다.', prev: '이전 페이지', next: '다음 페이지' },
    models: (n) => `${n}개 모델`,
    viewManual: '매뉴얼 보기',
  },
  en: {
    center: 'Support Center',
    eyebrow: 'CUSTOMER SUPPORT',
    home: 'Support Center home',
    heroTitle: 'How can we help?',
    heroSub: 'Welcome to the AIDIN ROBOTICS Support Center.',
    shareDesc: 'Find product manuals, installation and integration guides, downloads, and service requests in one place.',
    searchPh: 'Search by product, model, or issue (e.g., AFT200 CAN communication)',
    search: 'Search',
    popular: 'Popular products',
    pdf: 'Download PDF',
    edit: 'Edit on GitHub',
    related: 'Related resources',
    filterModel: 'Find by model',
    allProducts: 'All products',
    ctaTitle: "Can't find what you're looking for?",
    ctaText: 'Try our FAQs first. Still need help? Contact us and our team will get back to you.',
    ctaFaq: 'Browse FAQs',
    ctaAs: 'Contact Us',
    asButton: 'Get Started',
    asCardTitle: 'Service & Sales',
    asCardDesc: 'Request a repair or inspection, or contact our sales team about products and quotes.',
    asCardAs: 'Service Request',
    asCardInquiry: 'Contact Sales',
    navInquiry: 'Contact Sales',
    viewAll: { manual: 'View all manuals', install: 'View all guides', downloads: 'View all downloads', faq: 'View all FAQs' },
    qSupport: 'Support',
    qContact: 'Contact Us',
    qShop: 'Shop',
    qOpen: 'Open quick menu',
    toTop: 'Back to top',
    lang: 'Language',
    all: 'All',
    pick: { model: 'Select a model', manual: 'Select a product family', install: 'Select a guide', downloads: 'Select a type', faq: 'Select a topic' },
    board: { total: (n) => `${n} ${n === 1 ? 'file' : 'files'}`, no: 'No.', cat: 'Type', title: 'Title', format: 'Format', lang: 'Language', rev: 'Revised', download: 'Download', dl: 'Download', search: 'Search by model or file name', empty: 'No files match your filters.', prev: 'Previous page', next: 'Next page' },
    models: (n) => `${n} ${n === 1 ? 'model' : 'models'}`,
    viewManual: 'View Manual',
  },
};
// 카드 라벨 (홈페이지 카드와 같은 '번호 + 영문' 표기)
export const CARD_LABEL = { manual: 'PRODUCT MANUAL', install: 'INSTALLATION', downloads: 'DOWNLOADS', faq: 'FAQ', as: 'SUPPORT' };

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
