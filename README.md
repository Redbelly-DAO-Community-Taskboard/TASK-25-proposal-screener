# Redbelly Community DAO proposal pre-screening

Runs a draft proposal against the 11 criteria the DAO already ratified, before it reaches
Snapshot, and returns feedback that names the criterion and the constitutional section
behind every flag.

There is no new rubric here. The rubric is the ratified Proposal Review Checklist,
unchanged.

## What it is

A council member opens a page, fills a structured form, presses one button and gets a
cited report. Screening runs in the browser. There is no account, no database, no server
to keep up, and a draft proposal never leaves the machine it was typed on.

Live pages:

| Page | For |
| --- | --- |
| `/` | What the tool does and the three things it will not do |
| `/screen` | The form and the report |
| `/rubric` | All 11 criteria with their constitutional mapping |
| `/guide` | The operator guide, written for a council member |
| `/examples` | Two real archive proposals screened end to end |

## Provenance

Everything the tool asserts comes from one of these, and each is quoted rather than
paraphrased.

| Document | Snapshot | Closed | Result |
| --- | --- | --- | --- |
| Adoption of Standardised Proposal Evaluation Criteria | `0xf2a05384` | 2025-10-06 | 4,347,753 For to 0 Against |
| Constitution v1.2 ratification | `0xcc1ea0e6` | 2025-09-20 | 1,779,675 For to 0 Against |
| Temporary Suspension of new treasury-funded activities | `0xc1db9174` | 2026-07-04 | 15,386,903 For to 0 Against |

Full 64-character ids are in `src/lib/rubric/checklist.ts`. Constitution v1.2 is
transcribed at `research/constitution-v1.2.md`, and the 30 archive proposals it was
checked against are under `research/proposals/`.

The ratified checklist addresses pod leaders, not the High Council. That is what the text
says, and it is worth knowing before the tool is handed to a council.

## How it works

### The rubric is one file

`src/lib/rubric/checklist.ts` holds all 11 criteria, their verbatim pass and flag
conditions, their constitutional anchors and the later proposals that overtake those
anchors. The screening engine and the published rubric document both read from it. They
cannot drift, because there is nothing to drift from.

`assertChecklistIntegrity()` in that file throws if the count is not 11, if the ids are
not 1 to 11, if a flag condition has been reworded so it no longer starts with "Flag if",
if a criterion has no anchor entry, if an anchor claiming no constitutional basis does not
say why, or if an anchor gives a section number without a section title. That last rule
exists because Constitution v1.2 contains two sections both numbered 6.2, so a number
alone is ambiguous.

### The treasury gate runs before the criteria

New treasury-funded activity is suspended. That is a policy bar, not a judgement about
proposal quality, so folding it into a criterion would misstate why a proposal cannot
proceed. It is evaluated first and reported separately, and the 11 criteria are screened
anyway, so a proposer gets a full review rather than a single blocking message.

### Three outcomes, not two

- **Pass.** Every ratified condition for that criterion is met.
- **Flag.** A ratified condition is not met. The report quotes the condition.
- **Needs human review.** The engine cannot settle it, and says exactly what a human must
  check.

The third tier is not hedging. Several ratified conditions turn on judgement no rule can
settle, such as whether goals are vague. Others depend on a figure the DAO does not
publish, such as the working group annual allocation the 25% limit runs against. Asserting
a verdict in either case would be a guess dressed as a result.

Criteria 3, 4 and 10 can never return pass, because each contains an irreducibly
qualitative condition. That is intended, and a test pins it.

### Every figure the engine tests against is one the DAO ratified

There is one, criterion 1's 25% share of a working group's annual allocation, and it is
written in the ratified checklist itself. `UNRATIFIED_THRESHOLDS` in
`src/lib/rubric/engine.ts` is empty, and a test keeps it empty.

Earlier versions also carried a 25% figure for what counts as a "large" upfront payment and
a 50% figure for what counts as a "dominating" share of payouts. The ratified text uses both
words and never states a number, so those figures were ours, and either could raise a flag
on its own. A tool whose purpose is checking proposals against ratified rules must not be
able to fail one on a number the DAO never voted for. Both are gone.

Criterion 2 lost nothing. Its ratified pass condition is "Upfront requests require clear
justification", with no size qualifier, so an unjustified upfront request breaches ratified
text whatever its size and the threshold was never carrying the decision.

