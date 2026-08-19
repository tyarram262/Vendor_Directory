import type { Metadata } from "next";
import { InquiryForm } from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "Not sure where to start?",
};

// General entry point for couples who haven't picked a city or vendor yet.
// Same InquiryForm as a vendor page, just without a vendorId — the softer,
// top-of-funnel counterpart to the per-vendor inquiry.
export default function PlanPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-foreground">Not sure where to start?</h1>
      <p className="mt-3 text-muted">
        Tell us a bit about your wedding and we&apos;ll help match you with the right
        vendors in Udaipur or Goa.
      </p>
      <div className="mt-8">
        <InquiryForm />
      </div>
    </main>
  );
}
