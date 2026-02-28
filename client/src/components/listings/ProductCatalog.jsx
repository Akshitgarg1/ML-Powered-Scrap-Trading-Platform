import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteListing, getListings, getProductFeedback } from "../../services/api";
import { LISTING_CATEGORY_OPTIONS } from "../../utils/constants";
import ProductCard from "./ProductCard";

const ProductCatalog = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [productRatings, setProductRatings] = useState({});
  const [filters, setFilters] = useState({
    category: "",
    min_price: "",
    max_price: "",
    search: "",
  });

  const debounceRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    const category = params.get("category") || "";

    const initialFilters = {
      category,
      search,
      min_price: "",
      max_price: "",
    };

    setFilters(initialFilters);
    fetchProducts(Object.fromEntries(
      Object.entries(initialFilters).filter(([, v]) => v !== "")
    ));
  }, [location.search]);

  useEffect(() => {
    if (products.length > 0) {
      applySort(products, sortBy);
    }
  }, [sortBy]);

  const fetchProducts = async (params = {}, { showLoader = true } = {}) => {
    if (showLoader) setLoading(true);
    try {
      const res = await getListings(params);
      if (res.success) {
        setProducts(res.products);
        // Fetch ratings for all products
        await fetchAllProductRatings(res.products);
      }
    } catch {
      setProducts([]);
    } finally {
      if (showLoader) setLoading(false);
      setInitialLoad(false);
    }
  };

  const fetchAllProductRatings = async (productsToRate) => {
    try {
      const ratings = {};
      await Promise.all(
        productsToRate.map(async (product) => {
          try {
            const res = await getProductFeedback(product.id);
            if (res.success) {
              ratings[product.id] = {
                average_rating: res.average_rating || 0,
                total_reviews: res.total_reviews || 0,
              };
            }
          } catch (err) {
            console.error(`Error fetching rating for ${product.id}:`, err);
          }
        })
      );
      setProductRatings(ratings);
    } catch (err) {
      console.error("Error fetching ratings:", err);
    }
  };

  const applySort = async (productsToSort, sortType) => {
    setSorting(true);
    try {
      let sorted = [...productsToSort];

      switch (sortType) {
        case "price-low":
          sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case "price-high":
          sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case "rating":
          sorted.sort((a, b) => {
            const ratingA = productRatings[a.id]?.average_rating || 0;
            const ratingB = productRatings[b.id]?.average_rating || 0;
            return ratingB - ratingA;
          });
          break;
        case "condition":
          const conditionOrder = { excellent: 0, good: 1, fair: 2, poor: 3 };
          sorted.sort(
            (a, b) =>
              (conditionOrder[a.condition?.toLowerCase()] || 999) -
              (conditionOrder[b.condition?.toLowerCase()] || 999)
          );
          break;
        case "brand":
          sorted.sort((a, b) => {
            const brandA = (a.brand || "").toLowerCase().trim() || "zzz-no-brand";
            const brandB = (b.brand || "").toLowerCase().trim() || "zzz-no-brand";
            return brandA.localeCompare(brandB, 'en', { sensitivity: 'base' });
          });
          break;
        case "newest":
          sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        default:
          sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      setProducts(sorted);
    } finally {
      setSorting(false);
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
    setFilters({ category: "", min_price: "", max_price: "", search: "" });
    setSortBy("newest");
    navigate(location.pathname);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return `http://localhost:5000${url}`;
    return null;
  };

  const fieldClass =
    "input-field placeholder-gray-500 text-sm md:text-base rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10";

  if (initialLoad && loading) {
    return (
      <div className="glass-panel-dark flex items-center justify-center py-16 text-gray-600 dark:text-white/70">
        Loading marketplace...
      </div>
    );
  }

  return (
    <div className="space-y-10 relative animation-fade-in">
      {!initialLoad && (loading || filtering || sorting) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-slate-950/60 text-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white/70"></div>
            <span>
              {loading ? "Refreshing products..." : sorting ? "Sorting..." : "Applying filters..."}
            </span>
          </div>
        </div>
      )}
      <div className="glass-panel-dark p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-600 dark:text-white/50 font-bold">
                Smart Marketplace
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Find exactly what you need.
              </h3>
            </div>
          </div>
          <button onClick={clearFilters} className="text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors uppercase tracking-widest">
            Clear Filters
          </button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search items..."
              className={`${fieldClass} pl-11 !bg-slate-50 dark:!bg-slate-950/50`}
            />
          </div>
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
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="min_price"
              value={filters.min_price}
              onChange={handleFilterChange}
              placeholder="Min ₹"
              className={fieldClass}
            />
            <input
              type="number"
              name="max_price"
              value={filters.max_price}
              onChange={handleFilterChange}
              placeholder="Max ₹"
              className={fieldClass}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={fieldClass}
          >
            <option value="newest">📅 Newest</option>
            <option value="price-low">💰 Price: Low to High</option>
            <option value="price-high">💎 Price: High to Low</option>
            <option value="rating">⭐ Highest Rating</option>
            <option value="condition">✨ Best Condition</option>
            <option value="brand">🏷️ Brand (A-Z)</option>
          </select>
          <Link to="/sell" className="btn-gradient text-sm">
            List an item
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <div className="glass-panel-dark col-span-full p-10 text-center text-white/70">
            No items found. Refine your search!
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <ProductCard
                product={product}
                onDelete={handleDeleteProduct}
                getImageUrl={getImageUrl}
              />
            </div>
          ))
        )}
      </div>

      {products.length > 0 && (
        <div className="text-center text-white/60">
          Showing {products.length} item{products.length > 1 ? "s" : ""} • Sorted by{" "}
          {sortBy === "newest" && "Newest"}
          {sortBy === "price-low" && "Price: Low to High"}
          {sortBy === "price-high" && "Price: High to Low"}
          {sortBy === "rating" && "Highest Rating"}
          {sortBy === "condition" && "Best Condition"}
          {sortBy === "brand" && "Brand"}
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
