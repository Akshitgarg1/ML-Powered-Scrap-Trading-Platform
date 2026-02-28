import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const links = [
  { to: "/", label: "Home", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { to: "/browse", label: "Browse", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
  { to: "/sell", label: "Sell", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> },
  { to: "/price-predictor", label: "Price AI", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
  { to: "/image-search", label: "Visual Search", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { to: "/logo-verifier", label: "Logo Check", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { to: "/wishlist", label: "Wishlist", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
];

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 transition-all duration-300
      bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl 
      border-b border-slate-200 dark:border-white/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl 
            bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/20
            transition-all duration-300 group-hover:scale-105 group-hover:shadow-brand-500/40">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
            ML
          </div>

          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              ScrapTrade
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400 font-bold mt-1">
              AI-POWERED PLATFORM
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1.5 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "relative rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                  isActive
                    ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
                ].join(" ")
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side - Theme Toggle & CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2.5 transition-all duration-300
              hover:bg-slate-100 dark:hover:bg-white/5
              border border-transparent hover:border-slate-200 dark:hover:border-white/10
              group flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 0A9 9 0 115.636 5.636a9 9 0 0112.728 12.728z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-700 group-hover:-rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <Link
            to="/sell"
            className="hidden lg:flex btn-gradient !py-2.5 !px-6 !text-sm whitespace-nowrap"
          >
            Start Selling
          </Link>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="lg:hidden border-t border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80">
        <div className="mx-auto flex gap-1 overflow-x-auto px-4 py-3 scrollbar-hide">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200",
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
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
