"use server";

import { Prisma } from "@prisma/client";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { fieldErrorsFromZod, vendorInputFromFormData, vendorSchema } from "@/lib/validation";

// Type-only export — see the same note in lib/actions/inquiries.ts.
export type VendorFormState = {
  status: "idle" | "error";
  errors?: Record<string, string>;
  formError?: string;
};

/**
 * Vendor.slug is globally unique (see prisma/schema.prisma), so two vendors
 * with similar names — or the same name in a different city — need distinct
 * slugs. Appends -2, -3, ... on collision, matching the plan's noted seed
 * behavior. excludeId lets an update keep its own current slug.
 */
async function uniqueVendorSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base;
  for (let suffix = 2; ; suffix++) {
    const existing = await db.vendor.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
  }
}

function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
}

export async function createVendor(
  _prevState: VendorFormState,
  formData: FormData,
): Promise<VendorFormState> {
  const parsed = vendorSchema.safeParse(vendorInputFromFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      errors: fieldErrorsFromZod(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  const { slug: requestedSlug, name, ...rest } = parsed.data;
  const baseSlug = requestedSlug ?? slugify(name);
  if (!baseSlug) {
    return {
      status: "error",
      errors: { name: "Couldn't derive a URL slug from this name — set one manually." },
    };
  }

  let vendorId: string;
  try {
    const slug = await uniqueVendorSlug(baseSlug);
    const vendor = await db.vendor.create({ data: { name, slug, ...rest } });
    vendorId = vendor.id;
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return { status: "error", formError: "Pick a valid city and category." };
    }
    throw error;
  }

  revalidatePath("/admin/vendors");
  redirect(`/admin/vendors/${vendorId}?created=1`);
}

export async function updateVendor(
  id: string,
  _prevState: VendorFormState,
  formData: FormData,
): Promise<VendorFormState> {
  const parsed = vendorSchema.safeParse(vendorInputFromFormData(formData));
  if (!parsed.success) {
    return {
      status: "error",
      errors: fieldErrorsFromZod(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  const { slug: requestedSlug, name, ...rest } = parsed.data;
  const baseSlug = requestedSlug ?? slugify(name);
  if (!baseSlug) {
    return {
      status: "error",
      errors: { name: "Couldn't derive a URL slug from this name — set one manually." },
    };
  }

  try {
    const slug = await uniqueVendorSlug(baseSlug, id);
    await db.vendor.update({ where: { id }, data: { name, slug, ...rest } });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return { status: "error", formError: "Pick a valid city and category." };
    }
    throw error;
  }

  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${id}`);
  redirect(`/admin/vendors/${id}?saved=1`);
}

export async function deleteVendor(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await db.vendor.delete({ where: { id } });
  } catch (error) {
    // Already gone (e.g. a double submit) is fine; anything else isn't.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025")) {
      throw error;
    }
  }

  revalidatePath("/admin/vendors");
  redirect("/admin/vendors");
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function redirectWithImageError(vendorId: string, message: string): never {
  redirect(`/admin/vendors/${vendorId}?imageError=${encodeURIComponent(message)}`);
}

/**
 * Adds one portfolio image, either by uploading a file to Vercel Blob or by
 * accepting a pasted URL — whichever the admin provided. Falls back to
 * requiring a pasted URL when BLOB_READ_WRITE_TOKEN isn't configured (e.g.
 * local dev before the Vercel project exists), per the phase 5 plan.
 */
export async function addVendorImage(vendorId: string, formData: FormData): Promise<void> {
  const file = formData.get("file");
  const pastedUrl = String(formData.get("url") ?? "").trim();

  let url: string | undefined;

  if (file instanceof File && file.size > 0) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      redirectWithImageError(
        vendorId,
        "Image upload isn't configured yet (BLOB_READ_WRITE_TOKEN is unset) — paste an image URL instead.",
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      redirectWithImageError(vendorId, "That image is too large (max 8MB).");
    }
    const blob = await put(`vendors/${vendorId}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    url = blob.url;
  } else if (pastedUrl) {
    if (!/^https?:\/\//.test(pastedUrl)) {
      redirectWithImageError(vendorId, "That doesn't look like a valid image URL.");
    }
    url = pastedUrl;
  } else {
    redirectWithImageError(vendorId, "Choose a file or paste an image URL.");
  }

  const last = await db.vendorImage.findFirst({
    where: { vendorId },
    orderBy: { order: "desc" },
  });
  await db.vendorImage.create({ data: { vendorId, url, order: (last?.order ?? -1) + 1 } });

  revalidatePath(`/admin/vendors/${vendorId}`);
}

export async function deleteVendorImage(vendorId: string, formData: FormData): Promise<void> {
  const imageId = String(formData.get("imageId") ?? "");
  if (imageId) {
    try {
      await db.vendorImage.delete({ where: { id: imageId } });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025")) {
        throw error;
      }
    }
  }
  revalidatePath(`/admin/vendors/${vendorId}`);
}

export async function moveVendorImage(
  vendorId: string,
  direction: "up" | "down",
  formData: FormData,
): Promise<void> {
  const imageId = String(formData.get("imageId") ?? "");
  const images = await db.vendorImage.findMany({ where: { vendorId }, orderBy: { order: "asc" } });
  const index = images.findIndex((img) => img.id === imageId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= images.length) return;

  const a = images[index];
  const b = images[swapWith];
  await db.$transaction([
    db.vendorImage.update({ where: { id: a.id }, data: { order: b.order } }),
    db.vendorImage.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath(`/admin/vendors/${vendorId}`);
}
