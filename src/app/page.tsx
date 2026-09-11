import Link from 'next/link';

import { Shell } from '@/components/Shell';
import { Button, Status } from '@/components/ui';
import {
  CRITERIA,
  TREASURY_GATE,
  UNANCHORED_CONDITION_COUNT,
} from '@/lib/rubric/checklist';

const STEPS = [
  ['Fill the form', 'Thirteen sections. Every field is there because a ratified condition needs it.'],
  ['Press one button', 'The treasury gate runs, then all 11 criteria. It takes under a second.'],
  ['Send the report back', 'Every flag names its criterion and the constitutional section behind it.'],
];

export default function Home() {
  return (
    <Shell>
      <div className="flex flex-col gap-20">
        <section>
          <p className="label-caps text-ink-muted">Redbelly Community DAO</p>
          <h1 className="headline-hero text-ink mt-3 max-w-[14ch]">
            Proposal pre-screening
          </h1>
          <p className="body-lg text-ink-secondary measure mt-5">
            Runs a draft against the 11 criteria the DAO already ratified, before it
            reaches Snapshot. A proposer finds out which criterion they missed and which
            part of the constitution it enforces, so the feedback is something they can
            act on.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/screen">
              <Button>Screen a proposal</Button>
            </Link>
            <Link href="/guide">
              <Button variant="secondary">How to run it</Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-8">
            <Status tone="ok" label={`${CRITERIA.length} RATIFIED CRITERIA`} />
            <Status tone="brand" label="TREASURY SUSPENSION IN FORCE" />
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map(([title, body], i) => (
              <article key={title}>
                <p className="label-mono text-primary">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="text-[18px] font-semibold text-ink mt-2">{title}</h2>
                <p className="text-[15px] text-ink-secondary mt-2">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-[var(--rb-brand)] bg-container px-6 py-6">
          <p className="label-caps text-ink-muted">Right now</p>
          <h2 className="text-[18px] font-semibold text-ink mt-2">
            New treasury-funded activity is suspended
          </h2>
          <p className="text-[15px] text-ink-secondary measure mt-3">
            Passed {TREASURY_GATE.proposal.result.for.toLocaleString()} For to{' '}
            {TREASURY_GATE.proposal.result.against.toLocaleString()} Against, closed{' '}
            {TREASURY_GATE.proposal.closed.slice(0, 10)}. Proposals approved before it took
            effect continue as approved. The gate is checked before the criteria, because
            it is a policy bar rather than a judgement about quality.
          </p>
        </section>

        <section>
          <h2 className="headline-lg text-ink">What it will not do</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="border-l-2 border-outline-variant pl-4">
              <p className="text-[16px] font-semibold text-ink">Decide funding</p>
              <p className="text-[15px] text-ink-secondary mt-1">
                It checks structure against the checklist. Merit is a vote.
              </p>
            </div>
            <div className="border-l-2 border-outline-variant pl-4">
              <p className="text-[16px] font-semibold text-ink">See across proposals</p>
              <p className="text-[15px] text-ink-secondary mt-1">
                Criterion 9 targets concentrated payouts. One submission cannot show
                that, so the tool asks rather than answers.
              </p>
            </div>
            <div className="border-l-2 border-outline-variant pl-4">
              <p className="text-[16px] font-semibold text-ink">Invent an anchor</p>
              <p className="text-[15px] text-ink-secondary mt-1">
                {UNANCHORED_CONDITION_COUNT} ratified conditions have no basis in
                Constitution v1.2. The rubric says so at each one.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
