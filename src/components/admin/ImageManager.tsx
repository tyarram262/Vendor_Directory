import Image from "next/image";
import {
  addVendorImage,
  deleteVendorImage,
  moveVendorImage,
} from "@/lib/actions/admin-vendors";

/**
 * Plain server-rendered forms only — every control here is a real <form>
 * bound to a server action via .bind(), no client JS. Reordering is two
 * buttons that swap `order` with the neighbor, not drag-and-drop; this is
 * admin-only tooling for ~20 vendors, not worth a DnD library.
 */
export function ImageManager({
  vendorId,
  images,
}: {
  vendorId: string;
  images: { id: string; url: string }[];
}) {
  const deleteImage = deleteVendorImage.bind(null, vendorId);
  const moveUp = moveVendorImage.bind(null, vendorId, "up");
  const moveDown = moveVendorImage.bind(null, vendorId, "down");
  const addImage = addVendorImage.bind(null, vendorId);

  return (
    <div className="space-y-4">
      {images.length === 0 ? (
        <p className="text-sm text-muted">No photos yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.id} className="space-y-2">
              <div className="relative aspect-square overflow-hidden rounded-md bg-border">
                <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-1 text-xs">
                <form action={moveUp}>
                  <input type="hidden" name="imageId" value={image.id} />
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="rounded border border-border px-2 py-1 disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveDown}>
                  <input type="hidden" name="imageId" value={image.id} />
                  <button
                    type="submit"
                    disabled={index === images.length - 1}
                    className="rounded border border-border px-2 py-1 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
                <form action={deleteImage}>
                  <input type="hidden" name="imageId" value={image.id} />
                  <button type="submit" className="text-red-600 underline">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={addImage} className="space-y-2 rounded-lg border border-dashed border-border p-4">
        <p className="text-sm font-medium text-foreground">Add a photo</p>
        <div>
          <label htmlFor="file" className="block text-xs text-muted">
            Upload a file (requires BLOB_READ_WRITE_TOKEN)
          </label>
          <input id="file" name="file" type="file" accept="image/*" className="mt-1 text-sm" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="flex-1 border-t border-border" />
          or
          <span className="flex-1 border-t border-border" />
        </div>
        <div>
          <label htmlFor="url" className="block text-xs text-muted">
            Paste an image URL
          </label>
          <input
            id="url"
            name="url"
            type="text"
            placeholder="https://…"
            className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Add photo
        </button>
      </form>
    </div>
  );
}
