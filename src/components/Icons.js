import React from 'react';

const P = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  search: (<><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  arrowUp: <path d="M12 21V3M6 9l6-6 6 6" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 19h16" />,
  edit: <path d="M4 20h4l10-10-4-4L4 16zM14 6l4 4" />,
  book: <path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2zM22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z" />,
  plug: <path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4" />,
  help: (<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" /></>),
  wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z" />,
  arrowRight: <path d="M4 12h16M14 6l6 6-6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  headset: (<><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /><path d="M19 19c0 1.5-1.5 2.5-4 2.5h-2" /></>),
  cart: (<><path d="M3 4h2.5l2.2 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 7H6.2" /><circle cx="9.5" cy="19" r="1.3" fill="currentColor" /><circle cx="16.5" cy="19" r="1.3" fill="currentColor" /></>),
};
const FILLED = {
  group: (<><circle cx="12" cy="7.5" r="3.2" /><circle cx="5.5" cy="9" r="2.4" /><circle cx="18.5" cy="9" r="2.4" /><path d="M6.5 19.5c0-3.3 2.5-5.6 5.5-5.6s5.5 2.3 5.5 5.6z" /><path d="M1.5 18.5c0-2.4 1.7-4.2 4-4.2.7 0 1.3.1 1.9.4-1.3 1.2-2.1 2.8-2.2 4.6H1.5zM22.5 18.5c0-2.4-1.7-4.2-4-4.2-.7 0-1.3.1-1.9.4 1.3 1.2 2.1 2.8 2.2 4.6h3.7z" /></>),
  pen: (<><path d="M14.8 3.6l3.6 3.6-8.7 8.7H6.1v-3.6zM16.2 2.2l1.6-1.6 3.6 3.6-1.6 1.6z" /><rect x="2" y="19" width="20" height="2.4" /></>),
  // 문의하기: 말풍선
  chat: (<path fillRule="evenodd" d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9.5L5 21.5V18H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 9.2a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0-2.6zM12 9.2a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0-2.6zM16 9.2a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0-2.6z" />),
  // A/S 신청: 렌치
  wrench: (<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />),
};

export function Icon({ name, size = 20, stroke = 1.8 }) {
  if (FILLED[name]) {
    return (
      <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        {FILLED[name]}
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {P[name]}
    </svg>
  );
}
