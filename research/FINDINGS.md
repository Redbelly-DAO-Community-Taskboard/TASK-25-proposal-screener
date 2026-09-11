# Research findings: proposal pre-screening automation

Status: research record, written 30 July 2026 while the mapping was being derived, and superseded in two places by the implementation it fed into. Both are corrected inline below and marked as corrections rather than edited away, because how a conclusion changed is part of the provenance.

The brand kit was outstanding when this was written and is no longer. It was supplied directly, and the tokens, type scale, logo rules and asset dimensions are applied throughout, with the extraction scripts and untouched logo sources under `brand/`.

Where this document and the code disagree, the code governs. `../src/lib/rubric/checklist.ts` is the single source of truth for the mapping, and `../README.md` describes its current state.

## Sources secured

1. Ratified checklist, full body, retrieved from Snapshot GraphQL API. Passed 4,347,753 For, 0 Against, 0 Abstain. Opened 3 Oct 2025 05:07 UTC, closed 6 Oct 2025 05:07 UTC. All 11 criteria and all 11 flag conditions available verbatim, so the rubric can quote rather than restate.
2. Constitution v1.2, full text, 7,122 characters, extracted from the Notion page linked in the ratification vote (`26cf342e-202f-80b8-af8e-e64999397095`). Saved to `constitution-v1.2.md`.
3. All 30 archive proposals with bodies, authors, and vote tallies. Saved to `proposals/`.

Constitution ratification vote opened 17 Sep 2025 07:22 UTC. The three policy polls that follow it opened 17 Sep 2025 10:20 to 10:23 UTC, so they postdate it by 3 hours and close 3 hours after it closes. They are later instruments.

## Finding 1: the checklist is addressed to pod leaders, not council

The ratified text says "Pod leaders agree to adopt the following Proposal Review Checklist" and "Pod leaders are asked to ratify this checklist". The task requests a council-operable flow. Both are satisfiable, but the rubric document must not silently relabel the actor.

## Finding 2: section 6.2 is duplicated in the ratified constitution

Section 6 contains two subsections both numbered 6.2, "6.2 Budgeting" and "6.2 Transparency". Any mapping that cites "section 6.2" is ambiguous. Every citation in the deliverable must disambiguate by title, not number alone.

## Finding 3: criterion 1's 25 percent limit has no constitutional anchor

The checklist requires that a request "does not exceed 25% of the working group's annual allocation". Constitution 6.2 Budgeting contains no 25 percent figure. It sets an annual cap of 100,000 USDT, 10,000,000 RBNT total for incentives, quarterly splits to pods published at the start of each quarter, and a 10 percent minimum reserved for Open Innovation. The 25 percent rule exists only in the checklist. It must be marked as having no constitutional anchor rather than pinned to 6.2.

The USDT and RBNT separation is a partial anchor. Constitution section 1 and 6.2 Budgeting distinguish the two treasuries by function, USDT for operational costs and contributor payments and RBNT for incentives, rewards and grants, but neither frames the split as external spend versus internal rewards.

## Finding 4: five proposals have overtaken the text the mapping relies on

- `Budget Allocation per Proposal`, 17 Sep 2025, passed 2,569,012 to 606,880. The winning side was "proposals may request more than a quarterly budget disbursement". This loosens the quarterly framework in 6.2 Budgeting and is controlling over it.
- `DAO Guild Structure - Consolidation`, 17 Sep 2025, passed 1,363,897 For to 10,941 Against with 1,801,054 Abstain. Merged Partnerships and Research into the others, reducing 5 pods to 3. Constitution section 3 still lists 5 pods. This is why criterion 3 names three working groups. Soft ground: Abstain exceeded For, so the mandate is thin.
- `Proposal Submission Limit per Round`, 17 Sep 2025, passed 3,175,892 to 0. Members may submit multiple proposals per round. Affects the section 4 lifecycle.
- `Snapshot Voting Duration`, 3 Oct 2025, passed 4,042,095 to 305,658. Extends the voting window beyond 3 days but does not state the new number, it asks leaders to specify a figure in comments. The replacement value is undetermined. This is the softest ground in the mapping and must be flagged as such.
- `Community Code of Conduct`, 3 Oct 2025, passed 4,042,179 to 0. Criterion 10 requires "consistency with DAO's code of conduct". The constitution has no code of conduct section. This proposal is criterion 10's actual anchor, and it was ratified 15 minutes after the evaluation criteria vote opened. Constitution section 10 Founding Principles is the nearest constitutional relative, not the anchor.
- `Community Consultation Policy`, 5 Dec 2025, passed 15,364,381 to 2,040. Authorises proposal discussion in non-official channels. Criterion 11 requires evidence of community discussion, and constitution section 8 Community Involvement is about voting power and badges rather than proposal consultation. This policy is the controlling text for criterion 11.

## Finding 5: a unanimous treasury freeze is currently in force

`Temporary Suspension of new treasury-funded activities`, 29 Jun 2026, passed 15,386,903 For, 0 Against, 0 Abstain. It suspends new treasury-funded proposals, new grant programs, new bounty programs, and new discretionary treasury spending. Existing approved commitments continue. The High Council publishes a readiness assessment every 6 months and reopening requires a community vote.

Design consequence: the budget criteria now sit behind a gate. Any new treasury-funded proposal is barred outright before criterion 1 is reached. The pre-screening flow should evaluate this as a gate before the 11 criteria rather than folding it into one of them, because it is a policy bar, not a quality judgement. This is the sharpest case of a later proposal overriding the constitution, since it suspends the operation of the whole of section 6.2 Budgeting.

## Criteria with no clean constitutional anchor

Three, plus two partials.

