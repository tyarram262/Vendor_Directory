import { db } from "./db";

/**
 * Read helpers shared by the public browse pages (phase 2), the admin panel
 * (phase 5), and the landing page (phase 6) — kept in one place so all three
 * agree on how a vendor is looked up and what "belongs to this city/category"
 * means.
 */

export function getCities() {
  return db.city.findMany({ orderBy: { name: "asc" } });
}

/** Cities annotated with category and vendor counts, for the landing page's boarding-pass cards. */
export async function getCitiesWithCounts() {
  const [cities, totalCategories] = await Promise.all([
    db.city.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { vendors: true } } },
    }),
    db.category.count(),
  ]);
  return cities.map((c) => ({
    ...c,
    vendorCount: c._count.vendors,
    categoryCount: totalCategories,
  }));
}

/** Featured vendors across all cities, for the landing page. */
export function getFeaturedVendors(take = 6) {
  return db.vendor.findMany({
    where: { featured: true },
    include: {
      city: true,
      category: true,
      portfolioImages: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "asc" },
    take,
  });
}

export function getCityBySlug(citySlug: string) {
  return db.city.findUnique({ where: { slug: citySlug } });
}

export function getCategories() {
  return db.category.findMany({ orderBy: { order: "asc" } });
}

export function getCategoryBySlug(categorySlug: string) {
  return db.category.findUnique({ where: { slug: categorySlug } });
}

/** All categories, each annotated with how many vendors this city has in it. */
export async function getCategoriesWithCounts(cityId: string) {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { vendors: { where: { cityId } } } } },
  });
  return categories.map((c) => ({ ...c, vendorCount: c._count.vendors }));
}

export function getVendorsFor(citySlug: string, categorySlug: string) {
  return db.vendor.findMany({
    where: { city: { slug: citySlug }, category: { slug: categorySlug } },
    include: { portfolioImages: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
}

/**
 * Looks up a vendor scoped to its city AND category, not by slug alone.
 * Vendor.slug is globally unique, but a slug-only lookup would let
 * `/goa/photography/<a-udaipur-venue-slug>` render that vendor under the
 * wrong city and category — wrong breadcrumbs, wrong claims about location.
 * Returns null (caller does notFound()) if city, category, or the vendor's
 * membership in both doesn't match.
 */
export function getVendor(
  citySlug: string,
  categorySlug: string,
  vendorSlug: string,
) {
  return db.vendor.findFirst({
    where: {
      slug: vendorSlug,
      city: { slug: citySlug },
      category: { slug: categorySlug },
    },
    include: {
      city: true,
      category: true,
      portfolioImages: { orderBy: { order: "asc" } },
    },
  });
}

/** All vendors for the admin list — no city/category scoping, unlike getVendor(). */
export function getVendorsForAdmin() {
  return db.vendor.findMany({
    include: { city: true, category: true },
    orderBy: [{ city: { name: "asc" } }, { category: { order: "asc" } }, { name: "asc" }],
  });
}

/** Looked up by id, not slug — for the admin edit form, which links off the id. */
export function getVendorByIdForAdmin(id: string) {
  return db.vendor.findUnique({
    where: { id },
    include: { portfolioImages: { orderBy: { order: "asc" } } },
  });
}
