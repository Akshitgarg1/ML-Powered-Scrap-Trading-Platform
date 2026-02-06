import React from "react";
import UploadForm from "../components/listings/UploadForm";

const SellProduct = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-100">
            Sell smarter
          </p>
          <h1 className="mt-2 text-4xl font-display font-semibold text-white md:text-5xl">
            Showcase your product like a premium listing.
          </h1>
          <p className="mt-4 text-white/70 md:text-lg">
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
