"use client";

import { updateInquiryStatus } from "@/lib/actions/admin-inquiries";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/inquiry-status";

export function StatusSelect({ id, status }: { id: string; status: InquiryStatus }) {
  return (
    <form action={updateInquiryStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        // Auto-submits on change so status updates without a separate save
        // button. Clicking the select may also toggle the row's <details>
        // disclosure it sits inside — a minor, accepted quirk, not a bug.
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-border bg-white px-2 py-1 text-sm text-foreground"
      >
        {INQUIRY_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </form>
  );
}
