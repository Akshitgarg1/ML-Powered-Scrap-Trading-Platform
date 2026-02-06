import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { deleteListing, getListings } from "../../services/api";
import { LISTING_CATEGORY_OPTIONS } from "../../utils/constants";

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    min_price: "",
    max_price: "",
  });

  const debounceRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (params = {}, { showLoader = true } = {}) => {
    if (showLoader) setLoading(true);
    try {
      const res = await getListings(params);
      if (res.success) setProducts(res.products);
    } catch {
      setProducts([]);
    } finally {
      if (showLoader) setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await deleteListing(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        alert("Product deleted successfully.");
      }
    } catch {
      alert("Failed to delete product.");
    }
  };

  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filtered = Object.fromEntries(
        Object.entries(updated).filter(([, value]) => value !== "")
      );
      setFiltering(true);
      fetchProducts(filtered, { showLoader: false }).finally(() =>
        setFiltering(false)
      );
    }, 400);
  };

  const clearFilters = () => {
    setFilters({ category: "", min_price: "", max_price: "" });
    fetchProducts({}, { showLoader: true });
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return `http://localhost:5000${url}`;
    return null;
  };

  const fieldClass =
    "input-field placeholder:text-white/50 text-sm md:text-base rounded-2xl";

  if (initialLoad && loading) {
    return (
      <div className="glass-panel-dark flex items-center justify-center py-16 text-white/70">
        Loading marketplace...
      </div>
    );
  }

  return (
    <div className="space-y-10 relative">
      {!initialLoad && (loading || filtering) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-slate-950/60 text-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white/70"></div>
            <span>{loading ? "Refreshing products..." : "Applying filters..."}</span>
          </div>
        </div>
      )}
      <div className="glass-panel-dark p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">
              Filter products
            </p>
            <h3 className="text-2xl font-semibold text-white">
              Tune the inventory instantly.
            </h3>
          </div>
          <button onClick={clearFilters} className="btn-ghost text-sm">
            Reset
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className={fieldClass}
          >
            <option value="">All categories</option>
            {LISTING_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="min_price"
            value={filters.min_price}
            onChange={handleFilterChange}
            placeholder="Min price (₹)"
            className={fieldClass}
          />
          <input
            type="number"
            name="max_price"
            value={filters.max_price}
            onChange={handleFilterChange}
            placeholder="Max price (₹)"
            className={fieldClass}
          />
          <Link to="/sell" className="btn-gradient text-sm">
            List an item
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <div className="glass-panel-dark col-span-full p-10 text-center text-white/70">
            No products available. Be the first to add one!
          </div>
        ) : (
          products.map((product) => {
            const img = getImageUrl(product.image_url);
            return (
              <div
                key={product.id}
                className="glass-panel flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 p-4"
              >
                <div className="h-56 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/40">
                  {img ? (
                    <img
                      src={img}
                      alt={product.title}
                      className="h-full w-full object-cover transition hover:scale-105"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/40">
                      No image
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/60">
                      {product.category || "General"}
                    </span>
                    <span className="text-2xl font-semibold text-emerald-300">
                      ₹{product.price}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/70 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="capitalize">{product.condition}</span>
                    <span>{product.year}</span>
                  </div>
                  {product.brand && (
                    <p className="text-sm text-white/60">Brand: {product.brand}</p>
                  )}

                  <div className="mt-auto flex gap-3">
                    <Link
                      to={`/product/${product.id}`}
                      className="btn-gradient flex-1 justify-center text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="btn-ghost text-sm text-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs text-white/40">
                    Listed on: {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {products.length > 0 && (
        <div className="text-center text-white/60">
          Showing {products.length} item{products.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
