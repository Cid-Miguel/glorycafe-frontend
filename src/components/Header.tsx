import { NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium tracking-wide transition-colors ${
    isActive
      ? "text-terracotta"
      : "text-coffee hover:text-espresso"
  }`;

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-cream-300 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2.5">
          <img
            src="/logocafe.jpg"
            alt="Glory Cafe logo"
            className="h-10 w-10 rounded-full object-cover ring-1 ring-cream-300"
          />
          <span className="font-display text-xl font-semibold text-espresso">
            Glory Cafe
          </span>
        </NavLink>
        <nav className="flex items-center gap-5">
          <NavLink to="/shop" className={navLinkClass}>
            Menu
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            Visit
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
