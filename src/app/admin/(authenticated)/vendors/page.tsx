import Link from "next/link";
import type { Metadata } from "next";
import { DeleteVendorButton } from "@/components/admin/DeleteVendorButton";
import { getVendorsForAdmin } from "@/lib/queries";

export const metadata: Metadata = { title: "Vendors" };
export const dynamic = "force-dynamic";

export default async function AdminVendorsPage() {
  const vendors = await getVendorsForAdmin();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Vendors</h1>
        <Link
          href="/admin/vendors/new"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          New vendor
        </Link>
      </div>

      {vendors.length === 0 ? (
        <p className="mt-8 text-muted">No vendors yet.</p>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-lg border border-border">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {vendor.name}
                  {vendor.featured && (
                    <span className="ml-2 rounded-full bg-border px-2 py-0.5 text-xs">
                      Featured
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  {vendor.city.name} · {vendor.category.name}
                </p>
              </div>
              <Link
                href={`/admin/vendors/${vendor.id}`}
                className="text-sm underline hover:text-foreground"
              >
                Edit
              </Link>
              <DeleteVendorButton id={vendor.id} name={vendor.name} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
