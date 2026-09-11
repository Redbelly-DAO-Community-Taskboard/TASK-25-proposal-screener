/**
 * The structured shape a proposal is collected in.
 *
 * Every field exists because a ratified pass condition needs it. Free text is
 * used only where the ratified condition is itself qualitative, and in those
 * cases the engine tests for presence rather than judging quality.
 */

export type WorkingGroup =
  | 'Community'
  | 'Marketing'
  | 'Developers/Builders'
  | 'None of these';

export type PaymentStructure =
  | 'Milestone-based'
  | 'Post-completion'
  | 'Partly upfront'
  | 'Fully upfront';

export type UpdateCadence = 'Monthly' | 'Quarterly' | 'At completion only' | 'None';

export interface Milestone {
  name: string;
  /** What is delivered at this milestone. Required by criterion 2. */
  deliverable: string;
  amountUsdt: number;
  amountRbnt: number;
}

export interface PaidContributor {
  name: string;
  amountUsdt: number;
  /**
   * RBNT expressed in USD equivalent so concentration is comparable.
   * Null where the proposal does not state a USD equivalent.
   */
  amountRbntUsdEquivalent: number | null;
  role: string;
}

export interface RiskEntry {
  risk: string;
  mitigation: string;
}

export interface DiscussionEvidence {
  channel: string;
  /** Link to the discussion. Absence of a link is what separates evidence from intent. */
  url: string;
  date: string;
  /**
   * True where the proposal describes discussion it intends to hold rather
   * than discussion that has happened. Criterion 11 requires evidence.
   */
  isPlanned: boolean;
}

export interface Submission {
  meta: {
    title: string;
    proposerHandle: string;
    proposerWallet: string;
    submittedAt: string;
  };

  /**
   * Drives the treasury gate. A proposal requesting no new treasury funds, or
   * continuing a commitment approved before the suspension took effect, is not
   * barred by it.
   */
  treasury: {
    requestsNewTreasuryFunding: boolean;
    approvedBeforeSuspension: boolean;
  };

  budget: {
    usdt: number;
    rbnt: number;
    /**
     * RBNT in USD equivalent, so the total can be compared to an allocation.
     * Null where the proposal states an RBNT amount without a USD equivalent,
     * which is common. The engine reports that the total cannot be computed
     * rather than treating the RBNT component as worth nothing.
     */
    rbntUsdEquivalent: number | null;
    /**
     * The working group annual allocation the 25% test runs against. Optional
     * because the DAO does not publish it reliably. When absent the engine
     * returns needs-human-review for that condition rather than guessing.
     */
    workingGroupAnnualAllocationUsdt: number | null;
    costBreakdown: string;
    justification: string;
  };

  payment: {
    structure: PaymentStructure;
    /** Percentage of the total requested before any deliverable is accepted. */
    upfrontPercent: number;
    upfrontJustification: string;
    milestones: Milestone[];
  };

  strategicFit: {
    workingGroup: WorkingGroup;
    daoGoalLink: string;
  };

  feasibility: {
    /**
     * The timeline as the proposal states it. Free text because real proposals
     * express it as a duration ("2 to 3 weeks") as often as as dates, and the
     * ratified condition asks only that a timeline is provided.
     */
    timeline: string;
    scopeStatement: string;
    /** What the proposer checked to establish this is not a duplicate. */
    duplicationCheck: string;
  };

  oversight: {
    reviewerName: string;
    /** Set where the proposer nominates themself. Defeats independence. */
    reviewerIsProposer: boolean;
    reviewerIsPaidByThisProposal: boolean;
    updateCadence: UpdateCadence;
    updateChannel: string;
  };

  impact: {
    kpis: string[];
    midpointReviewMethod: string;
    finalReviewMethod: string;
    longTermValue: string;
  };

  risk: {
    entries: RiskEntry[];
  };

  coFunding: {
    hasLeverage: boolean;
    description: string;
  };

  equity: {
    paidContributors: PaidContributor[];
    /**
     * Other paid DAO roles the proposer holds in the same quarter. Constitution
     * section 5 sets a hard limit of one paid role per individual per quarter.
     */
    proposerOtherPaidRolesThisQuarter: number;
    multipleRolesJustification: string;
  };

  compliance: {
    /** Regulatory or reputational risks the proposer has identified. */
    identifiedRisks: string;
    codeOfConductConfirmed: boolean;
    activitySummary: string;
  };

  community: {
    evidence: DiscussionEvidence[];
    coAuthors: string[];
  };
}

/**
 * Total requested in USD, for the concentration and 25% tests.
 *
 * Returns null where the proposal requests RBNT without stating a USD
 * equivalent, because the total is genuinely unknown in that case. Callers must
 * report the gap rather than substituting a figure.
 */
export function totalRequestedUsd(s: Submission): number | null {
  if (s.budget.rbnt > 0 && s.budget.rbntUsdEquivalent === null) return null;
  return s.budget.usdt + (s.budget.rbntUsdEquivalent ?? 0);
}

/** Empty submission used by the form and by tests as a starting point. */
export function emptySubmission(): Submission {
  return {
    meta: { title: '', proposerHandle: '', proposerWallet: '', submittedAt: '' },
    treasury: {
      requestsNewTreasuryFunding: true,
      approvedBeforeSuspension: false,
    },
    budget: {
      usdt: 0,
      rbnt: 0,
      rbntUsdEquivalent: null,
      workingGroupAnnualAllocationUsdt: null,
      costBreakdown: '',
      justification: '',
    },
    payment: {
      structure: 'Milestone-based',
      upfrontPercent: 0,
      upfrontJustification: '',
      milestones: [],
    },
    strategicFit: { workingGroup: 'None of these', daoGoalLink: '' },
    feasibility: {
      timeline: '',
      scopeStatement: '',
      duplicationCheck: '',
    },
    oversight: {
      reviewerName: '',
      reviewerIsProposer: false,
      reviewerIsPaidByThisProposal: false,
      updateCadence: 'None',
      updateChannel: '',
    },
    impact: {
      kpis: [],
      midpointReviewMethod: '',
      finalReviewMethod: '',
      longTermValue: '',
    },
    risk: { entries: [] },
    coFunding: { hasLeverage: false, description: '' },
    equity: {
      paidContributors: [],
      proposerOtherPaidRolesThisQuarter: 0,
      multipleRolesJustification: '',
    },
    compliance: {
      identifiedRisks: '',
      codeOfConductConfirmed: false,
      activitySummary: '',
    },
    community: { evidence: [], coAuthors: [] },
  };
}
