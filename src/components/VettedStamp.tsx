/**
 * The site's signature mark: a rubber-stamp motif standing in for the "we've
 * actually vetted these vendors" claim — the product's core differentiator
 * (a hand-curated shortlist, not an algorithmic or crowdsourced one). Circular
 * text via SVG textPath rather than a badge/pill, so it reads as something
 * stamped onto the page rather than a UI component.
 *
 * `id` must be unique per instance on a page (SVG <textPath> ids aren't
 * scoped) — callers pass something already unique to their data, e.g. a
 * vendor id, rather than this component generating one itself.
 */
export function VettedStamp({
  id,
  label = "HAND-VETTED",
  size = 72,
  className = "",
}: {
  id: string;
  label?: string;
  size?: number;
  className?: string;
}) {
  const pathId = `vetted-stamp-path-${id}`;
  const repeated = `${label} • ${label} • `;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`-rotate-6 text-terracotta ${className}`}
      role="img"
      aria-label={`${label} mark`}
    >
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1" />
      <path
        id={pathId}
        d="M 50, 50 m -33, 0 a 33,33 0 1,1 66,0 a 33,33 0 1,1 -66,0"
        fill="none"
      />
      <text fontSize="7" letterSpacing="1.5" fill="currentColor" className="font-data uppercase">
        <textPath href={`#${pathId}`} startOffset="0%">
          {repeated}
        </textPath>
      </text>
      <circle cx="50" cy="50" r="2.5" fill="currentColor" />
    </svg>
  );
}
