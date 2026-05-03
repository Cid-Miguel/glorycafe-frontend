import { Link } from "react-router-dom";
import { BTN_PRIMARY_MD } from "../../styles/buttons";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta">
        Lost in the queue
      </p>
      <h1 className="font-display mt-2 text-6xl text-espresso">404</h1>
      <p className="mt-3 text-coffee-soft">
        This page doesn't exist. Maybe it ran off with our last croissant.
      </p>
      <Link to="/" className={`mt-6 ${BTN_PRIMARY_MD}`}>
        Back home
      </Link>
    </section>
  );
}
