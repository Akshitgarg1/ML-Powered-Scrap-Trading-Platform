import React from "react";
import PriceSuggestion from "../components/listings/PriceSuggestion";

const PricePredictor = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <PriceSuggestion />
      </div>
    </div>
  );
};

export default PricePredictor;