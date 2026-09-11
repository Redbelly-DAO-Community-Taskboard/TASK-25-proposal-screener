/**
 * Page frame. Header, content column and footer.
 *
 * The bar holds the lockup and two controls and nothing else. Links live in the
 * drawer behind the menu button, so the bar reads the same on a phone and on a
 * desktop. Margins are 16px on mobile and step up to 64px on desktop, and the
 * content column stops at 1280px, per the brand kit.
 */

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Nav } from './Nav';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-outline-variant bg-background-deep">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-16">
          {/*
            Variant is picked by background, per the brand kit: light ink on any
            surface darker than #DADDE1, dark ink on anything lighter. Both are
            rendered and CSS shows one, so the choice survives server rendering.
            Never a plate.

            The files carry their own clear space, the wordmark cap height on all
            four sides, so they are not cropped tight. At 48px of file height the
            lockup itself reads at 36px, above the 28px minimum.
          */}
          <Link href="/" aria-label="Redbelly Community DAO" className="shrink-0">
            <Image
              src="/dao-logo-on-dark.png"
              alt="Redbelly Community DAO"
              width={172}
              height={131}
              priority
              className="h-12 w-auto logo-on-dark"
            />
            <Image
              src="/dao-logo-on-light.png"
              alt="Redbelly Community DAO"
              width={167}
              height={131}
              priority
              className="h-12 w-auto logo-on-light"
            />
          </Link>
          <Nav />
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-12 sm:px-8 lg:px-16 lg:py-20">
          {children}
        </div>
      </main>

      <footer className="border-t border-outline-variant bg-background-deep">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-8 lg:px-16">
          <p className="text-[14px] text-ink-muted measure">
            Screens against the Proposal Review Checklist ratified 6 October 2025 and
            Constitution v1.2. An aid to review, not a decision.
          </p>
          <p className="label-mono text-ink-muted mt-3">
            RUBRIC 0xf2a05384 / CONSTITUTION v1.2
          </p>
        </div>
      </footer>
    </>
  );
}
