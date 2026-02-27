import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatPrice";
import { getProductFeedback } from "../../services/api";

const ProductCard = ({ product, onDelete, getImageUrl }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingRating, setLoadingRating] = useState(true);

  useEffect(() => {
    fetchAverageRating();
  }, [product.id]);

  const fetchAverageRating = async () => {
    try {
      setLoadingRating(true);
      const res = await getProductFeedback(product.id);
      if (res.success) {
        setAverageRating(res.average_rating || 0);
        setTotalReviews(res.total_reviews || 0);
      }
    } catch (err) {
      console.error("Error loading rating:", err);
    } finally {
      setLoadingRating(false);
    }
  };

  const img = getImageUrl(product.image_url);

  // Determine badge color based on rating
  const getRatingColor = (rating) => {
    if (rating === 0) return "from-gray-500/90 to-gray-600/90 border-gray-400/20";
    if (rating < 3) return "from-red-500/90 to-rose-500/90 border-red-400/20";
    if (rating < 4) return "from-yellow-500/90 to-amber-500/90 border-yellow-400/20";
    return "from-emerald-500/90 to-green-500/90 border-emerald-400/20";
  };

  const getRatingLabel = (rating) => {
    if (rating === 0) return "No Rating";
    if (rating < 2.5) return "Poor";
    if (rating < 3.5) return "Good";
    if (rating < 4.5) return "Excellent";
    return "Outstanding";
  };

  return (
    <div className="group glass-panel flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-white/0 p-4 transition-all duration-500 ease-out hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 hover:from-white/10 hover:to-white/5 hover:ring-4 hover:ring-blue-400/25 ring-0 ring-offset-0 relative">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>

      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/40 ring-1 ring-white/10 group-hover:ring-blue-400/30 transition-all duration-500">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 brightness-95 group-hover:brightness-110"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-white/40 group-hover:text-gray-700 dark:group-hover:text-white/60 transition-colors duration-500">
            No image
          </div>
        )}

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/0 via-transparent to-blue-900/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>

        {/* Rating Badge - Top Right Corner */}
        {!loadingRating && (
          <div className={`absolute top-3 right-3 bg-gradient-to-br ${getRatingColor(averageRating)} backdrop-blur-md rounded-2xl px-4 py-2 flex flex-col items-center gap-1 shadow-2xl border group-hover:shadow-3xl group-hover:shadow-blue-500/30 transform group-hover:scale-110 transition-all duration-500 animation-pulse`}>
            {totalReviews > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-gray-900 dark:text-white text-lg font-bold drop-shadow-lg group-hover:text-yellow-100 dark:group-hover:text-yellow-100 transition-colors duration-300">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xl text-yellow-300 transition-transform duration-300 transform group-hover:rotate-12">
                    ★
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-semibold text-gray-800 dark:text-white/90 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                    {getRatingLabel(averageRating)}
                  </span>
                  <span className="text-xs text-gray-700 dark:text-white/75 px-1.5 py-0.5 bg-white/10 dark:bg-white/5 group-hover:bg-white/20 dark:group-hover:bg-white/10 rounded-full transition-colors duration-300">
                    {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </>
            ) : (
                <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-gray-800 dark:text-white/90 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">No Ratings</span>
                <span className="text-xs text-gray-700 dark:text-white/75 group-hover:text-gray-900 dark:group-hover:text-white/90 transition-colors duration-300">Be first to review</span>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loadingRating && (
          <div className="absolute top-3 right-3 bg-gradient-to-br from-slate-600/90 to-slate-700/90 backdrop-blur-md rounded-2xl px-4 py-2 shadow-lg border border-slate-400/20">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/10 group-hover:bg-white/20 px-3 py-1 text-xs uppercase tracking-wide text-gray-800 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-blue-200 transition-all duration-300">
            {product.category || "General"}
          </span>
          <span className="text-2xl font-semibold text-gray-900 dark:text-emerald-300 group-hover:text-gray-800 dark:group-hover:text-emerald-200 group-hover:scale-110 transition-all duration-300 origin-right">
            {formatPrice(product.price)}
          </span>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-blue-200 transition-colors duration-300">
            {product.title}
          </h3>
          <p className="mt-2 text-sm text-gray-700 dark:text-white/70 line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-white/85 transition-colors duration-300">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white/80 transition-colors duration-300">
          <span className="capitalize">{product.condition}</span>
          <span>{product.year}</span>
        </div>

        {product.brand && (
          <p className="text-sm text-gray-700 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white/80 transition-colors duration-300">Brand: {product.brand}</p>
        )}

        <div className="mt-auto flex gap-3">
          <Link
            to={`/product/${product.id}`}
            className="btn-gradient flex-1 justify-center text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95"
          >
            View
          </Link>
          <button
            onClick={() => onDelete(product.id)}
            className="btn-danger text-sm disabled:opacity-60"
          >
            Delete
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-white/40 group-hover:text-gray-700 dark:group-hover:text-white/50 transition-colors duration-300">
          Listed on: {new Date(product.created_at).toLocaleDateString()}
        </p>
      </div>

      <style>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animation-pulse {
          animation: pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
