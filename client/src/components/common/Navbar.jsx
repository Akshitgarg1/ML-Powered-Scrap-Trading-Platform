import React from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/sell", label: "Sell" },
  { to: "/price-predictor", label: "Price AI" },
  { to: "/image-search", label: "Visual Search" },
  { to: "/logo-verifier", label: "Logo Check" },
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="group inline-flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 text-white font-semibold shadow-lg shadow-brand-500/30">
            ML
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-white">
              Scrap Trade
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              AI powered
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "rounded-2xl px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-white/10 text-white shadow-lg shadow-slate-900/30"
                    : "text-white/70 hover:text-white hover:bg-white/5",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex">
          <Link to="/sell" className="btn-gradient text-sm">
            List an item
          </Link>
        </div>
      </nav>

      <div className="lg:hidden border-t border-white/5 bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-wide transition whitespace-nowrap",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;