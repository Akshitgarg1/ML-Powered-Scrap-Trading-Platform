import React from "react";
import ProductCatalog from "../components/listings/ProductCatalog";

const BrowseProducts = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 py-16 px-4">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-100">
          Curated marketplace
        </p>
        <h1 className="mt-2 text-4xl font-display font-semibold text-white md:text-5xl">
          Browse premium, pre-loved inventory.
        </h1>
        <p className="mt-4 text-white/70 md:text-lg">
          Filter by category, price, or authenticity signals. Every card uses the
          new glass aesthetic for an elevated experience.
        </p>
      </div>
      <div className="mx-auto mt-12 max-w-6xl">
        <ProductCatalog />
      </div>
    </div>
  );
};

export default BrowseProducts;
