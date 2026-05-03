import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { createOrder } from "../../api/orders";
import { selectSubtotal, useCartStore } from "../../store/cartStore";
import { BTN_PRIMARY_LG, BTN_PRIMARY_MD } from "../../styles/buttons";
import type {
  ApiValidationProblem,
  CreateOrderRequest,
} from "../../types/order";

const PICKUP_DEFAULT_OFFSET_MIN = 15;
const PICKUP_MIN_OFFSET_MIN = 10;
const PICKUP_MAX_OFFSET_HOURS = 24;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toLocalInputValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultPickupValue() {
  const d = new Date(Date.now() + PICKUP_DEFAULT_OFFSET_MIN * 60_000);
  return toLocalInputValue(d);
}

function minPickupValue() {
  const d = new Date(Date.now() + PICKUP_MIN_OFFSET_MIN * 60_000);
  return toLocalInputValue(d);
}

function maxPickupValue() {
  const d = new Date(Date.now() + PICKUP_MAX_OFFSET_HOURS * 3_600_000);
  return toLocalInputValue(d);
}

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectSubtotal);
  const clearCart = useCartStore((s) => s.clear);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickup, setPickup] = useState(defaultPickupValue());
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      clearCart();
      navigate(`/order/${data.orderId}/confirm`, {
        state: {
          totalAmount: data.totalAmount,
          dailyOrderNumber: data.dailyOrderNumber,
        },
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError && err.response?.status === 400) {
        const data = err.response.data as ApiValidationProblem;
        setErrors(data.errors ?? {});
      } else {
        setErrors({
          _: ["Something went wrong placing your order. Please try again."],
        });
      }
    },
  });

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl text-espresso">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-coffee-soft">
          Add some items before checking out.
        </p>
        <Link to="/shop" className={`mt-6 ${BTN_PRIMARY_MD}`}>
          Browse menu
        </Link>
      </section>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    const request: CreateOrderRequest = {
      customerFirstName: firstName.trim(),
      customerLastName: lastName.trim(),
      customerPhone: phone.trim() || undefined,
      customerEmail: email.trim() || undefined,
      estimatedPickupTime: new Date(pickup).toISOString(),
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };
    mutation.mutate(request);
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <h1 className="font-display text-3xl text-espresso sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-coffee-soft">
          We'll have it ready for pickup at your time.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-cream-300 bg-parchment p-5 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First name"
            name="customerFirstName"
            value={firstName}
            onChange={setFirstName}
            required
            errors={errors}
          />
          <Field
            label="Last name"
            name="customerLastName"
            value={lastName}
            onChange={setLastName}
            required
            errors={errors}
          />
        </div>
        <Field
          label="Phone (Australian format)"
          name="customerPhone"
          value={phone}
          onChange={setPhone}
          placeholder="+61 400 000 000"
          errors={errors}
        />
        <Field
          label="Email"
          name="customerEmail"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          errors={errors}
        />
        <p className="text-xs text-coffee-soft">
          At least one contact (phone or email) is required.
        </p>
        {errors.Contact && (
          <p className="text-sm text-terracotta-dark">{errors.Contact[0]}</p>
        )}

        <Field
          label="Pickup time"
          name="estimatedPickupTime"
          type="datetime-local"
          value={pickup}
          onChange={setPickup}
          min={minPickupValue()}
          max={maxPickupValue()}
          required
          errors={errors}
        />

        <div className="border-t border-cream-300 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-coffee-soft">Total</span>
            <span className="font-display text-2xl font-semibold text-espresso">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <p className="mt-1 text-xs text-coffee-soft/70">
            Online payment will be added soon. For now your order is recorded
            and the cafe is notified.
          </p>
        </div>

        {errors._ && (
          <p className="text-sm text-terracotta-dark">{errors._[0]}</p>
        )}
        {errors.Items && (
          <p className="text-sm text-terracotta-dark">{errors.Items[0]}</p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className={`w-full ${BTN_PRIMARY_LG}`}
        >
          {mutation.isPending ? "Placing order…" : "Place order"}
        </button>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  min,
  max,
  errors,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  errors: Record<string, string[]>;
}) {
  const fieldErrors = errors[name];
  return (
    <div>
      <label
        className="block text-xs font-medium uppercase tracking-wide text-coffee-soft"
        htmlFor={name}
      >
        {label}
        {required && <span className="text-terracotta"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className="mt-1 block w-full rounded-md border border-cream-300 bg-white px-3 py-2 text-sm text-espresso shadow-sm focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
      />
      {fieldErrors && fieldErrors.length > 0 && (
        <p className="mt-1 text-xs text-terracotta-dark">{fieldErrors[0]}</p>
      )}
    </div>
  );
}
