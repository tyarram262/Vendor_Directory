const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * Renders a vendor's price band for the diaspora audience, who think in USD.
 * Bounds are optional and independent — a vendor may have published only a
 * starting price, or none at all.
 */
export function formatPriceRange(
  min?: number | null,
  max?: number | null,
): string {
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;

  if (hasMin && hasMax) {
    // Tolerate inverted bounds rather than rendering "$120,000 – $45,000".
    const [lo, hi] = min <= max ? [min, max] : [max, min];
    return lo === hi ? usd.format(lo) : `${usd.format(lo)} – ${usd.format(hi)}`;
  }
  if (hasMin) return `From ${usd.format(min)}`;
  if (hasMax) return `Up to ${usd.format(max)}`;
  return "Price on request";
}

// Unicode combining diacritical marks block (U+0300–U+036F) — what NFKD
// normalization splits accented letters into, e.g. "é" -> "e" + U+0301.
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * URL-safe slug from a display name. Used by the admin vendor form in phase 5;
 * uniqueness is enforced separately by the caller, since Vendor.slug is global.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
