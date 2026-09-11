/**
 * Single source of truth for the ratified Proposal Review Checklist.
 *
 * The 11 criteria, their pass conditions and their flag conditions are quoted
 * verbatim from the Snapshot proposal "Adoption of Standardised Proposal
 * Evaluation Criteria", which passed 4,347,753 For to 0 Against to 0 Abstain
 * and closed on 6 October 2025.
 *
 * Nothing in this file restates, paraphrases or extends the ratified text.
 * The rubric document in docs/ is generated from this file, so the document
 * and the screening engine cannot drift apart.
 *
 * Quoted text preserves the wording of the source documents exactly. One
 * typographic change is made and it is disclosed to the reader rather than made
 * quietly: em dashes in the source are set as plain hyphens, because the brand
 * voice rule against them is absolute and covers quoted material. No word,
 * figure or meaning is altered. QUOTE_NOTE below is the disclosure, and the
 * untouched source sits at research/constitution-v1.2.md for anyone checking.
 */

/**
 * Printed wherever quotations are shown, so a reader never has to wonder
 * whether a quotation was edited.
 */
export const QUOTE_NOTE =
  'Quotations are reproduced word for word. Em dashes in the source documents ' +
  'are set here as plain hyphens to meet the board voice rule. Nothing else is ' +
  'changed, and the untouched source is at research/constitution-v1.2.md.';

export const RATIFIED_CHECKLIST = {
  title: 'Adoption of Standardised Proposal Evaluation Criteria',
  snapshotId:
    '0xf2a05384e37a710c1600db1abbac9b4dc66444a56a1ed49df7f0e3dbfd7570e7',
  space: 'rbnt.eth',
  opened: '2025-10-03T05:07:36Z',
  closed: '2025-10-06T05:07:36Z',
  result: { for: 4347753, against: 0, abstain: 0 },
  /** The ratified text addresses pod leaders, not the High Council. */
  adoptedBy: 'Pod leaders',
  url: 'https://snapshot.box/#/s:rbnt.eth/proposal/0xf2a05384e37a710c1600db1abbac9b4dc66444a56a1ed49df7f0e3dbfd7570e7',
} as const;

export const CONSTITUTION = {
  title: 'Redbelly Community DAO Constitution',
  version: 'v1.2',
  ratifiedBy:
    'Redbelly Community DAO Constitution - Ratification, Snapshot, closed 20 September 2025',
  snapshotId:
    '0xcc1ea0e69962dbb390d71a467c0ea69ce0b38de342ec0777e1ef130d11e844e3',
  result: { for: 1779675, against: 0, abstain: 0 },
  note:
    'Last ratified text. Not re-ratified since September 2025. Treat as the ' +
    'last agreed baseline rather than a description of current practice.',
} as const;

/**
 * The public Snapshot page for a proposal in this space.
 *
 * Every id in this file is a real proposal anyone can open and read. Printing
 * the id alone asks a reader to take it on trust; printing the link lets them
 * check the vote, the dates and the body against what this tool says about it.
 */
export function snapshotUrl(id: string, space = RATIFIED_CHECKLIST.space): string {
  return `https://snapshot.box/#/s:${space}/proposal/${id}`;
}

/** How much weight a constitutional citation can carry. */
export type AnchorStrength =
  /** The section states the requirement directly. */
  | 'direct'
  /** The section supports part of the criterion but not all of it. */
  | 'partial'
  /** No section states the requirement. Never invent one. */
  | 'none';

export interface Anchor {
  strength: AnchorStrength;
  /**
   * Section number as printed in the constitution. Section 6 contains two
   * subsections both numbered 6.2, so `sectionTitle` is required for
   * disambiguation and citations must always render both.
   */
  section?: string;
  sectionTitle?: string;
  /** Verbatim quote from Constitution v1.2. */
  quote?: string;
  /** Why there is no anchor, required when strength is 'none'. */
  gap?: string;
  /** Nearest related section, named only to help a reader, never as the anchor. */
  nearest?: string;
  /** What the criterion asks for that the section does not cover. */
  shortfall?: string;
}

