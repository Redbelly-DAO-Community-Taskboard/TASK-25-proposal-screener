/**
 * Deterministic pre-screening engine.
 *
 * Given a structured submission it returns one result per ratified criterion,
 * each carrying the criterion, the ratified flag condition that fired, and the
 * constitutional section the criterion enforces.
 *
 * Three outcomes, not two. Several ratified conditions turn on judgement that
 * no rule can settle, and several depend on figures the DAO does not publish.
 * Those return 'review' with the exact question for the reviewer rather than
 * asserting a verdict the engine cannot support.
 */

import {
  CRITERIA,
  TREASURY_GATE,
  criterionById,
  type Anchor,
  type Criterion,
} from './checklist';
import { totalRequestedUsd, type Submission } from './submission';

export type Verdict = 'pass' | 'flag' | 'review';

export interface Citation {
  criterionId: number;
  criterionName: string;
  /** Verbatim ratified flag condition for this criterion. */
  ratifiedFlagCondition: string;
  /** Rendered constitutional citation, or an explicit statement that none exists. */
  constitution: string;
  /** Present where a later passed proposal controls over the constitution. */
  controlling?: string;
}

export interface CriterionResult {
  criterionId: number;
  criterionName: string;
  verdict: Verdict;
  /** Why this verdict, in the reviewer's language. One entry per failed condition. */
  reasons: string[];
  /** Set on 'review'. The specific question a human must answer. */
  reviewQuestion?: string;
  citation: Citation;
  /** Set where the ratified text marks the flag as not disqualifying. */
  notADealbreaker?: boolean;
  /** Set where the checklist and the constitution disagree on this criterion. */
  conflictNote?: string;
}

export interface GateResult {
  barred: boolean;
  reason: string;
  proposalTitle: string;
  snapshotId: string;
  reopens: string;
}

export interface ScreeningReport {
  submissionTitle: string;
  screenedAt: string;
  gate: GateResult;
  results: CriterionResult[];
  summary: {
    passed: number;
    flagged: number;
    needsReview: number;
    /** Flags that the ratified text does not treat as disqualifying. */
    flaggedButNotDealbreakers: number;
  };
}

/**
 * Every figure the engine tests against, and where it comes from.
 *
 * There is one, and the DAO ratified it. Earlier versions of this engine also
 * carried a 25% figure for what counts as a "large" upfront payment and a 50%
 * figure for what counts as a "dominating" share of payouts. The ratified text
 * uses both words without ever stating a number, so those figures were ours.
 * Both have been removed, because a tool that exists to check proposals against
 * ratified rules must not be able to fail one on a number the DAO never voted
 * for.
 *
 * Criterion 2 lost nothing by it. Its ratified pass condition is "Upfront
 * requests require clear justification", with no size qualifier at all, so an
 * unjustified upfront request breaches ratified text whatever its size and the
 * threshold was never doing the work. Criterion 9 genuinely cannot be settled:
 * "dominating" has no ratified figure, so the engine reports the share as a
 * fact and asks a human to judge it rather than inventing the line.
 */
export const THRESHOLDS = {
  /** Criterion 1 states this figure in the ratified checklist itself. */
  maxShareOfAnnualAllocationPercent: 25,
} as const;

/**
 * Figures used by the engine that the DAO has not ratified.
 *
 * Deliberately empty, and a test keeps it that way. Anything added here can
 * inform a review question but must never be the sole cause of a flag, because
 * a flag asserts that a ratified rule was broken.
 */
export const UNRATIFIED_THRESHOLDS: ReadonlySet<keyof typeof THRESHOLDS> =
  new Set();

function renderAnchor(a: Anchor): string {
  if (a.strength === 'none') {
    return `No constitutional anchor. ${a.gap}${a.nearest ? ` Nearest related text: ${a.nearest}` : ''}`;
  }
  const label = `Constitution v1.2 section ${a.section} ${a.sectionTitle}`;
  const strength =
    a.strength === 'partial' && a.shortfall ? ` Partial anchor: ${a.shortfall}` : '';
  return `${label}: "${a.quote}"${strength}`;
}

function buildCitation(c: Criterion): Citation {
  const controlling = c.supersededBy.length
    ? c.supersededBy
        .map(
          (p) =>
            `${p.title} (Snapshot ${p.snapshotId.slice(0, 10)}, closed ${p.closed.slice(0, 10)}, ` +
            `${p.result.for.toLocaleString()} For to ${p.result.against.toLocaleString()} Against). ` +
            `${p.effect} Footing: ${p.footing}.` +
            (p.footingNote ? ` ${p.footingNote}` : ''),
        )
        .join(' ')
    : undefined;

  return {
    criterionId: c.id,
    criterionName: c.name,
    ratifiedFlagCondition: c.flagCondition,
    constitution: c.anchors.map(renderAnchor).join(' '),
    controlling,
  };
}

