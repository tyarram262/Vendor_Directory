import Image from "next/image";

/**
 * Server-rendered responsive grid — no lightbox/carousel client JS in v1.
 * First image runs wide as the hero shot; the rest fill a smaller grid below it.
 */
export function Gallery({
  images,
  vendorName,
}: {
  images: { url: string }[];
  vendorName: string;
}) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-lg bg-border text-sm text-muted">
        No photos yet
      </div>
    );
  }

  const [hero, ...rest] = images;

  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-border">
        <Image
          src={hero.url}
          alt={vendorName}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {rest.map((image, i) => (
            <div
              key={image.url + i}
              className="relative aspect-square overflow-hidden rounded-lg bg-border"
            >
              <Image
                src={image.url}
                alt={`${vendorName} — photo ${i + 2}`}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