export interface ControllingProposal {
  title: string;
  snapshotId: string;
  closed: string;
  result: { for: number; against: number; abstain: number };
  /** What this proposal changed about the constitutional position. */
  effect: string;
  /**
   * 'firm' where the proposal states a replacement rule.
   * 'soft' where it changed the position without stating what replaces it,
   * or where the mandate itself is weak.
   */
  footing: 'firm' | 'soft';
  footingNote?: string;
}

export interface Criterion {
  id: number;
  /** Ratified name, unchanged. */
  name: string;
  /** Verbatim pass conditions from the ratified checklist. */
  passConditions: string[];
  /** Verbatim flag condition from the ratified checklist. */
  flagCondition: string;
  /** Constitutional anchors. More than one where the criterion spans sections. */
  anchors: Anchor[];
  /** Later passed proposals that control over the anchors above. */
  supersededBy: ControllingProposal[];
  /** Set where the ratified text itself says the flag is not disqualifying. */
  notADealbreaker?: boolean;
  /**
   * Set where the ratified checklist and the constitution genuinely disagree.
   * Recorded rather than smoothed over. The constitution governs unless a
   * later proposal says otherwise.
   */
  conflict?: string;
}

// Proposals reused across several criteria, declared once.

const GUILD_CONSOLIDATION: ControllingProposal = {
  title: 'DAO Guild Structure - Consolidation',
  snapshotId:
    '0x901e2873e7907d2ee87de5a79beae4fd602e75d053cd9fc6489e97d2547dd039',
  closed: '2025-09-20T10:23:13Z',
  result: { for: 1363897, against: 10941, abstain: 1801054 },
  effect:
    'Merged the Partnerships and Research pods into the others, reducing the 5 ' +
    'pods listed in Constitution section 3 to 3. This is why the ratified ' +
    'checklist names three working groups rather than five.',
  footing: 'soft',
  footingNote:
    'Abstain, 1,801,054, exceeded For, 1,363,897. The result carried on a ' +
    'plurality of votes cast but the mandate is thin. A future vote could ' +
    'revisit it, and the constitution was never amended to match.',
};

const BUDGET_ALLOCATION_PER_PROPOSAL: ControllingProposal = {
  title: 'Budget Allocation per Proposal',
  snapshotId:
    '0x1bd9879b46f5f04239afd74e5c1a57059b390147d56fb0d3e4b9d41fb8278a58',
  closed: '2025-09-20T10:20:37Z',
  result: { for: 2569012, against: 606880, abstain: 0 },
  effect:
    'The winning side was "Yes, proposals may request more than a quarterly ' +
    'budget disbursement". This loosens the quarterly split framework in ' +
    'Constitution section 6.2 Budgeting, so a request exceeding one quarter ' +
    'of a pod allocation is not by itself a breach.',
  footing: 'firm',
};

const TREASURY_SUSPENSION: ControllingProposal = {
  title:
    'Temporary Suspension of new treasury-funded activities of the Redbelly Community DAO Until Ecosystem Readiness',
  snapshotId:
    '0xc1db9174e4fee76b78930f235bf3f3d9898d1c4416921f2cbd291881e097ebca',
  closed: '2026-07-04T06:53:00Z',
  result: { for: 15386903, against: 0, abstain: 0 },
  effect:
    'Suspends new treasury-funded proposals, new grant programs, new bounty ' +
    'programs and new discretionary treasury spending until a future ' +
    'governance vote reopens them. Existing approved commitments continue. ' +
    'This suspends the operation of Constitution section 6.2 Budgeting for ' +
    'any new request, so it is evaluated as a gate before the 11 criteria ' +
    'rather than inside any one of them.',
  footing: 'firm',
};

