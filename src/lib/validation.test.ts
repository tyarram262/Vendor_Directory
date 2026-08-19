import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  fieldErrorsFromZod,
  inquiryInputFromFormData,
  inquirySchema,
  vendorInputFromFormData,
  vendorSchema,
} from "./validation";

const validInput = {
  coupleName: "Priya & Alex",
  email: "priya@example.com",
  phone: "555-123-4567",
  weddingDate: "February 2027",
  guestCount: "~150",
  budgetRange: "$50k–80k",
  message: "Excited to learn more!",
  vendorId: "clx1a2b3c4d5e6f7g8h9i0j1k",
};

describe("inquirySchema", () => {
  it("accepts a fully filled-out inquiry", () => {
    const result = inquirySchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.coupleName).toBe("Priya & Alex");
      expect(result.data.vendorId).toBe(validInput.vendorId);
    }
  });

  it("rejects a missing couple name", () => {
    const result = inquirySchema.safeParse({ ...validInput, coupleName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = inquirySchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing email", () => {
    const result = inquirySchema.safeParse({ ...validInput, email: "" });
    expect(result.success).toBe(false);
  });

  it("normalizes omitted optional fields to null", () => {
    const result = inquirySchema.safeParse({
      coupleName: "Priya & Alex",
      email: "priya@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
      expect(result.data.weddingDate).toBeNull();
      expect(result.data.guestCount).toBeNull();
      expect(result.data.budgetRange).toBeNull();
      expect(result.data.message).toBeNull();
      expect(result.data.vendorId).toBeNull();
    }
  });

  it("normalizes empty-string optional fields to null, matching omitted fields", () => {
    const result = inquirySchema.safeParse({
      ...validInput,
      phone: "",
      weddingDate: "",
      guestCount: "",
      budgetRange: "",
      message: "",
      vendorId: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
      expect(result.data.vendorId).toBeNull();
    }
  });

  it("trims whitespace-only optional fields to null", () => {
    const result = inquirySchema.safeParse({ ...validInput, message: "   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBeNull();
    }
  });

  it("trims whitespace on the required fields", () => {
    const result = inquirySchema.safeParse({
      ...validInput,
      coupleName: "  Priya & Alex  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.coupleName).toBe("Priya & Alex");
    }
  });
});

describe("inquiryInputFromFormData", () => {
  it("reads present fields and treats absent fields as undefined, not the string 'null'", () => {
    const fd = new FormData();
    fd.set("coupleName", "Priya & Alex");
    fd.set("email", "priya@example.com");
    // phone, weddingDate, etc. intentionally omitted, as an unfilled optional
    // field would be if the form doesn't render that input at all.

    const parsed = inquirySchema.safeParse(inquiryInputFromFormData(fd));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.phone).toBeNull();
      expect(parsed.data.vendorId).toBeNull();
    }
  });

  it("carries a vendorId through when the hidden field is present", () => {
    const fd = new FormData();
    fd.set("coupleName", "Priya & Alex");
    fd.set("email", "priya@example.com");
    fd.set("vendorId", "clx1a2b3c4d5e6f7g8h9i0j1k");

    const parsed = inquirySchema.safeParse(inquiryInputFromFormData(fd));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.vendorId).toBe("clx1a2b3c4d5e6f7g8h9i0j1k");
    }
  });
});

const validVendorInput = {
  name: "Lakeside Palace Grounds",
  slug: "",
  cityId: "city_1",
  categoryId: "cat_1",
  shortPitch: "A restored lakefront haveli.",
  description: "Longer description of the venue.",
  priceRangeMin: "45000",
  priceRangeMax: "120000",
  featured: "on",
  contactNote: "",
};

describe("vendorSchema", () => {
  it("accepts a fully filled-out vendor and coerces price fields to numbers", () => {
    const result = vendorSchema.safeParse(validVendorInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priceRangeMin).toBe(45000);
      expect(result.data.priceRangeMax).toBe(120000);
      expect(result.data.featured).toBe(true);
      expect(result.data.slug).toBeNull();
    }
  });

  it("rejects a missing name", () => {
    const result = vendorSchema.safeParse({ ...validVendorInput, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing city or category", () => {
    expect(vendorSchema.safeParse({ ...validVendorInput, cityId: "" }).success).toBe(false);
    expect(vendorSchema.safeParse({ ...validVendorInput, categoryId: "" }).success).toBe(false);
  });

  it("treats an omitted featured field as false (unchecked checkboxes aren't submitted)", () => {
    const { featured: _featured, ...rest } = validVendorInput;
    const result = vendorSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.featured).toBe(false);
    }
  });

  it("normalizes blank price fields to null rather than 0 or NaN", () => {
    const result = vendorSchema.safeParse({
      ...validVendorInput,
      priceRangeMin: "",
      priceRangeMax: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priceRangeMin).toBeNull();
      expect(result.data.priceRangeMax).toBeNull();
    }
  });

  it("rejects a negative price", () => {
    const result = vendorSchema.safeParse({ ...validVendorInput, priceRangeMin: "-5" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-numeric price", () => {
    const result = vendorSchema.safeParse({ ...validVendorInput, priceRangeMin: "not-a-number" });
    expect(result.success).toBe(false);
  });

  it("accepts an explicit slug matching the lowercase-hyphen pattern", () => {
    const result = vendorSchema.safeParse({ ...validVendorInput, slug: "lakeside-palace-2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("lakeside-palace-2");
    }
  });

  it("rejects a malformed explicit slug", () => {
    const result = vendorSchema.safeParse({ ...validVendorInput, slug: "Not A Slug!" });
    expect(result.success).toBe(false);
  });

  it("normalizes a blank contactNote to null", () => {
    const result = vendorSchema.safeParse(validVendorInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactNote).toBeNull();
    }
  });
});

describe("vendorInputFromFormData", () => {
  it("reads a checked checkbox as 'on' and an absent one as undefined", () => {
    const fd = new FormData();
    fd.set("name", "Test Vendor");
    fd.set("cityId", "city_1");
    fd.set("categoryId", "cat_1");
    fd.set("shortPitch", "Pitch");
    fd.set("description", "Description");
    fd.set("featured", "on");

    const parsed = vendorSchema.safeParse(vendorInputFromFormData(fd));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.featured).toBe(true);
    }
  });
});

describe("fieldErrorsFromZod", () => {
  it("collects the first error message per field", () => {
    const schema = z.object({
      a: z.string().min(1, "a is required"),
      b: z.string().email("b must be an email"),
    });
    const result = schema.safeParse({ a: "", b: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrorsFromZod(result.error);
      expect(errors).toEqual({ a: "a is required", b: "b must be an email" });
    }
  });
});
