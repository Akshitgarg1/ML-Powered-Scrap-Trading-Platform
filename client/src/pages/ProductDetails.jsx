import React, { useEffect, useState } from "react";
import { getProduct, getProductRecommendations, initializeEscrow } from "../services/api";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import FeedbackForm from "../components/listings/FeedbackForm";
import FeedbackList from "../components/listings/FeedbackList";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [escrowLoading, setEscrowLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(true);

  const handleBuy = async () => {
    setEscrowLoading(true);
    try {
      // For demo: Use current mock IDs
      const buyerId = localStorage.getItem("escrow_user_id") || "demo_buyer";

      const res = await initializeEscrow({
        product_id: product.id,
        buyer_id: buyerId,
        seller_id: product.seller_id || "demo_seller",
        amount: product.price
      });

      if (res.success) {
        navigate(`/escrow/${res.escrow_id}`);
      }
    } catch (err) {
      alert("Escrow Initiation Failed: " + err.message);
    } finally {
      setEscrowLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchRecommendations();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await getProduct(id);
      if (res.success) {
        setProduct(res.product);
        // Check if in wishlist
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlisted(wishlist.includes(id));
      }
    } catch (err) {
      console.error("Error loading product:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setRecommendationLoading(true);
      const res = await getProductRecommendations(id);
      if (res.success) setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error("Error loading recommendations:", err);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    let newWishlist;
    if (wishlisted) {
      newWishlist = wishlist.filter(item => item !== id);
    } else {
      newWishlist = [...wishlist, id];
    }
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setWishlisted(!wishlisted);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out this ${product.title} on Scrap Trading Platform!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("Link Copied!");
        setTimeout(() => setShareStatus(""), 2000);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return `http://localhost:5000${url}`;
    return null;
  };

  if (loading) {
    return (
      <div className="section-products min-h-screen flex justify-center items-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section-products min-h-screen text-center py-20 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-400 transition-colors duration-300">Product not found</h2>
        <Link to="/browse" className="text-indigo-600 dark:text-indigo-400 underline transition-colors duration-300">
          Go Back
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.image_url);

  return (
    <div className="min-h-screen py-10 transition-colors duration-500">
      <div className="section-container">
        {/* Back Button */}
        <div className="mb-10">
          <Link to="/browse" className="btn-secondary !py-2.5 !px-5 !text-sm flex items-center gap-2 w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Marketplace
          </Link>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 group">

          {/* Left Column: Visuals */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel overflow-hidden aspect-[4/3] relative">
              <div className="absolute inset-0 bg-grid-subtle opacity-10"></div>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-900/50">
                  <svg className="w-20 h-20 opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-bold uppercase tracking-widest text-xs">Awaiting Asset Inspection</p>
                </div>
              )}

              {/* Overlay Badges */}
              <div className="absolute top-6 left-6 flex gap-3">
                <span className="glass-panel !rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-slate-950/40 backdrop-blur-md">
                  Verified Listing
                </span>
                <span className={`glass-panel !rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white ${product.condition?.toLowerCase() === 'good' ? 'bg-emerald-600/60' : 'bg-brand-600/60'}`}>
                  {product.condition} Condition
                </span>
              </div>
            </div>

            {/* Technical Metadata Bar */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Purchase Year", value: product.year },
                { label: "Asset Class", value: product.category },
                { label: "Brand", value: product.brand || "Authentic" }
              ].map(stat => (
                <div key={stat.label} className="card-light !p-4 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/30">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Pricing & Action */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-xs">Premium Resale Opportunity</span>
              <h1 className="section-heading !text-4xl lg:!text-5xl leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-display font-bold text-slate-900 dark:text-white">
                  {formatPrice(product.price)}
                </p>
                <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded border border-emerald-500/10">
                  Market Verified
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              {product.description}
            </p>

            <div className="pt-8 space-y-4 border-t border-slate-200 dark:border-white/5">
              <button
                onClick={handleBuy}
                disabled={escrowLoading}
                className="btn-gradient w-full !rounded-xl !py-4 text-center disabled:opacity-50"
              >
                {escrowLoading ? "Initializing Secure Protocol..." : "Secure Buy with Escrow"}
              </button>
              <div className="flex gap-4">
                <button
                  onClick={handleWishlist}
                  className={`btn-secondary flex-1 !rounded-xl !py-3.5 !px-4 text-sm flex items-center justify-center gap-2 transition-all duration-300 ${wishlisted ? "!bg-brand-500 !text-white !border-brand-500" : ""
                    }`}
                >
                  <svg
                    className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlisted ? "In Watchlist" : "Save to Watchlist"}
                </button>
                <button
                  onClick={handleShare}
                  className="btn-secondary !p-3.5 !rounded-xl relative group"
                  title="Share"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {shareStatus && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap animate-fade-in">
                      {shareStatus}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 bg-brand-500/5 dark:bg-brand-500/10 rounded-2xl border border-brand-500/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Suggestion</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Our ML model suggests this item is priced slightly below market average. Excellent procurement opportunity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-24 space-y-10">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-6">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Related <span className="text-gradient">Products</span>
            </h2>
            <Link to="/browse" className="text-brand-600 dark:text-brand-400 font-bold text-sm">
              Browse More →
            </Link>
          </div>

          {recommendationLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="card-light text-center py-20 opacity-50">No similar assets currently indexed.</div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.slice(0, 4).map((item) => {
                const recImage = getImageUrl(item.image_url);
                return (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="relative rounded-2xl overflow-hidden aspect-square mb-4 bg-slate-100 dark:bg-slate-900">
                      {recImage ? (
                        <img
                          src={recImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <Link to={`/product/${item.id}`} className="w-full btn-gradient !py-2 !text-[10px]">View Detail</Link>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1">{item.title}</h3>
                      <p className="text-brand-600 dark:text-brand-400 font-bold text-sm">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Feedback Sections - These will inherit the new professional styles */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <FeedbackList productId={id} />
          <FeedbackForm productId={id} productName={product?.title} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
