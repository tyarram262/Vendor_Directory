"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isValidInquiryStatus } from "@/lib/inquiry-status";

export async function updateInquiryStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !isValidInquiryStatus(status)) return;

  await db.inquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/inquiries");
}
