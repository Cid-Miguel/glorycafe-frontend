import { Link } from "react-router-dom";
import { BTN_PRIMARY_MD } from "../styles/buttons";

const INSTAGRAM_URL = "https://www.instagram.com/glory.cafe.espresso/";

export default function Footer() {
  return (
    <footer className="mt-16 bg-espresso text-cream">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-10 text-center">
        <Link to="/" aria-label="Glory Cafe home">
          <img
            src="/logocafe.jpg"
            alt="Glory Cafe logo"
            className="h-14 w-14 rounded-full object-cover ring-1 ring-cream/30"
          />
        </Link>

        <div>
          <p className="font-display text-2xl text-cream">Glory Cafe</p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-cream/60">
            Specialty Coffee · South Brisbane
          </p>
        </div>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className={BTN_PRIMARY_MD}
          aria-label="Open Glory Cafe Instagram"
        >
          <InstagramIcon className="h-5 w-5" />
          Instagram
        </a>

        <p className="text-xs text-cream/50">
          © {new Date().getFullYear()} Glory Cafe — 56 Peel St, South Brisbane
        </p>
      </div>
    </footer>
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
