import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

// 본문 맨 위 '# 제목'은 화면에서 숨기고 상단 제목 영역의 h1을 씀.
// 검색엔진이 보는 h1이 페이지마다 하나만 남도록 본문의 h1은 일반 문단으로 바꿈.
function MdTitle(props) {
  return <p className="aidin-md-h1" {...props} />;
}

export default { ...MDXComponents, h1: MdTitle };
