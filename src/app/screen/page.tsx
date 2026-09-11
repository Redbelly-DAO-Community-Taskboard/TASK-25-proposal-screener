import type { Metadata } from 'next';

import { Shell } from '@/components/Shell';
import { SubmissionForm } from '@/components/SubmissionForm';

export const metadata: Metadata = {
  title: 'Screen a proposal | Redbelly Community DAO',
  description:
    'Fill the structured form and get feedback citing the ratified criterion and the Constitution v1.2 section behind every flag.',
};

export default function ScreenPage() {
  return (
    <Shell>
      <div className="flex flex-col gap-10">
        <header>
          <p className="label-caps text-ink-muted">Pre-screening</p>
          <h1 className="headline-xl text-ink mt-2">Screen a proposal</h1>
          <p className="body-lg text-ink-secondary measure mt-4">
            Fill the 13 sections below and press Screen this proposal. Every flag names
            the ratified criterion it came from and the Constitution v1.2 section that
            criterion enforces.
          </p>
        </header>
        <SubmissionForm />
      </div>
    </Shell>
  );
}
