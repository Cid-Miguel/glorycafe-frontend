import { NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-amber-700" : "text-stone-600 hover:text-stone-900"
  }`;

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <NavLink to="/" className="text-lg font-semibold tracking-tight text-stone-900">
          Glory Cafe
        </NavLink>
        <nav className="flex gap-5">
          <NavLink to="/shop" className={navLinkClass}>Shop</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
        </nav>
      </div>
    </header>
  );
}
