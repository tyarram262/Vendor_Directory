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
        <Gallery
          images={vendor.portfolioImages}
          vendorName={vendor.name}
          vendorSlug={vendor.slug}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="font-data text-xs uppercase tracking-[0.2em] text-terracotta">
            {vendor.category.name} in {vendor.city.name}
          </p>
          <h1 className="font-display font-display-wonk mt-2 text-4xl text-foreground">
            {vendor.name}
          </h1>
          <p className="mt-2 text-lg text-muted">{vendor.shortPitch}</p>
          <p className="mt-6 whitespace-pre-line leading-relaxed text-foreground">
            {vendor.description}
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-t-2 border-border border-t-brass bg-card p-5">
            <p className="font-data text-xs uppercase tracking-wider text-muted">
              Price range
            </p>
            <p className="mt-1 font-display text-2xl text-foreground">
              {formatPriceRange(vendor.priceRangeMin, vendor.priceRangeMax)}
            </p>
          </div>

          <InquiryForm vendorId={vendor.id} />
        </div>
      </div>
    </main>
  );
}
