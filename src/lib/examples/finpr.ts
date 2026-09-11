/**
 * Worked examples drawn from the Snapshot archive, not invented.
 *
 * Both proposals are transcribed from their published bodies, retrieved from
 * the Snapshot GraphQL API and stored under research/proposals/. Every field
 * that required a reading decision rather than a direct transcription carries a
 * comment saying which sentence of the proposal it came from.
 *
 * The pair is useful because one passed and its continuation failed, and
 * because the failure is not explained by proposal quality. See
 * docs/worked-examples.md for the analysis.
 */

import type { Submission } from '../rubric/submission';

/**
 * Marketing press only : FINPR Agency
 * Snapshot 0x7ac0de16f72ad78e0da0eed4dc7d2413b8b753ba229884986609e26d33f00f42
 * Opened 1 March 2026, closed 6 March 2026.
 * PASSED 10,947,839 For to 0 Against, 1,868,908 Abstain.
 */
export const FINPR_MARCH_2026: Submission = {
  meta: {
    title: 'Marketing press only : FINPR Agency',
    proposerHandle: 'Rainbowmagician',
    proposerWallet: '0xA4811219b12CE85B377Cd8197b929e98d1C3CdE1',
    submittedAt: '2026-03-01',
  },
  treasury: {
    requestsNewTreasuryFunding: true,
    // Approved by Snapshot 6 March 2026, four months before the suspension
    // closed on 4 July 2026. The suspension states that proposals approved
    // before it took effect continue under their approved terms.
    approvedBeforeSuspension: true,
  },
  budget: {
    usdt: 2890,
    rbnt: 50000,
    // The proposal states "50,000 RBNT" with no USD equivalent anywhere in the
    // text, so the total request genuinely cannot be computed from it.
    rbntUsdEquivalent: null,
    workingGroupAnnualAllocationUsdt: null,
    costBreakdown:
      'USDT: 2,890 (vendor payment - FINPR). RBNT: 50,000 (Rainbowmagician - coordination and research).',
    justification:
      'Press release published in recognised crypto media creates persistent external credibility, ' +
      'improves discoverability and SEO, and can be reused by the DAO without dependency on execution by Redbelly.',
  },
  payment: {
    structure: 'Partly upfront',
    // Section 5 states "USDT: 70% upfront in usdt, 30% after FINPR completes
    // all deliverables and obligations", then states "No upfront payments." two
    // lines later. The stated payment terms govern over the summary denial.
    upfrontPercent: 70,
    // No justification is offered anywhere. The proposal denies the upfront
    // payment exists rather than justifying it.
    upfrontJustification: '',
    milestones: [
      {
        name: 'FINPR delivery',
        deliverable: 'Publication links and final report',
        amountUsdt: 867,
        amountRbnt: 0,
      },
      {
        name: 'Contributor delivery',
        deliverable: 'Final publication links and coordination report',
        amountUsdt: 0,
        amountRbnt: 50000,
      },
    ],
  },
  strategicFit: {
    // Section 3 names "Marketing guild : visibility and credibility" and
    // "Community guild : onboarding and education support".
    workingGroup: 'Marketing',
    daoGoalLink:
      'Marketing guild visibility and credibility, Community guild onboarding and education support.',
  },
  feasibility: {
    // Section 6 gives a duration rather than dates.
    timeline: 'Estimated execution 2 to 3 weeks. Single-cycle delivery.',
    scopeStatement:
      'Strictly limited to press content only, with no influencers, no promotions and no operational dependencies.',
    duplicationCheck: 'No duplication of existing DAO efforts.',
  },
  oversight: {
    // Section 7 states "Oversight: Any pod leader or HC". No individual named.
    reviewerName: 'Any pod leader or HC',
    reviewerIsProposer: false,
    reviewerIsPaidByThisProposal: false,
    // The proposal defines validation criteria but no update cadence.
    updateCadence: 'None',
    updateChannel: '',
  },
  impact: {
    kpis: [
      'Publication completed (yes/no)',
      'Number of media placements',
      'Links archived and shared publicly',
    ],
    // No midpoint review appears in the text.
    midpointReviewMethod: '',
    finalReviewMethod:
      'Validation criteria: confirmed publication, links delivered, coordination report submitted. Payment contingent on validation.',
    longTermValue:
      'Reusable editorial references, external credibility, improved discoverability.',
  },
  risk: {
    entries: [
      { risk: 'Limited immediate reach', mitigation: 'Editorial content is durable. Low budget exposure.' },
      { risk: 'No viral effect', mitigation: 'One-time expense with no follow-up commitment without new vote.' },
    ],
  },
  coFunding: {
    // Section 10 states "No co-funding required".
    hasLeverage: false,
    description: '',
  },
  equity: {
    paidContributors: [
      {
        name: 'Rainbowmagician',
        amountUsdt: 0,
        amountRbntUsdEquivalent: null,
        role: 'Research, coordination and delivery oversight',
      },
    ],
    // Section 11 states "No overlapping paid roles".
    proposerOtherPaidRolesThisQuarter: 0,
    multipleRolesJustification: '',
  },
  compliance: {
    identifiedRisks: '',
    // Section 11 states "Fully compliant with DAO conduct standards".
    codeOfConductConfirmed: true,
    activitySummary:
      'One professional editorial press release, placement in recognised crypto media, ' +
      'reusable DAO-owned communication asset. No influencers, no promotions.',
  },
  community: {
    evidence: [
      {
        channel: 'Discord',
        // Section 12 states "Proposal discussed publicly prior to submission"
        // in the past tense but provides no link to the discussion.
        url: '',
        date: '',
        isPlanned: false,
      },
    ],
    coAuthors: [],
  },
};