const CODE_OF_CONDUCT: ControllingProposal = {
  title: 'Community Code of Conduct',
  snapshotId:
    '0x0503ba90c264f15e18cd7ca6b0757bbbdef2b00b0e3d1013f60bd17bc878c94d',
  closed: '2025-10-06T05:22:20Z',
  result: { for: 4042179, against: 0, abstain: 305575 },
  effect:
    'Criterion 10 requires consistency with the DAO code of conduct. ' +
    'Constitution v1.2 contains no code of conduct. This proposal is the ' +
    'document the criterion actually points at, and it was ratified after ' +
    'the constitution.',
  footing: 'firm',
};

const CONSULTATION_POLICY: ControllingProposal = {
  title:
    'Community Consultation Policy - Authorization of Proposal Discussions in Non-Official Channels',
  snapshotId:
    '0xee2c60094e87fa9b5e71f6895791b48bb28351c53b6d3419189fccbd8dff42cc',
  closed: '2025-12-12T13:00:00Z',
  result: { for: 15364381, against: 2040, abstain: 0 },
  effect:
    'Authorises proposal discussion in non-official channels. Criterion 11 ' +
    'requires evidence of community discussion, and Constitution section 8 ' +
    'Community Involvement covers voting power and contributor acknowledgement ' +
    'rather than proposal consultation. This policy is the controlling text ' +
    'for where consultation may take place.',
  footing: 'firm',
};

