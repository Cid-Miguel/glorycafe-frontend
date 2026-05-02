import { useRef, useState } from "react";
import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProductImage,
  updateProduct,
  uploadProductImage,
} from "../../api/admin";
import type { Category, Product } from "../../types/catalog";
import type { ProductInput } from "../../types/admin";
import Modal from "./Modal";

interface Props {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  categoryId: number | "";
  isAvailable: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  isAvailable: true,
};

function toFormState(product: Product | null, categories: Category[]): FormState {
  if (product) {
    return {
      name: product.name,
      description: product.description ?? "",
      price: product.price.toFixed(2),
      categoryId: product.categoryId,
      isAvailable: product.isAvailable,
    };
  }
  return {
    ...EMPTY_FORM,
    categoryId: categories[0]?.id ?? "",
  };
}

function parseInput(form: FormState): ProductInput | string {
  const price = Number.parseFloat(form.price);
  if (!form.name.trim()) return "Name is required.";
  if (!form.description.trim()) return "Description is required.";
  if (Number.isNaN(price) || price <= 0) return "Price must be greater than 0.";
  if (price > 9999.99) return "Price is too high.";
  if (form.categoryId === "") return "Pick a category.";

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    price,
    categoryId: form.categoryId,
    isAvailable: form.isAvailable,
  };
}

export default function AdminProductForm({
  product,
  categories,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => toFormState(product, categories));
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function invalidateProducts() {
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const saveMutation = useMutation({
    mutationFn: async (input: ProductInput) => {
      if (product) {
        await updateProduct(product.id, input);
        return product.id;
      }
      return await createProduct(input);
    },
    onSuccess: () => {
      invalidateProducts();
      onClose();
    },
    onError: (err) => setError(translateError(err)),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      product
        ? uploadProductImage(product.id, file)
        : Promise.reject(new Error("Save the product before uploading an image.")),
    onSuccess: () => {
      invalidateProducts();
      queryClient.invalidateQueries({ queryKey: ["admin", "product", product?.id] });
    },
    onError: (err) => setError(translateError(err)),
  });

  const removeImageMutation = useMutation({
    mutationFn: () =>
      product
        ? deleteProductImage(product.id)
        : Promise.reject(new Error("Save the product first.")),
    onSuccess: invalidateProducts,
    onError: (err) => setError(translateError(err)),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const parsed = parseInput(form);
    if (typeof parsed === "string") {
      setError(parsed);
      return;
    }
    saveMutation.mutate(parsed);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    uploadMutation.mutate(file);
    // Reset so re-selecting the same file fires onChange.
    e.target.value = "";
  }

  const isEdit = product !== null;

  return (
    <Modal
      open
      title={isEdit ? `Edit "${product.name}"` : "New product"}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-1.5 text-sm text-stone-700 hover:bg-stone-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={saveMutation.isPending}
            className="rounded-md bg-amber-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-800 disabled:bg-stone-300"
          >
            {saveMutation.isPending ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={200}
            required
            className={fieldClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={1000}
            rows={3}
            required
            className={fieldClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (AUD)">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              max="9999.99"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className={fieldClass}
            />
          </Field>
          <Field label="Category">
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: Number(e.target.value) })
              }
              required
              className={fieldClass}
            >
              <option value="" disabled>
                Pick one
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
            className="h-4 w-4 rounded border-stone-300 text-amber-700 focus:ring-amber-700"
          />
          Available for purchase
        </label>

        {isEdit && (
          <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
              Image
            </p>
            <div className="flex items-center gap-3">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-md bg-stone-200 text-2xl text-stone-400">
                  ☕
                </div>
              )}
              <div className="flex flex-col gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                  className="rounded-md border border-stone-300 px-3 py-1 text-xs text-stone-700 hover:bg-white disabled:opacity-50"
                >
                  {uploadMutation.isPending
                    ? "Uploading…"
                    : product.imageUrl
                      ? "Replace image"
                      : "Upload image"}
                </button>
                {product.imageUrl && (
                  <button
                    type="button"
                    onClick={() => removeImageMutation.mutate()}
                    disabled={removeImageMutation.isPending}
                    className="rounded-md px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const fieldClass =
  "w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700";

function translateError(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    if (typeof data === "object" && data && "errors" in data) {
      const errors = (data as { errors: Record<string, string[]> }).errors;
      const first = Object.values(errors)[0]?.[0];
      if (first) return first;
    }
    if (typeof data === "object" && data && "detail" in data) {
      return String((data as { detail: unknown }).detail);
    }
    if (err.response?.status === 409) return "Cannot apply: item is in use.";
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}
