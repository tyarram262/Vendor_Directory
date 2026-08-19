import Link from "next/link";

type CategoryGridProps = {
  citySlug: string;
  categories: {
    slug: string;
    name: string;
    blurb: string | null;
    vendorCount: number;
  }[];
};

export function CategoryGrid({ citySlug, categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const isEmpty = category.vendorCount === 0;
        return (
          <Link
            key={category.slug}
            href={`/${citySlug}/${category.slug}`}
            aria-disabled={isEmpty}
            className={`group block rounded-lg border border-t-2 border-border border-t-brass bg-card p-5 transition-all ${
              isEmpty
                ? "opacity-60 hover:border-t-brass"
                : "hover:-translate-y-0.5 hover:shadow-md"
            }`}
          >
            <h3 className="font-display text-xl text-foreground">{category.name}</h3>
            {category.blurb && (
              <p className="mt-1 text-sm text-muted">{category.blurb}</p>
            )}
            <p className="mt-4 font-data text-xs uppercase tracking-wider text-terracotta">
              {isEmpty
                ? "Coming soon"
                : `${category.vendorCount} vendor${category.vendorCount === 1 ? "" : "s"}`}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
