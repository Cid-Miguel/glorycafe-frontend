export default function About() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">About</h1>
        <p className="text-sm text-stone-500">
          Independent local cafe in Brisbane.
        </p>
      </header>

      <div className="space-y-4">
        <Block title="Find us">
          <p>123 Placeholder Street</p>
          <p>Brisbane, QLD 4000</p>
        </Block>

        <Block title="Hours">
          <p>Mon – Fri · 6:30 am – 3:00 pm</p>
          <p>Sat – Sun · 7:30 am – 2:00 pm</p>
        </Block>

        <Block title="Contact">
          <p>
            Phone:{" "}
            <a href="tel:+61400000000" className="text-amber-700 hover:underline">
              +61 400 000 000
            </a>
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:hello@glorycafe.local"
              className="text-amber-700 hover:underline"
            >
              hello@glorycafe.local
            </a>
          </p>
        </Block>

        <Block title="Follow">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="text-amber-700 hover:underline"
          >
            @glorycafe on Instagram
          </a>
        </Block>
      </div>

      <p className="mt-8 text-xs text-stone-400">
        Information shown is placeholder until owners confirm details.
      </p>
    </section>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-stone-500">
        {title}
      </h2>
      <div className="text-sm text-stone-700 leading-relaxed">{children}</div>
    </div>
  );
}
