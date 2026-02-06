import React from "react";
import ImageSearch from "../components/listings/ImageSearch";

const ImageSearchPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 py-16 px-4">
      <div className="mx-auto max-w-6xl">
        <ImageSearch />
      </div>
    </div>
  );
};

export default ImageSearchPage;