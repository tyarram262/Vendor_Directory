import Link from "next/link";

export function Breadcrumbs({
  items,
  tone = "default",
}: {
  items: { label: string; href?: string }[];
  /** "inverted" for use over a dark photo background, e.g. the city page hero. */
  tone?: "default" | "inverted";
}) {
  const isInverted = tone === "inverted";
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-sm ${isInverted ? "text-background/85" : "text-muted"}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className={isInverted ? "hover:text-background hover:underline" : "hover:text-foreground hover:underline"}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className={isInverted ? "text-background" : "text-foreground"}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
