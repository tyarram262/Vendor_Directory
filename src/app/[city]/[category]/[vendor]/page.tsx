import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Gallery } from "@/components/Gallery";
import { InquiryForm } from "@/components/InquiryForm";
import { formatPriceRange } from "@/lib/format";
import { getVendor } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function VendorPage({
  params,
}: PageProps<"/[city]/[category]/[vendor]">) {
  const { city: citySlug, category: categorySlug, vendor: vendorSlug } = await params;

  // Scoped to city + category, not slug alone — Vendor.slug is globally
  // unique, so a bare slug lookup would let a Udaipur vendor render under a
  // /goa/... URL with the wrong breadcrumbs. getVendor() returns null (and we
  // 404) unless the vendor actually belongs to both.
  const vendor = await getVendor(citySlug, categorySlug, vendorSlug);
  if (!vendor) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: vendor.city.name, href: `/${vendor.city.slug}` },
          {
            label: vendor.category.name,
            href: `/${vendor.city.slug}/${vendor.category.slug}`,
          },
          { label: vendor.name },
        ]}
      />

      <div className="mt-4">
        <Gallery images={vendor.portfolioImages} vendorName={vendor.name} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-semibold text-foreground">{vendor.name}</h1>
          <p className="mt-2 text-lg text-muted">{vendor.shortPitch}</p>
          <p className="mt-6 whitespace-pre-line text-foreground">{vendor.description}</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-5">
            <p className="text-sm text-muted">Price range</p>
            <p className="mt-1 text-xl font-medium text-foreground">
              {formatPriceRange(vendor.priceRangeMin, vendor.priceRangeMax)}
            </p>
          </div>

          <InquiryForm vendorId={vendor.id} />
        </div>
      </div>
    </main>
  );
}
