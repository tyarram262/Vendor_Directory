import { Resend } from "resend";

export type InquiryEmailPayload = {
  coupleName: string;
  email: string;
  phone: string | null;
  weddingDate: string | null;
  guestCount: string | null;
  budgetRange: string | null;
  message: string | null;
  vendorName: string | null;
};

export type SendResult =
  | { sent: true }
  | { sent: false; reason: "no-api-key" | "no-recipient" | "send-error" };

function formatBody(inquiry: InquiryEmailPayload): string {
  const lines = [
    `Couple: ${inquiry.coupleName}`,
    `Email: ${inquiry.email}`,
    inquiry.phone && `Phone: ${inquiry.phone}`,
    `Vendor: ${inquiry.vendorName ?? "General inquiry (not tied to a specific vendor)"}`,
    inquiry.weddingDate && `Wedding date: ${inquiry.weddingDate}`,
    inquiry.guestCount && `Guest count: ${inquiry.guestCount}`,
    inquiry.budgetRange && `Budget range: ${inquiry.budgetRange}`,
    inquiry.message && `Message:\n${inquiry.message}`,
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * Best-effort inquiry notification. Never throws — the inquiry is already
 * saved to the database by the time this runs, and a dropped email must
 * never be mistaken for a lost lead. Without RESEND_API_KEY (e.g. local dev,
 * or before the account is set up), the would-be email is logged instead.
 */
export async function sendInquiryNotification(
  inquiry: InquiryEmailPayload,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[email] RESEND_API_KEY not set — logging instead of sending:", inquiry);
    return { sent: false, reason: "no-api-key" };
  }

  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) {
    console.log("[email] ADMIN_NOTIFICATION_EMAIL not set — logging instead of sending:", inquiry);
    return { sent: false, reason: "no-recipient" };
  }

  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      subject: `New inquiry: ${inquiry.coupleName}`,
      text: formatBody(inquiry),
    });
    return { sent: true };
  } catch (error) {
    console.error("[email] Failed to send inquiry notification:", error);
    return { sent: false, reason: "send-error" };
  }
}