/**
 * Continuation of Long-Term Marketing & PR Campaign with FINPR
 * Snapshot 0x21afed409a2b189d564dc83f9aac23e3f1c3f7c585d0c35e8a0826d3aa505d04
 * Opened 29 June 2026, closed 4 July 2026.
 * FAILED 0 For to 9,849,764 Against, 3,953,219 Abstain.
 */
export const FINPR_CONTINUATION_JUNE_2026: Submission = {
  meta: {
    title: 'Continuation of Long-Term Marketing & PR Campaign with FINPR',
    proposerHandle: 'Rainbowmagician1',
    proposerWallet: '0xA4811219b12CE85B377Cd8197b929e98d1C3CdE1',
    submittedAt: '2026-06-29',
  },
  treasury: {
    requestsNewTreasuryFunding: true,
    // A new three-month programme, not a continuation of an approved
    // commitment. The March proposal stated "No renewal implied."
    approvedBeforeSuspension: false,
  },
  budget: {
    usdt: 12650,
    // The proposal states the contributor component as "2,400 USD equivalent in
    // RBNT" and never gives a token figure, which is the reverse of the March
    // proposal.
    rbnt: 0,
    rbntUsdEquivalent: 2400,
    workingGroupAnnualAllocationUsdt: null,
    costBreakdown:
      'Month 1 4,230 USDT. Month 2 4,620 USDT. Month 3 3,800 USDT. Total 12,650 USDT. ' +
      'Reviewer compensation 800 USD equivalent in RBNT per month for 3 months, total 2,400.',
    justification:
      'Covers media placements, press release distribution, influencer promotion, social media ' +
      'management, content creation, campaign reporting, and independent oversight and verification.',
  },
  payment: {
    structure: 'Milestone-based',
    // Milestone 1 is payable "Upon approval" for "Month 1 campaign execution",
    // before any deliverable is verified. Milestones 2 and 3 are explicitly
    // "After verification" of the preceding month. So 4,230 of the 15,050 USD
    // total, 28.1%, is payable before anything is verified, notwithstanding the
    // proposal's statement that "all payments are milestone-based".
    upfrontPercent: 28.1,
    upfrontJustification: '',
    milestones: [
      {
        name: 'Milestone 1, upon approval',
        deliverable:
          'Month 1 campaign execution: 5 press placements, 1 YouTube review, 30 social posts, 2 threads, monthly report',
        amountUsdt: 4230,
        amountRbnt: 0,
      },
      {
        name: 'Milestone 2, after verification of Month 1',
        deliverable:
          'Month 2 campaign execution: 4 features and interviews, 2 influencer tweets, monthly content package, reporting',
        amountUsdt: 4620,
        amountRbnt: 0,
      },
      {
        name: 'Milestone 3, after verification of Month 2',
        deliverable:
          'Month 3 campaign execution: 3 features and interviews, 2 influencer tweets, monthly content package, final report',
        amountUsdt: 3800,
        amountRbnt: 0,
      },
    ],
  },
  strategicFit: {
    workingGroup: 'Marketing',
    daoGoalLink:
      'Increased ecosystem awareness, community growth, brand visibility, strategic communications, long-term adoption and participation.',
  },
  feasibility: {
    timeline: 'Three months, with Month 1, Month 2 and Month 3 deliverables specified separately.',
    scopeStatement:
      'Targeted PR placements, influencer marketing and social media management across three months.',
    // The proposal states no non-duplication check. It argues the opposite,
    // that it continues an existing effort.
    duplicationCheck: '',
  },
  oversight: {
    // "Oversight Lead : HC and/or Leaders. Rainbow Magician - LEAD".
    reviewerName: 'Rainbow Magician',
    reviewerIsProposer: true,
    // Paid 800 USD equivalent in RBNT per month for the oversight role.
    reviewerIsPaidByThisProposal: true,
    // "Publish monthly campaign updates to DAO channels".
    updateCadence: 'Monthly',
    updateChannel: 'DAO channels',
  },
  impact: {
    kpis: [
      'Growth in X followers, Discord members and Telegram members, measured monthly against a baseline recorded at commencement',
      '100% completion of contracted PR placements',
      '100% completion of influencer deliverables',
      '100% completion of monthly content commitments',
      'Monthly reporting delivered on schedule',
    ],
    midpointReviewMethod: 'Midpoint review after Month 2.',
    finalReviewMethod: 'Final review after Month 3, with recommendations for future marketing initiatives.',
    longTermValue:
      'Sustained growth across Redbelly community channels, stronger ecosystem awareness, increased visibility of institutional blockchain positioning.',
  },
  risk: {
    entries: [
      { risk: 'Delayed publication schedules', mitigation: 'Milestone-based payment structure' },
      { risk: 'Lower than expected community growth', mitigation: 'Multi-channel campaign diversification' },
      { risk: 'Market-wide decline in engagement', mitigation: 'Consistent monthly exposure across multiple media outlets' },
      { risk: 'Incomplete deliverables', mitigation: 'Independent review before payment approval' },
    ],
  },
  coFunding: {
    // "No external co-funding is requested." The proposal describes a benefit
    // from an existing vendor relationship, which reduces cost but is not a
    // matching fund, sponsorship or in-kind contribution.
    hasLeverage: false,
    description: '',
  },
  equity: {
    paidContributors: [
      {
        name: 'Rainbow Magician',
        amountUsdt: 0,
        amountRbntUsdEquivalent: 2400,
        role: 'Independent Reviewer',
      },
    ],
    // The proposal states "Rainbow Magician currently does not hold any other
    // paid DAO role". The March payment fell in the previous quarter, so this
    // transcription takes the statement at face value for the current quarter.
    proposerOtherPaidRolesThisQuarter: 0,
    multipleRolesJustification: '',
  },
  compliance: {
    identifiedRisks: 'Presents no identified regulatory or reputational concerns.',
    codeOfConductConfirmed: true,
    activitySummary:
      'Three-month PR, influencer and social media campaign. No token purchasing activity, ' +
      'no personal expense claims, externally verifiable deliverables.',
  },
  community: {
    evidence: [
      {
        channel: 'Discord',
        url: '',
        date: '',
        // "will be discussed publicly on Discord prior to Snapshot submission".
        // Future tense. The proposal describes discussion it intends to hold.
        isPlanned: true,
      },
    ],
    coAuthors: [],
  },
};
