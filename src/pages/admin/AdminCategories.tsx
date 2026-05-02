import { useState } from "react";
import { AxiosError } from "axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getCategories } from "../../api/catalog";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../api/admin";
import type { Category } from "../../types/catalog";
import type { CategoryInput } from "../../types/admin";
import Modal from "../../components/admin/Modal";

export default function AdminCategories() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      <Link
        to="/admin/products"
        className="text-sm text-stone-600 hover:text-stone-900"
      >
        ← Back to products
      </Link>

      <header className="mt-2 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
          <p className="text-sm text-stone-500">
            Group products on the menu. Lower display order shows first.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-800"
        >
          + New category
        </button>
      </header>

      {categoriesQuery.isLoading && <p className="text-stone-500">Loading…</p>}
      {categoriesQuery.error && (
        <p className="text-red-600">Failed to load categories.</p>
      )}

      {categoriesQuery.data && categoriesQuery.data.length === 0 && (
        <p className="rounded-md border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
          No categories yet.
        </p>
      )}

      {categoriesQuery.data && categoriesQuery.data.length > 0 && (
        <ul className="space-y-2">
          {[...categoriesQuery.data]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={() => setEditing(category)}
              />
            ))}
        </ul>
      )}

      {creating && (
        <CategoryFormModal
          category={null}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <CategoryFormModal
          key={editing.id}
          category={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function CategoryRow({
  category,
  onEdit,
}: {
  category: Category;
  onEdit: () => void;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(category.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 409) {
        setError("Move or remove the products in this category first.");
      } else {
        setError("Delete failed.");
      }
    },
  });

  function handleDelete() {
    setError(null);
    if (window.confirm(`Delete category "${category.name}"?`)) {
      deleteMutation.mutate();
    }
  }

  return (
    <li className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
      <div className="min-w-0">
        <p className="truncate font-medium text-stone-900">{category.name}</p>
        <p className="text-xs text-stone-500">
          Order #{category.displayOrder}
          {error && <span className="ml-2 text-red-600">{error}</span>}
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
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
          aria-label={`Delete ${category.name}`}
        >
          ✕
        </button>
      </div>
    </li>
  );
}

function CategoryFormModal({
  category,
  onClose,
}: {
  category: Category | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(category?.name ?? "");
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder ?? 0);
  const [error, setError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (input: CategoryInput) => {
      if (category) {
        await updateCategory(category.id, input);
      } else {
        await createCategory(input);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 409) {
        setError("A category with that name already exists.");
      } else {
        setError("Save failed.");
      }
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    saveMutation.mutate({ name: name.trim(), displayOrder });
  }

  return (
    <Modal
      open
      title={category ? `Edit "${category.name}"` : "New category"}
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
            form="category-form"
            disabled={saveMutation.isPending}
            className="rounded-md bg-amber-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-800 disabled:bg-stone-300"
          >
            {saveMutation.isPending ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
            Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-500">
            Display order
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            min="0"
            className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
          />
          <span className="mt-1 block text-xs text-stone-500">
            Lower numbers appear first on the menu.
          </span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Modal>
  );
}
