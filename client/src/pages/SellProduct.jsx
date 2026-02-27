import React from "react";
import UploadForm from "../components/listings/UploadForm";

const SellProduct = () => {
  return (
    <div className="section-sell min-h-screen py-16 px-4 transition-colors duration-300">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-purple-300 dark:text-brand-300 transition-colors duration-300">
            Sell smarter
          </p>
          <h1 className="mt-2 text-4xl font-display font-semibold text-white dark:text-white md:text-5xl transition-colors duration-300">
            Showcase your product like a premium listing.
          </h1>
          <p className="mt-4 text-purple-100 dark:text-white/70 md:text-lg transition-colors duration-300">
            Our guided form adds stunning previews, trust indicators, and AI
            pricing so buyers convert faster.
          </p>
        </div>
        <UploadForm />
      </div>
    </div>
  );
};

export default SellProduct;
