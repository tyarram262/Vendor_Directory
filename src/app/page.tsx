import Image from "next/image";
import Link from "next/link";
import { CityBoardingPass } from "@/components/CityBoardingPass";
import { VendorCard } from "@/components/VendorCard";
import { VettedStamp } from "@/components/VettedStamp";
import { getCitiesWithCounts, getFeaturedVendors } from "@/lib/queries";

export const dynamic = "force-dynamic";

const CHECKS = [
  {
    label: "What we check",
    body: "Every venue, visited in person. Every photographer's full portfolio, not just the highlight reel. Every caterer's kitchen, inspected before it goes on the list.",
  },
  {
    label: "What we skip",
    body: "Pay-to-play placements. Vendors who only respond fast when a customer's watching. Anyone who wouldn't pass muster for our own family's wedding.",
  },
  {
    label: "What you get",
    body: "A shortlist small enough to actually compare, with real price ranges up front — no “contact for pricing” games.",
  },
];

export default async function Home() {
  const [cities, featuredVendors] = await Promise.all([
    getCitiesWithCounts(),
    getFeaturedVendors(),
  ]);
  const collage = featuredVendors
    .map((v) => ({ url: v.portfolioImages[0]?.url, name: v.name }))
    .filter((img): img is { url: string; name: string } => Boolean(img.url))
    .slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-10">
          <div className="rise-in">
            <p className="font-data text-xs uppercase tracking-[0.2em] text-terracotta">
              Udaipur · Goa — hand-vetted, not crowdsourced
            </p>
            <h1 className="font-display font-display-wonk mt-4 text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              Plan your India wedding with vendors we&apos;ve actually vetted.
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">
              From wherever you live. We&apos;ve walked every venue, met every photographer, and
              tasted every menu on this list — so you&apos;re not planning a wedding sight unseen.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {cities.map((city) => (
                <CityBoardingPass
                  key={city.slug}
                  city={city}
                  categoryCount={city.categoryCount}
                  vendorCount={city.vendorCount}
                />
              ))}
            </div>
          </div>

          {collage.length > 0 && (
            <div className="rise-in [animation-delay:150ms]">
              {/* Mobile: simple side-by-side strip. lg+: offset editorial collage. */}
              <div className="flex gap-3 lg:hidden">
                {collage.slice(0, 2).map((img) => (
                  <div
                    key={img.url}
                    className="relative aspect-[3/4] flex-1 overflow-hidden rounded-lg bg-border"
                  >
                    <Image
                      src={img.url}
                      alt={img.name}
                      fill
                      sizes="50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="relative hidden h-[460px] lg:block">
                {collage[2] && (
                  <div className="absolute bottom-0 left-[8%] z-0 h-[170px] w-[44%] -rotate-[7deg] overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={collage[2].url}
                      alt={collage[2].name}
                      fill
                      sizes="20vw"
                      className="object-cover"
                    />
                  </div>
                )}
                {collage[0] && (
                  <div className="absolute top-0 left-0 z-10 h-[310px] w-[62%] -rotate-[5deg] overflow-hidden rounded-lg shadow-xl">
                    <Image
                      src={collage[0].url}
                      alt={collage[0].name}
                      fill
                      sizes="35vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
                {collage[1] && (
                  <div className="absolute top-[150px] right-0 z-20 h-[280px] w-[50%] rotate-[6deg] overflow-hidden rounded-lg shadow-xl">
                    <Image
                      src={collage[1].url}
                      alt={collage[1].name}
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <VettedStamp
                  id="hero-collage"
                  size={92}
                  className="absolute top-[370px] -right-4 z-30 drop-shadow-md"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* What we check / skip / get */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {CHECKS.map((item) => (
              <div key={item.label} className="border-t-2 border-brass pt-4">
                <h2 className="font-display text-xl text-foreground">{item.label}</h2>
                <p className="mt-2 text-sm text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured vendors */}
      {featuredVendors.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="font-data text-xs uppercase tracking-[0.2em] text-terracotta">
            Currently featured
          </p>
          <h2 className="font-display mt-2 text-3xl text-foreground">A few we&apos;d start with</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                citySlug={vendor.city.slug}
                categorySlug={vendor.category.slug}
                vendor={vendor}
              />
            ))}
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="bg-deep-green">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-3xl text-background sm:text-4xl">
            Haven&apos;t picked a city yet?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-background/80">
            Tell us a bit about your wedding and we&apos;ll help match you with the right
            vendors — no pressure to commit to anything yet.
          </p>
          <Link
            href="/plan"
            className="mt-7 inline-block rounded-lg bg-background px-6 py-3 font-medium text-deep-green hover:opacity-90"
          >
            Tell us about your wedding
          </Link>
        </div>
      </section>
    </main>
  );
}
