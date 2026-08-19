import Image from "next/image";
import Link from "next/link";
import { formatPriceRange } from "@/lib/format";
import { VettedStamp } from "@/components/VettedStamp";

type VendorCardProps = {
  citySlug: string;
  categorySlug: string;
  vendor: {
    slug: string;
    name: string;
    shortPitch: string;
    priceRangeMin: number | null;
    priceRangeMax: number | null;
    featured: boolean;
    portfolioImages: { url: string }[];
  };
};

export function VendorCard({ citySlug, categorySlug, vendor }: VendorCardProps) {
  const image = vendor.portfolioImages[0];

  return (
    <Link
      href={`/${citySlug}/${categorySlug}/${vendor.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-border">
        {image ? (
          <Image
            src={image.url}
            alt={vendor.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            No photos yet
          </div>
        )}
        {vendor.featured && (
          <VettedStamp
            id={vendor.slug}
            size={56}
            className="absolute -top-1 -left-1 drop-shadow-sm"
          />
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-display text-lg text-foreground">{vendor.name}</h3>
        <p className="line-clamp-2 text-sm text-muted">{vendor.shortPitch}</p>
        <p className="pt-1 font-data text-sm text-terracotta-ink">
          {formatPriceRange(vendor.priceRangeMin, vendor.priceRangeMax)}
        </p>
      </div>
    </Link>
  );
}
