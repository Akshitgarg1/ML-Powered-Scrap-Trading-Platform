import React, { useState } from "react";
import { imageSearch } from "../../services/api";
import Loader from "../common/Loader";

const ImageSearch = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSearchResults(null);
      setError(null);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const result = await imageSearch(selectedImage);
      setSearchResults(result);
    } catch {
      setError("Failed to search. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    setSearchResults(null);
    setError(null);
  };

  return (
    <section className="glass-panel-dark p-6 sm:p-10">
      <div className="flex flex-col gap-3 border-b border-white/5 pb-6 text-center lg:text-left">
        <p className="text-sm uppercase tracking-[0.35em] text-white/50">
          Visual search
        </p>
        <h2 className="text-3xl font-display font-semibold text-white">
          Find look-alike products
        </h2>
        <p className="text-white/70">
          Drop an image and let our computer vision model surface listings that
          match shape, texture, and color palettes.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label
            htmlFor="image-upload"
            className="glass-panel flex min-h-[360px] cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed border-white/15 text-center"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              id="image-upload"
              className="hidden"
            />
            {!previewUrl ? (
              <>
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/60">
                  Upload image
                </span>
                <p className="text-xl font-semibold text-white">Drag or click</p>
                <p className="text-sm text-white/60">
                  Supported: PNG, JPG, WEBP under 8MB
                </p>
                <span className="btn-gradient text-sm">Choose file</span>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-white/60">Selected image</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-48 w-full rounded-2xl object-cover"
                />
                <button
                  type="button"
                  onClick={resetSearch}
                  className="text-sm font-semibold text-rose-200 hover:text-rose-100"
                >
                  Choose different image
                </button>
              </div>
            )}
          </label>

          {previewUrl && !loading && (
            <button
              onClick={handleSearch}
              className="btn-gradient mt-6 w-full justify-center py-4 text-base"
            >
              Find similar products
            </button>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {loading && (
            <div className="text-center">
              <Loader />
              <p className="text-white/60">Searching...</p>
            </div>
          )}

          {searchResults && !loading && (
            <div className="space-y-6">
              {searchResults.results && searchResults.results.length > 0 ? (
                <>
                  <h3 className="text-2xl font-semibold text-white">
                    Found {searchResults.results.length} similar products
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {searchResults.results.map((result, index) => (
                      <div
                        key={index}
                        className="glass-panel rounded-2xl border border-white/5 p-4"
                      >
                        <div className="h-40 w-full overflow-hidden rounded-2xl bg-slate-900">
                          {result.image_url ? (
                            <img
                              src={result.image_url}
                              alt={result.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-white/40">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                              {result.similarity_percentage}% Match
                            </span>
                            <span className="text-xs uppercase tracking-wide text-white/50">
                              {result.category}
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-white">
                            {result.title}
                          </p>
                          {result.price !== undefined && (
                            <p className="text-2xl font-semibold text-emerald-300">
                              ₹{result.price}
                            </p>
                          )}
                          <p className="text-sm text-white/60">
                            {result.description || result.match_quality}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="glass-panel p-8 text-center text-white/70">
                  No similar products found. Try another angle or category.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ImageSearch;
