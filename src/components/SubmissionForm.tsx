'use client';

/**
 * The structured submission form.
 *
 * Every field exists because a ratified pass condition needs it, and each
 * section names the criterion it feeds along with the ratified flag condition
 * that will fire if the section is left short. A proposer sees the rubric while
 * filling the form rather than after being rejected by it.
 *
 * Screening runs in the browser. There is no account, no database and no
 * submission to a server, so a council member can open the page and use it with
 * nothing set up, and a draft proposal never leaves the machine it was typed on.
 */

import { useMemo, useRef, useState } from 'react';

import { criterionById } from '@/lib/rubric/checklist';
import { screen, type ScreeningReport } from '@/lib/rubric/engine';
import { renderReport } from '@/lib/rubric/report';
import {
  emptySubmission,
  type Milestone,
  type PaidContributor,
  type RiskEntry,
  type Submission,
  type UpdateCadence,
  type WorkingGroup,
} from '@/lib/rubric/submission';
import {
  FINPR_CONTINUATION_JUNE_2026,
  FINPR_MARCH_2026,
} from '@/lib/examples/finpr';
import { ReportView } from './ReportView';
import {
  Button,
  Checkbox,
  Field,
  MonoInput,
  Section,
  Select,
  TextArea,
  TextInput,
} from './ui';

/** The ratified flag condition for a criterion, shown under its section. */
function flagCondition(id: number): string {
  return `Ratified flag condition: "${criterionById(id).flagCondition}"`;
}

function num(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** A repeating group of object rows, with add and remove. */
function Repeater<T extends object>({
  rows,
  onChange,
  blank,
  addLabel,
  render,
}: {
  rows: T[];
  onChange: (rows: T[]) => void;
  blank: () => T;
  addLabel: string;
  render: (row: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, i) => (
        <div
          key={i}
          className="rounded-[4px] border border-outline-variant bg-container-lowest p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="label-mono text-ink-muted">
              {String(i + 1).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              className="text-[14px] font-medium text-ink-muted hover:text-[var(--rb-destructive)]"
            >
              Remove
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {render(
              row,
              (patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r))),
              i,
            )}
          </div>
        </div>
      ))}
      <div>
        <Button type="button" variant="secondary" onClick={() => onChange([...rows, blank()])}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

/** The same thing for plain string lists, where there is one input per row. */
function StringList({
  rows,
  onChange,
  addLabel,
  label,
  placeholder,
}: {
  rows: string[];
  onChange: (rows: string[]) => void;
  addLabel: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <div key={i} className="flex items-end gap-3">
          <div className="flex-1">
            <Field label={`${label} ${i + 1}`}>
              <TextInput
                value={row}
                placeholder={placeholder}
                onChange={(e) =>
                  onChange(rows.map((r, j) => (j === i ? e.target.value : r)))
                }
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            className="pb-3 text-[14px] font-medium text-ink-muted hover:text-[var(--rb-destructive)]"
          >
            Remove
          </button>
        </div>
      ))}
      <div>
        <Button type="button" variant="secondary" onClick={() => onChange([...rows, ''])}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

