import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendInquiryNotification } from "./email";

const payload = {
  coupleName: "Priya & Alex",
  email: "priya@example.com",
  phone: null,
  weddingDate: "February 2027",
  guestCount: null,
  budgetRange: null,
  message: null,
  vendorName: "[SAMPLE] Lakeside Palace Grounds",
};

describe("sendInquiryNotification", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("degrades to a console log and never throws when RESEND_API_KEY is unset", async () => {
    delete process.env.RESEND_API_KEY;

    const result = await sendInquiryNotification(payload);

    expect(result).toEqual({ sent: false, reason: "no-api-key" });
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("RESEND_API_KEY"),
      expect.objectContaining({ coupleName: "Priya & Alex" }),
    );
  });

  it("degrades to a console log and never throws when ADMIN_NOTIFICATION_EMAIL is unset", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    delete process.env.ADMIN_NOTIFICATION_EMAIL;

    const result = await sendInquiryNotification(payload);

    expect(result).toEqual({ sent: false, reason: "no-recipient" });
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("ADMIN_NOTIFICATION_EMAIL"),
      expect.objectContaining({ coupleName: "Priya & Alex" }),
    );
  });
});