export const CRITERIA: Criterion[] = [
  {
    id: 1,
    name: 'Budget Alignment & Limits',
    passConditions: [
      'Clear separation of USDT (external spend) and RBNT (internal rewards).',
      'Request does not exceed 25% of the working group’s annual allocation.',
      'Budget proportional to workload/deliverables.',
      'Cost breakdown or justification included.',
    ],
    flagCondition:
      'Flag if missing USDT/RBNT split, excessive allocation, or weak justification.',
    anchors: [
      {
        strength: 'partial',
        section: '6.2',
        sectionTitle: 'Budgeting',
        quote:
          'Annual cap: 100,000 USDT\nRBNT: 10M total available for DAO incentives\nQuarterly splits to Pods to be published at start of each quarter\n10% minimum allocation reserved for Open Innovation',
        shortfall:
          'Section 6.2 Budgeting sets an annual cap, a total RBNT pool, quarterly ' +
          'pod splits and an Open Innovation reserve. It contains no 25% figure ' +
          'of any kind. The 25% limit in this criterion exists only in the ' +
          'ratified checklist and has no constitutional anchor.',
      },
      {
        strength: 'partial',
        section: '1',
        sectionTitle: 'Treasury Overview',
        quote:
          'Token Treasury: 10,000,000 RBNT - for incentives, rewards, grants\nStablecoin Reserve: 100,000 USDT annually - for operational costs and contributor payments',
        shortfall:
          'Distinguishes the two treasuries by function, USDT for operational ' +
          'costs and contributor payments and RBNT for incentives, rewards and ' +
          'grants. It does not frame the split as external spend versus ' +
          'internal rewards, which is the checklist wording.',
      },
    ],
    supersededBy: [BUDGET_ALLOCATION_PER_PROPOSAL, TREASURY_SUSPENSION],
  },
  {
    id: 2,
    name: 'Payment & Payout Structure',
    passConditions: [
      'Payouts milestone-based or post-completion.',
      'Upfront requests require clear justification.',
      'Milestones tied to deliverables.',
    ],
    flagCondition:
      'Flag if large upfront payments lack justification or no milestone structure provided.',
    anchors: [
      {
        strength: 'direct',
        section: '7',
        sectionTitle: 'Contributor Expectations',
        quote:
          'Tasks and grants must define:\n  Clear KPIs\n  Timeline and milestones\n  Reward structure (RBNT/USDT)',
      },
      {
        strength: 'partial',
        section: '4.1',
        sectionTitle: 'Process Overview',
        quote: 'Payment + Archive (with public record)',
        shortfall:
          'Places payment at the end of the lifecycle, after final review, which ' +
          'supports post-completion payment. It does not address partial upfront ' +
          'payments or what justification they require.',
      },
    ],
    supersededBy: [],
  },
  {
    id: 3,
    name: 'Strategic Fit',
    passConditions: [
      'Alignment with one of the three working groups (Community, Marketing, Developers/Builders).',
      'Clear link to DAO-wide goals (adoption, awareness, infrastructure growth).',
    ],
    flagCondition: 'Flag if alignment unclear or goals vague.',
    anchors: [
      {
        strength: 'partial',
        section: '3',
        sectionTitle: 'Working Groups (Pods)',
        quote:
          'Marketing Pod\nBuilder/Develop Pod\nResearcher Pod\nCommunity Pod\nPartnerships Pod',
        shortfall:
          'Names 5 pods, not the 3 working groups the criterion refers to. The ' +
          'constitutional text is out of date here and the guild consolidation ' +
          'vote is controlling.',
      },
      {
        strength: 'direct',
        section: '10',
        sectionTitle: 'Founding Principles',
        quote:
          'Alignment with Redbelly’s Infrastructure Vision\nDAO activity must reinforce Redbelly’s broader ecosystem goals: scalable, secure, and institution-grade blockchain infrastructure.',
      },
    ],
    supersededBy: [GUILD_CONSOLIDATION],
  },
  {
    id: 4,
    name: 'Feasibility & Timeline',
    passConditions: [
      'Timeline with milestones/deliverables provided.',
      'Scope achievable with proposed budget/resources.',
      'No duplication of existing efforts.',
    ],
    flagCondition:
      'Flag if timeline absent, milestones vague, or scope unrealistic.',
    anchors: [
      {
        strength: 'direct',
        section: '7',
        sectionTitle: 'Contributor Expectations',
        quote: 'Tasks and grants must define:\n  Timeline and milestones',
      },
      {
        strength: 'none',
        gap:
          'No section of Constitution v1.2 requires a proposal to show that it ' +
          'does not duplicate existing efforts. This pass condition has no ' +
          'constitutional anchor.',
        nearest:
          'Section 10 Founding Principles, "Constructive Collaboration over Silos", ' +
          'is thematically related but states a collaboration principle for pods ' +
          'rather than a duplication check on proposals.',
      },
    ],
    supersededBy: [],
  },
  {
    id: 5,
    name: 'Oversight & Accountability',
    passConditions: [
      'Independent reviewer/oversight lead nominated.',
      'Monthly updates planned in DAO channels.',
    ],
    flagCondition: 'Flag if oversight or communication plan missing.',
    anchors: [
      {
        strength: 'partial',
        section: '5',
        sectionTitle: 'Conflict of Interest Policy',
        quote:
          'Pod Leads, Council Members, and Reviewers must publicly disclose relevant relationships\nRecusal is required for any vote on self-submitted proposals\nAnonymous reviewers (if used) must submit written rationale; logs must be audit-friendly',
        shortfall:
          'Governs how reviewers must behave once they exist, including ' +
          'disclosure and recusal, which is what makes a self-nominated paid ' +
          'reviewer checkable. It does not require a per-proposal independent ' +
          'reviewer to be nominated in the first place.',
      },
      {
        strength: 'partial',
        section: '6.1',
        sectionTitle: 'Transparency and Accountability',
        quote:
          'Monthly treasury and revenue dashboards published to the community\nQuarterly reporting required by each working group\nPublic access to all proposals, vote results, and treasury activity',
        shortfall:
          'Sets working group reporting at quarterly. The criterion asks for ' +
          'monthly updates, which is stricter than the constitution requires.',
      },
    ],
    supersededBy: [],
    conflict:
      'The criterion requires monthly updates in DAO channels. Constitution ' +
      'section 6.1 Transparency and Accountability requires quarterly reporting ' +
      'by each working group, and section 6.2 Transparency repeats the quarterly ' +
      'cadence. The checklist is stricter than the constitution it enforces. ' +
      'Screening applies the checklist standard, since it is the ratified ' +
      'review instrument, and records the divergence here.',
  },
  {
    id: 6,
    name: 'Impact & Measurement',
    passConditions: [
      'KPIs or measurable success criteria included.',
      'Midpoint and final review methods defined.',
      'Long-term/community value identified.',
    ],
    flagCondition:
      'Flag if no success criteria or only short-term focus.',
    anchors: [
      {
        strength: 'direct',
        section: '7',
        sectionTitle: 'Contributor Expectations',
        quote: 'Tasks and grants must define:\n  Clear KPIs',
      },
      {
        strength: 'direct',
        section: '6.2',
        sectionTitle: 'Transparency',
        quote: 'Quarterly Pod reporting on spend, outcomes, and KPIs',
      },
      {
        strength: 'partial',
        section: '4.1',
        sectionTitle: 'Process Overview',
        quote: 'Final Review by Guild + Council',
        shortfall:
          'Establishes a final review at the end of the lifecycle. It does not ' +
          'establish a midpoint review, which the criterion also asks for.',
      },
    ],
    supersededBy: [],
  },
  {
    id: 7,
    name: 'Risk & Mitigation',
    passConditions: [
      'Key risks identified.',
      'Mitigation strategies outlined.',
    ],
    flagCondition: 'Flag if no risks or mitigation described.',
    anchors: [
      {
        strength: 'none',
        gap:
          'Constitution v1.2 contains no risk assessment or mitigation ' +
          'requirement for proposals. This criterion has no constitutional ' +
          'anchor at all.',
        nearest:
          'Section 10 Founding Principles, "Transparency and Auditability", ' +
          'requires rationale and documentation to be publicly visible, which ' +
          'is a disclosure principle rather than a risk requirement.',
      },
    ],
    supersededBy: [],
  },
  {
    id: 8,
    name: 'Co-Funding & Leverage',
    passConditions: [
      'Matching funds, sponsorships, or in-kind contributions noted.',
    ],
    flagCondition:
      'Flag if no leverage (not a dealbreaker, but relevant).',
    anchors: [
      {
        strength: 'none',
        gap:
          'Constitution v1.2 says nothing about matching funds, sponsorships or ' +
          'in-kind contributions. This criterion has no constitutional anchor.',
        nearest:
          'None. Section 6.2 Budgeting governs how the DAO spends its own funds ' +
          'and does not address third party contributions.',
      },
    ],
    supersededBy: [],
    notADealbreaker: true,
  },
  {
    id: 9,
    name: 'Contribution Equity',
    passConditions: [
      'No single contributor dominating payouts.',
      'Proposer not holding multiple paid lead roles without justification.',
    ],
    flagCondition:
      'Flag if payouts concentrated with same individual(s).',
    anchors: [
      {
        strength: 'direct',
        section: '5',
        sectionTitle: 'Conflict of Interest Policy',
        quote: 'Limit: One paid role per individual per quarter',
      },
      {
        strength: 'partial',
        section: '10',
        sectionTitle: 'Founding Principles',
        quote:
          'Merit-Based Funding and Roles\nFunding is earned through clear deliverables and value - not connections or titles. No role is permanent, and all are accountable.',
        shortfall:
          'States the principle behind the criterion. It sets no testable limit ' +
          'on payout concentration.',
      },
    ],
    supersededBy: [],
    conflict:
      'The criterion permits multiple paid lead roles where justified. ' +
      'Constitution section 5 sets a hard limit of one paid role per individual ' +
      'per quarter with no justification exception. The checklist is looser than ' +
      'the constitution it enforces. Screening reports the checklist verdict and ' +
      'raises the constitutional limit in the citation, so a reviewer sees both.',
  },
  {
    id: 10,
    name: 'Compliance & Ethical Standards',
    passConditions: [
      'No regulatory/reputational risks.',
      'Consistency with DAO’s code of conduct.',
    ],
    flagCondition:
      'Flag if unclear or non-compliant activities proposed.',
    anchors: [
      {
        strength: 'none',
        gap:
          'Constitution v1.2 contains no code of conduct and no compliance ' +
          'section. The document this criterion points at did not exist in the ' +
          'constitution when the checklist was ratified.',
        nearest:
          'Section 10 Founding Principles is the nearest constitutional relative ' +
          'and states values rather than conduct rules or compliance tests.',
      },
    ],
    supersededBy: [CODE_OF_CONDUCT],
  },
  {
    id: 11,
    name: 'Community Involvement',
    passConditions: [
      'Evidence of discussion with community members.',
      'Presence of co-authors or collaborators.',
    ],
    flagCondition: 'Flag if no signs of community input.',
    anchors: [
      {
        strength: 'partial',
        section: '4.1',
        sectionTitle: 'Process Overview',
        quote: 'Cross-Pod Feedback via Discord (3-day window)',
        shortfall:
          'Puts a feedback window in the lifecycle after submission. The ' +
          'criterion asks for evidence of discussion that has already happened, ' +
          'which is a different and earlier test.',
      },
      {
        strength: 'none',
        gap:
          'Section 8 Community Involvement shares its name with this criterion ' +
          'but covers Genesis Leader voting power and contributor ' +
          'acknowledgement through Galxe badges and archive mentions. It does ' +
          'not require community consultation before a proposal is submitted. ' +
          'The section name is a false friend and must not be cited as the anchor.',
        nearest: 'Section 8 Community Involvement, by name only.',
      },
    ],
    supersededBy: [CONSULTATION_POLICY],
  },
];

