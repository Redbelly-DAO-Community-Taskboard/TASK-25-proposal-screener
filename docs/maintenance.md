# Maintaining the criterion-to-constitution mapping

For whoever maintains this repository. A council member does not need this page. Their
version is the operator guide at `/guide`.

The mapping goes stale every time the DAO votes. This is how to move it forward without
breaking the guarantee the tool rests on, which is that every citation it prints can be
traced to a document someone actually ratified.

## The one rule

**Never write a citation you have not read in the source.**

Not a section you remember, not a Snapshot id you reconstructed from a truncated prefix,
not a vote count you estimated from a screenshot. If you cannot open the document and see
the words, the anchor is `strength: 'none'` and you write down why. A gap stated honestly
is worth more than a citation that turns out to be invented, because the second one
destroys trust in all the others.

## Everything lives in one file

`src/lib/rubric/checklist.ts`. The engine reads it, the `/rubric` page renders it, the
tests check it. There is no second copy to keep in sync.

Do not edit `src/lib/rubric/engine.ts` to change what a criterion means. The engine holds
how a condition is tested, never what the condition is.

## The shapes you will edit

### An anchor

One constitutional section that a criterion enforces. A criterion can have several.

```ts
{
  strength: 'direct' | 'partial' | 'none',
  section: '6.1',                    // as printed in the constitution
  sectionTitle: 'Transparency and Accountability',
  quote: '...',                      // verbatim, punctuation included
  shortfall: '...',                  // required on 'partial'
  gap: '...',                        // required on 'none'
  nearest: '...',                    // optional, never treated as the anchor
}
```

Pick the strength honestly.

- `direct` when the section states the requirement. Not when it gestures at it.
- `partial` when the section supports part of the criterion. Write in `shortfall` what the
  criterion asks for that the section does not cover. That text is printed to the
  reviewer, so it has to be specific.
- `none` when no section states it. Write in `gap` why. If a section is thematically
  related, put it in `nearest`, which prints as related text and is never cited as the
  basis.

`sectionTitle` is required on `direct` and `partial`, and the integrity assertion enforces
it. Constitution v1.2 contains **two sections both numbered 6.2**, 6.2 Budgeting and 6.2
Transparency. A citation of "section 6.2" alone is ambiguous and will fail the test.

Quotes preserve the wording of the source exactly, and its punctuation too, including the
curly apostrophes in the ratified originals. One change is made, and it is disclosed to
the reader rather than made quietly: em dashes in the source are set as plain hyphens,
because the board voice rule against them is absolute and covers quoted material. No word,
figure or other mark is altered. `QUOTE_NOTE` states the substitution wherever quotations
are printed, and the untouched source stays at `research/constitution-v1.2.md`.

Do not tidy a quotation in any other way. The brand voice test scans quotations along with
everything else, so a stray em dash in a new quote will fail the suite, and a second test
pins one quotation character for character to catch a substitution that drifts into
paraphrase.

### A controlling proposal

A later passed proposal that overtakes the constitutional text. The proposal governs.

```ts
{
  title: '...',                      // as it appears on Snapshot
  snapshotId: '0x...',               // full 64 characters, never a prefix
  closed: '2026-07-04T06:53:00Z',    // exact, from the API
  result: { for: 0, against: 0, abstain: 0 },
  effect: '...',                     // what it changed about the constitutional position
  footing: 'firm' | 'soft',
  footingNote: '...',                // required in practice on 'soft'
}
```

`footing` is a judgement about how much weight the proposal can carry, and it is printed
to the reviewer.

- `firm` where the proposal states a replacement rule and the mandate is clear.
- `soft` where it changed the position without saying what replaces it, or where the
  mandate itself is thin. The guild consolidation vote is `soft` because abstentions,
  1,801,054, exceeded the For side, 1,363,897, so it carried on a plurality of votes cast.
  Say that in `footingNote`. A reviewer who is about to lean on a rule deserves to know
  the vote behind it was weak.

## Adding a proposal that changes the mapping

### 1. Get the real record

Do not work from a forum summary or a Discord message. Query the API.

```bash
curl -s https://hub.snapshot.org/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ proposals(where:{space:\"rbnt.eth\"}, first:30, orderBy:\"created\", orderDirection:desc) { id title state created start end scores scores_total choices } }"}'
```

Take the full `id`, the exact `end` timestamp, and the `scores` against `choices` in
order. Read the body. A proposal that sounds like it changes a rule often does not, and
one that sounds procedural sometimes does.

### 2. Decide what it actually displaces

