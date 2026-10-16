// 사이드바는 scripts/import-gitbook.mjs 가 GitBook SUMMARY.md 를 읽어 만듭니다.
import data from './src/data/sidebar.json';

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = { manual: data.manual };
export default sidebars;
