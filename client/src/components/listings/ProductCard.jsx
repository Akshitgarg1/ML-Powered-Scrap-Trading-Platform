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
    if (rating === 0) return "bg-slate-200 dark:bg-slate-800 text-slate-500";
    if (rating < 3) return "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400";
    if (rating < 4) return "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400";
    return "bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400";
  };

  const getRatingLabel = (rating) => {
    if (rating === 0) return "No Rating";
    if (rating < 2.5) return "Economy";
    if (rating < 3.5) return "Standard";
    if (rating < 4.5) return "Premium";
    return "Elite";
  };

  return (
    <div className="group card-light flex h-full flex-col !p-0">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-brand-600/5 via-transparent to-accent-600/10"></div>

      {/* Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 transition-all duration-700 group-hover:scale-[0.98] group-hover:mt-2 group-hover:mx-2 group-hover:w-[calc(100%-1rem)] group-hover:rounded-xl">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400 dark:text-white/20">
            No Image Available
          </div>
        )}

        {/* Rating Badge - Re-designed for Premium Feel */}
        {!loadingRating && (
          <div className={`absolute top-4 right-4 ${getRatingColor(averageRating)} backdrop-blur-md rounded-lg px-3 py-1.5 flex flex-col items-center gap-0 shadow-lg border border-white/20 dark:border-white/5 transition-all duration-500 transform group-hover:translate-x-1 group-hover:-translate-y-1`}>
            {totalReviews > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-amber-400">★</span>
              </div>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider">New</span>
            )}
          </div>
        )}

        {/* Category Badge - Bottom Left */}
        <div className="absolute bottom-4 left-4">
          <span className="rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
            {product.category || "General"}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 relative z-10">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 transition-colors duration-300 group-hover:text-brand-600 dark:group-hover:text-brand-400">
            {product.title}
          </h3>
          <span className="text-xl font-display font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6">
          {product.description}
        </p>

        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-white/5 pr-4">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              {product.condition}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              {product.year}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              to={`/product/${product.id}`}
              className="btn-gradient flex-1 !py-3 !px-4 !text-xs !rounded-lg"
            >
              View Details
            </Link>
            <button
              onClick={() => onDelete(product.id)}
              className="px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all duration-300"
              title="Delete Listing"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
