import React, { useState } from "react";
import { submitProductFeedback } from "../../services/api";

const FeedbackForm = ({ productId, productName }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await submitProductFeedback({
        product_id: productId,
        rating,
        comment,
        user_name: userName,
      });
      if (res.success) {
        setSubmitted(true);
        setTimeout(() => {
          setRating(5);
          setComment("");
          setUserName("");
          setSubmitted(false);
        }, 3000);
      } else {
        setError("Failed to submit feedback. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-12 p-6 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl backdrop-blur-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="text-3xl">✓</div>
          <div>
            <p className="text-emerald-700 dark:text-emerald-300 font-semibold transition-colors duration-300">Thank you for your feedback!</p>
            <p className="text-emerald-600/70 dark:text-emerald-200/70 text-sm transition-colors duration-300">Your review helps other users make better decisions.</p>
          </div>
        </div>
      </div>
    );
  }

  const stars = [1, 2, 3, 4, 5];
  const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="mt-12">
      <div className="card-light p-8 rounded-2xl border border-gray-200 dark:border-white/10 transition-colors duration-300">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Share Your Experience</h3>
          <p className="text-gray-600 dark:text-white/60 transition-colors duration-300">Help others by sharing your honest feedback about this product</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-xl transition-colors duration-300">
            <p className="text-red-700 dark:text-red-300 text-sm transition-colors duration-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-3 transition-colors duration-300">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-4 transition-colors duration-300">Rate This Product</label>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {stars.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onMouseEnter={() => setHoverRating(r)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(r)}
                    className="transition duration-200 transform hover:scale-110"
                  >
                    <span
                      className={`text-4xl transition ${
                        r <= (hoverRating || rating)
                          ? "text-yellow-400 drop-shadow-lg"
                          : "text-gray-300 dark:text-white/20"
                      }`}
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-gray-700 dark:text-white/70 font-medium transition-colors duration-300">
                {hoverRating ? ratingLabels[hoverRating - 1] : ratingLabels[rating - 1]}
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-3 transition-colors duration-300">Your Feedback</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 resize-none"
              placeholder="Share your experience with this product... (minimum 10 characters)"
              rows="5"
              required
            />
            <p className="text-gray-500 dark:text-white/40 text-xs mt-2 transition-colors duration-300">{comment.length} characters</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-500 dark:disabled:to-gray-600 text-white font-semibold rounded-xl transition duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Submitting...
              </>
            ) : (
              <>
                <span>Send Feedback</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

        {/* Info Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
          <p className="text-gray-600 dark:text-white/50 text-xs flex items-center gap-2 transition-colors duration-300">
            <span>💡</span>
            Your feedback is valuable and helps us improve the platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;