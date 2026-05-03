import { BTN_PRIMARY_SM } from "../../styles/buttons";

const INSTAGRAM_URL = "https://www.instagram.com/glory.cafe.espresso/";
const ADDRESS = "56 Peel St, South Brisbane, QLD";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  ADDRESS,
)}`;

export default function About() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta">
          Visit us
        </p>
        <h1 className="font-display mt-2 text-4xl text-espresso sm:text-5xl">
          South Brisbane corner.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-coffee-soft">
          Specialty coffee and fresh pastry, grab-and-go all morning.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Block icon={<PinIcon />} title="Find us">
          <p className="text-coffee">{ADDRESS}</p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className={`mt-3 ${BTN_PRIMARY_SM}`}
          >
            Open in Maps →
          </a>
        </Block>

        <Block icon={<ClockIcon />} title="Hours">
          <Row label="Mon – Fri" value="from 5:30 am" />
          <Row label="Saturday" value="from 7:30 am" />
          <Row label="Sunday" value="closed" muted />
        </Block>
      </div>

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-terracotta to-clay p-5 text-white shadow-sm transition-transform hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <InstagramIcon className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="font-display text-lg font-semibold">
              @glory.cafe.espresso
            </p>
            <p className="text-sm text-white/85">
              Daily updates, new pastries, the bar in motion.
            </p>
          </div>
        </div>
        <span className="text-2xl font-light leading-none">→</span>
      </a>

      <p className="mt-10 text-center text-xs text-coffee-soft/70">
        Specialty Coffee · Grab and Go Menu &amp; Fresh Pastry
      </p>
    </section>
  );
}

function Block({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-cream-300 bg-parchment p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
          {icon}
        </div>
        <h2 className="font-display text-lg font-semibold text-espresso">
          {title}
        </h2>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-cream-300/60 py-1.5 last:border-b-0">
      <span className="text-coffee-soft">{label}</span>
      <span
        className={`font-medium ${
          muted ? "text-coffee-soft/70" : "text-espresso"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
