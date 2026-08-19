import Image from "next/image";
import { notFound } from "next/navigation";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getCategoriesWithCounts, getCityBySlug } from "@/lib/queries";

// A Prisma call isn't a Next "dynamic API", so without this the page would
// prerender once at build time and freeze — phase 5 admin edits wouldn't
// show up until a redeploy. Revisit with revalidatePath if traffic ever
// makes that caching worthwhile. (generateStaticParams is skipped for the
// same reason: force-dynamic renders every request fresh regardless of
// which params were pre-listed, so pre-listing them buys nothing.)
export const dynamic = "force-dynamic";

export default async function CityPage({ params }: PageProps<"/[city]">) {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) notFound();

  const categories = await getCategoriesWithCounts(city.id);

  return (
    <main>
      <div className="relative h-[38vh] min-h-[280px] w-full overflow-hidden bg-border sm:h-[46vh]">
        {city.heroImageUrl && (
          <Image
            src={city.heroImageUrl}
            alt={city.name}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
        <div className="absolute inset-x-0 top-0 px-4 pt-4 sm:px-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: city.name }]}
            tone="inverted"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-6">
          <h1 className="font-display font-display-wonk text-4xl text-background sm:text-5xl">
            {city.name}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="max-w-2xl font-display text-xl leading-relaxed text-foreground italic">
          {city.intro}
        </p>

        <h2 className="font-display mt-12 mb-5 text-2xl text-foreground">
          Browse by category
        </h2>
        <CategoryGrid citySlug={city.slug} categories={categories} />
      </div>
    </main>
  );
}
