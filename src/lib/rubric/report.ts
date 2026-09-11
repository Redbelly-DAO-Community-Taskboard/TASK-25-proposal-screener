/**
 * Renders a screening report as plain text.
 *
 * Shared by the command line runner and the web result page so both show the
 * same wording. Written to the brand voice rules: plain hyphens only, no em or
 * en dashes, no emoji, no filler verbs, figures stated rather than described.
 */

import type { CriterionResult, ScreeningReport } from './engine';

const VERDICT_LABEL: Record<CriterionResult['verdict'], string> = {
  pass: 'PASS',
  flag: 'FLAG',
  review: 'NEEDS HUMAN REVIEW',
};

function wrap(text: string, width = 78, indent = '    '): string {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if (line.length + w.length + 1 > width - indent.length) {
      lines.push(indent + line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(indent + line);
  return lines.join('\n');
}

function renderCriterion(r: CriterionResult): string {
  const out: string[] = [];
  out.push(
    `Criterion ${r.criterionId}, ${r.criterionName}: ${VERDICT_LABEL[r.verdict]}` +
      (r.verdict === 'flag' && r.notADealbreaker ? ' (not a dealbreaker)' : ''),
  );

  for (const reason of r.reasons) {
    out.push(wrap(`Why: ${reason}`));
  }
  if (r.reviewQuestion) {
    out.push(wrap(`For the reviewer: ${r.reviewQuestion}`));
  }

  out.push(wrap(`Ratified flag condition: "${r.citation.ratifiedFlagCondition}"`));
  out.push(wrap(`Enforces: ${r.citation.constitution}`));
  if (r.citation.controlling) {
    out.push(wrap(`Superseded by: ${r.citation.controlling}`));
  }
  if (r.conflictNote) {
    out.push(wrap(`Known conflict: ${r.conflictNote}`));
  }
  return out.join('\n');
}

export function renderReport(report: ScreeningReport): string {
  const out: string[] = [];
  const rule = '='.repeat(78);
  const thin = '-'.repeat(78);

  out.push(rule);
  out.push('REDBELLY DAO PROPOSAL PRE-SCREENING REPORT');
  out.push(rule);
  out.push(`Proposal: ${report.submissionTitle}`);
  out.push(`Screened: ${report.screenedAt}`);
  out.push(
    'Rubric: Proposal Review Checklist, ratified by Snapshot 6 October 2025, ' +
      '4,347,753 For to 0 Against.',
  );
  out.push('');

  out.push(thin);
  out.push(`TREASURY GATE: ${report.gate.barred ? 'BARRED' : 'NOT BARRED'}`);
  out.push(thin);
  out.push(wrap(report.gate.reason, 78, ''));
  if (report.gate.barred) {
    out.push('');
    out.push(wrap(`Reopening: ${report.gate.reopens}`, 78, ''));
    out.push('');
    out.push(
      wrap(
        'The 11 criteria are still screened below, so the proposer receives a ' +
          'full review rather than a single blocking message.',
        78,
        '',
      ),
    );
  }
  out.push('');

  out.push(thin);
  out.push('SUMMARY');
  out.push(thin);
  out.push(`Passed: ${report.summary.passed} of 11`);
  out.push(`Flagged: ${report.summary.flagged} of 11`);
  out.push(`Needs human review: ${report.summary.needsReview} of 11`);
  if (report.summary.flaggedButNotDealbreakers > 0) {
    out.push(
      `Of the flags, ${report.summary.flaggedButNotDealbreakers} is marked in the ratified ` +
        'text as not a dealbreaker.',
    );
  }
  out.push('');

  out.push(thin);
  out.push('CRITERION BY CRITERION');
  out.push(thin);
  for (const r of report.results) {
    out.push(renderCriterion(r));
    out.push('');
  }

  out.push(rule);
  out.push(
    wrap(
      'This report checks structure and stated content against the ratified checklist. ' +
        'It does not decide whether a proposal should be funded. Items marked NEEDS HUMAN ' +
        'REVIEW require a reviewer to answer the stated question before the criterion can be ' +
        'settled.',
      78,
      '',
    ),
  );
  out.push(rule);

  return out.join('\n');
}