/**
 * Gate evaluated before the 11 criteria. The suspension is a policy bar on new
 * treasury-funded activity, not a judgement about proposal quality, so folding
 * it into a criterion would misreport why a proposal cannot proceed.
 */
export const TREASURY_GATE = {
  proposal: TREASURY_SUSPENSION,
  suspended: [
    'New treasury-funded proposals',
    'New grant programs',
    'New bounty programs',
    'New discretionary treasury spending',
  ],
  stillPermitted: [
    'Proposals approved by Snapshot before the suspension took effect, which continue through completion under their approved terms',
    'Treasury security',
    'Treasury transparency',
    'Governance record keeping',
  ],
  reopens:
    'Every 6 months the High Council publishes a readiness assessment and ' +
    'recommendation. Continuing or reopening is then put to a community vote.',
} as const;

/** Proposals that have overtaken constitutional text this mapping relies on. */
export const CONTROLLING_PROPOSALS: ControllingProposal[] = [
  BUDGET_ALLOCATION_PER_PROPOSAL,
  GUILD_CONSOLIDATION,
  CODE_OF_CONDUCT,
  CONSULTATION_POLICY,
  TREASURY_SUSPENSION,
  {
    title: 'Proposal Submission Limit per Round',
    snapshotId:
      '0x7a56cc468f8acb5013fe8d9afe0820affca5410c1b6c72ed57d53f77b3319bc2',
    closed: '2025-09-20T10:20:09Z',
    result: { for: 3175892, against: 0, abstain: 0 },
    effect:
      'Members may submit multiple proposals per round. Affects the section 4 ' +
      'lifecycle. No criterion depends on it, recorded so the next maintainer ' +
      'does not reintroduce a one-per-round assumption.',
    footing: 'firm',
  },
  {
    title: 'Snapshot Voting Duration',
    snapshotId:
      '0x2bc9c5588fed8c9d8b267ebcdcd115342322c9058bb9bc7a80555773b60b37db',
    closed: '2025-10-06T05:01:13Z',
    result: { for: 4042095, against: 305658, abstain: 0 },
    effect:
      'Extends the default Snapshot voting period beyond the 3 days in force at ' +
      'the time. The proposal asks leaders to specify a figure in comments and ' +
      'states no replacement number, so the new duration is undetermined.',
    footing: 'soft',
    footingNote:
      'This is the softest ground in the mapping. The old value is repealed and ' +
      'no new value is recorded in the proposal text. Anything that needs the ' +
      'voting window must confirm the current figure with the High Council ' +
      'rather than reading it from governance records.',
  },
];

