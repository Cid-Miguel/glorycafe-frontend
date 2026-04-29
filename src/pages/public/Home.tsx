import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-amber-700">
        Brisbane, QLD
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
        Good coffee. <br className="sm:hidden" /> No queue.
      </h1>
      <p className="mt-4 max-w-md text-base text-stone-600">
        Order ahead, pay online, walk in and grab your cup. That's it.
      </p>

      <Link
        to="/shop"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-amber-700 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-amber-800"
      >
        Order now
      </Link>

      <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <Feature title="Skip the line" body="Your order is ready when you arrive." />
        <Feature title="Fresh from the bar" body="Made by the same baristas you know." />
        <Feature title="Pay in seconds" body="Card on the phone, no fumbling at pickup." />
      </div>
    </section>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 text-left shadow-sm">
      <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
      <p className="mt-1 text-sm text-stone-600">{body}</p>
    </div>
  );
}
