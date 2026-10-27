// 사이트 전체에 한 번 붙는 작은 보정 (2026-10 점검)
if (typeof window !== 'undefined') {
  // 영문 주소의 없는 페이지: 호스팅이 국문 404를 내주므로 영문 404로 보냄
  if (document.documentElement.lang === 'ko' && /^\/en(\/|$)/.test(location.pathname) && document.querySelector('.hero__title') && !document.querySelector('.theme-doc-markdown')) {
    location.replace('/en/404.html');
  }
  // 모바일: 스크롤하는 동안 오른쪽 아래 바로가기 버튼을 잠깐 숨겨 내려받기 버튼·목차를 가리지 않게
  let t;
  window.addEventListener('scroll', () => {
    if (window.innerWidth > 996) return;
    document.documentElement.classList.add('aidin-scrolling');
    clearTimeout(t);
    t = setTimeout(() => document.documentElement.classList.remove('aidin-scrolling'), 700);
  }, { passive: true });
}
