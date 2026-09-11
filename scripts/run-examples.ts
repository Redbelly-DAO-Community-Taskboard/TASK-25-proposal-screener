/**
 * Runs the archive worked examples through the screening engine and writes the
 * reports to docs/examples/. Run with: npm run examples
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { screen } from '../src/lib/rubric/engine';
import { renderReport } from '../src/lib/rubric/report';
import { assertChecklistIntegrity } from '../src/lib/rubric/checklist';
import {
  FINPR_MARCH_2026,
  FINPR_CONTINUATION_JUNE_2026,
} from '../src/lib/examples/finpr';

assertChecklistIntegrity();

const outDir = join(process.cwd(), 'docs', 'examples');
mkdirSync(outDir, { recursive: true });

const cases = [
  { file: 'finpr-march-2026-passed.txt', submission: FINPR_MARCH_2026 },
  {
    file: 'finpr-continuation-june-2026-failed.txt',
    submission: FINPR_CONTINUATION_JUNE_2026,
  },
];

for (const c of cases) {
  const report = screen(c.submission);
  const text = renderReport(report);
  writeFileSync(join(outDir, c.file), text + '\n', 'utf8');
  console.log(text);
  console.log('\n\n');
}

console.log('Reports written to docs/examples/');
