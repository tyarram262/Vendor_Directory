import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Deterministic Unsplash source images — a fixed set so re-seeding is stable.
const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

async function main() {
  console.log("Seeding placeholder data (clearly marked [SAMPLE])...");

  // --- Cities -------------------------------------------------------------
  const udaipur = await db.city.upsert({
    where: { slug: "udaipur" },
    update: {},
    create: {
      name: "Udaipur",
      slug: "udaipur",
      intro:
        "The City of Lakes pairs marble palaces and lakeside ghats with a wedding infrastructure that's hosted royalty for generations — a natural fit for a multi-day celebration with a real sense of occasion.",
      heroImageUrl: img("photo-1589901164570-f9de6556e1c1"), // Udaipur City Palace, Lake Pichola
    },
  });

  const goa = await db.city.upsert({
    where: { slug: "goa" },
    update: {},
    create: {
      name: "Goa",
      slug: "goa",
      intro:
        "Beachfront ceremonies, golden-hour photos, and a laid-back pace that gives out-of-town guests a real vacation alongside the wedding — Goa works best for couples who want celebration over ceremony.",
      heroImageUrl: img("photo-1582972236019-ea4af5ffe587"), // Secluded beach, South Goa
    },
  });

  // --- Categories -----------------------------------------------------------
  const categoryDefs = [
    { name: "Venues", slug: "venues", order: 0, blurb: "Palaces, resorts, and lawns for every guest count." },
    { name: "Photography", slug: "photography", order: 1, blurb: "Editorial and candid teams who know Indian wedding rituals." },
    { name: "Decor & Styling", slug: "decor-styling", order: 2, blurb: "Florals, mandap design, and full-event styling." },
    { name: "Catering", slug: "catering", order: 3, blurb: "Regional menus, live counters, and dietary flexibility." },
    { name: "Priest & Ritual Services", slug: "priest-ritual-services", order: 4, blurb: "English-fluent pandits who can guide mixed-tradition families." },
  ];

  const categories: Record<string, Awaited<ReturnType<typeof db.category.upsert>>> = {};
  for (const c of categoryDefs) {
    categories[c.slug] = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // --- Vendors --------------------------------------------------------------
  type VendorSeed = {
    name: string;
    slug: string;
    city: typeof udaipur;
    category: (typeof categories)[string];
    shortPitch: string;
    description: string;
    priceRangeMin: number;
    priceRangeMax: number;
    featured?: boolean;
    images: string[];
  };

  const vendorDefs: VendorSeed[] = [
    {
      name: "[SAMPLE] Lakeside Palace Grounds",
      slug: "sample-lakeside-palace-grounds-udaipur",
      city: udaipur,
      category: categories["venues"],
      shortPitch: "A restored lakefront haveli with room for 400 guests across three lawns.",
      description:
        "Placeholder listing — replace via /admin/vendors. A 19th-century lakefront property with three event lawns, in-house generator backup, and on-site guest rooms for up to 120. Popular for three-day itineraries that move from mehndi to a lakeside pheras.",
      priceRangeMin: 45000,
      priceRangeMax: 120000,
      featured: true,
      images: [img("photo-1519167758481-83f550bb49b3"), img("photo-1519741497674-611481863552")],
    },
    {
      name: "[SAMPLE] Aravalli Hilltop Resort",
      slug: "sample-aravalli-hilltop-resort-udaipur",
      city: udaipur,
      category: categories["venues"],
      shortPitch: "Boutique hilltop resort with panoramic sunset views, ideal for 150 guests.",
      description:
        "Placeholder listing — replace via /admin/vendors. Twelve-acre property overlooking the Aravalli range, with a dedicated wedding planning team and flexible indoor/outdoor ceremony spaces.",
      priceRangeMin: 30000,
      priceRangeMax: 80000,
      images: [img("photo-1519225421980-715cb0215aed")],
    },
    {
      name: "[SAMPLE] Studio Marigold Photography",
      slug: "sample-studio-marigold-photography-udaipur",
      city: udaipur,
      category: categories["photography"],
      shortPitch: "Editorial-style husband-and-wife team, fluent in every major ritual sequence.",
      description:
        "Placeholder listing — replace via /admin/vendors. Ten years shooting destination weddings across Rajasthan, with a documentary approach to ceremonies and a separate stylized couple session.",
      priceRangeMin: 8000,
      priceRangeMax: 22000,
      featured: true,
      images: [img("photo-1465495976277-4387d4b0b4c6")],
    },
    {
      name: "[SAMPLE] Petal & Brass Decor Co.",
      slug: "sample-petal-and-brass-decor-co-udaipur",
      city: udaipur,
      category: categories["decor-styling"],
      shortPitch: "Full-service mandap and florals with a modern-meets-traditional palette.",
      description:
        "Placeholder listing — replace via /admin/vendors. In-house floral sourcing, custom mandap fabrication, and lighting design for lakeside and palace venues.",
      priceRangeMin: 12000,
      priceRangeMax: 40000,
      images: [img("photo-1478146059778-26028b07395a")],
    },
    {
      name: "[SAMPLE] Sunset Sands Beach Venue",
      slug: "sample-sunset-sands-beach-venue-goa",
      city: goa,
      category: categories["venues"],
      shortPitch: "Private beach frontage with an in-house event team, 80–250 guests.",
      description:
        "Placeholder listing — replace via /admin/vendors. Exclusive-use beach venue in South Goa with sound permits already secured, generator backup, and an adjoining resort for guest stays.",
      priceRangeMin: 25000,
      priceRangeMax: 90000,
      featured: true,
      images: [img("photo-1519741497674-611481863552"), img("photo-1522673607200-164d1b6ce486")],
    },
    {
      name: "[SAMPLE] Pandit Anand Shastri — Ritual Services",
      slug: "sample-pandit-anand-shastri-ritual-services-goa",
      city: goa,
      category: categories["priest-ritual-services"],
      shortPitch: "English-narrated ceremonies, comfortable guiding mixed-faith and mixed-tradition families.",
      description:
        "Placeholder listing — replace via /admin/vendors. Twenty-plus years officiating destination weddings, with a pre-wedding call to walk both families through the ceremony sequence in English.",
      priceRangeMin: 1500,
      priceRangeMax: 4000,
      images: [img("photo-1604017011826-d3b4c23f8914")],
    },
  ];

  for (const v of vendorDefs) {
    const vendor = await db.vendor.upsert({
      where: { slug: v.slug },
      update: {},
      create: {
        name: v.name,
        slug: v.slug,
        cityId: v.city.id,
        categoryId: v.category.id,
        shortPitch: v.shortPitch,
        description: v.description,
        priceRangeMin: v.priceRangeMin,
        priceRangeMax: v.priceRangeMax,
        featured: v.featured ?? false,
        contactNote: "SAMPLE DATA — no real contact info on file.",
      },
    });

    // Idempotent image reseed: clear and re-insert so re-running seed doesn't duplicate.
    await db.vendorImage.deleteMany({ where: { vendorId: vendor.id } });
    await db.vendorImage.createMany({
      data: v.images.map((url, order) => ({ vendorId: vendor.id, url, order })),
    });
  }

  console.log(`Seeded ${Object.keys(categories).length} categories and ${vendorDefs.length} vendors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
