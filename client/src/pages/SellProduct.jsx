import React from "react";
import UploadForm from "../components/listings/UploadForm";

const SellProduct = () => {
  return (
    <div className="min-h-screen py-10 transition-colors duration-500">
      <div className="section-container text-center !pb-10">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400">
          Sell Faster & Smarter
        </p>
        <h1 className="mt-4 section-heading text-slate-900 dark:text-white">
          List Your <span className="text-gradient">Pre-owned Assets</span>
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-slate-600 dark:text-slate-400 md:text-lg">
          Our intelligent listing process helps you showcase products with trust indicators,
          AI-driven pricing, and visual verification to attract serious buyers.
        </p>
      </div>

      <div className="section-container !py-0">
        <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-3xl rounded-full"></div>
          <UploadForm />
        </div>
      </div>
    </div>
  );
};

export default SellProduct;
