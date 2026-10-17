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
    searchPh: '제품명, 모델명, 증상으로 검색 (예: AFT200 CAN 통신)',
    search: '검색',
    popular: '자주 찾는 제품',
    pdf: 'PDF 다운로드',
    edit: 'GitHub에서 수정',
    related: '관련 자료',
    filterModel: '모델명으로 찾기',
    allProducts: '전체 제품',
    ctaTitle: '찾으시는 내용이 없나요?',
    ctaText: 'A/S를 신청하시면 담당 엔지니어가 확인 후 직접 회신드립니다.',
    ctaFaq: '자주 묻는 질문',
    ctaAs: 'A/S 신청',
    asButton: '바로가기',
    viewAll: { manual: '매뉴얼 전체 보기', install: '가이드 전체 보기', downloads: '자료실 전체 보기', faq: '질문 전체 보기' },
    qSupport: '고객지원',
    qContact: '문의하기',
    qShop: '쇼핑몰',
    qOpen: '바로가기 메뉴 열기',
    toTop: '맨 위로 이동',
    lang: '언어 선택',
    all: '전체',
    pickFamily: '제품군 선택',
    board: { total: (n) => `총 ${n}건`, no: '번호', cat: '분류', title: '자료명', format: '형식', rev: '개정', download: '다운로드', dl: '내려받기', search: '모델명·자료명 검색', empty: '조건에 맞는 자료가 없습니다.', prev: '이전 페이지', next: '다음 페이지' },
    models: (n) => `${n}개 모델`,
    viewManual: '매뉴얼 보기',
  },
  en: {
    center: 'Support Center',
    eyebrow: 'CUSTOMER SUPPORT',
    home: 'Support Center home',
    heroTitle: 'How can we help?',
    heroSub: 'Welcome to the AIDIN ROBOTICS Support Center.',
    searchPh: 'Search by product, model, or issue (e.g., AFT200 CAN communication)',
    search: 'Search',
    popular: 'Popular products',
    pdf: 'Download PDF',
    edit: 'Edit on GitHub',
    related: 'Related resources',
    filterModel: 'Find by model',
    allProducts: 'All products',
    ctaTitle: "Can't find what you're looking for?",
    ctaText: 'Submit a service request and one of our engineers will get back to you.',
    ctaFaq: 'View FAQ',
    ctaAs: 'Submit a Request',
    asButton: 'Get Started',
    viewAll: { manual: 'View all manuals', install: 'View all guides', downloads: 'View all downloads', faq: 'View all questions' },
    qSupport: 'Support',
    qContact: 'Contact Us',
    qShop: 'Shop',
    qOpen: 'Open quick menu',
    toTop: 'Back to top',
    lang: 'Language',
    all: 'All',
    pickFamily: 'Select a product family',
    board: { total: (n) => `${n} ${n === 1 ? 'file' : 'files'}`, no: 'No.', cat: 'Type', title: 'Title', format: 'Format', rev: 'Rev.', download: 'Download', dl: 'Download', search: 'Search by model or title', empty: 'No files match your filters.', prev: 'Previous page', next: 'Next page' },
    models: (n) => `${n} ${n === 1 ? 'model' : 'models'}`,
    viewManual: 'View Manual',
  },
};
// 카드 라벨 (홈페이지 카드와 같은 '번호 + 영문' 표기)
export const CARD_LABEL = { manual: 'PRODUCT MANUAL', install: 'INSTALLATION', downloads: 'DOWNLOADS', faq: 'FAQ', as: 'SERVICE' };

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