Three questions, in order.

1. Which criterion does it touch? If none, it is archive context and belongs in
   `research/FINDINGS.md`, not in the mapping.
2. Does it replace a constitutional section, or sit alongside it? Replacement makes it
   controlling. Sitting alongside makes it context.
3. Does it state what the new rule is? If not, the footing is `soft` no matter how large
   the majority.

### 3. Write it in

Add the `ControllingProposal` to the `supersededBy` array of every criterion it touches.
Reuse an existing const if the proposal touches several, the way `TREASURY_SUSPENSION`
already does. Do not copy the object.

If it changes what a criterion requires rather than what backs it, that is a different and
larger job. See "When the checklist itself is amended" below.

### 4. Prove it

```bash
npm test
npm run typecheck
npm run examples
```

`npm run examples` regenerates the two reports. Read the diff. If a citation changed in a
worked example, that is the mapping change showing up in output, and you should be able to
explain it in one sentence. If it changed somewhere you did not expect, you have touched a
criterion you did not mean to.

Then add a case to `src/lib/rubric/engine.test.ts` asserting that the new citation appears
where it should. An untested mapping entry is one refactor away from silently vanishing.

## When the checklist itself is amended

A new Snapshot vote can change the criteria. This is the case the integrity assertion
exists for.

1. Get the ratified body from Snapshot and update `RATIFIED_CHECKLIST` with the new id,
   close date and result.
2. Update the affected `Criterion` entries. `passConditions` and `flagCondition` are
   **verbatim**. Do not improve the grammar, do not expand an abbreviation, do not fix a
   typo. The flag condition must still begin with "Flag if" or the assertion throws, and
   if the new ratified text does not, change the assertion and say so in a comment rather
   than editing the quotation.
3. Add or remove a check function in `engine.ts`. `screen()` throws if the number of
   checks does not equal the number of criteria, so a criterion cannot be added to the
   rubric and quietly left unscreened.
4. Re-run the whole verification list above. Expect the worked example regression tests to
   fail, because the verdicts genuinely changed. Update the expected vectors and read the
   new reports end to end before you accept them.

Renumbering is the dangerous case. `criterionById()` looks up by id, so changing an id
silently repoints a check function at a different criterion. If the DAO renumbers, change
one criterion at a time and run the tests between each.

## Adding a figure the engine tests against

`THRESHOLDS` in `engine.ts` holds one number, `maxShareOfAnnualAllocationPercent`. It is 25%
and it is written in the ratified checklist. Changing it means the tool is no longer
screening against what the DAO agreed, so do not.

`UNRATIFIED_THRESHOLDS` is empty and a test asserts it stays empty. Read that test before
adding anything to it.

**A figure the DAO has not ratified must never be the sole cause of a flag.** A flag asserts
that a ratified rule was broken, and a number nobody voted for cannot establish that. This
was learned the hard way: the engine used to call 25% the line for a "large" upfront payment
and 50% the line for a "dominating" share of payouts, and both could flag a proposal on
their own. Neither figure appears anywhere in the ratified text.

If you find yourself needing a number the ratified text does not give, the answer is almost
always a review question that states the arithmetic and asks a human to judge it. That is
what criterion 9 now does with payout splits. Before reaching for a threshold, check whether
a ratified pass condition already covers the case without one, which is what criterion 2
turned out to have all along.

If the DAO ever ratifies a figure for "large" or "dominating", add it to `THRESHOLDS` with a
comment naming the proposal that ratified it, and it may then decide a flag.

## Refreshing the archive

`research/proposals/` holds 30 proposals with their headers and bodies, and
`research/constitution-v1.2.md` holds the constitution as transcribed from the Notion page
linked by the ratification proposal.

The constitution is still v1.2 and has not been re-ratified since September 2025. If it is
amended, re-transcribe it rather than patching the file by hand, then re-read every
`quote` in `checklist.ts` against the new text. A section can keep its number and change
its words.

## Review checklist before merging a mapping change

- Every new Snapshot id is 64 hex characters, copied from the API, not reconstructed.
- Every new quote was copied from the source document with its punctuation intact.
- Every `partial` anchor states its shortfall, and every `none` anchor states its gap.
- Every anchor with a section number also has a section title.
- Every `soft` footing says why it is soft.
- `npm test` and `npm run typecheck` pass.
- `npm run examples` produces a diff you can explain in one sentence.
- No string the tool can print contains an em dash, an en dash or an emoji, quotations
  included. The test catches this, but catching it yourself is faster.
