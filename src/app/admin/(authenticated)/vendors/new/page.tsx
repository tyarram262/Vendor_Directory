import type { Metadata } from "next";
import { VendorForm } from "@/components/admin/VendorForm";
import { getCategories, getCities } from "@/lib/queries";

export const metadata: Metadata = { title: "New Vendor" };
export const dynamic = "force-dynamic";

export default async function NewVendorPage() {
  const [cities, categories] = await Promise.all([getCities(), getCategories()]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">New vendor</h1>
      <p className="mt-1 text-sm text-muted">
        Save the vendor first, then add photos on the next screen.
      </p>
      <div className="mt-6">
        <VendorForm mode="create" cities={cities} categories={categories} />
      </div>
    </main>
  );
}
