import { useCartStore } from "../store/cartStore";
import { BTN_PRIMARY_MD, BTN_SUCCESS_MD } from "../styles/buttons";
import type { Product } from "../types/catalog";

interface Props {
  product: Product;
}

const SOLD_OUT_BTN =
  "inline-flex items-center justify-center rounded-full border-2 border-cream-300 bg-cream-200 px-5 py-2 text-sm font-semibold text-coffee-soft cursor-not-allowed";

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const itemInCart = useCartStore((s) =>
    s.items.find((i) => i.productId === product.id),
  );

  const unavailable = !product.isAvailable;

  return (
    <article
      className={`flex gap-4 rounded-2xl border bg-parchment p-4 shadow-sm transition-colors ${
        unavailable ? "border-cream-300 opacity-60" : "border-cream-300 hover:border-terracotta/40"
      }`}
    >
      <div
        className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cream-200"
        aria-hidden
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl text-coffee-soft/60">☕</span>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-espresso">
            {product.name}
          </h3>
          <span className="font-display text-base font-semibold text-terracotta">
            ${product.price.toFixed(2)}
          </span>
        </div>
        {product.description && (
          <p className="mt-1 text-sm text-coffee-soft">{product.description}</p>
        )}
        <button
          type="button"
          disabled={unavailable}
          onClick={() => addItem(product)}
          className={`mt-3 self-start ${
            unavailable
              ? SOLD_OUT_BTN
              : itemInCart
                ? BTN_SUCCESS_MD
                : BTN_PRIMARY_MD
          }`}
        >
          {unavailable
            ? "Sold out"
            : itemInCart
              ? `In cart · ${itemInCart.quantity}`
              : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
