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
    <section className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta">
          Today's menu
        </p>
        <h1 className="font-display mt-2 text-4xl text-espresso sm:text-5xl">
          Pick your cup.
        </h1>
        <p className="mt-2 text-sm text-coffee-soft">
          Tap to add. We'll have it ready when you walk in.
        </p>
      </header>

      {isLoading && (
        <p className="text-center text-coffee-soft">Loading menu…</p>
      )}

      {error && (
        <div className="rounded-md border border-terracotta/30 bg-terracotta/10 p-3 text-center text-sm text-terracotta-dark">
          Could not load the menu. Please try again.
        </div>
      )}

      {categoriesQuery.data && productsQuery.data && (
        <div className="space-y-10">
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
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="font-display text-2xl text-espresso">{title}</h2>
        <span className="h-px flex-1 bg-cream-300" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
