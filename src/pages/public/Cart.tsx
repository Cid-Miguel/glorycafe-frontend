import { Link } from "react-router-dom";
import {
  selectSubtotal,
  useCartStore,
  type CartItem,
} from "../../store/cartStore";
import { BTN_PRIMARY_LG, BTN_PRIMARY_MD } from "../../styles/buttons";

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl text-espresso">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-coffee-soft">
          Pick something from the menu to get started.
        </p>
        <Link to="/shop" className={`mt-6 ${BTN_PRIMARY_MD}`}>
          Browse menu
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <h1 className="font-display text-3xl text-espresso sm:text-4xl">
          Your cart
        </h1>
      </header>

      <ul className="space-y-3">
        {items.map((item) => (
          <CartRow
            key={item.productId}
            item={item}
            onUpdate={(q) => updateQuantity(item.productId, q)}
            onRemove={() => removeItem(item.productId)}
          />
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-cream-300 bg-parchment p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm text-coffee-soft">Subtotal</span>
          <span className="font-display text-2xl font-semibold text-espresso">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-xs text-coffee-soft/70">
          You'll pay at checkout. No tipping prompts, ever.
        </p>
        <Link to="/checkout" className={`mt-4 w-full ${BTN_PRIMARY_LG}`}>
          Checkout
        </Link>
      </div>
    </section>
  );
}

function CartRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-cream-300 bg-parchment p-4 shadow-sm">
      <div className="flex-1">
        <h3 className="font-display font-semibold text-espresso">{item.name}</h3>
        <p className="text-sm text-coffee-soft">
          ${item.price.toFixed(2)} each
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onUpdate(item.quantity - 1)}
          className="h-8 w-8 rounded-full border border-cream-300 text-coffee transition-colors hover:border-terracotta hover:text-terracotta"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold text-espresso">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onUpdate(item.quantity + 1)}
          disabled={item.quantity >= 99}
          className="h-8 w-8 rounded-full border border-cream-300 text-coffee transition-colors hover:border-terracotta hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="font-display w-20 text-right text-sm font-semibold text-espresso">
        ${(item.price * item.quantity).toFixed(2)}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="text-xs text-coffee-soft transition-colors hover:text-terracotta-dark"
        aria-label="Remove item"
      >
        Remove
      </button>
    </li>
  );
}
