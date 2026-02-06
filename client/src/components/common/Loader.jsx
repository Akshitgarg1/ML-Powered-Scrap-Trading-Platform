import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-transparent border-t-brand-400"></div>
    </div>
  );
};

export default Loader;