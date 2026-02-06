import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Price help (AI)",
    text: "Get a quick price estimate before you list your item.",
  },
  {
    title: "Search by photo",
    text: "Upload an image and find similar listings.",
  },
  {
    title: "Logo check",
    text: "Check a logo image for authenticity signals.",
  },
];

const Home = () => {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-80 [mask-image:radial-gradient(circle_at_center,black,transparent)]">
        <div className="h-full w-full bg-grid-pattern bg-[length:28px_28px]"></div>
      </div>

      <section className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-10 px-4 py-16 text-center lg:flex-row lg:items-center lg:text-left">
        <div className="flex-1 space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
            Buy & sell used items
          </p>

          <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            A simple marketplace for
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
              {" "}
              pre-owned items.
            </span>
          </h1>

          <p className="text-lg text-white/70 md:text-xl">
            List your product, browse listings, and use optional tools like price
            prediction, image search, and logo verification.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/sell" className="btn-gradient text-base">
              Start selling
            </Link>
            <Link to="/browse" className="btn-ghost text-base">
              Explore marketplace
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 pb-16">
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <div>
            <h2 className="section-heading mt-2">
              Tools that make listing easier
            </h2>
            <p className="subheading mt-3 max-w-3xl">
              Use as much (or as little) as you want — the marketplace works
              fine without them.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="glass-panel p-6 text-left">
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-white/70">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
