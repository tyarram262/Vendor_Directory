import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { isValidInquiryStatus } from "@/lib/inquiry-status";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const metadata: Metadata = { title: "Inquiries" };
export const dynamic = "force-dynamic";

const SORT_FIELDS = { date: "createdAt", status: "status" } as const;
type SortKey = keyof typeof SORT_FIELDS;

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function sortHref(current: { sort: SortKey; dir: "asc" | "desc" }, field: SortKey): string {
  const nextDir = current.sort === field && current.dir === "asc" ? "desc" : "asc";
  return `?sort=${field}&dir=${nextDir}`;
}

export default async function AdminInquiriesPage({
  searchParams,
}: PageProps<"/admin/inquiries">) {
  const sp = await searchParams;
  const sortParam = typeof sp.sort === "string" && sp.sort in SORT_FIELDS ? (sp.sort as SortKey) : "date";
  const dir = sp.dir === "asc" ? "asc" : "desc";

  const inquiries = await db.inquiry.findMany({
    include: {
      vendor: {
        select: {
          name: true,
          slug: true,
          city: { select: { slug: true } },
          category: { select: { slug: true } },
        },
      },
    },
    orderBy: { [SORT_FIELDS[sortParam]]: dir },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Inquiries</h1>

      {inquiries.length === 0 ? (
        <p className="mt-8 text-muted">No inquiries yet.</p>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-lg border border-border">
          <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted">
            <Link href={sortHref({ sort: sortParam, dir }, "date")} className="w-28 hover:text-foreground">
              Date {sortParam === "date" && (dir === "asc" ? "↑" : "↓")}
            </Link>
            <span className="flex-1">Couple</span>
            <span className="w-40">Vendor</span>
            <Link href={sortHref({ sort: sortParam, dir }, "status")} className="w-32 hover:text-foreground">
              Status {sortParam === "status" && (dir === "asc" ? "↑" : "↓")}
            </Link>
          </div>

          {inquiries.map((inquiry) => (
            <details key={inquiry.id} className="px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center gap-4">
                <span className="w-28 text-sm text-muted">{formatDate(inquiry.createdAt)}</span>
                <span className="flex-1 truncate font-medium text-foreground">
                  {inquiry.coupleName}
                </span>
                <span className="w-40 truncate text-sm text-muted">
                  {inquiry.vendor?.name ?? "General inquiry"}
                </span>
                <span className="w-32">
                  <StatusSelect
                    id={inquiry.id}
                    status={isValidInquiryStatus(inquiry.status) ? inquiry.status : "new"}
                  />
                </span>
              </summary>

              <div className="mt-3 space-y-1 text-sm text-foreground">
                <p>
                  Email:{" "}
                  <a className="underline" href={`mailto:${inquiry.email}`}>
                    {inquiry.email}
                  </a>
                </p>
                {inquiry.phone && <p>Phone: {inquiry.phone}</p>}
                {inquiry.vendor && (
                  <p>
                    Vendor:{" "}
                    <Link
                      href={`/${inquiry.vendor.city.slug}/${inquiry.vendor.category.slug}/${inquiry.vendor.slug}`}
                      className="underline"
                      target="_blank"
                    >
                      {inquiry.vendor.name}
                    </Link>
                  </p>
                )}
                {inquiry.weddingDate && <p>Wedding date: {inquiry.weddingDate}</p>}
                {inquiry.guestCount && <p>Guest count: {inquiry.guestCount}</p>}
                {inquiry.budgetRange && <p>Budget range: {inquiry.budgetRange}</p>}
                {inquiry.message && (
                  <p className="whitespace-pre-line">Message: {inquiry.message}</p>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </main>
  );
}
