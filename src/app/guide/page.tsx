import type { Metadata } from 'next';
import Link from 'next/link';

import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui';
import {
  CONFLICTING_CRITERIA,
  UNANCHORED_CONDITION_COUNT,
} from '@/lib/rubric/checklist';

export const metadata: Metadata = {
  title: 'Operator guide | Redbelly Community DAO',
  description:
    'How a council member runs a proposal through pre-screening, reads the result, and returns feedback. No step requires reading code.',
};

/**
 * Written for a council member, not a developer. No step on this page requires
 * opening a terminal, installing anything, or reading code.
 */

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-outline-variant bg-surface-slate">
      <header className="border-b border-outline-variant px-6 py-4">
        <p className="label-mono text-ink-muted">STEP {String(n).padStart(2, '0')}</p>
        <h2 className="text-[20px] font-semibold text-ink mt-1">{title}</h2>
      </header>
      <div className="px-6 py-6 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[16px] text-ink-secondary measure">{children}</p>;
}

function Verdict({
  label,
  tone,
  meaning,
  action,
}: {
  label: string;
  tone: string;
  meaning: string;
  action: string;
}) {
  return (
    <div className="rounded-[4px] border border-outline-variant bg-container-lowest px-5 py-4">
      <p className={`label-mono ${tone}`}>{label}</p>
      <p className="text-[15px] text-ink-secondary measure mt-2">
        <span className="font-semibold text-ink">Means: </span>
        {meaning}
      </p>
      <p className="text-[15px] text-ink-secondary measure mt-2">
        <span className="font-semibold text-ink">You do: </span>
        {action}
      </p>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Shell>
      <div className="flex flex-col gap-12">
        <header>
          <p className="label-caps text-ink-muted">For council members</p>
          <h1 className="headline-xl text-ink mt-2">Operator guide</h1>
          <p className="body-lg text-ink-secondary measure mt-4">
            Six steps for running a proposal through the tool and sending the result back
            to whoever wrote it. You do not need to know how it works to use it.
          </p>
        </header>

        <Step n={1} title="Open the screening page">
          <P>
            This is where the screening happens. You fill in the proposal here and run it.
          </P>
          <div>
            <Link href="/screen">
              <Button>Screen a proposal</Button>
            </Link>
          </div>
        </Step>

        <Step n={2} title="Fill the 13 sections">
          <P>
            Each section names the criterion it feeds and the flag condition that will
            fire if it is left short.
          </P>
          <P>
            <span className="font-semibold text-ink">Leave a box empty when the proposal
            does not state a figure. Never put a zero in.</span> A blank means unknown, and
            the tool will say so and ask you to check. A zero means nothing, and screening
            against that understates a real budget.
          </P>
        </Step>

        <Step n={3} title="Press Screen this proposal">
          <P>
            The result appears below the form in under a second. If nothing seems to
            happen, scroll down. It is already there.
          </P>
        </Step>

        <Step n={4} title="Read the treasury gate first">
          <P>
            The gate asks a different question: whether the DAO may fund this at all,
            which since 4 July 2026 it usually may not. A barred proposal can still be a
            good one, so all 11 criteria are screened anyway.
          </P>
        </Step>

        <Step n={5} title="Read the three verdicts">
          <Verdict
            label="PASS"
            tone="text-ok"
            meaning="Every ratified condition for that criterion is met."
            action="Nothing."
          />
          <Verdict
            label="FLAG"
            tone="text-primary"
            meaning="A ratified condition is not met. The block quotes the condition and gives the constitutional section behind it."
            action="Send the block to the proposer as written. It already says what is missing and why it is required."
          />
          <Verdict
            label="REVIEW"
            tone="text-warn"
            meaning="The tool cannot settle it. Either the criterion turns on judgement, such as whether goals are vague, or the DAO does not publish the figure it needs."
            action="Answer the question printed under To check. This is the only part of the job that needs you rather than the tool."
          />
        </Step>

        <Step n={6} title="Send the feedback back">
          <P>
            Press Download the report and paste it into the proposal thread. Do not
            rewrite it. The wording carries the criterion number and the constitutional
            section, which is what lets a proposer fix the thing without asking you what
            you meant.
          </P>
          <P>
            If you disagree with a flag, say so alongside the report rather than deleting
            it. What the checklist said and what the council decided are both worth
            keeping.
          </P>
        </Step>

        <section className="rounded-[8px] border border-outline-variant bg-container px-6 py-6">
          <h2 className="headline-lg text-ink">Three things to know before you rely on it</h2>
          <div className="mt-5 flex flex-col gap-4">
            <P>
              The checklist is calibrated for multi-month programmes. A 2 to 3 week
              engagement trips the monthly-updates and midpoint-review conditions even
              when it is well run. Worth raising as an amendment rather than working
              around quietly.
            </P>
            <P>
              {UNANCHORED_CONDITION_COUNT} ratified conditions have no anchor in
              Constitution v1.2. If someone challenges one of those flags, the honest
              answer is that the checklist requires it and the constitution does not.
            </P>
            <P>
              On {CONFLICTING_CRITERIA.length} criteria the two documents disagree.
              Criterion {CONFLICTING_CRITERIA[0]} is stricter than the constitution,
              criterion {CONFLICTING_CRITERIA[1]} is looser. Both blocks print the
              conflict.
            </P>
          </div>
        </section>

        <section>
          <h2 className="headline-lg text-ink">If the checklist itself changes</h2>
          <P>
            A new Snapshot vote can amend the criteria, and updating the tool is a
            developer task rather than a council one. Send the passed proposal to whoever
            maintains the repository. Do not work around a stale rule by ignoring a flag:
            the record should show the tool being wrong, then fixed.
          </P>
        </section>
      </div>
    </Shell>
  );
}
