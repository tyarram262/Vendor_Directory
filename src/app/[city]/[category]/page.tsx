import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VendorCard } from "@/components/VendorCard";
import { EmptyState } from "@/components/EmptyState";
import { getCategoryBySlug, getCityBySlug, getVendorsFor } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: PageProps<"/[city]/[category]">) {
  const { city: citySlug, category: categorySlug } = await params;

  const [city, category] = await Promise.all([
    getCityBySlug(citySlug),
    getCategoryBySlug(categorySlug),
  ]);
  if (!city || !category) notFound();

  const vendors = await getVendorsFor(citySlug, categorySlug);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: city.name, href: `/${city.slug}` },
          { label: category.name },
        ]}
      />
      <p className="mt-3 font-data text-xs uppercase tracking-[0.2em] text-terracotta">
        {city.name}
      </p>
      <h1 className="font-display font-display-wonk mt-1 text-4xl text-foreground">
        {category.name}
      </h1>
      {category.blurb && <p className="mt-3 max-w-2xl text-muted">{category.blurb}</p>}

      <div className="mt-10">
        {vendors.length === 0 ? (
          <EmptyState
            title={`We're still curating ${category.name.toLowerCase()} in ${city.name}`}
            description="Check back soon, or tell us what you're looking for."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                citySlug={city.slug}
                categorySlug={category.slug}
                vendor={vendor}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
