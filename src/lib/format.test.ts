import { describe, expect, it } from "vitest";
import { formatPriceRange, slugify } from "./format";

describe("formatPriceRange", () => {
  it("formats a full range with thousands separators", () => {
    expect(formatPriceRange(45000, 120000)).toBe("$45,000 – $120,000");
  });

  it("collapses an equal min and max to a single figure", () => {
    expect(formatPriceRange(5000, 5000)).toBe("$5,000");
  });

  it("formats a min-only range as a starting point", () => {
    expect(formatPriceRange(8000, null)).toBe("From $8,000");
  });

  it("formats a max-only range as a ceiling", () => {
    expect(formatPriceRange(null, 22000)).toBe("Up to $22,000");
  });

  it("falls back to 'Price on request' when both bounds are missing", () => {
    expect(formatPriceRange(null, null)).toBe("Price on request");
    expect(formatPriceRange(undefined, undefined)).toBe("Price on request");
  });

  it("treats a zero bound as a real value, not a missing one", () => {
    expect(formatPriceRange(0, 5000)).toBe("$0 – $5,000");
  });

  it("swaps inverted bounds rather than rendering a backwards range", () => {
    expect(formatPriceRange(120000, 45000)).toBe("$45,000 – $120,000");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Lakeside Palace Grounds")).toBe("lakeside-palace-grounds");
  });

  it("strips punctuation and ampersands", () => {
    expect(slugify("Petal & Brass Decor Co.")).toBe("petal-brass-decor-co");
  });

  it("collapses repeated separators and trims edges", () => {
    expect(slugify("  Decor  &&  Styling  ")).toBe("decor-styling");
  });

  it("strips diacritics so accented names stay URL-safe", () => {
    expect(slugify("Café Rosé")).toBe("cafe-rose");
  });

  it("returns an empty string for input with no usable characters", () => {
    expect(slugify("!!!")).toBe("");
  });
});
