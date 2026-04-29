import { Link } from "react-router-dom";
import {
  selectSubtotal,
  useCartStore,
  type CartItem,
} from "../../store/cartStore";

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-stone-500">
          Pick something from the menu to get started.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-full bg-amber-700 px-6 py-2 text-sm font-medium text-white hover:bg-amber-800"
        >
          Browse menu
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Your cart</h1>
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

      <div className="mt-8 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-base">
          <span className="text-stone-600">Subtotal</span>
          <span className="font-semibold text-stone-900">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-xs text-stone-400">
          You'll pay at checkout. No tipping prompts, ever.
        </p>
        <Link
          to="/checkout"
          className="mt-4 block w-full rounded-full bg-amber-700 px-6 py-3 text-center text-base font-medium text-white hover:bg-amber-800"
        >
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
    <li className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex-1">
        <h3 className="font-semibold text-stone-900">{item.name}</h3>
        <p className="text-sm text-stone-500">
          ${item.price.toFixed(2)} each
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onUpdate(item.quantity - 1)}
          className="h-8 w-8 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onUpdate(item.quantity + 1)}
          disabled={item.quantity >= 99}
          className="h-8 w-8 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="w-20 text-right text-sm font-semibold text-stone-900">
        ${(item.price * item.quantity).toFixed(2)}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="text-xs text-stone-400 hover:text-red-600"
        aria-label="Remove item"
      >
        Remove
      </button>
    </li>
  );
}
