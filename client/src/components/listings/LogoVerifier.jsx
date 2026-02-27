import React, { useEffect, useState } from "react";
import { getLogoBrands, verifyLogo } from "../../services/api";

const initialResult = {
  is_genuine: null,
  best_brand_match: "",
  confidence: 0,
  explanation: "",
  top_matches: [],
};

const LogoVerifier = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getLogoBrands();
        setBrands(res.brands || []);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a clear product/logo image.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(initialResult);
    try {
      const response = await verifyLogo({
        imageFile: file,
        brand: selectedBrand || undefined,
      });
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = result.is_genuine
    ? "Genuine"
    : result.is_genuine === false
    ? "Potential fake"
    : "Awaiting upload";

  const statusColor = result.is_genuine
    ? "text-emerald-300"
    : result.is_genuine === false
    ? "text-rose-300"
    : "text-white/60";

  return (
    <section className="glass-panel-dark p-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-gray-600 dark:text-white/50">
              Authenticity lab
            </p>
            <h2 className="mt-2 text-3xl font-display font-semibold text-gray-900 dark:text-white">
              Fake logo verification
            </h2>
            <p className="mt-2 text-gray-700 dark:text-white/70">
              Upload a product photo focused on the logo. We compare it with our
              authenticated references to flag tampering instantly.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-white/80">
              Brand (optional)
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="input-field mt-2"
            >
              <option value="">Auto detect</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-white/80">
              Product / logo image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="input-field mt-2 bg-white/10"
            />
            <p className="mt-2 text-xs text-gray-600 dark:text-white/50">
              Use a clear, front-facing photo of the logo portion of your product.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full justify-center py-4 text-base disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify logo"}
          </button>
        </form>

        <div className="space-y-6">
            <div className="glass-panel p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-600 dark:text-white/50">
              Result
            </p>
            <p className={`mt-3 text-3xl font-semibold ${statusColor.replace('text-white','text-gray-900 dark:text-white')}`}>
              {statusLabel}
            </p>
            {result.is_genuine !== null && (
              <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-white/70">
                <p>{result.explanation}</p>
                <p>
                  <span className="font-semibold text-gray-800 dark:text-white/90">Detected brand:</span>{" "}
                  {result.best_brand_match?.toUpperCase() || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-gray-800 dark:text-white/90">Confidence:</span>{" "}
                  {(result.confidence * 100).toFixed(1)}% (threshold{" "}
                  {(result.threshold * 100).toFixed(0)}%)
                </p>
              </div>
            )}
          </div>

          {result.top_matches?.length > 0 && (
              <div className="glass-panel p-6">
              <p className="text-sm font-semibold text-gray-800 dark:text-white/80">
                Closest reference logos
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {result.top_matches.map((match) => (
                  <div
                    key={`${match.brand}-${match.reference_url}`}
                    className="rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 p-3 text-center text-gray-900 dark:text-white"
                  >
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/80">
                      {match.brand.toUpperCase()}
                    </p>
                    {match.reference_url && (
                      <img
                        src={`http://localhost:5000${match.reference_url}`}
                        alt={`${match.brand} reference`}
                        className="mt-2 h-24 w-full rounded-xl bg-white/5 object-contain dark:bg-white/5"
                      />
                    )}
                    <p className="mt-2 text-xs text-gray-600 dark:text-white/60">
                      Similarity {(match.similarity * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LogoVerifier;

