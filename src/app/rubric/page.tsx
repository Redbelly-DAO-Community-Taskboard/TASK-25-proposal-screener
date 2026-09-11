import type { Metadata } from 'next';

import { Shell } from '@/components/Shell';
import { VerifyOnSnapshot } from '@/components/ui';
import {
  CONSTITUTION,
  CONTROLLING_PROPOSALS,
  CRITERIA,
  QUOTE_NOTE,
  RATIFIED_CHECKLIST,
  TREASURY_GATE,
  type Anchor,
  type ControllingProposal,
} from '@/lib/rubric/checklist';

export const metadata: Metadata = {
  title: 'The rubric | Redbelly Community DAO',
  description:
    'The 11 ratified Proposal Review Checklist criteria, each with its pass condition, its ratified flag condition, and the Constitution v1.2 section it enforces.',
};

/**
 * The rubric document is generated from the same module the engine screens
 * against. It cannot drift from the tool, because there is nothing to drift
 * from: one file feeds both.
 */

const STRENGTH_LABEL: Record<Anchor['strength'], string> = {
  direct: 'DIRECT ANCHOR',
  partial: 'PARTIAL ANCHOR',
  none: 'NO ANCHOR',
};

const STRENGTH_COLOUR: Record<Anchor['strength'], string> = {
  direct: 'text-ok',
  partial: 'text-warn',
  none: 'text-primary',
};

function AnchorBlock({ a }: { a: Anchor }) {
  return (
    <div className="border-l-2 border-outline-variant pl-4">
      <p className={`label-mono ${STRENGTH_COLOUR[a.strength]}`}>
        {STRENGTH_LABEL[a.strength]}
        {a.section ? ` / SECTION ${a.section}` : ''}
      </p>
      {a.sectionTitle ? (
        <p className="text-[15px] font-semibold text-ink mt-1">
          Section {a.section} {a.sectionTitle}
        </p>
      ) : null}
      {a.quote ? (
        <blockquote className="text-[15px] text-ink-secondary measure mt-2 whitespace-pre-line">
          &quot;{a.quote}&quot;
        </blockquote>
      ) : null}
      {a.shortfall ? (
        <p className="text-[15px] text-ink-muted measure mt-2">
          <span className="font-semibold text-ink">What it does not cover: </span>
          {a.shortfall}
        </p>
      ) : null}
      {a.gap ? (
        <p className="text-[15px] text-ink-muted measure mt-2">{a.gap}</p>
      ) : null}
      {a.nearest ? (
        <p className="text-[15px] text-ink-muted measure mt-2">
          <span className="font-semibold text-ink">Nearest related text: </span>
          {a.nearest}
        </p>
      ) : null}
    </div>
  );
}

function ProposalBlock({ p }: { p: ControllingProposal }) {
  return (
    <div className="border-l-2 border-[var(--rb-brand)] pl-4">
      <p className="text-[15px] font-semibold text-ink">{p.title}</p>
      <p className="label-mono text-ink-muted mt-1">
        {p.snapshotId.slice(0, 10)} / CLOSED {p.closed.slice(0, 10)} /{' '}
        {p.result.for.toLocaleString()} FOR / {p.result.against.toLocaleString()} AGAINST
      </p>
      <p className="text-[15px] text-ink-secondary measure mt-2">{p.effect}</p>
      <p className="text-[15px] text-ink-muted measure mt-2">
        <span className="font-semibold text-ink">Footing: </span>
        {p.footing}.{p.footingNote ? ` ${p.footingNote}` : ''}
      </p>
      <p className="mt-2">
        <VerifyOnSnapshot id={p.snapshotId} label="READ THE VOTE" />
      </p>
    </div>
  );
}

