import React, { useState, useEffect } from "react";
import { formatPrice } from "../../utils/formatPrice";
import { predictPrice, getPriceRange } from "../../services/api";
import { PRICE_CATEGORY_OPTIONS } from "../../utils/constants";
import Loader from "../common/Loader";

const PriceSuggestion = () => {
  const [formData, setFormData] = useState({
    category: "",
    brand: "",
    original_price: "",
    age_years: "",
    condition: "",
    location: "Delhi",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [priceRange, setPriceRange] = useState(null);
  const [priceError, setPriceError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchRange = async () => {
      try {
        const res = await getPriceRange();
        if (res && res.success && mounted) {
          setPriceRange(res.data);
        }
      } catch (err) {
        // ignore - range is best-effort
      }
    };
    fetchRange();
    return () => (mounted = false);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Validate original_price against fetched range
    if (name === 'original_price') {
      const num = Number(value);
      if (!isNaN(num) && priceRange) {
        if (num < priceRange.lower || num > priceRange.upper) {
          setPriceError(`Price should be between ₹${Math.round(priceRange.lower).toLocaleString()} and ₹${Math.round(priceRange.upper).toLocaleString()}.`);
        } else {
          setPriceError(null);
        }
      } else {
        setPriceError(null);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const selectedCategory = PRICE_CATEGORY_OPTIONS.find(
        (opt) => opt.value === formData.category
      )?.modelValue || formData.category;

      const payload = {
        ...formData,
        category: selectedCategory,
        original_price: Number(formData.original_price),
        age_years: Number(formData.age_years),
      };

      const result = await predictPrice(payload);

      if (result.success) {
        setPrediction(result.data);
      } else {
        setError(result.error || "Prediction failed.");
      }
    } catch {
      setError("Unable to connect to the server. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "input-field placeholder-gray-500 text-sm md:text-base";

  return (
    <div className="glass-panel-dark p-6 sm:p-10">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-6 text-center lg:text-left">
        <h2 className="text-3xl font-display font-semibold text-gray-900 dark:text-white">
          Price Predictor
        </h2>
        <p className="text-gray-700 dark:text-white/60">
          Fill a few details and get an estimated resale price.
        </p>
      </div>

      <div className="mt-8 max-w-3xl">
        <form onSubmit={handlePredict} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-white/80">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={fieldClass}
              >
                <option value="">Select</option>
                {PRICE_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-white/80">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                placeholder="Apple, Samsung, Dell..."
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-white/80">
                Original Price (₹) *
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                required
                placeholder="60000"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-white/80">
                Age (Years) *
              </label>
              <input
                type="number"
                step="0.1"
                name="age_years"
                value={formData.age_years}
                onChange={handleChange}
                required
                placeholder="2"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-white/80">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className={fieldClass}
              >
                <option value="">Select</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-white/80">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Delhi"
                className={fieldClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full justify-center py-4 text-base disabled:opacity-60"
          >
            {loading ? "Predicting..." : "Predict price"}
          </button>
        </form>

        {loading && <Loader />}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {prediction && !error && (
          <div className="mt-6 glass-panel p-6">
            <p className="text-sm text-gray-700 dark:text-white/60">Estimated resale price</p>
            <p className="mt-2 text-4xl font-semibold text-gray-900 dark:text-emerald-300">
              {formatPrice(prediction.predicted_price)}
            </p>
            {prediction.message && (
              <p className="mt-2 text-sm text-white/70">{prediction.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceSuggestion;
