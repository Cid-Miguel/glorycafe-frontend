import type { Product } from "../types/catalog";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <article className="flex gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div
        className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md bg-stone-100 text-2xl"
        aria-hidden
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <span>☕</span>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-stone-900">{product.name}</h3>
          <span className="text-base font-semibold text-stone-900">
            ${product.price.toFixed(2)}
          </span>
        </div>
        {product.description && (
          <p className="mt-1 text-sm text-stone-600">{product.description}</p>
        )}
        <button
          type="button"
          disabled={!product.isAvailable}
          className="mt-3 self-start rounded-full bg-amber-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {product.isAvailable ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}