Criterion 9 genuinely cannot be settled in general. One case can: where no contributor takes
more than an equal share, nobody takes more than anyone else, so nobody dominates on any
reading of the word, and that passes. Every other split is reported as arithmetic and sent
to a human, because any line drawn between them would be this tool's opinion deciding a
governance outcome.

### What the mapping found

Recorded in full at `research/FINDINGS.md` and rendered on `/rubric`.

- **Five anchors record that no constitutional text supports the criterion.** They sit on
  criteria 4, 7, 8, 10 and 11, and each states in a `gap` field why, rather than pointing
  at a section that merely sounds close. Criterion 1's 25% limit is a sixth condition with
  no constitutional basis, held as the shortfall on a partial anchor instead: section 6.2
  Budgeting contains no 25% figure of any kind.
- **Criterion 10's real anchor is a proposal, not the constitution.** Constitution v1.2
  contains no code of conduct. The Community Code of Conduct passed 6 October 2025 and is
  the document the criterion points at.
- **Section 8 "Community Involvement" is a false friend for criterion 11.** It shares the
  name but covers Genesis Leader voting power and Galxe badges, not pre-submission
  consultation. It is explicitly not cited as the anchor.
- **Two sections are numbered 6.2.** Every citation carries the title as well as the
  number.
- **Two criteria conflict with the constitution.** Criterion 5 requires monthly updates
  where sections 6.1 and 6.2 Transparency set quarterly, so the checklist is stricter.
  Criterion 9 permits multiple paid roles where justified, where section 5 sets a hard
  limit of one paid role per individual per quarter with no exception, so the checklist is
  looser. Both are reported to the reviewer rather than silently resolved.
- **Seven passed proposals overtake part of the constitution** as it applies to this
  checklist, and each is treated as controlling over the text it displaces. Five are
  attached to the criteria whose backing they change. The other two, the submission limit
  per round and the Snapshot voting duration, change the process around the checklist
  without changing what any criterion requires, so they are listed on `/rubric` without
  being tied to a criterion. Each carries a footing of firm or soft. The guild
  consolidation vote is marked soft because abstentions, 1,801,054, exceeded the For side,
  1,363,897.

## Running it

Requires Node 20 or later.

```
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
npm run typecheck
npm run examples   # regenerates docs/examples/*.txt
npm run build
```

## Verification

`npm test` covers:

- Every ratified pass condition, on a submission that meets it and one that breaches it,
  so no condition is dead code.
- All 3 treasury gate branches.
- The full verdict vector for both worked examples, as a regression lock.
- Checklist integrity, including that every Snapshot id is a full 64 characters and never
  a truncated prefix.
- Brand voice. The suite fails if any string the tool can print contains an em dash, an en
  dash or an emoji, quoted source text included. Quotations keep their wording exactly and
  have only their dashes set as plain hyphens, which `QUOTE_NOTE` discloses wherever a
  quotation appears. A further test pins the wording of a quotation character for
  character, so the substitution cannot drift into paraphrase.

## Worked examples

Two proposals from the archive, transcribed from their published bodies. Every field that
required a reading decision rather than a direct transcription carries a comment in
`src/lib/examples/finpr.ts` saying which sentence it came from.

The honest finding is on `/examples`: the proposal that failed scores better on the
ratified checklist than the proposal that passed. The failure was caused by the treasury
suspension, which ran concurrently and closed 12 minutes earlier, not by proposal quality.
The rubric does not predict that outcome, and claiming otherwise would misrepresent what
the tool does.

## Maintaining it

The criterion-to-constitution mapping will go stale as the DAO votes. `docs/maintenance.md`
covers how to update it.

## Layout

```
src/lib/rubric/checklist.ts    the 11 criteria and their mapping, single source of truth
src/lib/rubric/engine.ts       one check function per criterion, plus the treasury gate
src/lib/rubric/submission.ts   the structured shape a proposal is collected in
src/lib/rubric/report.ts       plain text renderer, shared by the page and the CLI
src/lib/rubric/engine.test.ts  the test suite
src/lib/examples/finpr.ts      the two archive proposals
src/app/                       the pages
src/components/                the form, the report view, the brand primitives
research/                      constitution, 30 archive proposals, findings writeup
docs/examples/                 generated reports
```