function has(text: string): boolean {
  return text.trim().length > 0;
}

/** Reads back a count with the noun agreeing, so reports never print "1 role(s)". */
function count(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

interface Check {
  reasons: string[];
  reviewQuestions: string[];
}

function newCheck(): Check {
  return { reasons: [], reviewQuestions: [] };
}

function resolve(c: Criterion, chk: Check): CriterionResult {
  const verdict: Verdict =
    chk.reasons.length > 0 ? 'flag' : chk.reviewQuestions.length > 0 ? 'review' : 'pass';
  return {
    criterionId: c.id,
    criterionName: c.name,
    verdict,
    reasons: chk.reasons,
    reviewQuestion: chk.reviewQuestions.length
      ? chk.reviewQuestions.join(' ')
      : undefined,
    citation: buildCitation(c),
    notADealbreaker: c.notADealbreaker,
    conflictNote: c.conflict,
  };
}

// One function per ratified criterion. Each tests only what its ratified pass
// conditions state, in the order they are written in the ratified text.

function checkBudget(s: Submission): CriterionResult {
  const c = criterionById(1);
  const chk = newCheck();

  const hasUsdt = s.budget.usdt > 0;
  // An RBNT component counts whether the proposal states it in tokens or in
  // USD equivalent. Real proposals do both.
  const hasRbnt = s.budget.rbnt > 0 || (s.budget.rbntUsdEquivalent ?? 0) > 0;
  if (!hasUsdt && !hasRbnt) {
    chk.reasons.push('No USDT or RBNT amount is declared, so there is no budget to assess.');
  } else if ((hasUsdt || hasRbnt) && !(hasUsdt && hasRbnt)) {
    // A single-currency request is not a missing split. Only note it.
    chk.reviewQuestions.push(
      `The request is ${hasUsdt ? 'USDT only' : 'RBNT only'}. Confirm no component of the ` +
        'other currency is implied, since the ratified condition requires a clear separation ' +
        'of USDT as external spend and RBNT as internal rewards.',
    );
  }

  if (!has(s.budget.costBreakdown)) {
    chk.reasons.push('No cost breakdown is provided.');
  }
  if (!has(s.budget.justification)) {
    chk.reasons.push('No budget justification is provided.');
  }

  const allocation = s.budget.workingGroupAnnualAllocationUsdt;
  const total = totalRequestedUsd(s);

  if (total === null) {
    chk.reviewQuestions.push(
      `The proposal requests ${s.budget.rbnt.toLocaleString()} RBNT without stating a USD ` +
        'equivalent, so the total request cannot be computed and the ratified 25% limit cannot ' +
        'be tested. Obtain the RBNT valuation used at submission and check the limit by hand.',
    );
  } else if (allocation === null) {
    chk.reviewQuestions.push(
      'The working group annual allocation was not supplied, so the ratified 25% limit ' +
        `cannot be tested. The request totals ${total.toLocaleString()} USD equivalent. ` +
        'Confirm the current allocation for this working group and check it by hand.',
    );
  } else if (allocation > 0) {
    const share = (total / allocation) * 100;
    if (share > THRESHOLDS.maxShareOfAnnualAllocationPercent) {
      chk.reasons.push(
        `The request is ${share.toFixed(1)}% of the working group annual allocation, above the ` +
          `ratified ${THRESHOLDS.maxShareOfAnnualAllocationPercent}% limit.`,
      );
    }
  }

  return resolve(c, chk);
}

function checkPayment(s: Submission): CriterionResult {
  const c = criterionById(2);
  const chk = newCheck();

  if (s.payment.milestones.length === 0) {
    chk.reasons.push('No milestone structure is provided.');
  } else {
    const undelivered = s.payment.milestones.filter((m) => !has(m.deliverable));
    if (undelivered.length > 0) {
      chk.reasons.push(
        `${undelivered.length} of ${s.payment.milestones.length} milestones are not tied to a deliverable.`,
      );
    }
  }

  if (s.payment.upfrontPercent > 0 && !has(s.payment.upfrontJustification)) {
    // The ratified pass condition is "Upfront requests require clear
    // justification". It carries no size qualifier, so any unjustified upfront
    // request breaches it and the percentage is reported as a fact rather than
    // measured against a line this tool drew. The ratified flag condition adds
    // the word "large", which is undefined, but it cannot narrow a pass
    // condition that is already unqualified.
    chk.reasons.push(
      `${s.payment.upfrontPercent}% of the total is requested upfront with no justification. ` +
        'The ratified pass condition "Upfront requests require clear justification" applies to ' +
        'any upfront request, whatever its size.',
    );
  }

  return resolve(c, chk);
}

function checkStrategicFit(s: Submission): CriterionResult {
  const c = criterionById(3);
  const chk = newCheck();

  if (s.strategicFit.workingGroup === 'None of these') {
    chk.reasons.push(
      'The proposal does not align with any of the three working groups named in the ratified ' +
        'criterion, which are Community, Marketing and Developers/Builders.',
    );
  }
  if (!has(s.strategicFit.daoGoalLink)) {
    chk.reasons.push('No link to DAO-wide goals is stated.');
  } else {
    chk.reviewQuestions.push(
      'A link to DAO-wide goals is stated. The ratified condition flags goals that are vague, ' +
        'which is a judgement no rule can settle. Read the stated link and confirm it is specific.',
    );
  }

  return resolve(c, chk);
}

function checkFeasibility(s: Submission): CriterionResult {
  const c = criterionById(4);
  const chk = newCheck();

  if (!has(s.feasibility.timeline)) {
    chk.reasons.push('No timeline is provided.');
  }
  if (s.payment.milestones.length === 0) {
    chk.reasons.push('No milestones or deliverables are provided.');
  }
  if (!has(s.feasibility.duplicationCheck)) {
    chk.reasons.push(
      'The proposal does not state what was checked to establish it does not duplicate existing efforts.',
    );
  }
  if (!has(s.feasibility.scopeStatement)) {
    chk.reasons.push('No scope statement is provided, so achievability cannot be assessed.');
  } else {
    chk.reviewQuestions.push(
      'The ratified condition flags scope that is unrealistic for the budget and resources. ' +
        'Read the scope statement against the budget and confirm it is achievable.',
    );
  }

  return resolve(c, chk);
}

function checkOversight(s: Submission): CriterionResult {
  const c = criterionById(5);
  const chk = newCheck();

  if (!has(s.oversight.reviewerName)) {
    chk.reasons.push('No independent reviewer or oversight lead is nominated.');
  } else if (s.oversight.reviewerIsProposer) {
    const paid = s.oversight.reviewerIsPaidByThisProposal;
    chk.reasons.push(
      'The nominated oversight lead is the proposer' +
        (paid ? ', and is paid by this proposal for the role' : '') +
        '. A self-nominated reviewer is not independent, which is what the ratified condition requires. ' +
        'Constitution v1.2 section 5 requires disclosure of relevant relationships and recusal on ' +
        'self-submitted proposals.',
    );
  }

  if (s.oversight.updateCadence !== 'Monthly') {
    chk.reasons.push(
      `Updates are planned ${s.oversight.updateCadence.toLowerCase()}, not monthly. The ratified ` +
        'condition requires monthly updates in DAO channels.',
    );
  } else if (!has(s.oversight.updateChannel)) {
    chk.reasons.push('Monthly updates are planned but no DAO channel is named.');
  }

  return resolve(c, chk);
}

function checkImpact(s: Submission): CriterionResult {
  const c = criterionById(6);
  const chk = newCheck();

  if (s.impact.kpis.length === 0) {
    chk.reasons.push('No KPIs or measurable success criteria are included.');
  }
  if (!has(s.impact.midpointReviewMethod)) {
    chk.reasons.push('No midpoint review method is defined.');
  }
  if (!has(s.impact.finalReviewMethod)) {
    chk.reasons.push('No final review method is defined.');
  }
  if (!has(s.impact.longTermValue)) {
    chk.reasons.push(
      'No long-term or community value is identified, which is the short-term focus the ratified ' +
        'condition flags.',
    );
  }

  return resolve(c, chk);
}

function checkRisk(s: Submission): CriterionResult {
  const c = criterionById(7);
  const chk = newCheck();

  if (s.risk.entries.length === 0) {
    chk.reasons.push('No risks are described.');
  } else {
    const unmitigated = s.risk.entries.filter((e) => !has(e.mitigation));
    if (unmitigated.length > 0) {
      chk.reasons.push(
        `${unmitigated.length} of ${s.risk.entries.length} identified risks have no mitigation described.`,
      );
    }
  }

  return resolve(c, chk);
}

function checkCoFunding(s: Submission): CriterionResult {
  const c = criterionById(8);
  const chk = newCheck();

  if (!s.coFunding.hasLeverage) {
    chk.reasons.push(
      'No matching funds, sponsorships or in-kind contributions are noted. The ratified condition ' +
        'records this as relevant but not a dealbreaker.',
    );
  } else if (!has(s.coFunding.description)) {
    chk.reasons.push('Leverage is claimed but not described.');
  }

  return resolve(c, chk);
}

function checkEquity(s: Submission): CriterionResult {
  const c = criterionById(9);
  const chk = newCheck();

  const contributors = s.equity.paidContributors;
  const unvalued = contributors.filter((p) => p.amountRbntUsdEquivalent === null);

  if (contributors.length === 0) {
    // A proposal can legitimately pay a vendor and no individual, so this is
    // not a breach. It does mean the concentration test has nothing to run on,
    // which the reviewer has to confirm rather than the engine assume.
    chk.reviewQuestions.push(
      'No paid contributor is named, so payout concentration cannot be tested. Confirm that no ' +
        'individual receives payment under this proposal and that the whole budget goes to ' +
        'vendors or costs.',
    );
  } else if (unvalued.length > 0) {
    chk.reviewQuestions.push(
      `${unvalued.length} of ${contributors.length} paid contributors are compensated in RBNT ` +
        'with no USD equivalent stated, so payout concentration cannot be computed. Obtain the ' +
        'RBNT valuation and check concentration by hand.',
    );
  } else {
    const totalPaid = contributors.reduce(
      (sum, p) => sum + p.amountUsdt + (p.amountRbntUsdEquivalent ?? 0),
      0,
    );
    if (contributors.length > 1 && totalPaid > 0) {
      // "No single contributor dominating payouts" is the ratified condition,
      // and the ratified text never says what dominating means. Only one case
      // can be settled without picking a figure: where no contributor takes
      // more than an equal share, nobody takes more than anyone else, so nobody
      // dominates on any reading of the word. Every other split is reported as
      // arithmetic and left to a human, because any line drawn between them
      // would be this tool's opinion deciding a governance outcome.
      const equalShare = 100 / contributors.length;
      const shares = contributors.map((p) => ({
        name: p.name,
        share: ((p.amountUsdt + (p.amountRbntUsdEquivalent ?? 0)) / totalPaid) * 100,
      }));
      const largest = Math.max(...shares.map((x) => x.share));
      // A cent of rounding either way is not a governance question.
      if (largest > equalShare + 0.01) {
        chk.reviewQuestions.push(
          `Contributor payouts split ${shares
            .map((x) => `${x.name} ${x.share.toFixed(1)}%`)
            .join(', ')}. The ratified condition asks that no single contributor dominates ` +
            'payouts, and the ratified text states no figure for dominating, so this tool ' +
            'reports the split rather than deciding it. Judge whether this concentration meets ' +
            'the condition.',
        );
      }
    } else if (contributors.length === 1 && totalPaid > 0) {
      // Within a single proposal one named contributor always takes 100% of the
      // contributor allocation, so the arithmetic says nothing. The concentration
      // the criterion is aimed at is concentration across proposals, which this
      // engine cannot see because it screens one submission at a time. Naming the
      // blind spot is more useful than a flag that fires on every solo proposal.
      chk.reviewQuestions.push(
        `${contributors[0].name} is the only paid contributor in this proposal, so payout ` +
          'concentration cannot be judged from this submission alone. Check the Snapshot archive ' +
          'for other proposals paying the same individual in the same period before deciding ' +
          'whether the ratified condition on concentrated payouts is met.',
      );
    }
  }

  if (s.equity.proposerOtherPaidRolesThisQuarter > 0) {
    const justified = has(s.equity.multipleRolesJustification);
    chk.reasons.push(
      `The proposer holds ${count(s.equity.proposerOtherPaidRolesThisQuarter, 'other paid DAO role')} ` +
        `this quarter${justified ? ', with justification supplied' : ' with no justification supplied'}. ` +
        'The ratified criterion permits this where justified. Constitution v1.2 section 5 sets a hard ' +
        'limit of one paid role per individual per quarter with no justification exception, so the ' +
        'constitution is stricter than the checklist here and a reviewer must decide which governs.',
    );
  }

  return resolve(c, chk);
}

function checkCompliance(s: Submission): CriterionResult {
  const c = criterionById(10);
  const chk = newCheck();

  if (!s.compliance.codeOfConductConfirmed) {
    chk.reasons.push(
      'Consistency with the DAO Community Code of Conduct is not confirmed.',
    );
  }
  if (!has(s.compliance.activitySummary)) {
    chk.reasons.push(
      'No activity summary is provided, so compliance cannot be assessed.',
    );
  } else {
    chk.reviewQuestions.push(
      'Whether an activity carries regulatory or reputational risk is a judgement no rule can ' +
        'settle. Read the activity summary and the declared risks, then confirm against the ' +
        'Community Code of Conduct, which is the document this criterion points at rather than ' +
        'Constitution v1.2.' +
        (has(s.compliance.identifiedRisks)
          ? ` The proposer has declared: "${s.compliance.identifiedRisks}"`
          : ' The proposer declared no risks.'),
    );
  }

  return resolve(c, chk);
}

function checkCommunity(s: Submission): CriterionResult {
  const c = criterionById(11);
  const chk = newCheck();

  const actual = s.community.evidence.filter((e) => !e.isPlanned);
  const planned = s.community.evidence.filter((e) => e.isPlanned);

  if (actual.length === 0) {
    if (planned.length > 0) {
      chk.reasons.push(
        `The proposal describes ${count(planned.length, 'discussion')} it intends to hold rather than ` +
          'discussion that has taken place. The ratified condition requires evidence of discussion ' +
          'with community members, and stated intent is not evidence.',
      );
    } else {
      chk.reasons.push('No evidence of discussion with community members is provided.');
    }
  } else {
    const unlinked = actual.filter((e) => !has(e.url));
    if (unlinked.length === actual.length) {
      chk.reasons.push(
        'Discussion is claimed but no link to it is provided, so the claim cannot be checked.',
      );
    }
  }

  if (s.community.coAuthors.length === 0 && actual.length === 0) {
    chk.reasons.push('No co-authors or collaborators are named.');
  }

  return resolve(c, chk);
}

const CHECKS: Array<(s: Submission) => CriterionResult> = [
  checkBudget,
  checkPayment,
  checkStrategicFit,
  checkFeasibility,
  checkOversight,
  checkImpact,
  checkRisk,
  checkCoFunding,
  checkEquity,
  checkCompliance,
  checkCommunity,
];

/**
 * The treasury gate.
 *
 * Evaluated before the criteria because the suspension is a policy bar on new
 * treasury-funded activity, not a judgement about proposal quality. Reporting
 * it as a criterion failure would misstate why the proposal cannot proceed.
 */
export function evaluateGate(s: Submission): GateResult {
  const p = TREASURY_GATE.proposal;
  const base = {
    proposalTitle: p.title,
    snapshotId: p.snapshotId,
    reopens: TREASURY_GATE.reopens,
  };

  if (!s.treasury.requestsNewTreasuryFunding) {
    return {
      ...base,
      barred: false,
      reason:
        'The proposal requests no new treasury funding, so the suspension does not bar it.',
    };
  }
  if (s.treasury.approvedBeforeSuspension) {
    return {
      ...base,
      barred: false,
      reason:
        'The proposal continues a commitment approved by Snapshot before the suspension took ' +
        'effect. The suspension states that such proposals continue through completion under ' +
        'their approved terms.',
    };
  }
  return {
    ...base,
    barred: true,
    reason:
      'The proposal requests new treasury funding, which is suspended. The suspension passed ' +
      `${p.result.for.toLocaleString()} For to ${p.result.against.toLocaleString()} Against and ` +
      `closed ${p.closed.slice(0, 10)}. It suspends new treasury-funded proposals, new grant ` +
      'programs, new bounty programs and new discretionary treasury spending. This overrides ' +
      'Constitution v1.2 section 6.2 Budgeting for any new request.',
  };
}

/**
 * Screens a submission against all 11 ratified criteria.
 *
 * The criteria are always evaluated, including when the gate bars the proposal,
 * so a proposer receives the full review rather than a single blocking message.
 */
export function screen(s: Submission): ScreeningReport {
  if (CHECKS.length !== CRITERIA.length) {
    throw new Error(
      `Engine has ${CHECKS.length} checks for ${CRITERIA.length} ratified criteria. ` +
        'Every ratified criterion must be screened.',
    );
  }

  const results = CHECKS.map((fn) => fn(s));

  return {
    submissionTitle: s.meta.title,
    screenedAt: new Date().toISOString(),
    gate: evaluateGate(s),
    results,
    summary: {
      passed: results.filter((r) => r.verdict === 'pass').length,
      flagged: results.filter((r) => r.verdict === 'flag').length,
      needsReview: results.filter((r) => r.verdict === 'review').length,
      flaggedButNotDealbreakers: results.filter(
        (r) => r.verdict === 'flag' && r.notADealbreaker,
      ).length,
    },
  };
}