export function criterionById(id: number): Criterion {
  const found = CRITERIA.find((c) => c.id === id);
  if (!found) throw new Error(`No ratified criterion with id ${id}`);
  return found;
}

/** Guards against a criterion being dropped during maintenance. */
export function assertChecklistIntegrity(): void {
  if (CRITERIA.length !== 11) {
    throw new Error(
      `The ratified checklist has 11 criteria, found ${CRITERIA.length}. ` +
        'Criteria cannot be added or removed without a governance vote.',
    );
  }
  const ids = CRITERIA.map((c) => c.id).sort((a, b) => a - b);
  const expected = Array.from({ length: 11 }, (_, i) => i + 1);
  if (ids.join(',') !== expected.join(',')) {
    throw new Error(`Criterion ids must be 1 to 11, found ${ids.join(',')}`);
  }
  for (const c of CRITERIA) {
    if (c.passConditions.length === 0) {
      throw new Error(`Criterion ${c.id} has no pass conditions`);
    }
    if (!c.flagCondition.startsWith('Flag if')) {
      throw new Error(
        `Criterion ${c.id} flag condition must be the ratified wording`,
      );
    }
    if (c.anchors.length === 0) {
      throw new Error(
        `Criterion ${c.id} has no anchor entry. Every criterion must be either ` +
          'mapped to a named section or explicitly marked as having none.',
      );
    }
    for (const a of c.anchors) {
      if (a.strength === 'none' && !a.gap) {
        throw new Error(`Criterion ${c.id} claims no anchor without stating why`);
      }
      if (a.strength !== 'none' && (!a.section || !a.sectionTitle)) {
        throw new Error(
          `Criterion ${c.id} cites a section without both number and title. ` +
            'Section 6.2 is duplicated in the constitution, so titles are required.',
        );
      }
    }
  }
}

