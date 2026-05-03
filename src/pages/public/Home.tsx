import { Link } from "react-router-dom";
import { BTN_DARK_MD, BTN_PRIMARY_LG } from "../../styles/buttons";

const INSTAGRAM_URL = "https://www.instagram.com/glory.cafe.espresso/";

export default function Home() {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-8 pb-16 sm:pt-12">
      <div className="flex flex-col items-center">
        <img
          src="/logocafe.jpg"
          alt="Glory Cafe logo"
          className="h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-cream/80 sm:h-40 sm:w-40"
        />

        {/*
         * Hero card — transparent so the page background image shows
         * straight through. The border keeps the structure visible
         * without painting a solid colour over the photo behind it.
         */}
        <div className="mt-6 w-full rounded-3xl border-2 border-cream/70 bg-transparent p-8 text-center sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta">
            South Brisbane · Specialty Coffee
          </p>

          <h1 className="font-display mt-3 text-5xl leading-[1.05] text-espresso sm:text-6xl">
            Tinto, pan,
            <br />
            <span className="italic text-terracotta">no queue.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base text-coffee sm:text-lg">
            Specialty coffee and fresh pastry from 56 Peel St. Order ahead,
            walk in, walk out with your cup.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/shop" className={BTN_PRIMARY_LG}>
              Order now
            </Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className={BTN_DARK_MD}
            >
              <InstagramIcon className="h-4 w-4" />
              @glory.cafe.espresso
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Feature
          icon={<ClockIcon />}
          title="Skip the line"
          body="Your order is ready when you walk in."
        />
        <Feature
          icon={<CupIcon />}
          title="Made on the bar"
          body="Same beans, same baristas you know."
        />
        <Feature
          icon={<SparkIcon />}
          title="Pay in seconds"
          body="Tap once, no fumbling at pickup."
        />
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-cream-300 bg-parchment/95 p-5 text-left shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold text-espresso">
        {title}
      </h3>
      <p className="mt-1 text-sm text-coffee-soft">{body}</p>
    </div>
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
      className="h-5 w-5"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CupIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M5 9h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" />
      <path d="M17 11h2a2 2 0 0 1 0 4h-2" />
      <path d="M9 5c0-1 .8-1.5 1.5-1.5S12 4 12 5s.8 1.5 1.5 1.5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
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
