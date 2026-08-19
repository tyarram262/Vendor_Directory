import Link from "next/link";

/**
 * The primary CTA on the landing page: each city rendered as a ticket-stub
 * card (a dashed "tear line" separating name from route info, data set in
 * the Courier Prime utility face) — the destination-travel motif that gives
 * this page its point of view, standing in for a generic city picker.
 */
export function CityBoardingPass({
  city,
  categoryCount,
  vendorCount,
}: {
  city: { slug: string; name: string };
  categoryCount: number;
  vendorCount: number;
}) {
  return (
    <Link
      href={`/${city.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="px-6 pt-6 pb-5">
        <p className="font-data text-xs uppercase tracking-[0.2em] text-terracotta">
          Destination
        </p>
        <h3 className="mt-1 font-display text-4xl text-foreground">{city.name}</h3>
      </div>
      <div className="border-t border-dashed border-border px-6 py-4">
        <div className="flex items-center justify-between font-data text-xs uppercase tracking-wider text-muted">
          <span>{categoryCount} categories</span>
          <span>{vendorCount} vetted vendors</span>
        </div>
        <p className="mt-3 flex items-center gap-1.5 font-medium text-foreground">
          Browse {city.name}
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </p>
      </div>
    </Link>
  );
}