/**
 * Counts the published pages quote, derived rather than written down.
 *
 * These numbers appear in explanatory copy on more than one page. Written as
 * prose they drift the moment an anchor changes, and a governance tool whose
 * explanation disagrees with its own rubric is worse than one that explains
 * nothing. Every page reads them from here, so the mapping is the only place a
 * count can come from.
 */

/** Criteria where no constitutional text supports the criterion at all. */
export const UNANCHORED_CRITERIA: number[] = CRITERIA.filter((c) =>
  c.anchors.some((a) => a.strength === 'none'),
).map((c) => c.id);

/**
 * Conditions with no constitutional basis that sit inside an otherwise anchored
 * criterion, held as the shortfall on a partial anchor. Criterion 1's 25% limit
 * is the case: section 6.2 Budgeting backs the idea of a budget ceiling, but
 * contains no 25% figure of any kind, so the limit itself is unanchored while
 * the criterion around it is not.
 */
export const UNANCHORED_CONDITIONS_WITHIN_ANCHORED_CRITERIA = 1;

/** Every ratified condition with no constitutional basis, however it is held. */
export const UNANCHORED_CONDITION_COUNT =
  UNANCHORED_CRITERIA.length + UNANCHORED_CONDITIONS_WITHIN_ANCHORED_CRITERIA;

/** Criteria where the ratified checklist and the constitution disagree. */
export const CONFLICTING_CRITERIA: number[] = CRITERIA.filter(
  (c) => c.conflict,
).map((c) => c.id);