export function SubmissionForm() {
  const [s, setS] = useState<Submission>(emptySubmission());
  const [report, setReport] = useState<ScreeningReport | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** Set when the report on screen belongs to an archive example, not the form. */
  const [exampleLabel, setExampleLabel] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  /** Patches one top level group of the submission. */
  function set<K extends keyof Submission>(key: K, patch: Partial<Submission[K]>) {
    setS((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  /**
   * Screens an archive proposal and shows the report, without touching the form.
   *
   * This used to pour the example into all 13 sections, which overwrote whatever
   * the reader had typed and left them looking at a filled form rather than the
   * thing they clicked to see. The point of the examples is the output, so the
   * output is what they get. Their own draft is left exactly as they left it.
   */
  function showExample(example: Submission, label: string) {
    setReport(screen(example));
    setExampleLabel(label);
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }

  function run() {
    const result = screen(s);
    setReport(result);
    setNotice(null);
    setExampleLabel(null);
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }

  function reset() {
    setS(emptySubmission());
    setReport(null);
    setNotice(null);
    setExampleLabel(null);
  }

  const plainText = useMemo(() => (report ? renderReport(report) : ''), [report]);

  function download() {
    const blob = new Blob([plainText + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screening-report-${(report?.submissionTitle || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-[8px] border border-outline-variant bg-container px-6 py-5">
        <p className="label-caps text-ink-muted">Worked examples</p>
        <p className="text-[15px] text-ink-secondary measure mt-2">
          See what a finished report looks like before you fill anything in. Both are real
          proposals from the Snapshot archive. Your form is left untouched.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              showExample(
                FINPR_MARCH_2026,
                'Marketing press only, FINPR Agency, passed its vote 6 March 2026',
              )
            }
          >
            Report for a passed proposal
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              showExample(
                FINPR_CONTINUATION_JUNE_2026,
                'Continuation of Long-Term Marketing and PR Campaign with FINPR, voted down 4 July 2026',
              )
            }
          >
            Report for a failed proposal
          </Button>
          <Button type="button" variant="secondary" onClick={reset}>
            Clear the form
          </Button>
        </div>
        {notice ? (
          <p className="text-[15px] text-primary measure mt-4">{notice}</p>
        ) : null}
      </div>

      <Section step={1} title="Proposal details">
        <Field label="Proposal title">
          <TextInput
            value={s.meta.title}
            onChange={(e) => set('meta', { title: e.target.value })}
            placeholder="As it will appear on Snapshot"
          />
        </Field>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Proposer handle">
            <TextInput
              value={s.meta.proposerHandle}
              onChange={(e) => set('meta', { proposerHandle: e.target.value })}
            />
          </Field>
          <Field label="Proposer wallet">
            <MonoInput
              value={s.meta.proposerWallet}
              onChange={(e) => set('meta', { proposerWallet: e.target.value })}
              placeholder="0x"
            />
          </Field>
        </div>
        <Field label="Date of submission">
          <MonoInput
            type="date"
            value={s.meta.submittedAt}
            onChange={(e) => set('meta', { submittedAt: e.target.value })}
          />
        </Field>
      </Section>

      <Section step={2} title="Treasury status">
        <p className="text-[15px] text-ink-secondary measure">
          New treasury-funded activity is suspended since 4 July 2026. Checked before the
          criteria, because it is a policy bar rather than a judgement about quality.
        </p>
        <Checkbox
          label="This proposal requests new treasury funding."
          checked={s.treasury.requestsNewTreasuryFunding}
          onChange={(v) => set('treasury', { requestsNewTreasuryFunding: v })}
        />
        <Checkbox
          label="This continues a commitment approved by Snapshot before the suspension took effect."
          checked={s.treasury.approvedBeforeSuspension}
          onChange={(v) => set('treasury', { approvedBeforeSuspension: v })}
        />
      </Section>

      <Section
        step={3}
        title="Budget"
        criterionId={1}
        criterionName={criterionById(1).name}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Field label="USDT requested" hint="External spend.">
            <MonoInput
              type="number"
              min={0}
              value={s.budget.usdt || ''}
              onChange={(e) => set('budget', { usdt: num(e.target.value) })}
            />
          </Field>
          <Field label="RBNT requested" hint="Internal rewards.">
            <MonoInput
              type="number"
              min={0}
              value={s.budget.rbnt || ''}
              onChange={(e) => set('budget', { rbnt: num(e.target.value) })}
            />
          </Field>
          <Field
            label="RBNT in USD equivalent"
            hint="Leave blank if the proposal does not state one."
          >
            <MonoInput
              type="number"
              min={0}
              value={s.budget.rbntUsdEquivalent ?? ''}
              onChange={(e) =>
                set('budget', {
                  rbntUsdEquivalent: e.target.value === '' ? null : num(e.target.value),
                })
              }
            />
          </Field>
        </div>
        <Field
          label="Working group annual allocation in USDT"
          hint="Leave blank if it is not published. The 25% limit is then flagged for review rather than guessed."
        >
          <MonoInput
            type="number"
            min={0}
            value={s.budget.workingGroupAnnualAllocationUsdt ?? ''}
            onChange={(e) =>
              set('budget', {
                workingGroupAnnualAllocationUsdt:
                  e.target.value === '' ? null : num(e.target.value),
              })
            }
          />
        </Field>
        <Field label="Cost breakdown">
          <TextArea
            value={s.budget.costBreakdown}
            onChange={(e) => set('budget', { costBreakdown: e.target.value })}
            placeholder="Each line item and what it buys"
          />
        </Field>
        <Field label="Budget justification" criterion={flagCondition(1)}>
          <TextArea
            value={s.budget.justification}
            onChange={(e) => set('budget', { justification: e.target.value })}
            placeholder="Why each cost is what it is"
          />
        </Field>
      </Section>

      <Section
        step={4}
        title="Payment structure"
        criterionId={2}
        criterionName={criterionById(2).name}
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Payment structure">
            <Select
              value={s.payment.structure}
              onChange={(e) =>
                set('payment', {
                  structure: e.target.value as Submission['payment']['structure'],
                })
              }
            >
              <option>Milestone-based</option>
              <option>Post-completion</option>
              <option>Partly upfront</option>
              <option>Fully upfront</option>
            </Select>
          </Field>
          <Field label="Percentage payable before any deliverable is accepted">
            <MonoInput
              type="number"
              min={0}
              max={100}
              value={s.payment.upfrontPercent || ''}
              onChange={(e) => set('payment', { upfrontPercent: num(e.target.value) })}
            />
          </Field>
        </div>
        <Field
          label="Justification for the upfront portion"
          hint="Required for any upfront request. The ratified condition is 'Upfront requests require clear justification', with no size qualifier."
        >
          <TextArea
            value={s.payment.upfrontJustification}
            onChange={(e) => set('payment', { upfrontJustification: e.target.value })}
          />
        </Field>
        <Field label="Milestones" criterion={flagCondition(2)}>
          <Repeater<Milestone>
            rows={s.payment.milestones}
            onChange={(rows) => set('payment', { milestones: rows })}
            blank={() => ({ name: '', deliverable: '', amountUsdt: 0, amountRbnt: 0 })}
            addLabel="Add a milestone"
            render={(row, update) => (
              <>
                <Field label="Milestone name">
                  <TextInput
                    value={row.name}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                </Field>
                <Field label="Deliverable at this milestone">
                  <TextInput
                    value={row.deliverable}
                    onChange={(e) => update({ deliverable: e.target.value })}
                    placeholder="What is handed over before this payment"
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="USDT">
                    <MonoInput
                      type="number"
                      min={0}
                      value={row.amountUsdt || ''}
                      onChange={(e) => update({ amountUsdt: num(e.target.value) })}
                    />
                  </Field>
                  <Field label="RBNT">
                    <MonoInput
                      type="number"
                      min={0}
                      value={row.amountRbnt || ''}
                      onChange={(e) => update({ amountRbnt: num(e.target.value) })}
                    />
                  </Field>
                </div>
              </>
            )}
          />
        </Field>
      </Section>

      <Section
        step={5}
        title="Strategic fit"
        criterionId={3}
        criterionName={criterionById(3).name}
      >
        <Field
          label="Working group"
          hint="Constitution v1.2 section 3 still lists 5 pods. The guild consolidation vote of 20 September 2025 is controlling."
        >
          <Select
            value={s.strategicFit.workingGroup}
            onChange={(e) =>
              set('strategicFit', { workingGroup: e.target.value as WorkingGroup })
            }
          >
            <option>Community</option>
            <option>Marketing</option>
            <option>Developers/Builders</option>
            <option>None of these</option>
          </Select>
        </Field>
        <Field label="Link to DAO-wide goals" criterion={flagCondition(3)}>
          <TextArea
            value={s.strategicFit.daoGoalLink}
            onChange={(e) => set('strategicFit', { daoGoalLink: e.target.value })}
            placeholder="Which stated DAO goal this advances, and how"
          />
        </Field>
      </Section>

      <Section
        step={6}
        title="Feasibility and timeline"
        criterionId={4}
        criterionName={criterionById(4).name}
      >
        <Field label="Timeline" hint="A duration or a set of dates. Both are accepted.">
          <TextInput
            value={s.feasibility.timeline}
            onChange={(e) => set('feasibility', { timeline: e.target.value })}
            placeholder="For example, 8 weeks from approval"
          />
        </Field>
        <Field label="Scope statement">
          <TextArea
            value={s.feasibility.scopeStatement}
            onChange={(e) => set('feasibility', { scopeStatement: e.target.value })}
            placeholder="What is in scope and what is explicitly out"
          />
        </Field>
        <Field
          label="Duplication check"
          hint="What you checked to establish this is not a duplicate. This condition has no anchor in Constitution v1.2."
          criterion={flagCondition(4)}
        >
          <TextArea
            value={s.feasibility.duplicationCheck}
            onChange={(e) => set('feasibility', { duplicationCheck: e.target.value })}
          />
        </Field>
      </Section>

      <Section
        step={7}
        title="Oversight and accountability"
        criterionId={5}
        criterionName={criterionById(5).name}
      >
        <Field label="Nominated reviewer or oversight lead">
          <TextInput
            value={s.oversight.reviewerName}
            onChange={(e) => set('oversight', { reviewerName: e.target.value })}
          />
        </Field>
        <Checkbox
          label="The nominated reviewer is the proposer."
          checked={s.oversight.reviewerIsProposer}
          onChange={(v) => set('oversight', { reviewerIsProposer: v })}
        />
        <Checkbox
          label="The nominated reviewer is paid by this proposal."
          checked={s.oversight.reviewerIsPaidByThisProposal}
          onChange={(v) => set('oversight', { reviewerIsPaidByThisProposal: v })}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field
            label="Update cadence"
            hint="The checklist requires monthly. The constitution sets quarterly, so the checklist is stricter here."
          >
            <Select
              value={s.oversight.updateCadence}
              onChange={(e) =>
                set('oversight', { updateCadence: e.target.value as UpdateCadence })
              }
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>At completion only</option>
              <option>None</option>
            </Select>
          </Field>
          <Field label="DAO channel for updates" criterion={flagCondition(5)}>
            <TextInput
              value={s.oversight.updateChannel}
              onChange={(e) => set('oversight', { updateChannel: e.target.value })}
              placeholder="For example, the Discord governance channel"
            />
          </Field>
        </div>
      </Section>

      <Section
        step={8}
        title="Impact and measurement"
        criterionId={6}
        criterionName={criterionById(6).name}
      >
        <StringList
          rows={s.impact.kpis}
          onChange={(rows) => set('impact', { kpis: rows })}
          addLabel="Add a KPI"
          label="KPI"
          placeholder="Measurable, with a number where possible"
        />
        <Field label="Midpoint review method">
          <TextArea
            value={s.impact.midpointReviewMethod}
            onChange={(e) => set('impact', { midpointReviewMethod: e.target.value })}
          />
        </Field>
        <Field label="Final review method">
          <TextArea
            value={s.impact.finalReviewMethod}
            onChange={(e) => set('impact', { finalReviewMethod: e.target.value })}
          />
        </Field>
        <Field label="Long-term or community value" criterion={flagCondition(6)}>
          <TextArea
            value={s.impact.longTermValue}
            onChange={(e) => set('impact', { longTermValue: e.target.value })}
            placeholder="What remains after the work is delivered"
          />
        </Field>
      </Section>

      <Section
        step={9}
        title="Risk and mitigation"
        criterionId={7}
        criterionName={criterionById(7).name}
      >
        <p className="text-[15px] text-ink-muted measure">
          No anchor in Constitution v1.2. This comes from the ratified checklist alone.
        </p>
        <Field label="Risks and their mitigations" criterion={flagCondition(7)}>
          <Repeater<RiskEntry>
            rows={s.risk.entries}
            onChange={(rows) => set('risk', { entries: rows })}
            blank={() => ({ risk: '', mitigation: '' })}
            addLabel="Add a risk"
            render={(row, update) => (
              <>
                <Field label="Risk">
                  <TextInput
                    value={row.risk}
                    onChange={(e) => update({ risk: e.target.value })}
                  />
                </Field>
                <Field label="Mitigation">
                  <TextInput
                    value={row.mitigation}
                    onChange={(e) => update({ mitigation: e.target.value })}
                  />
                </Field>
              </>
            )}
          />
        </Field>
      </Section>

      <Section
        step={10}
        title="Co-funding and leverage"
        criterionId={8}
        criterionName={criterionById(8).name}
      >
        <p className="text-[15px] text-ink-muted measure">
          No anchor in Constitution v1.2. The ratified text marks this flag as relevant but
          not a dealbreaker.
        </p>
        <Checkbox
          label="This proposal carries matching funds, sponsorship or an in-kind contribution."
          checked={s.coFunding.hasLeverage}
          onChange={(v) => set('coFunding', { hasLeverage: v })}
        />
        <Field label="Describe the leverage" criterion={flagCondition(8)}>
          <TextArea
            value={s.coFunding.description}
            onChange={(e) => set('coFunding', { description: e.target.value })}
          />
        </Field>
      </Section>

      <Section
        step={11}
        title="Contribution equity"
        criterionId={9}
        criterionName={criterionById(9).name}
      >
        <Field label="Paid contributors">
          <Repeater<PaidContributor>
            rows={s.equity.paidContributors}
            onChange={(rows) => set('equity', { paidContributors: rows })}
            blank={() => ({ name: '', amountUsdt: 0, amountRbntUsdEquivalent: 0, role: '' })}
            addLabel="Add a paid contributor"
            render={(row, update) => (
              <>
                <Field label="Name">
                  <TextInput
                    value={row.name}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                </Field>
                <Field label="Role">
                  <TextInput
                    value={row.role}
                    onChange={(e) => update({ role: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="USDT">
                    <MonoInput
                      type="number"
                      min={0}
                      value={row.amountUsdt || ''}
                      onChange={(e) => update({ amountUsdt: num(e.target.value) })}
                    />
                  </Field>
                  <Field label="RBNT in USD equivalent" hint="Blank if not stated.">
                    <MonoInput
                      type="number"
                      min={0}
                      value={row.amountRbntUsdEquivalent ?? ''}
                      onChange={(e) =>
                        update({
                          amountRbntUsdEquivalent:
                            e.target.value === '' ? null : num(e.target.value),
                        })
                      }
                    />
                  </Field>
                </div>
              </>
            )}
          />
        </Field>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field
            label="Other paid DAO roles the proposer holds this quarter"
            hint="Section 5 sets a hard limit of one paid role per person per quarter."
          >
            <MonoInput
              type="number"
              min={0}
              value={s.equity.proposerOtherPaidRolesThisQuarter || ''}
              onChange={(e) =>
                set('equity', { proposerOtherPaidRolesThisQuarter: num(e.target.value) })
              }
            />
          </Field>
          <Field label="Justification for multiple roles" criterion={flagCondition(9)}>
            <TextArea
              value={s.equity.multipleRolesJustification}
              onChange={(e) => set('equity', { multipleRolesJustification: e.target.value })}
            />
          </Field>
        </div>
      </Section>

      <Section
        step={12}
        title="Compliance and ethical standards"
        criterionId={10}
        criterionName={criterionById(10).name}
      >
        <p className="text-[15px] text-ink-muted measure">
          Points at the Community Code of Conduct, ratified 6 October 2025. Constitution
          v1.2 contains no code of conduct.
        </p>
        <Checkbox
          label="This proposal is consistent with the DAO Community Code of Conduct."
          checked={s.compliance.codeOfConductConfirmed}
          onChange={(v) => set('compliance', { codeOfConductConfirmed: v })}
        />
        <Field label="Summary of the activity">
          <TextArea
            value={s.compliance.activitySummary}
            onChange={(e) => set('compliance', { activitySummary: e.target.value })}
          />
        </Field>
        <Field
          label="Regulatory or reputational risks you have identified"
          criterion={flagCondition(10)}
        >
          <TextArea
            value={s.compliance.identifiedRisks}
            onChange={(e) => set('compliance', { identifiedRisks: e.target.value })}
          />
        </Field>
      </Section>

      <Section
        step={13}
        title="Community involvement"
        criterionId={11}
        criterionName={criterionById(11).name}
      >
        <p className="text-[15px] text-ink-muted measure">
          Requires discussion that has taken place. Discussion you intend to hold is
          intent, not evidence, and is flagged as such. The Community Consultation Policy
          authorises non-official channels.
        </p>
        <Field label="Where the proposal was discussed" criterion={flagCondition(11)}>
          <Repeater<Submission['community']['evidence'][number]>
            rows={s.community.evidence}
            onChange={(rows) => set('community', { evidence: rows })}
            blank={() => ({ channel: '', url: '', date: '', isPlanned: false })}
            addLabel="Add a discussion"
            render={(row, update) => (
              <>
                <Field label="Channel">
                  <TextInput
                    value={row.channel}
                    onChange={(e) => update({ channel: e.target.value })}
                    placeholder="For example, Discord governance channel"
                  />
                </Field>
                <Field label="Link to the discussion">
                  <TextInput
                    value={row.url}
                    onChange={(e) => update({ url: e.target.value })}
                    placeholder="https://"
                  />
                </Field>
                <Field label="Date">
                  <MonoInput
                    type="date"
                    value={row.date}
                    onChange={(e) => update({ date: e.target.value })}
                  />
                </Field>
                <Checkbox
                  label="This discussion has not happened yet and is planned."
                  checked={row.isPlanned}
                  onChange={(v) => update({ isPlanned: v })}
                />
              </>
            )}
          />
        </Field>
        <StringList
          rows={s.community.coAuthors}
          onChange={(rows) => set('community', { coAuthors: rows })}
          addLabel="Add a co-author"
          label="Co-author"
        />
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={run}>
          Screen this proposal
        </Button>
        {report ? (
          <Button type="button" variant="secondary" onClick={download}>
            Download the report
          </Button>
        ) : null}
      </div>

      <div ref={resultRef}>
        {report ? (
          <div className="flex flex-col gap-6 border-t border-outline-variant pt-8">
            <div>
              <p className="label-caps text-ink-muted">
                {exampleLabel ? 'Worked example' : 'Result'}
              </p>
              <h2 className="headline-lg text-ink mt-1">
                {report.submissionTitle || 'Untitled proposal'}
              </h2>
              {exampleLabel ? (
                <p className="text-[15px] text-ink-secondary measure mt-2">
                  {exampleLabel}. This is the archive proposal, not your draft. Your form
                  is untouched below.
                </p>
              ) : null}
            </div>
            <ReportView report={report} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
