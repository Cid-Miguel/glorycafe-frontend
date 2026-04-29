import { useQuery } from "@tanstack/react-query";
import { getCategories, getProducts } from "../../api/catalog";
import ProductCard from "../../components/ProductCard";
import type { Product } from "../../types/catalog";

export default function Shop() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const isLoading = categoriesQuery.isLoading || productsQuery.isLoading;
  const error = categoriesQuery.error ?? productsQuery.error;

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Menu</h1>
        <p className="text-sm text-stone-500">Tap to add items to your cart.</p>
      </header>

      {isLoading && (
        <p className="text-stone-500">Loading menu…</p>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not load the menu. Please try again.
        </div>
      )}

      {categoriesQuery.data && productsQuery.data && (
        <div className="space-y-8">
          {categoriesQuery.data.map((category) => {
            const items = productsQuery.data.filter(
              (p) => p.categoryId === category.id,
            );
            if (items.length === 0) return null;
            return (
              <CategorySection
                key={category.id}
                title={category.name}
                products={items}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function CategorySection({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-stone-800">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
