"use client";

import { deleteVendor } from "@/lib/actions/admin-vendors";

export function DeleteVendorButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteVendor}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This also removes its photos. This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-red-600 underline hover:text-red-700">
        Delete
      </button>
    </form>
  );
}
