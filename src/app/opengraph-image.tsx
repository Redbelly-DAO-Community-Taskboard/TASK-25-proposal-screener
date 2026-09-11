import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import { CRITERIA } from '@/lib/rubric/checklist';

/**
 * The card that renders when this link is posted in Discord or on X.
 *
 * 1200 x 630 is the size the brand kit gives for a Discord embed and notes is
 * also the correct Open Graph size for any linked page. Type is set in the real
 * Be Vietnam Pro and JetBrains Mono rather than approximated, and every colour
 * is a token. Text sits inside a 5% safe margin.
 *
 * The mark is not used here. At this canvas size the master would have to be
 * scaled up past the point where it reads cleanly, and the kit sanctions the
 * wordmark in Be Vietnam Pro 700 as the fallback when the lockup will not read.
 */

export const alt =
  'Redbelly Community DAO proposal pre-screening. Screens a draft against the 11 ratified criteria before it reaches Snapshot.';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Satori needs every text node resolved to one string, so the counts are
  // interpolated here rather than inline in the markup.
  const subtitle = `Runs a draft against the ${CRITERIA.length} criteria the DAO already ratified, before it reaches Snapshot.`;
  const criteriaLabel = `${CRITERIA.length} RATIFIED CRITERIA`;

  const [bold, regular, mono] = await Promise.all([
    readFile(join(process.cwd(), 'assets/BeVietnamPro-Bold.ttf')),
    readFile(join(process.cwd(), 'assets/BeVietnamPro-Regular.ttf')),
    readFile(join(process.cwd(), 'assets/JetBrainsMono-Medium.ttf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0f181d',
          padding: '60px', // 5% safe margin on the 1200 width
          fontFamily: 'Be Vietnam Pro',
        }}
      >
        {/* The accent is the only saturated colour, used once, at the top. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '6px', background: '#ef5350' }} />
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '22px',
              letterSpacing: '0.1em',
              color: '#93a4ae',
            }}
          >
            REDBELLY COMMUNITY DAO
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: '86px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#e4ebf0',
              lineHeight: 1.05,
            }}
          >
            Proposal pre-screening
          </div>
          <div
            style={{
              fontSize: '30px',
              fontWeight: 400,
              color: '#b8c4cc',
              lineHeight: 1.45,
              marginTop: '24px',
              maxWidth: '900px',
              display: 'flex',
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #3a4650',
            paddingTop: '28px',
            fontFamily: 'JetBrains Mono',
            fontSize: '20px',
            letterSpacing: '0.05em',
            color: '#93a4ae',
          }}
        >
          <div style={{ display: 'flex', gap: '36px' }}>
            <span>{criteriaLabel}</span>
            <span>CONSTITUTION v1.2</span>
          </div>
          <span style={{ color: '#ffb3ae' }}>RUBRIC 0xf2a05384</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Be Vietnam Pro', data: bold, weight: 700, style: 'normal' },
        { name: 'Be Vietnam Pro', data: regular, weight: 400, style: 'normal' },
        { name: 'JetBrains Mono', data: mono, weight: 500, style: 'normal' },
      ],
    },
  );
}
