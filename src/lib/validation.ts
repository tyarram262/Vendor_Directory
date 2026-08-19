import { z } from "zod";

/**
 * An optional free-text field. Missing, empty-string, and whitespace-only
 * input all normalize to `null` so the server action can pass the parsed
 * result straight to Prisma without a separate "empty string -> null" step,
 * and so admin-panel display logic only ever has to handle one "no value" case.
 */
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .default("")
    .transform((value) => (value.length > 0 ? value : null));
}

export const inquirySchema = z.object({
  coupleName: z.string().trim().min(1, "Please share your name(s).").max(200),
  email: z
    .string()
    .trim()
    .min(1, "Please share an email.")
    .email("That doesn't look like a valid email."),
  phone: optionalText(40),
  weddingDate: optionalText(200),
  guestCount: optionalText(50),
  budgetRange: optionalText(100),
  message: optionalText(4000),
  // Present only on vendor-page inquiries (hidden field); absent on the
  // general /plan inquiry, where it should land as null.
  vendorId: optionalText(50),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/**
 * FormData.get() returns null for a field that was never rendered (e.g. the
 * vendorId hidden input on the general /plan form) — normalize that to
 * undefined so it matches inquirySchema's .optional() fields rather than
 * being validated as the literal string "null".
 */
export function inquiryInputFromFormData(formData: FormData): unknown {
  const get = (name: string) => formData.get(name) ?? undefined;
  return {
    coupleName: get("coupleName"),
    email: get("email"),
    phone: get("phone"),
    weddingDate: get("weddingDate"),
    guestCount: get("guestCount"),
    budgetRange: get("budgetRange"),
    message: get("message"),
    vendorId: get("vendorId"),
  };
}

/** A whole-dollar price, or blank -> null. Never 0-by-default and never NaN. */
const priceField = z
  .string()
  .trim()
  .optional()
  .default("")
  .transform((value) => (value.length > 0 ? Number(value) : null))
  .refine((value) => value === null || (Number.isInteger(value) && value >= 0), {
    message: "Enter a whole number, 0 or greater.",
  });

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const vendorSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200),
  // Left blank, the action derives a slug from the name and de-duplicates on
  // collision (Vendor.slug is globally unique — see uniqueVendorSlug).
  slug: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default("")
    .transform((value) => (value.length > 0 ? value : null))
    .refine((value) => value === null || slugPattern.test(value), {
      message: "Use only lowercase letters, numbers, and hyphens.",
    }),
  cityId: z.string().trim().min(1, "Pick a city."),
  categoryId: z.string().trim().min(1, "Pick a category."),
  shortPitch: z.string().trim().min(1, "Short pitch is required.").max(300),
  description: z.string().trim().min(1, "Description is required.").max(5000),
  priceRangeMin: priceField,
  priceRangeMax: priceField,
  // Checkboxes are absent from FormData entirely when unchecked, so any
  // non-"on" value (including undefined) means false.
  featured: z
    .string()
    .optional()
    .transform((value) => value === "on"),
  contactNote: optionalText(2000),
});

export type VendorInput = z.infer<typeof vendorSchema>;

export function vendorInputFromFormData(formData: FormData): unknown {
  const get = (name: string) => formData.get(name) ?? undefined;
  return {
    name: get("name"),
    slug: get("slug"),
    cityId: get("cityId"),
    categoryId: get("categoryId"),
    shortPitch: get("shortPitch"),
    description: get("description"),
    priceRangeMin: get("priceRangeMin"),
    priceRangeMax: get("priceRangeMax"),
    featured: get("featured"),
    contactNote: get("contactNote"),
  };
}

/**
 * Collapses a ZodError into one message per field (the first issue wins),
 * shared by every "use server" action that renders inline field errors —
 * inquiries, login, and the admin vendor form.
 */
export function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
