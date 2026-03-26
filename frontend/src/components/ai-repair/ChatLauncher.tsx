'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import ChatClient from './ChatClient';
import styles from './launcher.module.css';
import { useLanguage } from '@/components/providers/language-provider';

const HIDE_PATHS = ['/register', '/login']; // add any other paths you want to hide on

export default function ChatLauncher() {
  const pathname = usePathname() || '/';
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { t } = useLanguage();
  const open = openPathname === pathname;

  // hide launcher on certain pages
  const hidden = HIDE_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenPathname(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // close when clicking outside panel
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // allow clicking the launcher button to toggle, so check target
        const target = e.target as HTMLElement | null;
        if (target && target.closest(`.${styles.launcherButton}`)) return;
        setOpenPathname(null);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  if (hidden) return null;

  return (
    <>
      {/* Floating launcher button */}
      <button
        aria-label={open ? t('chat.close') : t('chat.open')}
        className={styles.launcherButton}
        onClick={() => setOpenPathname((current) => (current === pathname ? null : pathname))}
        type="button"
      >
        {/* simple icon: you can replace with an SVG */}
        <span className={styles.bubbleIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img" focusable="false">
            <path
              d="M7 18.5L3.5 20l1.5-3.5A8.5 8.5 0 1112 20a8.47 8.47 0 01-5-1.5z"
              fill="currentColor"
            />
          </svg>
        </span>
      </button>

      {/* Panel */}
      <div
        ref={panelRef}
        className={`${styles.panel} ${open ? styles.open : ''}`}
        role="dialog"
        aria-hidden={!open}
        aria-label={t('chat.title')}
      >
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>{t('chat.title')}</div>
          <button
            aria-label={t('chat.close')}
            className={styles.closeBtn}
            onClick={() => setOpenPathname(null)}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className={styles.panelBody}>
          {/* use your existing ChatClient component here */}
          <ChatClient />
        </div>
      </div>
    </>
  );
}