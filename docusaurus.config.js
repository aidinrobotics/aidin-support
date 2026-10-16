// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// 배포 주소: 도메인을 붙이면 SITE_URL만 바꾸면 됩니다 (예: https://support.aidinrobotics.co.kr)
const SITE_URL = process.env.SITE_URL || 'https://aidinrobotics.github.io';
const BASE_URL = process.env.BASE_URL || '/';
const SHOP_URL = 'https://tebzhj-p0.myshopify.com/';
const HOMEPAGE_URL = 'https://www.aidinrobotics.co.kr';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '에이딘로보틱스 고객지원센터',
  tagline: '제품 매뉴얼 · 설치·연동 가이드 · 자료실 · 자주 묻는 질문 · A/S 신청',
  favicon: 'img/favicon.svg',
  url: SITE_URL,
  baseUrl: BASE_URL,
  organizationName: 'aidinrobotics',
  trailingSlash: false,
  onBrokenLinks: 'warn',
  markdown: {
    format: 'detect',
    hooks: { onBrokenMarkdownLinks: 'warn', onBrokenMarkdownImages: 'warn' },
  },
  customFields: { SHOP_URL, HOMEPAGE_URL },

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    localeConfigs: {
      ko: { label: '한국어', htmlLang: 'ko' },
      en: { label: 'English', htmlLang: 'en' },
    },
  },

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          exclude: ['README.md', 'SUMMARY.md'],
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          showLastUpdateTime: false,
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      }),
    ],
  ],

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'ko'],
        indexDocs: true,
        indexPages: false,
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: { defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false },
      navbar: {
        logo: { alt: 'AIDIN ROBOTICS', src: 'img/logo-white.svg', href: '/' },
        items: [
          { to: '/as', label: 'A/S 신청', position: 'right', className: 'aidin-nav-cta' },
          { type: 'localeDropdown', position: 'right', className: 'aidin-nav-lang' },
        ],
      },
      docs: { sidebar: { hideable: false, autoCollapseCategories: false } },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'python', 'cpp', 'c'],
      },
    }),
};

export default config;
