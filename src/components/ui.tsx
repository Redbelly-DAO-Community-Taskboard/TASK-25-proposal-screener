/**
 * Shared interface pieces, built to the Task Board brand kit.
 *
 * Rules encoded here rather than repeated at every call site: the label always
 * sits above the input and never inside it as a placeholder, error text sits
 * below the field, depth is tonal rather than shadowed, and status is a dot
 * plus a monospace label rather than a filled pill.
 */

import type { ReactNode } from 'react';

import { snapshotUrl } from '@/lib/rubric/checklist';

export function Button({
  children,
  variant = 'primary',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
}) {
  const base =
    'inline-flex items-center justify-center rounded-[4px] px-5 py-3 text-[16px] font-semibold ' +
    'text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  // White on brand red is 3.49:1, fine at 16px semibold and never smaller.
  const styles =
    variant === 'primary'
      ? 'bg-brand text-on-brand hover:brightness-110'
      : 'border border-outline-variant text-ink hover:border-brand hover:text-primary';
  return (
    <button className={`${base} ${styles}`} {...rest}>
      {children}
    </button>
  );
}

/**
 * A form field with its label above it and, where the field exists because a
 * ratified condition asks for it, that condition shown underneath. A proposer
 * should never have to guess why a question is being asked.
 */
export function Field({
  label,
  hint,
  criterion,
  children,
}: {
  label: string;
  hint?: string;
  criterion?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[14px] font-medium text-ink mb-2">{label}</span>
      {hint ? (
        <span className="block text-[14px] text-ink-muted mb-2 measure">{hint}</span>
      ) : null}
      {children}
      {criterion ? (
        <span className="block text-[14px] text-ink-muted mt-2 measure italic">
          {criterion}
        </span>
      ) : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="rb-field" {...props} />;
}

/** Machine-generated values only: ids, wallets, hashes, figures, dates. */
export function MonoInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="rb-field rb-field-mono" {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="rb-field" rows={3} {...props} />;
}

export function Select({
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className="rb-field" {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-[var(--rb-brand)]"
      />
      <span className="text-[16px] text-ink measure">{label}</span>
    </label>
  );
}

/**
 * A form section. One per criterion group, headed by the criterion it feeds so
 * the proposer can see the rubric while filling the form rather than after.
 */
export function Section({
  step,
  title,
  criterionId,
  criterionName,
  children,
}: {
  step: number;
  title: string;
  criterionId?: number;
  criterionName?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-outline-variant bg-surface-slate">
      <header className="border-b border-outline-variant px-6 py-4">
        <p className="label-mono text-ink-muted">
          STEP {String(step).padStart(2, '0')}
          {criterionId ? ` / CRITERION ${criterionId}` : ''}
        </p>
        <h2 className="text-[20px] font-semibold text-ink mt-1">{title}</h2>
        {criterionName ? (
          <p className="text-[14px] text-ink-muted mt-1">
            Feeds criterion {criterionId}, {criterionName}.
          </p>
        ) : null}
      </header>
      <div className="px-6 py-6 flex flex-col gap-6">{children}</div>
    </section>
  );
}

const DOT: Record<string, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  brand: 'bg-brand',
  muted: 'bg-outline',
};

/** A dot plus a monospace label. Not a filled pill, so dense lists stay calm. */
export function Status({
  tone,
  label,
}: {
  tone: 'ok' | 'warn' | 'brand' | 'muted';
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${DOT[tone]}`} aria-hidden />
      <span className="label-mono text-ink">{label}</span>
    </span>
  );
}

/**
 * A link out to the Snapshot page for a proposal.
 *
 * Printing an id asks the reader to take the citation on trust. Printing the
 * link lets them open the vote and check it against what this tool says, which
 * is the whole claim the tool makes about itself.
 */
export function VerifyOnSnapshot({ id, label = 'Verify on Snapshot' }: { id: string; label?: string }) {
  return (
    <a
      href={snapshotUrl(id)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[44px] items-center gap-2 label-mono text-primary underline decoration-outline-variant underline-offset-4 transition-colors hover:decoration-current"
    >
      {label}
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </a>
  );
}
