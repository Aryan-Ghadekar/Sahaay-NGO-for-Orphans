// Small shared icon set used across Admin/Staff stat tiles and panel
// headers, so a dashboard reads as a product instead of a bare number
// list. Falls back to a plain dot for any name this doesn't recognize.
const ICON_PATHS = {
  wallet: <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  users: <><circle cx="9" cy="8" r="3" /><path d="M2 19.5c0-3.3 3.1-6 7-6s7 2.7 7 6" /></>,
  heart: <path d="M12 20s-7-4.4-9.3-8.6C1.2 8.7 2.5 5.6 5.4 5c2-.4 3.8.6 4.6 2.2C10.8 5.6 12.6 4.6 14.6 5c2.9.6 4.2 3.7 2.7 6.4C19 15.6 12 20 12 20z" />,
  book: <><path d="M12 6c-1.6-1.4-4-2-6.5-2C4.7 4 4 4.4 4 5v13c0 .6.7 1 1.5 1 2.5 0 4.9.6 6.5 2 1.6-1.4 4-2 6.5-2 .8 0 1.5-.4 1.5-1V5c0-.6-.7-1-1.5-1-2.5 0-4.9.6-6.5 2z" /><path d="M12 6v14" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.3 2.3 4.7-5" /></>,
  star: <path d="m12 2 2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16l-5.6 3.1 1.4-6.3-4.8-4.3 6.4-.6z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  handshake: <><path d="M11 12 8 9l-3 3 3.5 3.5a1.5 1.5 0 0 0 2 0l1-1" /><path d="m13 12 3-3 3 3-3.5 3.5a1.5 1.5 0 0 1-2 0" /><path d="M8 9 5.5 6.5 3 9M16 9l2.5-2.5L21 9" /></>,
  gift: <><rect x="3" y="8" width="18" height="13" rx="1" /><path d="M12 8v13M3 12h18" /><path d="M12 8c-1.5 0-3-1-3-2.5S10.5 3 12 4c1.5-1 3 0 3 1.5S13.5 8 12 8z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  dot: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />,
};

export default function DashboardIcon({ name }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name] || ICON_PATHS.dot}
    </svg>
  );
}
