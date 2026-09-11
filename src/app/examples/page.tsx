import type { Metadata } from 'next';

import { ReportView } from '@/components/ReportView';
import { Shell } from '@/components/Shell';
import { Status } from '@/components/ui';
import { screen } from '@/lib/rubric/engine';
import {
  FINPR_CONTINUATION_JUNE_2026,
  FINPR_MARCH_2026,
} from '@/lib/examples/finpr';

export const metadata: Metadata = {
  title: 'Worked examples | Redbelly Community DAO',
  description:
    'Two real Snapshot proposals run through the screener, one passed and one failed, with an honest reading of what the rubric did and did not predict.',
};

/**
 * Both reports are produced by calling the same engine the form calls. Nothing
 * on this page is transcribed output, so it cannot go stale against the code.
 */

const march = screen(FINPR_MARCH_2026);
const june = screen(FINPR_CONTINUATION_JUNE_2026);

function Meta({
  outcome,
  tone,
  snapshotId,
  opened,
  closed,
  result,
}: {
  outcome: string;
  tone: 'ok' | 'brand';
  snapshotId: string;
  opened: string;
  closed: string;
  result: string;
}) {
  return (
    <div className="rounded-[8px] border border-outline-variant bg-container px-6 py-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Status tone={tone} label={outcome} />
        <span className="label-mono text-ink-muted">
          {opened} TO {closed}
        </span>
      </div>
      <p className="label-mono text-ink-muted mt-3 break-all">{snapshotId}</p>
      <p className="label-mono text-ink mt-3">{result}</p>
    </div>
  );
}

export default function ExamplesPage() {
  return (
    <Shell>
      <div className="flex flex-col gap-14">
        <header>
          <p className="label-caps text-ink-muted">Demonstration</p>
          <h1 className="headline-xl text-ink mt-2">Worked examples</h1>
          <p className="body-lg text-ink-secondary measure mt-4">
            Two proposals from the Snapshot archive, transcribed from their published
            bodies. One passed. Its continuation, by the same author, failed. Both are
            screened below by the engine the form uses.
          </p>
        </header>

        <section className="rounded-[8px] border border-[var(--rb-brand)] bg-container px-6 py-6">
          <p className="label-caps text-ink-muted">What this pair shows</p>
          <h2 className="headline-lg text-ink mt-2">
            The rubric does not explain the real outcome
          </h2>
          <p className="text-[16px] text-ink-secondary measure mt-4">
            The proposal that failed scores better on the ratified checklist than the one
            that passed. It has milestone payment tied to verification, a midpoint review,
            5 measurable KPIs and 4 risks with mitigations. The one that passed has none of
            the last three and requests 70% upfront.
          </p>
          <p className="text-[16px] text-ink-secondary measure mt-4">
            The failure was not about quality. The continuation ran concurrently with the
            vote suspending new treasury-funded activity, submitted by the same author on
            the same day. The two closed 12 minutes apart.
          </p>
          <p className="text-[16px] text-ink-secondary measure mt-4">
            That is why the gate is evaluated before the 11 criteria. A checklist scores
            quality and cannot see a policy bar, and claiming the criteria predicted this
            outcome would misstate what the tool does.
          </p>
        </section>

        <section className="flex flex-col gap-6">
          <header>
            <p className="label-caps text-ink-muted">Example 1</p>
            <h2 className="headline-lg text-ink mt-2">Marketing press only, FINPR Agency</h2>
            <p className="text-[16px] text-ink-secondary measure mt-3">
              Screening finds a self-contradiction the vote did not catch. The proposal
              states 70% upfront in USDT, then states no upfront payments 2 lines later.
              The tool reads the payment terms rather than the denial. It also cannot
              compute the total, because 50,000 RBNT is given with no USD equivalent.
            </p>
          </header>
          <Meta
            outcome="PASSED ON SNAPSHOT"
            tone="ok"
            snapshotId="0x7ac0de16f72ad78e0da0eed4dc7d2413b8b753ba229884986609e26d33f00f42"
            opened="2026-03-01"
            closed="2026-03-06"
            result="10,947,839 FOR / 0 AGAINST / 1,868,908 ABSTAIN"
          />
          <ReportView report={march} />
        </section>

        <section className="flex flex-col gap-6">
          <header>
            <p className="label-caps text-ink-muted">Example 2</p>
            <h2 className="headline-lg text-ink mt-2">
              Continuation of Long-Term Marketing and PR Campaign with FINPR
            </h2>
            <p className="text-[16px] text-ink-secondary measure mt-3">
              Barred at the gate. Of the flags that remain, 2 stand on their own terms: the
              proposer nominates himself as the independent reviewer and is paid 800 USD
              equivalent a month for it, and the consultation is written in the future
              tense as discussion that will be held.
            </p>
          </header>
          <Meta
            outcome="FAILED ON SNAPSHOT"
            tone="brand"
            snapshotId="0x21afed409a2b189d564dc83f9aac23e3f1c3f7c585d0c35e8a0826d3aa505d04"
            opened="2026-06-29"
            closed="2026-07-04"
            result="0 FOR / 9,849,764 AGAINST / 3,953,219 ABSTAIN"
          />
          <ReportView report={june} />
        </section>

        <section>
          <h2 className="headline-lg text-ink">What the pair says about the checklist</h2>
          <div className="mt-5 flex flex-col gap-4">
            <p className="text-[16px] text-ink-secondary measure">
              The checklist is calibrated for multi-month programmes. The March proposal is
              a 2 to 3 week engagement and trips the monthly-updates and midpoint-review
              conditions for that reason alone. The conditions are aimed at a different
              shape of proposal.
            </p>
            <p className="text-[16px] text-ink-secondary measure">
              Both fail criterion 8, because neither carries co-funding. The ratified text
              already marks that flag as not a dealbreaker, which is the checklist
              anticipating exactly this.
            </p>
            <p className="text-[16px] text-ink-secondary measure">
              Neither supplies a working group annual allocation, so the 25% limit could
              not be tested on either. Until the DAO publishes that figure, the most
              numeric-looking rule in the checklist is the one that runs least often.
            </p>
          </div>
        </section>
      </div>
    </Shell>
  );
}
