"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createVendor,
  updateVendor,
  type VendorFormState,
} from "@/lib/actions/admin-vendors";

const initialState: VendorFormState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-foreground px-5 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={error ? "true" : undefined}
        className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: number | null;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        min={0}
        step={1}
        defaultValue={defaultValue ?? undefined}
        aria-invalid={error ? "true" : undefined}
        className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

type VendorFormProps = {
  mode: "create" | "edit";
  vendorId?: string;
  cities: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  defaultValues?: {
    name: string;
    slug: string;
    cityId: string;
    categoryId: string;
    shortPitch: string;
    description: string;
    priceRangeMin: number | null;
    priceRangeMax: number | null;
    featured: boolean;
    contactNote: string | null;
  };
};

export function VendorForm({ mode, vendorId, cities, categories, defaultValues }: VendorFormProps) {
  const action = mode === "create" ? createVendor : updateVendor.bind(null, vendorId!);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <TextField
        label="Name"
        name="name"
        required
        defaultValue={defaultValues?.name}
        error={state.errors?.name}
      />

      <TextField
        label="Slug (optional — derived from the name if left blank)"
        name="slug"
        placeholder="e.g. lakeside-palace-grounds-udaipur"
        defaultValue={defaultValues?.slug}
        error={state.errors?.slug}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cityId" className="block text-sm font-medium text-foreground">
            City
          </label>
          <select
            id="cityId"
            name="cityId"
            required
            defaultValue={defaultValues?.cityId}
            className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
          >
            <option value="" disabled>
              Select a city
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {state.errors?.cityId && (
            <p className="mt-1 text-sm text-red-600">{state.errors.cityId}</p>
          )}
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-foreground">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={defaultValues?.categoryId}
            className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {state.errors?.categoryId && (
            <p className="mt-1 text-sm text-red-600">{state.errors.categoryId}</p>
          )}
        </div>
      </div>

      <TextField
        label="Short pitch (card view one-liner)"
        name="shortPitch"
        required
        defaultValue={defaultValues?.shortPitch}
        error={state.errors?.shortPitch}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          defaultValue={defaultValues?.description}
          aria-invalid={state.errors?.description ? "true" : undefined}
          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        {state.errors?.description && (
          <p className="mt-1 text-sm text-red-600">{state.errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Price range min (USD, optional)"
          name="priceRangeMin"
          defaultValue={defaultValues?.priceRangeMin}
          error={state.errors?.priceRangeMin}
        />
        <NumberField
          label="Price range max (USD, optional)"
          name="priceRangeMax"
          defaultValue={defaultValues?.priceRangeMax}
          error={state.errors?.priceRangeMax}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="featured"
          name="featured"
          type="checkbox"
          defaultChecked={defaultValues?.featured}
          className="h-4 w-4 rounded border-border"
        />
        <label htmlFor="featured" className="text-sm font-medium text-foreground">
          Featured
        </label>
      </div>

      <div>
        <label htmlFor="contactNote" className="block text-sm font-medium text-foreground">
          Internal contact note (never shown publicly)
        </label>
        <textarea
          id="contactNote"
          name="contactNote"
          rows={3}
          defaultValue={defaultValues?.contactNote ?? undefined}
          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      {state.formError && <p className="text-sm text-red-600">{state.formError}</p>}

      <SubmitButton label={mode === "create" ? "Create vendor" : "Save changes"} />
    </form>
  );
}
