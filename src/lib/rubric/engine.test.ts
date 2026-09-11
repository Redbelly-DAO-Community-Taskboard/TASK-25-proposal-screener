/**
 * Verification for the screening engine.
 *
 * Three things are proved here.
 *
 * 1. Structure. All 11 ratified criteria are screened, in order, and every
 *    result carries a citation. The engine cannot silently drop a criterion.
 * 2. Behaviour. Each ratified pass condition is exercised on a submission that
 *    meets it and on one that breaches it, so no condition is dead code.
 * 3. Voice. Every string the tool can print uses plain hyphens and no emoji,
 *    quoted source text included. Quotations keep their wording exactly and
 *    have only their dashes normalised, which QUOTE_NOTE discloses wherever a
 *    quotation is printed.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  CONFLICTING_CRITERIA,
  CRITERIA,
  QUOTE_NOTE,
  RATIFIED_CHECKLIST,
  TREASURY_GATE,
  UNANCHORED_CONDITION_COUNT,
  UNANCHORED_CRITERIA,
  assertChecklistIntegrity,
  criterionById,
} from './checklist';
import {
  THRESHOLDS,
  UNRATIFIED_THRESHOLDS,
  evaluateGate,
  screen,
  type Verdict,
} from './engine';
import { renderReport } from './report';
import { emptySubmission, totalRequestedUsd, type Submission } from './submission';
import {
  FINPR_MARCH_2026,
  FINPR_CONTINUATION_JUNE_2026,
} from '../examples/finpr';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * A submission that satisfies every ratified condition a rule can settle.
 *
 * Tests mutate a clone of this, so each assertion isolates one condition. It is
 * not drawn from the archive and is never presented as a real proposal.
 */
function compliant(): Submission {
  return {
    meta: {
      title: 'Test submission',
      proposerHandle: 'tester',
      proposerWallet: '0x0000000000000000000000000000000000000001',
      submittedAt: '2026-07-31',
    },
    treasury: {
      requestsNewTreasuryFunding: false,
      approvedBeforeSuspension: false,
    },
    budget: {
      usdt: 4000,
      rbnt: 10000,
      rbntUsdEquivalent: 1000,
      workingGroupAnnualAllocationUsdt: 100000,
      costBreakdown: 'USDT 4,000 for vendor fees. RBNT 10,000 for contributor rewards.',
      justification: 'Each line item is priced against two quotes obtained in June 2026.',
    },
    payment: {
      structure: 'Milestone-based',
      upfrontPercent: 0,
      upfrontJustification: '',
      milestones: [
        { name: 'Milestone 1', deliverable: 'Draft published', amountUsdt: 2000, amountRbnt: 0 },
        { name: 'Milestone 2', deliverable: 'Final report published', amountUsdt: 2000, amountRbnt: 10000 },
      ],
    },
    strategicFit: {
      workingGroup: 'Marketing',
      daoGoalLink: 'Supports the Marketing working group goal of ecosystem visibility.',
    },
    feasibility: {
      timeline: 'Eight weeks from approval.',
      scopeStatement: 'Two published reports and one community call.',
      duplicationCheck: 'Searched the Snapshot archive for marketing proposals since January 2026.',
    },
    oversight: {
      reviewerName: 'An unrelated pod lead',
      reviewerIsProposer: false,
      reviewerIsPaidByThisProposal: false,
      updateCadence: 'Monthly',
      updateChannel: 'Discord governance channel',
    },
    impact: {
      kpis: ['2 reports published', '1 community call held'],
      midpointReviewMethod: 'Review at week 4 against the 2 KPIs.',
      finalReviewMethod: 'Final review at week 8 by the nominated pod lead.',
      longTermValue: 'The reports remain available to the DAO after completion.',
    },
    risk: {
      entries: [{ risk: 'Delay in publication', mitigation: 'Drafts approved 1 week ahead of each date.' }],
    },
    coFunding: {
      hasLeverage: true,
      description: 'The vendor contributes design work at no cost.',
    },
    equity: {
      paidContributors: [
        { name: 'Contributor A', amountUsdt: 2500, amountRbntUsdEquivalent: 0, role: 'Delivery' },
        { name: 'Contributor B', amountUsdt: 1500, amountRbntUsdEquivalent: 1000, role: 'Editing' },
      ],
      proposerOtherPaidRolesThisQuarter: 0,
      multipleRolesJustification: '',
    },
    compliance: {
      identifiedRisks: 'No regulatory exposure identified.',
      codeOfConductConfirmed: true,
      activitySummary: 'Two written reports and one community call.',
    },
    community: {
      evidence: [
        {
          channel: 'Discord',
          url: 'https://discord.com/channels/example/1',
          date: '2026-07-10',
          isPlanned: false,
        },
      ],
      coAuthors: ['Contributor B'],
    },
  };
}

