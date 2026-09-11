import type { Metadata } from 'next';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';

import { THEME_SCRIPT } from '@/components/Nav';
import './globals.css';

// Be Vietnam Pro carries every heading and all body copy.
const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-be-vietnam-pro',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// JetBrains Mono is functional only: ids, hashes, figures and timestamps.
const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  // Resolves the Open Graph image to an absolute URL, which Discord requires.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000',
  ),
  title: 'Proposal Pre-Screening | Redbelly Community DAO',
  description:
    'Screens a proposal against the 11 ratified Proposal Review Checklist criteria and returns feedback citing the criterion and the Constitution v1.2 section behind each one.',
  openGraph: {
    title: 'Proposal Pre-Screening | Redbelly Community DAO',
    description:
      'Screens a proposal against the 11 ratified Proposal Review Checklist criteria before it reaches Snapshot.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${beVietnamPro.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
