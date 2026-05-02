import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCategories, getProducts } from "../../api/catalog";
import { deleteProduct, updateProduct } from "../../api/admin";
import type { Product } from "../../types/catalog";
import AdminProductForm from "../../components/admin/AdminProductForm";

export default function AdminProducts() {
  const productsQuery = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => getProducts(),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const [filter, setFilter] = useState<"all" | "available" | "unavailable">(
    "all",
  );
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!productsQuery.data) return [];
    return productsQuery.data.filter((p) => {
      if (filter === "available") return p.isAvailable;
      if (filter === "unavailable") return !p.isAvailable;
      return true;
    });
  }, [productsQuery.data, filter]);

  const productsByCategory = useMemo(() => {
    if (!categoriesQuery.data) return [];
    return categoriesQuery.data
      .map((category) => ({
        category,
        products: filteredProducts.filter((p) => p.categoryId === category.id),
      }))
      .filter((group) => group.products.length > 0);
  }, [categoriesQuery.data, filteredProducts]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500">
            Toggle availability when an item runs out so customers can&apos;t
            order it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/categories"
            className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-white"
          >
            Manage categories
          </Link>
          <button
            type="button"
            onClick={() => setCreating(true)}
            disabled={!categoriesQuery.data?.length}
            className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-800 disabled:bg-stone-300"
          >
            + New product
          </button>
        </div>
      </header>

      <div className="mb-4 flex gap-2">
        <FilterPill
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
        />
        <FilterPill
          active={filter === "available"}
          onClick={() => setFilter("available")}
          label="Available"
        />
        <FilterPill
          active={filter === "unavailable"}
          onClick={() => setFilter("unavailable")}
          label="Out of stock"
        />
      </div>

      {(productsQuery.isLoading || categoriesQuery.isLoading) && (
        <p className="text-stone-500">Loading…</p>
      )}
      {(productsQuery.error || categoriesQuery.error) && (
        <p className="text-red-600">Failed to load products.</p>
      )}

      {productsQuery.data && categoriesQuery.data && productsByCategory.length === 0 && (
        <p className="rounded-md border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
          No products match this view.
          {!categoriesQuery.data.length && (
            <>
              {" "}
              Start by{" "}
              <Link
                to="/admin/categories"
                className="font-medium text-amber-700 hover:text-amber-800"
              >
                creating a category
              </Link>
              .
            </>
          )}
        </p>
      )}

      <div className="space-y-6">
        {productsByCategory.map(({ category, products }) => (
          <div key={category.id}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              {category.name}
            </h2>
            <ul className="space-y-2">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={() => setEditing(product)}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {creating && (
        <AdminProductForm
          product={null}
          categories={categoriesQuery.data ?? []}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <AdminProductForm
          key={editing.id}
          product={editing}
          categories={categoriesQuery.data ?? []}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-amber-700 text-white"
          : "bg-white text-stone-700 hover:bg-stone-200"
      }`}
    >
      {label}
    </button>
  );
}

function ProductRow({
  product,
  onEdit,
}: {
  product: Product;
  onEdit: () => void;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const toggleMutation = useMutation({
    mutationFn: (next: boolean) =>
      updateProduct(product.id, {
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        categoryId: product.categoryId,
        isAvailable: next,
      }),
    onSuccess: invalidate,
    onError: () => setError("Could not update."),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product.id),
    onSuccess: invalidate,
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 409) {
        setError("Has order history — toggle off instead of deleting.");
      } else {
        setError("Delete failed.");
      }
    },
  });

  function handleDelete() {
    setError(null);
    if (
      window.confirm(
        `Delete "${product.name}"? This cannot be undone. (If the product has order history, the API will refuse — toggle off instead.)`,
      )
    ) {
      deleteMutation.mutate();
    }
  }

  return (
    <li className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-stone-100 text-xl text-stone-400">
            ☕
          </div>
        )}
        <div className="min-w-0">
          <p
            className={`truncate font-medium ${
              product.isAvailable ? "text-stone-900" : "text-stone-400 line-through"
            }`}
          >
            {product.name}
          </p>
          <p className="text-xs text-stone-500">
            ${product.price.toFixed(2)}
            {error && <span className="ml-2 text-red-600">{error}</span>}
          </p>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <ToggleSwitch
          checked={product.isAvailable}
          disabled={toggleMutation.isPending}
          onChange={(next) => {
            setError(null);
            toggleMutation.mutate(next);
          }}
        />
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border border-stone-300 px-3 py-1 text-xs text-stone-700 hover:bg-stone-100"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
          aria-label={`Delete ${product.name}`}
        >
          ✕
        </button>
      </div>
    </li>
  );
}

function ToggleSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        checked ? "bg-emerald-600" : "bg-stone-300"
      }`}
      title={checked ? "Available — click to mark out of stock" : "Out of stock — click to make available"}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
