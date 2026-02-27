import React, { useState, useEffect } from "react";
import { getProductFeedback } from "../../services/api";

const FeedbackList = ({ productId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchFeedbacks();
  }, [productId]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await getProductFeedback(productId);
      if (res.success) {
        setFeedbacks(res.feedback || []);
        setAverageRating(res.average_rating || 0);
        setTotalReviews(res.total_reviews || 0);
      }
    } catch (err) {
      console.error("Error loading feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSortedFeedbacks = () => {
    const sorted = [...feedbacks];
    if (sortBy === "recent") {
      return sorted.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    } else if (sortBy === "highest") {
      return sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowest") {
      return sorted.sort((a, b) => a.rating - b.rating);
    }
    return sorted;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const RatingStars = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? "text-yellow-400" : "text-gray-300 dark:text-white/20"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const sortedFeedbacks = getSortedFeedbacks();

  return (
    <div className="mt-12">
      <div className="card-light p-8 rounded-2xl border border-gray-200 dark:border-white/10 transition-colors duration-300">
        {/* Header and Stats */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Customer Reviews</h3>

          {/* Rating Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Average Rating */}
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 transition-colors duration-300">
              <p className="text-gray-600 dark:text-white/60 text-sm mb-2 transition-colors duration-300">Average Rating</p>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-yellow-400">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex flex-col">
                  <RatingStars rating={Math.round(averageRating)} />
                  <p className="text-gray-500 dark:text-white/50 text-xs mt-2 transition-colors duration-300">
                    {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 md:col-span-2 transition-colors duration-300">
              <p className="text-gray-600 dark:text-white/60 text-sm mb-4 transition-colors duration-300">Rating Breakdown</p>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = feedbacks.filter((f) => f.rating === stars).length;
                  const percentage = totalReviews ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="text-gray-600 dark:text-white/60 text-sm w-24 text-right transition-colors duration-300">
                        {stars} Star{stars !== 1 ? "s" : ""}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden transition-colors duration-300">
                        <div
                          className="h-full bg-yellow-400/70 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-500 dark:text-white/50 text-sm w-10 text-right transition-colors duration-300">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sort and Filter */}
        {totalReviews > 0 && (
          <div className="mb-8 flex items-center gap-4 pb-8 border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <span className="text-gray-700 dark:text-white/60 text-sm font-semibold transition-colors duration-300">Sort Reviews</span>
              <div className="relative">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 pl-10 pr-12 bg-white dark:bg-slate-800 border border-gray-300 dark:border-blue-500/50 rounded-lg text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition appearance-none cursor-pointer [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-900 dark:[&>option]:text-white [&>option:checked]:bg-blue-600 [&>option:checked]:text-white transition-colors duration-300"
                >
                  <option value="recent">📅 Most Recent</option>
                  <option value="highest">⭐ Highest Rating</option>
                  <option value="lowest">⬇️ Lowest Rating</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-600 dark:text-white/60 transition-colors duration-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-600 dark:text-white/60 transition-colors duration-300">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Sort Badge */}
            <div className="ml-auto">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-medium transition-colors duration-300">
                {sortBy === "recent" && "🔄 Sorted by Date"}
                {sortBy === "highest" && "⭐ Sorted by Rating (High to Low)"}
                {sortBy === "lowest" && "⬇️ Sorted by Rating (Low to High)"}
              </span>
            </div>
          </div>
        )}

        {/* Feedbacks List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : totalReviews === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-600 dark:text-white/60 transition-colors duration-300">
              No reviews yet. Be the first to share your feedback!
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {sortedFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors duration-300"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold transition-colors duration-300">{feedback.user_name}</p>
                    <RatingStars rating={feedback.rating} />
                  </div>
                  <p className="text-gray-500 dark:text-white/50 text-sm transition-colors duration-300">{formatDate(feedback.timestamp)}</p>
                </div>

                {/* Review Comment */}
                <p className="text-gray-700 dark:text-white/70 text-sm leading-relaxed transition-colors duration-300">
                  {feedback.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </div>
  );
};

export default FeedbackList;
