import React from "react";
import ProductCatalog from "../components/listings/ProductCatalog";

const BrowseProducts = () => {
  return (
    <div className="min-h-screen py-10 transition-colors duration-500">
      <div className="section-container text-center !pb-10">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400">
          Curated Marketplace
        </p>
        <h1 className="mt-4 section-heading">
          Explore Premium <span className="text-gradient">Second-Hand Inventory</span>
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-slate-600 dark:text-slate-400 md:text-lg">
          Connect with trusted sellers and browse high-quality pre-owned products.
          Use our AI filters to find specific items or verify authenticity instantly.
        </p>
      </div>

      <div className="section-container !py-0">
        <div className="glass-panel p-1">
          <ProductCatalog />
        </div>
      </div>
    </div>
  );
};

export default BrowseProducts;
