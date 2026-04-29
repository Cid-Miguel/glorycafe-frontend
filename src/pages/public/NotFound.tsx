import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-stone-900">404</h1>
      <p className="mt-2 text-stone-600">This page doesn't exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-amber-700 px-6 py-2 text-sm font-medium text-white hover:bg-amber-800"
      >
        Back home
      </Link>
    </section>
  );
}