- Criterion 7, Risk and Mitigation. No anchor. The constitution contains no risk assessment requirement.
- Criterion 8, Co-Funding and Leverage. No anchor. The constitution says nothing about matching funds, sponsorships or in-kind contributions. The checklist itself marks this one as not a dealbreaker.
- Criterion 1's 25 percent limit. No anchor, per finding 3.
- Criterion 5's "independent reviewer nominated" requirement. Partial. Constitution section 5 requires anonymous reviewers to submit written rationale with audit-friendly logs, and 6.1 requires quarterly working group reporting, but nothing requires a per-proposal independent reviewer. Criterion 5's monthly update requirement also conflicts with 6.1, which sets reporting at quarterly.
- Criterion 4's "no duplication of existing efforts". No anchor.

## Conflict between checklist and constitution on criterion 9

Criterion 9 flags a proposer "holding multiple paid lead roles without justification". Constitution section 5 sets a hard limit of one paid role per individual per quarter with no justification escape. The checklist is looser than the constitution it enforces. The rubric must record this as a conflict rather than smoothing it over, and the constitution governs unless a later proposal says otherwise.

## Worked example pair, verified

### Passed: `Marketing press only : FINPR Agency`, 1 Mar 2026

10,947,839 For, 0 Against, 1,868,908 Abstain. Author `0xA4811219b12CE85B377Cd8197b929e98d1C3CdE1`, Rainbowmagician. Requests 2,890 USDT plus 50,000 RBNT. The proposal is written section by section against the 11 criteria, which is the likely reason it drew zero Against votes.

Expected pre-screening result: passes most criteria, flags criterion 2. The payment terms state "USDT: 70% upfront in usdt, 30% after FINPR completes all deliverables" and then state "No upfront payments." That is a direct self-contradiction, and 70 percent upfront is a large upfront payment with no justification supplied. Criterion 2's ratified flag condition is "Flag if large upfront payments lack justification or no milestone structure provided", so the flag is grounded in the ratified text and in the proposal's own words. This demonstrates the tool adding value on a proposal that passed.

### Failed: `Continuation of Long-Term Marketing & PR Campaign with FINPR`, 29 Jun 2026

0 For, 9,849,764 Against, 3,953,219 Abstain. Same author. Requests 12,650 USDT plus 2,400 USD equivalent in RBNT.

Honest result, and the most important analytical point in the submission: the rubric does not predict this failure on quality grounds. The continuation is better aligned to the checklist than the proposal that passed. It carries an explicit USDT and RBNT split, fully milestone-based payments with no upfront component, named working group alignment, a three month timeline with per-month deliverables, KPIs with midpoint and final reviews, a risk and mitigation table, and a compliance section. It even cites the evaluation framework by name.

Of the three criteria this analysis singled out, pre-screening flags two and sends the third to review, all defensible from the ratified text:

- Criterion 5, Oversight and Accountability. The proposer nominates themself as oversight LEAD and is paid 2,400 USD equivalent in RBNT for the role. A self-nominated paid reviewer is not an independent reviewer. Anchored to Constitution section 5, which requires disclosure of relevant relationships and recusal on self-submitted proposals.
- Criterion 9, Contribution Equity. **Corrected. The implementation returns review here, not flag, and the implementation is right.** The reasoning below rests on Constitution section 5's limit of one paid role per individual per quarter, but the March payment fell in Q1 2026 and this proposal falls in Q2, so two payments in two quarters do not breach that limit. The concentration point in criterion 9's own flag condition, "payouts concentrated with same individual(s)", is not quarter-bounded and may well stand, but it cannot be established from one submission. A proposal does not carry the archive inside it. The engine therefore routes criterion 9 to review and asks the reviewer to check the Snapshot archive for other proposals paying the same individual in the same period. Asserting the flag would have been a cross-proposal judgement dressed up as a rule the submission supports.

  The original observation stands as fact and is what the reviewer is pointed at: the proposal states Rainbow Magician "does not hold any other paid DAO role", while the same individual received 50,000 RBNT as coordinator on the March FINPR proposal and authored both.
- Criterion 11, Community Involvement. The proposal says it "will be discussed publicly on Discord prior to Snapshot submission", in future tense. The ratified criterion requires "evidence of discussion with community members". Stated intent is not evidence.

Criterion 8 also flags for no co-funding, which the ratified text marks as not a dealbreaker. This list is the research-time reading of the three criteria that mattered most to the argument, not the full verdict vector. The engine's actual output on this proposal is 2 passed, 5 flagged and 4 sent to review, and the generated report at `../docs/examples/finpr-continuation-june-2026-failed.txt` is the authoritative record.

The actual cause of the failure was a policy decision, not proposal quality. The same author submitted the treasury freeze the same day, 29 Jun 2026, and it passed unanimously while this proposal drew zero For votes. The rubric contains no criterion for treasury preservation policy, so it could not have predicted the outcome. The submission should state this plainly and present the freeze gate as the mechanism that would surface it today. Claiming the rubric predicted the failure would be false.

## Open dependency, since resolved

Brand kit at `/brand` on the task board. The DAO dashboard at `dao.redbelly.network` is a Next.js client-rendered shell that returns 1,686 bytes with no server-rendered content and no discoverable brand route, so the tokens, type scale, logo rules and asset dimensions have to come from the user or from an authenticated session. Written voice rules are already known from the task spec and are being applied.

Resolved. The kit was supplied directly rather than fetched. Its tokens are transcribed into `../src/app/globals.css` as the only source of colour, the type scale and logo rules are applied across every page, and the two logo variants sit in `../public/` with the untouched sources and extraction scripts under `brand/`. Nothing in the kit was inferred or approximated.
