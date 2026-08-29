import { createContext, useContext, useMemo, useState, useCallback } from 'react';

// The Donate button lives in several places (header, hero, volunteer CTA,
// donor dashboard) that don't otherwise share state — a tiny context is
// simpler than threading open/close callbacks through all of them, and the
// modal itself renders once at the app root regardless of which button
// opened it.
const DonateModalContext = createContext(null);

export function DonateModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <DonateModalContext.Provider value={value}>{children}</DonateModalContext.Provider>;
}

export function useDonateModal() {
  const ctx = useContext(DonateModalContext);
  if (!ctx) throw new Error('useDonateModal must be used within a DonateModalProvider');
  return ctx;
}
