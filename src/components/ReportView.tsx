/**
 * Renders a screening report on screen.
 *
 * The verdict, the reason and the reviewer's question are always visible,
 * because that is what someone acts on. The citation sits behind a disclosure:
 * a reviewer reading 11 criteria should not have to scroll past 11 walls of
 * constitutional text to find the 3 that need them. Nothing is dropped, and the
 * downloaded report carries every citation expanded, because that is the copy
 * that gets pasted back to a proposer.
 *
 * The wording is the engine's, unchanged. This component decides layout only.
 */

import { QUOTE_NOTE } from '@/lib/rubric/checklist';
import type { CriterionResult, ScreeningReport } from '@/lib/rubric/engine';
import { Status } from './ui';

const TONE: Record<CriterionResult['verdict'], 'ok' | 'brand' | 'warn'> = {
  pass: 'ok',
  flag: 'brand',
  review: 'warn',
};

const LABEL: Record<CriterionResult['verdict'], string> = {
  pass: 'PASS',
  flag: 'FLAG',
  review: 'REVIEW',
};

function Criterion({ r }: { r: CriterionResult }) {
  const hasCitation = Boolean(r.citation.controlling) || Boolean(r.conflictNote);

  return (
    <article className="rounded-[8px] border border-outline-variant bg-surface-slate px-6 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h3 className="text-[17px] font-semibold text-ink">
          {r.criterionId}. {r.criterionName}
        </h3>
        <Status
          tone={TONE[r.verdict]}
          label={
            r.verdict === 'flag' && r.notADealbreaker
              ? 'FLAG / NOT A DEALBREAKER'
              : LABEL[r.verdict]
          }
        />
      </div>

      {r.reasons.map((reason, i) => (
        <p key={i} className="text-[15px] text-ink-secondary measure mt-3">
          {reason}
        </p>
      ))}

      {r.reviewQuestion ? (
        <p className="text-[15px] text-ink-secondary measure mt-3">
          <span className="font-semibold text-ink">To check: </span>
          {r.reviewQuestion}
        </p>
      ) : null}

      <details className="mt-4 group">
        <summary className="label-mono cursor-pointer list-none text-ink-muted hover:text-primary">
          {hasCitation ? 'RULE, CITATION AND CONFLICTS' : 'RULE AND CITATION'}
          <span className="group-open:hidden"> +</span>
          <span className="hidden group-open:inline"> -</span>
        </summary>

        <div className="mt-4 border-t border-outline-variant pt-4">
          <p className="label-caps text-ink-muted">Ratified flag condition</p>
          <p className="text-[15px] text-ink-secondary measure mt-1">
            &quot;{r.citation.ratifiedFlagCondition}&quot;
          </p>

          <p className="label-caps text-ink-muted mt-4">Enforces</p>
          <p className="text-[15px] text-ink-secondary measure mt-1 whitespace-pre-line">
            {r.citation.constitution}
          </p>

          {r.citation.controlling ? (
            <>
              <p className="label-caps text-ink-muted mt-4">Superseded by</p>
              <p className="text-[15px] text-ink-secondary measure mt-1">
                {r.citation.controlling}
              </p>
            </>
          ) : null}

          {r.conflictNote ? (
            <>
              <p className="label-caps text-ink-muted mt-4">Known conflict</p>
              <p className="text-[15px] text-ink-secondary measure mt-1">
                {r.conflictNote}
              </p>
            </>
          ) : null}
        </div>
      </details>
    </article>
  );
}

export function ReportView({ report }: { report: ScreeningReport }) {
  const { summary, gate } = report;

  return (
    <div className="flex flex-col gap-4">
      <section
        className="rounded-[8px] border px-6 py-5"
        style={{
          borderColor: gate.barred ? 'var(--rb-brand)' : 'var(--rb-outline-variant)',
          background: 'var(--rb-container)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold text-ink">Treasury gate</h2>
          <Status
            tone={gate.barred ? 'brand' : 'ok'}
            label={gate.barred ? 'BARRED' : 'NOT BARRED'}
          />
        </div>
        <p className="text-[15px] text-ink-secondary measure mt-3">{gate.reason}</p>
        {gate.barred ? (
          <details className="mt-3">
            <summary className="label-mono cursor-pointer list-none text-ink-muted hover:text-primary">
              WHEN IT REOPENS +
            </summary>
            <p className="text-[15px] text-ink-secondary measure mt-3">{gate.reopens}</p>
            <p className="text-[15px] text-ink-secondary measure mt-3">
              The 11 criteria are screened below anyway, so the proposer gets a full
              review rather than a single blocking message.
            </p>
          </details>
        ) : null}
      </section>

      <section className="rounded-[8px] border border-outline-variant bg-container px-6 py-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <p className="label-caps text-ink-muted">Passed</p>
            <p className="label-mono text-ok text-[20px] mt-1">{summary.passed}</p>
          </div>
          <div>
            <p className="label-caps text-ink-muted">Flagged</p>
            <p className="label-mono text-primary text-[20px] mt-1">{summary.flagged}</p>
          </div>
          <div>
            <p className="label-caps text-ink-muted">To check</p>
            <p className="label-mono text-warn text-[20px] mt-1">{summary.needsReview}</p>
          </div>
          <div className="ml-auto">
            <p className="label-mono text-ink-muted">
              {report.screenedAt.slice(0, 10)} / 11 CRITERIA
            </p>
          </div>
        </div>
        {summary.flaggedButNotDealbreakers > 0 ? (
          <p className="text-[15px] text-ink-muted measure mt-4">
            {summary.flaggedButNotDealbreakers} of the flags is marked in the ratified
            text as not a dealbreaker.
          </p>
        ) : null}
      </section>

      {report.results.map((r) => (
        <Criterion key={r.criterionId} r={r} />
      ))}

      <p className="text-[14px] text-ink-muted measure mt-2">
        Checks structure and stated content against the ratified checklist. It does not
        decide whether a proposal should be funded. {QUOTE_NOTE}
      </p>
    </div>
  );
}
