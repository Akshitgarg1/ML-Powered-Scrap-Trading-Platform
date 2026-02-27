import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/sell", label: "Sell" },
  { to: "/price-predictor", label: "Price AI" },
  { to: "/image-search", label: "Visual Search" },
  { to: "/logo-verifier", label: "Logo Check" },
];

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/75 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        
        {/* Logo */}
        <Link to="/" className="group inline-flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl 
            bg-gradient-to-br from-brand-500 to-purple-500 
            text-white font-semibold shadow-lg shadow-brand-500/30
            transition group-hover:scale-105 group-hover:shadow-brand-500/50">
            ML
          </div>

          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-gray-900 dark:text-white transition-colors duration-300">
              Scrap Trade
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-white/50 transition-colors duration-300">
              AI powered
            </p>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "relative rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200",
                  "hover:-translate-y-0.5",
                  isActive
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-1 h-[2px] rounded-full 
                      bg-gradient-to-r from-brand-500 to-purple-500 shadow-md" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right side - Theme Toggle & CTA */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2.5 transition-all duration-300
              bg-gray-100 dark:bg-white/10 
              hover:bg-gray-200 dark:hover:bg-white/20
              border border-gray-300 dark:border-white/20
              group flex items-center justify-center"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <svg
                className="w-5 h-5 text-yellow-500 transition-transform duration-300 group-hover:scale-110"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 011.414-1.414zM5 11a1 1 0 100-2H4a1 1 0 100 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-700 transition-transform duration-300 group-hover:scale-110"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* CTA - Hidden on mobile, shown on lg */}
          <div className="hidden lg:flex">
            <Link
              to="/sell"
              className="btn-gradient text-sm shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50"
            >
              List an item
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="lg:hidden border-t border-gray-200 dark:border-white/5 bg-white/75 dark:bg-slate-950/85 transition-colors duration-300">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-3 scrollbar-hide">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-wide",
                  "transition-all duration-200 whitespace-nowrap",
                  isActive
                    ? "bg-gray-200 dark:bg-white/15 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5",
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
