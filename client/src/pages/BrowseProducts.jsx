import React from "react";
import ProductCatalog from "../components/listings/ProductCatalog";

const BrowseProducts = () => {
  return (
    <div className="section-products min-h-screen py-16 px-4 transition-colors duration-300">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-600 dark:text-brand-100 transition-colors duration-300">
          Curated marketplace
        </p>
        <h1 className="mt-2 text-4xl font-display font-semibold text-gray-900 dark:text-white md:text-5xl transition-colors duration-300">
          Browse premium, pre-loved inventory.
        </h1>
        <p className="mt-4 text-gray-600 dark:text-white/70 md:text-lg transition-colors duration-300">
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
