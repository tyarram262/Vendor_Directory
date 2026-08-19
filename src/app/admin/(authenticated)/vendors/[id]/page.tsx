import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ImageManager } from "@/components/admin/ImageManager";
import { VendorForm } from "@/components/admin/VendorForm";
import { getCategories, getCities, getVendorByIdForAdmin } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit Vendor" };
export const dynamic = "force-dynamic";

export default async function EditVendorPage({
  params,
  searchParams,
}: PageProps<"/admin/vendors/[id]">) {
  const { id } = await params;
  const sp = await searchParams;

  const [vendor, cities, categories] = await Promise.all([
    getVendorByIdForAdmin(id),
    getCities(),
    getCategories(),
  ]);
  if (!vendor) notFound();

  const banner =
    sp.created === "1"
      ? "Vendor created. Add photos below."
      : sp.saved === "1"
        ? "Changes saved."
        : null;
  const imageError = typeof sp.imageError === "string" ? sp.imageError : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Edit vendor</h1>

      {banner && (
        <p className="mt-4 rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground">
          {banner}
        </p>
      )}

      <div className="mt-6">
        <VendorForm
          mode="edit"
          vendorId={vendor.id}
          cities={cities}
          categories={categories}
          defaultValues={{
            name: vendor.name,
            slug: vendor.slug,
            cityId: vendor.cityId,
            categoryId: vendor.categoryId,
            shortPitch: vendor.shortPitch,
            description: vendor.description,
            priceRangeMin: vendor.priceRangeMin,
            priceRangeMax: vendor.priceRangeMax,
            featured: vendor.featured,
            contactNote: vendor.contactNote,
          }}
        />
      </div>

      <h2 className="mt-10 mb-4 text-lg font-medium text-foreground">Photos</h2>
      {imageError && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {imageError}
        </p>
      )}
      <ImageManager vendorId={vendor.id} images={vendor.portfolioImages} />
    </main>
  );
}
