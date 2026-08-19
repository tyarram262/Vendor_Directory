"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitInquiry,
  type InquiryFormState,
} from "@/lib/actions/inquiries";

const initialState: InquiryFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-terracotta px-5 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send inquiry"}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? "true" : undefined}
        className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function InquiryForm({ vendorId }: { vendorId?: string }) {
  const [state, formAction] = useActionState(submitInquiry, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-t-2 border-border border-t-brass bg-card p-5">
        <p className="font-display text-lg text-foreground">
          Thank you — we&apos;ve got your inquiry.
        </p>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll follow up by email within a couple of days.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {vendorId && <input type="hidden" name="vendorId" value={vendorId} />}

      {/* Honeypot: hidden from real visitors, invisible to screen readers via
          aria-hidden, but present in the DOM so bots that auto-fill every
          field trip it. See submitInquiry(). */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field blank</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field label="Your name(s)" name="coupleName" required error={state.errors?.coupleName} />
      <Field label="Email" name="email" type="email" required error={state.errors?.email} />
      <Field label="Phone (optional)" name="phone" type="tel" />
      <Field
        label="Wedding date (optional)"
        name="weddingDate"
        placeholder="e.g. February 2027, or still deciding"
      />
      <Field label="Guest count (optional)" name="guestCount" placeholder="e.g. ~150" />
      <Field label="Budget range (optional)" name="budgetRange" placeholder="e.g. $50k–80k" />

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground">
          Message (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      {state.formError && <p className="text-sm text-red-600">{state.formError}</p>}

      <SubmitButton />
    </form>
  );
}