/** Mutates a clone, so each test isolates one ratified condition. */
function withChange(edit: (s: Submission) => void): Submission {
  const s = structuredClone(compliant());
  edit(s);
  return s;
}

function verdictFor(id: number, s: Submission): Verdict {
  const r = screen(s).results.find((x) => x.criterionId === id);
  if (!r) throw new Error(`No result for criterion ${id}`);
  return r.verdict;
}

function reasonsFor(id: number, s: Submission): string {
  const r = screen(s).results.find((x) => x.criterionId === id);
  if (!r) throw new Error(`No result for criterion ${id}`);
  return r.reasons.join(' ');
}

/**
 * Criteria whose ratified conditions turn on judgement no rule can settle.
 * These return review rather than pass even on a fully compliant submission,
 * and that is the intended behaviour rather than a defect.
 */
const ALWAYS_NEEDS_JUDGEMENT = [3, 4, 10];

describe('ratified checklist integrity', () => {
  it('holds exactly the 11 ratified criteria', () => {
    expect(CRITERIA).toHaveLength(11);
    expect(CRITERIA.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('passes its own integrity assertion', () => {
    expect(() => assertChecklistIntegrity()).not.toThrow();
  });

  it('quotes a ratified flag condition verbatim for every criterion', () => {
    for (const c of CRITERIA) {
      expect(c.flagCondition.startsWith('Flag if')).toBe(true);
    }
  });

  it('names a constitutional anchor or states plainly that none exists', () => {
    for (const c of CRITERIA) {
      expect(c.anchors.length).toBeGreaterThan(0);
      for (const a of c.anchors) {
        if (a.strength === 'none') {
          expect(a.gap ?? '').not.toBe('');
        } else {
          // Two sections are numbered 6.2, so a number alone is ambiguous.
          expect(a.section ?? '').not.toBe('');
          expect(a.sectionTitle ?? '').not.toBe('');
          expect(a.quote ?? '').not.toBe('');
        }
      }
    }
  });

  it('cites the Snapshot proposal that ratified it', () => {
    expect(RATIFIED_CHECKLIST.snapshotId).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('cites full Snapshot ids everywhere, never a truncated prefix', () => {
    const ids = [
      RATIFIED_CHECKLIST.snapshotId,
      TREASURY_GATE.proposal.snapshotId,
      ...CRITERIA.flatMap((c) => c.supersededBy.map((p) => p.snapshotId)),
    ];
    for (const id of ids) {
      expect(id).toMatch(/^0x[0-9a-f]{64}$/);
    }
  });
});

describe('engine structure', () => {
  it('returns one result per ratified criterion, in ratified order', () => {
    const report = screen(compliant());
    expect(report.results).toHaveLength(11);
    expect(report.results.map((r) => r.criterionId)).toEqual(CRITERIA.map((c) => c.id));
  });

  it('cites the criterion and the constitution on every result', () => {
    for (const r of screen(compliant()).results) {
      expect(r.citation.criterionId).toBe(r.criterionId);
      expect(r.citation.ratifiedFlagCondition).toBe(criterionById(r.criterionId).flagCondition);
      expect(r.citation.constitution.length).toBeGreaterThan(0);
    }
  });

  it('states a question on every result that needs human review', () => {
    for (const s of [compliant(), FINPR_MARCH_2026, FINPR_CONTINUATION_JUNE_2026]) {
      for (const r of screen(s).results) {
        if (r.verdict === 'review') {
          expect(r.reviewQuestion?.length ?? 0).toBeGreaterThan(0);
        }
        if (r.verdict === 'flag') {
          expect(r.reasons.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('never reports a flag without a reason, which would be generic feedback', () => {
    const s = withChange((x) => {
      x.budget.costBreakdown = '';
      x.payment.milestones = [];
      x.impact.kpis = [];
      x.risk.entries = [];
    });
    for (const r of screen(s).results) {
      if (r.verdict === 'flag') {
        expect(r.reasons.every((t) => t.trim().length > 0)).toBe(true);
      }
    }
  });

  it('summary counts add up to 11', () => {
    for (const s of [compliant(), FINPR_MARCH_2026, FINPR_CONTINUATION_JUNE_2026]) {
      const { summary } = screen(s);
      expect(summary.passed + summary.flagged + summary.needsReview).toBe(11);
    }
  });

  it('passes every criterion that a rule can settle on a compliant submission', () => {
    for (const r of screen(compliant()).results) {
      const expected = ALWAYS_NEEDS_JUDGEMENT.includes(r.criterionId) ? 'review' : 'pass';
      expect([r.criterionId, r.verdict]).toEqual([r.criterionId, expected]);
    }
  });
});

describe('treasury gate', () => {
  it('does not bar a proposal requesting no new treasury funding', () => {
    const g = evaluateGate(withChange((s) => { s.treasury.requestsNewTreasuryFunding = false; }));
    expect(g.barred).toBe(false);
  });

  it('does not bar a commitment approved before the suspension took effect', () => {
    const g = evaluateGate(
      withChange((s) => {
        s.treasury.requestsNewTreasuryFunding = true;
        s.treasury.approvedBeforeSuspension = true;
      }),
    );
    expect(g.barred).toBe(false);
  });

  it('bars a new treasury request and cites the suspension vote', () => {
    const g = evaluateGate(
      withChange((s) => {
        s.treasury.requestsNewTreasuryFunding = true;
        s.treasury.approvedBeforeSuspension = false;
      }),
    );
    expect(g.barred).toBe(true);
    expect(g.reason).toContain('15,386,903');
    expect(g.snapshotId).toBe(TREASURY_GATE.proposal.snapshotId);
  });

  it('still screens all 11 criteria when the gate bars the proposal', () => {
    const report = screen(withChange((s) => { s.treasury.requestsNewTreasuryFunding = true; }));
    expect(report.gate.barred).toBe(true);
    expect(report.results).toHaveLength(11);
  });
});

describe('criterion 1, Budget Alignment and Limits', () => {
  it('flags a missing cost breakdown', () => {
    const s = withChange((x) => { x.budget.costBreakdown = ''; });
    expect(verdictFor(1, s)).toBe('flag');
    expect(reasonsFor(1, s)).toContain('cost breakdown');
  });

  it('flags a missing justification', () => {
    const s = withChange((x) => { x.budget.justification = ''; });
    expect(reasonsFor(1, s)).toContain('justification');
  });

  it('flags a request above the ratified 25% of the annual allocation', () => {
    const s = withChange((x) => {
      x.budget.workingGroupAnnualAllocationUsdt = 10000;
      x.budget.usdt = 4000;
      x.budget.rbntUsdEquivalent = 1000;
    });
    expect(verdictFor(1, s)).toBe('flag');
    expect(reasonsFor(1, s)).toContain(`${THRESHOLDS.maxShareOfAnnualAllocationPercent}% limit`);
  });

  it('passes a request at exactly the 25% limit, since the ratified text says exceeds', () => {
    const s = withChange((x) => {
      x.budget.workingGroupAnnualAllocationUsdt = 20000;
      x.budget.usdt = 4000;
      x.budget.rbnt = 0;
      x.budget.rbntUsdEquivalent = 1000;
    });
    expect(verdictFor(1, s)).toBe('pass');
  });

  it('asks for review rather than guessing when the allocation is not published', () => {
    const s = withChange((x) => { x.budget.workingGroupAnnualAllocationUsdt = null; });
    expect(verdictFor(1, s)).toBe('review');
  });

  it('asks for review when RBNT is requested with no USD equivalent', () => {
    const s = withChange((x) => { x.budget.rbntUsdEquivalent = null; });
    expect(totalRequestedUsd(s)).toBeNull();
    expect(verdictFor(1, s)).toBe('review');
  });

  it('flags a submission declaring no budget at all', () => {
    const s = withChange((x) => {
      x.budget.usdt = 0;
      x.budget.rbnt = 0;
      x.budget.rbntUsdEquivalent = 0;
    });
    expect(verdictFor(1, s)).toBe('flag');
  });
});

describe('criterion 2, Payment and Payout Structure', () => {
  it('flags a missing milestone structure', () => {
    const s = withChange((x) => { x.payment.milestones = []; });
    expect(verdictFor(2, s)).toBe('flag');
    expect(reasonsFor(2, s)).toContain('milestone');
  });

  it('flags a milestone not tied to a deliverable', () => {
    const s = withChange((x) => { x.payment.milestones[0].deliverable = ''; });
    expect(verdictFor(2, s)).toBe('flag');
  });

  it('flags an unjustified upfront payment on the ratified condition', () => {
    const s = withChange((x) => { x.payment.upfrontPercent = 70; });
    expect(verdictFor(2, s)).toBe('flag');
    expect(reasonsFor(2, s)).toContain('Upfront requests require clear justification');
  });

  it('passes a large upfront payment that is justified', () => {
    const s = withChange((x) => {
      x.payment.upfrontPercent = 70;
      x.payment.upfrontJustification = 'The vendor requires a deposit before booking placements.';
    });
    expect(verdictFor(2, s)).toBe('pass');
  });

  it('flags a small unjustified upfront too, because the condition sets no size', () => {
    // This returned review while the tool still had its own idea of "large".
    const s = withChange((x) => { x.payment.upfrontPercent = 10; });
    expect(verdictFor(2, s)).toBe('flag');
    expect(reasonsFor(2, s)).toContain('whatever its size');
  });
});

describe('criterion 3, Strategic Fit', () => {
  it('flags a proposal matching none of the three working groups', () => {
    const s = withChange((x) => { x.strategicFit.workingGroup = 'None of these'; });
    expect(verdictFor(3, s)).toBe('flag');
  });

  it('flags a missing link to DAO-wide goals', () => {
    const s = withChange((x) => { x.strategicFit.daoGoalLink = ''; });
    expect(verdictFor(3, s)).toBe('flag');
  });

  it('leaves the vagueness judgement to a reviewer', () => {
    expect(verdictFor(3, compliant())).toBe('review');
  });
});

describe('criterion 4, Feasibility and Timeline', () => {
  it('flags a missing timeline', () => {
    const s = withChange((x) => { x.feasibility.timeline = ''; });
    expect(verdictFor(4, s)).toBe('flag');
  });

  it('flags absent milestones', () => {
    const s = withChange((x) => { x.payment.milestones = []; });
    expect(reasonsFor(4, s)).toContain('milestones');
  });

  it('flags a missing duplication check', () => {
    const s = withChange((x) => { x.feasibility.duplicationCheck = ''; });
    expect(verdictFor(4, s)).toBe('flag');
    expect(reasonsFor(4, s)).toContain('duplicate');
  });

  it('records that the duplication condition has no constitutional anchor', () => {
    const c = criterionById(4);
    expect(c.anchors.some((a) => a.strength === 'none')).toBe(true);
  });
});

describe('criterion 5, Oversight and Accountability', () => {
  it('flags a missing reviewer', () => {
    const s = withChange((x) => { x.oversight.reviewerName = ''; });
    expect(verdictFor(5, s)).toBe('flag');
  });

  it('flags a self-nominated reviewer and names the conflict of interest section', () => {
    const s = withChange((x) => { x.oversight.reviewerIsProposer = true; });
    expect(verdictFor(5, s)).toBe('flag');
    expect(reasonsFor(5, s)).toContain('section 5');
  });

  it('records that the reviewer is paid by the proposal when that is so', () => {
    const s = withChange((x) => {
      x.oversight.reviewerIsProposer = true;
      x.oversight.reviewerIsPaidByThisProposal = true;
    });
    expect(reasonsFor(5, s)).toContain('paid by this proposal');
  });

  it('flags a cadence looser than the monthly updates the checklist requires', () => {
    const s = withChange((x) => { x.oversight.updateCadence = 'Quarterly'; });
    expect(verdictFor(5, s)).toBe('flag');
  });

  it('flags monthly updates with no channel named', () => {
    const s = withChange((x) => { x.oversight.updateChannel = ''; });
    expect(verdictFor(5, s)).toBe('flag');
  });

  it('carries the conflict note, since the constitution sets quarterly reporting', () => {
    const r = screen(compliant()).results.find((x) => x.criterionId === 5);
    expect(r?.conflictNote).toContain('quarterly');
  });
});

describe('criterion 6, Impact and Measurement', () => {
  it('flags absent KPIs', () => {
    const s = withChange((x) => { x.impact.kpis = []; });
    expect(verdictFor(6, s)).toBe('flag');
  });

  it('flags a missing midpoint review', () => {
    const s = withChange((x) => { x.impact.midpointReviewMethod = ''; });
    expect(verdictFor(6, s)).toBe('flag');
  });

  it('flags a missing final review', () => {
    const s = withChange((x) => { x.impact.finalReviewMethod = ''; });
    expect(verdictFor(6, s)).toBe('flag');
  });

  it('flags short-term focus, meaning no long-term value stated', () => {
    const s = withChange((x) => { x.impact.longTermValue = ''; });
    expect(reasonsFor(6, s)).toContain('long-term');
  });
});

describe('criterion 7, Risk and Mitigation', () => {
  it('flags a submission with no risks described', () => {
    const s = withChange((x) => { x.risk.entries = []; });
    expect(verdictFor(7, s)).toBe('flag');
  });

  it('flags a risk with no mitigation', () => {
    const s = withChange((x) => { x.risk.entries[0].mitigation = ''; });
    expect(verdictFor(7, s)).toBe('flag');
  });

  it('states plainly that this criterion has no constitutional anchor', () => {
    const c = criterionById(7);
    expect(c.anchors.every((a) => a.strength === 'none')).toBe(true);
  });
});

describe('criterion 8, Co-Funding and Leverage', () => {
  it('flags absent leverage but does not treat it as a dealbreaker', () => {
    const s = withChange((x) => { x.coFunding.hasLeverage = false; });
    const r = screen(s).results.find((x) => x.criterionId === 8);
    expect(r?.verdict).toBe('flag');
    expect(r?.notADealbreaker).toBe(true);
  });

  it('flags leverage claimed without description', () => {
    const s = withChange((x) => { x.coFunding.description = ''; });
    expect(verdictFor(8, s)).toBe('flag');
  });

  it('counts a not-a-dealbreaker flag separately in the summary', () => {
    const s = withChange((x) => { x.coFunding.hasLeverage = false; });
    expect(screen(s).summary.flaggedButNotDealbreakers).toBe(1);
  });
});

describe('criterion 9, Contribution Equity', () => {
  it('reports a lopsided payout split and leaves the judgement to a human', () => {
    // This flagged while the tool still called 50% the line for "dominating".
    // The ratified text names no figure, so the split is reported as fact.
    const s = withChange((x) => {
      x.equity.paidContributors[0].amountUsdt = 9000;
      x.equity.paidContributors[1].amountUsdt = 100;
      x.equity.paidContributors[1].amountRbntUsdEquivalent = 0;
    });
    expect(verdictFor(9, s)).toBe('review');
    const r = screen(s).results.find((x) => x.criterionId === 9)!;
    expect(r.reviewQuestion ?? '').toContain('98.9%');
  });

  it('asks for review rather than flagging when a single contributor is named', () => {
    // Within one proposal a lone contributor always takes 100%, so the
    // arithmetic is meaningless. The concentration the criterion targets runs
    // across proposals, which a single-submission engine cannot see.
    const s = withChange((x) => {
      x.equity.paidContributors = [
        { name: 'Contributor A', amountUsdt: 4000, amountRbntUsdEquivalent: 1000, role: 'Delivery' },
      ];
    });
    expect(verdictFor(9, s)).toBe('review');
    expect(screen(s).results[8].reviewQuestion).toContain('Snapshot archive');
  });

  it('asks for review when RBNT payouts carry no USD equivalent', () => {
    const s = withChange((x) => { x.equity.paidContributors[0].amountRbntUsdEquivalent = null; });
    expect(verdictFor(9, s)).toBe('review');
  });

  it('reports the constitutional one-role-per-quarter limit against a second paid role', () => {
    const s = withChange((x) => { x.equity.proposerOtherPaidRolesThisQuarter = 1; });
    expect(verdictFor(9, s)).toBe('flag');
    expect(reasonsFor(9, s)).toContain('1 other paid DAO role');
    expect(reasonsFor(9, s)).toContain('one paid role per individual per quarter');
  });

  it('reads back a plural count correctly', () => {
    const s = withChange((x) => { x.equity.proposerOtherPaidRolesThisQuarter = 2; });
    expect(reasonsFor(9, s)).toContain('2 other paid DAO roles');
  });

  it('carries the conflict note, since the checklist is looser than the constitution', () => {
    const r = screen(compliant()).results.find((x) => x.criterionId === 9);
    expect(r?.conflictNote).toContain('one paid role per individual per quarter');
  });
});

describe('criterion 10, Compliance and Ethical Standards', () => {
  it('flags an unconfirmed code of conduct', () => {
    const s = withChange((x) => { x.compliance.codeOfConductConfirmed = false; });
    expect(verdictFor(10, s)).toBe('flag');
  });

  it('flags a missing activity summary', () => {
    const s = withChange((x) => { x.compliance.activitySummary = ''; });
    expect(verdictFor(10, s)).toBe('flag');
  });

  it('points the reviewer at the Code of Conduct proposal, not at the constitution', () => {
    const r = screen(compliant()).results.find((x) => x.criterionId === 10);
    expect(r?.verdict).toBe('review');
    expect(r?.citation.controlling).toContain('Community Code of Conduct');
    expect(r?.citation.constitution).toContain('No constitutional anchor');
  });
});

describe('criterion 11, Community Involvement', () => {
  it('flags a proposal with no evidence of discussion', () => {
    const s = withChange((x) => {
      x.community.evidence = [];
      x.community.coAuthors = [];
    });
    expect(verdictFor(11, s)).toBe('flag');
  });

  it('flags planned discussion, because stated intent is not evidence', () => {
    const s = withChange((x) => { x.community.evidence[0].isPlanned = true; });
    expect(verdictFor(11, s)).toBe('flag');
    expect(reasonsFor(11, s)).toContain('1 discussion it intends to hold');
  });

  it('flags discussion claimed with no link', () => {
    const s = withChange((x) => { x.community.evidence[0].url = ''; });
    expect(verdictFor(11, s)).toBe('flag');
    expect(reasonsFor(11, s)).toContain('cannot be checked');
  });

  it('does not cite section 8, which shares the name but not the subject', () => {
    const c = criterionById(11);
    const none = c.anchors.find((a) => a.strength === 'none');
    expect(none?.gap).toContain('false friend');
  });
});

describe('worked example, FINPR March 2026, passed on Snapshot', () => {
  const report = screen(FINPR_MARCH_2026);

  it('is not barred, because it was approved before the suspension took effect', () => {
    expect(report.gate.barred).toBe(false);
  });

  it('produces the recorded verdict for every criterion', () => {
    const expected: Record<number, Verdict> = {
      1: 'review',
      2: 'flag',
      3: 'review',
      4: 'review',
      5: 'flag',
      6: 'flag',
      7: 'pass',
      8: 'flag',
      9: 'review',
      10: 'review',
      11: 'flag',
    };
    for (const r of report.results) {
      expect([r.criterionId, r.verdict]).toEqual([r.criterionId, expected[r.criterionId]]);
    }
  });

  it('flags the 70% upfront payment the proposal states and then denies', () => {
    expect(reasonsFor(2, FINPR_MARCH_2026)).toContain('70%');
  });

  it('cannot compute the total, because 50,000 RBNT carries no USD equivalent', () => {
    expect(totalRequestedUsd(FINPR_MARCH_2026)).toBeNull();
  });
});

describe('worked example, FINPR continuation June 2026, failed on Snapshot', () => {
  const report = screen(FINPR_CONTINUATION_JUNE_2026);

  it('is barred by the treasury suspension', () => {
    expect(report.gate.barred).toBe(true);
  });

  it('produces the recorded verdict for every criterion', () => {
    const expected: Record<number, Verdict> = {
      1: 'review',
      2: 'flag',
      3: 'review',
      4: 'flag',
      5: 'flag',
      6: 'pass',
      7: 'pass',
      8: 'flag',
      9: 'review',
      10: 'review',
      11: 'flag',
    };
    for (const r of report.results) {
      expect([r.criterionId, r.verdict]).toEqual([r.criterionId, expected[r.criterionId]]);
    }
  });

  it('flags the self-nominated paid reviewer', () => {
    expect(reasonsFor(5, FINPR_CONTINUATION_JUNE_2026)).toContain('paid by this proposal');
  });

  it('flags the future-tense discussion as intent rather than evidence', () => {
    expect(reasonsFor(11, FINPR_CONTINUATION_JUNE_2026)).toContain('intends to hold');
  });

  it('scores better on the checklist than the proposal that passed', () => {
    // The rubric does not explain the real outcome. The cause was the treasury
    // suspension, not proposal quality. This is recorded as a finding rather
    // than smoothed over.
    const march = screen(FINPR_MARCH_2026).summary;
    expect(report.summary.passed).toBeGreaterThan(march.passed);
  });
});

describe('brand voice', () => {
  const EM_OR_EN_DASH = /[–—]/;
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

  /**
   * Every string the tool can print, quoted source included.
   *
   * The board voice rule against em and en dashes is absolute and covers quoted
   * material, so quotations have theirs set as plain hyphens. No word or figure
   * is changed, and QUOTE_NOTE discloses the substitution wherever quotations
   * appear. The untouched source stays at research/constitution-v1.2.md.
   */
  function authoredProse(): string[] {
    const out: string[] = [QUOTE_NOTE];
    for (const c of CRITERIA) {
      out.push(c.name, c.flagCondition, ...c.passConditions);
      for (const a of c.anchors) {
        if (a.quote) out.push(a.quote);
      }
      if (c.conflict) out.push(c.conflict);
      for (const a of c.anchors) {
        if (a.shortfall) out.push(a.shortfall);
        if (a.gap) out.push(a.gap);
        if (a.nearest) out.push(a.nearest);
      }
      for (const p of c.supersededBy) {
        out.push(p.effect);
        if (p.footingNote) out.push(p.footingNote);
      }
    }
    for (const s of [compliant(), FINPR_MARCH_2026, FINPR_CONTINUATION_JUNE_2026]) {
      const report = screen(s);
      out.push(report.gate.reason, report.gate.reopens);
      for (const r of report.results) {
        out.push(...r.reasons);
        if (r.reviewQuestion) out.push(r.reviewQuestion);
      }
    }
    return out;
  }

  it('uses plain hyphens, never an em or en dash', () => {
    for (const text of authoredProse()) {
      expect([text, EM_OR_EN_DASH.test(text)]).toEqual([text, false]);
    }
  });

  it('uses no emoji', () => {
    for (const text of authoredProse()) {
      expect([text, EMOJI.test(text)]).toEqual([text, false]);
    }
  });

  it('renders a report containing no em dash, en dash or emoji anywhere', () => {
    for (const s of [FINPR_MARCH_2026, FINPR_CONTINUATION_JUNE_2026]) {
      const text = renderReport(screen(s));
      expect(EM_OR_EN_DASH.test(text)).toBe(false);
      expect(EMOJI.test(text)).toBe(false);
    }
  });

  it('keeps the wording of a quotation, changing only the dash', () => {
    // Guards the substitution from turning into paraphrase. If a quote is ever
    // reworded rather than re-punctuated, this fails.
    const treasury = criterionById(1)
      .anchors.map((a) => a.quote ?? '')
      .join(' ');
    expect(treasury).toContain('Token Treasury: 10,000,000 RBNT - for incentives, rewards, grants');
    expect(treasury).toContain('Stablecoin Reserve: 100,000 USDT annually - for operational costs');
  });
});

describe('empty submission', () => {
  it('flags rather than crashes, so an abandoned form still returns feedback', () => {
    const report = screen(emptySubmission());
    expect(report.results).toHaveLength(11);
    expect(report.summary.passed).toBe(0);
    for (const r of report.results) {
      expect(r.verdict).not.toBe('pass');
    }
  });
});

/**
 * The published pages explain the mapping in prose, and prose goes stale.
 *
 * These counts were written as words on the homepage and in the operator guide
 * and fell out of step with the rubric they described. They are derived from
 * CRITERIA now, and pinned here, so a mapping change that moves one of them
 * fails the suite instead of quietly contradicting the published explanation.
 */
describe('published counts match the rubric', () => {
  it('derives the unanchored criteria from the anchors themselves', () => {
    const fromData = CRITERIA.filter((c) =>
      c.anchors.some((a) => a.strength === 'none'),
    ).map((c) => c.id);
    expect(UNANCHORED_CRITERIA).toEqual(fromData);
    expect(UNANCHORED_CRITERIA).toEqual([4, 7, 8, 10, 11]);
  });

  it('counts criterion 1 as the condition unanchored inside an anchored criterion', () => {
    // Section 6.2 Budgeting backs a budget ceiling but states no 25% figure, so
    // the limit is unanchored while the criterion around it is not.
    const shortfalls = criterionById(1)
      .anchors.map((a) => a.shortfall ?? '')
      .join(' ');
    expect(shortfalls).toContain('no 25% figure');
    expect(UNANCHORED_CONDITION_COUNT).toBe(UNANCHORED_CRITERIA.length + 1);
    expect(UNANCHORED_CONDITION_COUNT).toBe(6);
  });

  it('derives the conflicting criteria from the criteria that record a conflict', () => {
    const fromData = CRITERIA.filter((c) => c.conflict).map((c) => c.id);
    expect(CONFLICTING_CRITERIA).toEqual(fromData);
    expect(CONFLICTING_CRITERIA).toEqual([5, 9]);
  });

  it('leaves no count written as a word in the pages that quote one', () => {
    // The drift was "Four ratified conditions" outliving a fifth and sixth.
    const pages = ['../../app/page.tsx', '../../app/guide/page.tsx'];
    for (const rel of pages) {
      const src = readFileSync(join(__dirname, rel), 'utf8');
      expect(src).not.toMatch(
        /\b(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven)\s+(ratified|criteria|criterion|conditions?|anchors?)\b/,
      );
    }
  });
});

/**
 * No unratified number may decide a governance outcome.
 *
 * A flag asserts that a ratified rule was broken. Earlier versions of this
 * engine could raise one from a 25% figure for "large" and a 50% figure for
 * "dominating", neither of which the DAO ever voted for. Both are gone. These
 * tests keep them gone, and would fail if a future contributor reintroduced a
 * figure of their own and let it reach a verdict.
 */
describe('no unratified threshold can cause a flag', () => {
  it('holds no unratified figures at all', () => {
    expect([...UNRATIFIED_THRESHOLDS]).toEqual([]);
    // The one figure left is in the ratified checklist text itself.
    expect(Object.keys(THRESHOLDS)).toEqual(['maxShareOfAnnualAllocationPercent']);
    expect(THRESHOLDS.maxShareOfAnnualAllocationPercent).toBe(25);
    expect(criterionById(1).passConditions.join(' ')).toContain('25%');
  });

  it('does not raise an upfront reason when a large upfront request is justified', () => {
    const s = emptySubmission();
    s.payment.upfrontPercent = 30;
    s.payment.upfrontJustification =
      'The agency requires a deposit to reserve media placements, standard in PR contracts.';
    expect(reasonsFor(2, s).toLowerCase()).not.toContain('upfront');
  });

  it('flags an unjustified upfront request on the ratified condition, not on its size', () => {
    // Two requests either side of the figure this tool used to draw the line at.
    for (const percent of [5, 30]) {
      const s = emptySubmission();
      s.payment.upfrontPercent = percent;
      const reasons = reasonsFor(2, s);
      expect(reasons).toContain('Upfront requests require clear justification');
      expect(reasons).not.toContain('threshold');
    }
  });

  it('sends a concentrated payout split to review rather than flagging it', () => {
    const s = emptySubmission();
    s.equity.paidContributors = [
      { name: 'Lead', amountUsdt: 5500, amountRbntUsdEquivalent: 0, role: 'Lead' },
      { name: 'Support', amountUsdt: 4500, amountRbntUsdEquivalent: 0, role: 'Support' },
    ];
    const r = screen(s).results.find((x) => x.criterionId === 9)!;
    expect(r.verdict).toBe('review');
    expect(r.reviewQuestion ?? '').toContain('Lead 55.0%');
  });

  it('never turns a payout split into a flag, at any concentration', () => {
    for (const leadShare of [51, 60, 75, 90, 99]) {
      const s = emptySubmission();
      s.equity.paidContributors = [
        { name: 'Lead', amountUsdt: leadShare, amountRbntUsdEquivalent: 0, role: 'Lead' },
        {
          name: 'Support',
          amountUsdt: 100 - leadShare,
          amountRbntUsdEquivalent: 0,
          role: 'Support',
        },
      ];
      const r = screen(s).results.find((x) => x.criterionId === 9)!;
      expect([leadShare, r.verdict]).toEqual([leadShare, 'review']);
    }
  });

  it('prints no reason anywhere that rests on a figure this tool chose', () => {
    for (const s of [FINPR_MARCH_2026, FINPR_CONTINUATION_JUNE_2026, emptySubmission()]) {
      for (const r of screen(s).results) {
        for (const reason of r.reasons) {
          expect([r.criterionId, reason]).toEqual([
            r.criterionId,
            expect.not.stringContaining('threshold set by this tool'),
          ]);
        }
      }
    }
  });
});

describe('criterion 9 settles only the case that needs no invented figure', () => {
  it('passes an even split, where nobody takes more than anyone else', () => {
    const s = emptySubmission();
    s.equity.paidContributors = [
      { name: 'A', amountUsdt: 1000, amountRbntUsdEquivalent: 0, role: 'Delivery' },
      { name: 'B', amountUsdt: 500, amountRbntUsdEquivalent: 500, role: 'Editing' },
      { name: 'C', amountUsdt: 1000, amountRbntUsdEquivalent: 0, role: 'Research' },
    ];
    const r = screen(s).results.find((x) => x.criterionId === 9)!;
    expect(r.verdict).toBe('pass');
  });

  it('asks about any uneven split, however slight, rather than drawing its own line', () => {
    const s = emptySubmission();
    s.equity.paidContributors = [
      { name: 'A', amountUsdt: 5100, amountRbntUsdEquivalent: 0, role: 'Delivery' },
      { name: 'B', amountUsdt: 4900, amountRbntUsdEquivalent: 0, role: 'Editing' },
    ];
    const r = screen(s).results.find((x) => x.criterionId === 9)!;
    expect(r.verdict).toBe('review');
    expect(r.reasons).toEqual([]);
  });
});