export default function RubricPage() {
  return (
    <Shell>
      <div className="flex flex-col gap-12">
        <header>
          <p className="label-caps text-ink-muted">The rubric</p>
          <h1 className="headline-xl text-ink mt-2">Proposal Review Checklist</h1>
          <p className="body-lg text-ink-secondary measure mt-4">
            The 11 ratified criteria, unchanged. Each carries its pass condition, the flag
            condition that fires when it is not met, and the Constitution v1.2 section it
            enforces. Where a criterion has no anchor, that is stated rather than covered
            over.
          </p>
          <div className="mt-6 rounded-[8px] border border-outline-variant bg-container px-6 py-5">
            <p className="label-caps text-ink-muted">Provenance</p>
            <p className="text-[15px] text-ink-secondary measure mt-2">
              {RATIFIED_CHECKLIST.title}, ratified by Snapshot on{' '}
              {RATIFIED_CHECKLIST.closed.slice(0, 10)},{' '}
              {RATIFIED_CHECKLIST.result.for.toLocaleString()} For to{' '}
              {RATIFIED_CHECKLIST.result.against.toLocaleString()} Against. The ratified
              text addresses {RATIFIED_CHECKLIST.adoptedBy.toLowerCase()}.
            </p>
            <p className="label-mono text-ink-muted mt-3 break-all">
              {RATIFIED_CHECKLIST.snapshotId}
            </p>
            <p className="mt-2">
              <VerifyOnSnapshot
                id={RATIFIED_CHECKLIST.snapshotId}
                label="READ THE RATIFIED CHECKLIST ON SNAPSHOT"
              />
            </p>
            <p className="text-[15px] text-ink-secondary measure mt-4">
              {CONSTITUTION.title} {CONSTITUTION.version}. {CONSTITUTION.note}
            </p>
            <p className="label-mono text-ink-muted mt-3 break-all">
              {CONSTITUTION.snapshotId}
            </p>
            <p className="mt-2">
              <VerifyOnSnapshot
                id={CONSTITUTION.snapshotId}
                label="READ THE RATIFICATION VOTE ON SNAPSHOT"
              />
            </p>
            <p className="text-[14px] text-ink-muted measure mt-4">{QUOTE_NOTE}</p>
          </div>
        </header>

        <section className="rounded-[8px] border border-[var(--rb-brand)] bg-container px-6 py-5">
          <p className="label-caps text-ink-muted">Checked before the 11 criteria</p>
          <h2 className="headline-lg text-ink mt-2">The treasury gate</h2>
          <p className="text-[15px] text-ink-secondary measure mt-3">
            {TREASURY_GATE.proposal.title}, closed{' '}
            {TREASURY_GATE.proposal.closed.slice(0, 10)},{' '}
            {TREASURY_GATE.proposal.result.for.toLocaleString()} For to{' '}
            {TREASURY_GATE.proposal.result.against.toLocaleString()} Against. It is
            evaluated before the criteria because it is a policy bar, not a judgement
            about proposal quality. Reporting it as a criterion failure would misstate why
            a proposal cannot proceed.
          </p>
          <div className="grid grid-cols-1 gap-6 mt-5 sm:grid-cols-2">
            <div>
              <p className="label-caps text-ink-muted">Suspended</p>
              <ul className="mt-2 flex flex-col gap-1">
                {TREASURY_GATE.suspended.map((x) => (
                  <li key={x} className="text-[15px] text-ink-secondary">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label-caps text-ink-muted">Still permitted</p>
              <ul className="mt-2 flex flex-col gap-1">
                {TREASURY_GATE.stillPermitted.map((x) => (
                  <li key={x} className="text-[15px] text-ink-secondary measure">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-[15px] text-ink-secondary measure mt-5">
            <span className="font-semibold text-ink">Reopening: </span>
            {TREASURY_GATE.reopens}
          </p>
        </section>

        <div className="flex flex-col gap-8">
          {CRITERIA.map((c) => (
            <details
              key={c.id}
              className="rb-criterion rounded-[8px] border border-outline-variant bg-surface-slate"
            >
              {/*
                Collapsed by default. All 11 criteria expanded at once is several
                thousand words before the reader has chosen anything to read, so
                the list is the page and the detail is one click away. The summary
                still carries the marks that would make someone open it.
              */}
              <summary className="cursor-pointer list-none px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="label-mono text-ink-muted">
                      CRITERION {String(c.id).padStart(2, '0')}
                    </p>
                    <h2 className="text-[22px] font-semibold text-ink mt-1">{c.name}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {c.anchors.some((a) => a.strength === 'none') ? (
                        <span className="label-mono text-primary">NO ANCHOR</span>
                      ) : null}
                      {c.conflict ? (
                        <span className="label-mono text-warn">CONFLICT</span>
                      ) : null}
                      {c.supersededBy.length > 0 ? (
                        <span className="label-mono text-ink-muted">
                          {c.supersededBy.length} CONTROLLING
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <svg
                    className="rb-chevron mt-1 shrink-0 text-ink-muted"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </summary>
              <div className="border-t border-outline-variant px-6 py-6 flex flex-col gap-6">
                <div>
                  <p className="label-caps text-ink-muted">Pass condition</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {c.passConditions.map((p) => (
                      <li key={p} className="text-[15px] text-ink-secondary measure">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="label-caps text-ink-muted">Ratified flag condition</p>
                  <p className="text-[15px] text-ink-secondary measure mt-2">
                    &quot;{c.flagCondition}&quot;
                    {c.notADealbreaker
                      ? ' The ratified text marks this flag as relevant but not disqualifying.'
                      : ''}
                  </p>
                </div>

                <div>
                  <p className="label-caps text-ink-muted">
                    What it enforces in Constitution {CONSTITUTION.version}
                  </p>
                  <div className="mt-3 flex flex-col gap-5">
                    {c.anchors.map((a, i) => (
                      <AnchorBlock key={i} a={a} />
                    ))}
                  </div>
                </div>

                {c.supersededBy.length > 0 ? (
                  <div>
                    <p className="label-caps text-ink-muted">
                      Overtaken by a later passed proposal
                    </p>
                    <div className="mt-3 flex flex-col gap-5">
                      {c.supersededBy.map((p) => (
                        <ProposalBlock key={p.snapshotId} p={p} />
                      ))}
                    </div>
                  </div>
                ) : null}

                {c.conflict ? (
                  <div className="rounded-[4px] border border-outline-variant bg-container-lowest px-4 py-3">
                    <p className="label-caps text-ink-muted">Known conflict</p>
                    <p className="text-[15px] text-ink-secondary measure mt-2">
                      {c.conflict}
                    </p>
                  </div>
                ) : null}
              </div>
            </details>
          ))}
        </div>

        <section>
          <h2 className="headline-lg text-ink">Every controlling proposal, in one place</h2>
          <p className="text-[15px] text-ink-secondary measure mt-3">
            {CONTROLLING_PROPOSALS.length} passed proposals overtake part of Constitution
            v1.2 as it applies to this checklist, and each controls over the text it
            displaces.
          </p>
          <div className="mt-6 flex flex-col gap-6">
            {CONTROLLING_PROPOSALS.map((p) => (
              <ProposalBlock key={p.snapshotId} p={p} />
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
