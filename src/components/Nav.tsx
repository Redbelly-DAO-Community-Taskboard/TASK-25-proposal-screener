'use client';

/**
 * The top bar controls: theme, and a drawer holding navigation.
 *
 * The bar carries the lockup and two icon buttons and nothing else. Links live
 * in the drawer, which uses the backdrop blur the brand kit allows for
 * navigation, over a semi transparent dark fill. Depth stays tonal.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const KEY = 'rb-theme';

let listeners: Array<() => void> = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function isLight() {
  return document.documentElement.classList.contains('light');
}

/** The server renders the dark default, which is what the class-free page is. */
function isLightOnServer() {
  return false;
}

function IconButton({
  label,
  onClick,
  expanded,
  className = '',
  children,
}: {
  label: string;
  onClick: () => void;
  expanded?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-outline-variant text-ink transition-colors hover:border-brand hover:text-primary ${className}`}
    >
      {children}
    </button>
  );
}

function ThemeButton() {
  const light = useSyncExternalStore(subscribe, isLight, isLightOnServer);

  function toggle() {
    const next = !light;
    document.documentElement.classList.toggle('light', next);
    try {
      localStorage.setItem(KEY, next ? 'light' : 'dark');
    } catch {
      // A blocked localStorage is not worth failing a page load over.
    }
    for (const l of listeners) l();
  }

  return (
    <IconButton
      label={light ? 'Switch to the dark theme' : 'Switch to the light theme'}
      onClick={toggle}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden
      >
        {light ? (
          // Moon: offered when the light theme is on.
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
          </>
        )}
      </svg>
    </IconButton>
  );
}

/**
 * Ordered the way someone arrives: what it is, how to run it, then the run
 * itself, with the two reference pages last.
 */
const LINKS = [
  { href: '/', label: 'Overview', note: 'What the tool does' },
  { href: '/guide', label: 'Operator guide', note: 'How to run it, step by step' },
  { href: '/screen', label: 'Screen a proposal', note: 'The form and the report' },
  { href: '/rubric', label: 'The rubric', note: 'All 11 criteria and their mapping' },
  { href: '/examples', label: 'Worked examples', note: 'Two real archive proposals' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);

  // Escape closes it, and the body stops scrolling underneath.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      {/*
        Desktop shows the links outright, because there is room and a drawer
        costs a click for nothing. Below lg the same links live in the drawer,
        where a phone has neither the width nor the pointer for a five item bar.
      */}
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={`rounded-[4px] px-3 py-2 text-[15px] font-medium transition-colors hover:text-primary ${
                active ? 'bg-container-lowest text-primary' : 'text-ink-secondary'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <ThemeButton />
        <IconButton
          label="Open the menu"
          onClick={() => setOpen(true)}
          expanded={open}
          className="lg:hidden"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
          </svg>
        </IconButton>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close the menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 backdrop-blur-[16px]"
            style={{ background: 'color-mix(in srgb, #0a1216 62%, transparent)' }}
          />
          <div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute right-0 top-0 h-full w-full max-w-[380px] border-l border-outline-variant bg-surface-slate outline-none"
          >
            <div className="flex items-center justify-between border-b border-outline-variant px-6 py-5">
              <span className="label-caps text-ink-muted">Menu</span>
              <IconButton label="Close the menu" onClick={() => setOpen(false)}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </IconButton>
            </div>

            <nav className="flex flex-col px-3 py-4">
              {LINKS.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className="rounded-[4px] px-3 py-3 transition-colors hover:bg-container-lowest"
                  >
                    <span
                      className={`block text-[17px] font-semibold ${
                        active ? 'text-primary' : 'text-ink'
                      }`}
                    >
                      {l.label}
                    </span>
                    <span className="block text-[14px] text-ink-muted">{l.note}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Applies the stored choice before first paint, so a light reader does not get
 * a dark flash on every navigation.
 */
export const THEME_SCRIPT = `(function(){try{if(localStorage.getItem('${KEY}')==='light'){document.documentElement.classList.add('light')}}catch(e){}})()`;
