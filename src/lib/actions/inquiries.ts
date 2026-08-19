"use server";

import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { sendInquiryNotification } from "@/lib/email";
import { fieldErrorsFromZod, inquiryInputFromFormData, inquirySchema } from "@/lib/validation";

// Type-only export — erased at compile time, so it doesn't run into the
// "a 'use server' file may only export async functions" restriction that
// applies to runtime (value) exports.
export type InquiryFormState = {
  status: "idle" | "success" | "error";
  errors?: Record<string, string>;
  formError?: string;
};

export async function submitInquiry(
  prevState: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  // Honeypot: a hidden field real users never see or fill. Bots that fill
  // every input trip this. Report success so we don't tip them off to retry
  // without it — the submission is simply dropped, not saved or emailed.
  if (formData.get("website")) {
    return { status: "success" };
  }

  const parsed = inquirySchema.safeParse(inquiryInputFromFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      errors: fieldErrorsFromZod(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  const { vendorId, ...rest } = parsed.data;

  try {
    // DB write first — the lead is saved before we ever attempt an email.
    const inquiry = await db.inquiry.create({
      data: { vendorId, ...rest },
      include: { vendor: { select: { name: true } } },
    });

    // Best-effort — a dropped email must never lose a lead that's already saved.
    await sendInquiryNotification({ ...rest, vendorName: inquiry.vendor?.name ?? null });

    return { status: "success" };
  } catch (error) {
    // vendorId references a real Vendor row via a foreign key; a tampered or
    // stale hidden field surfaces here as a P2003 constraint violation rather
    // than silently creating an orphaned inquiry.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        status: "error",
        formError: "That vendor could not be found. Please refresh the page and try again.",
      };
    }
    throw error;
  }
}
