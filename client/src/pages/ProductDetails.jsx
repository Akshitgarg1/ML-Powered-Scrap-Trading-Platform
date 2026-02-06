import React, { useEffect, useState } from "react";
import { getProduct, getProductRecommendations } from "../services/api";
import { useParams, Link } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
    fetchRecommendations();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await getProduct(id);
      if (res.success) setProduct(res.product);
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

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return `http://localhost:5000${url}`;
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-600">Product not found</h2>
        <Link to="/browse" className="text-blue-600 underline">
          Go Back
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.image_url);

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8 space-y-10">
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/browse" className="btn-ghost text-sm inline-flex items-center gap-2">
          ← Back to Products
        </Link>
      </div>

      {/* Product Wrapper */}
      <div className="glass-panel-dark p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Image */}
        <div className="flex justify-center items-center bg-slate-900/40 rounded-2xl h-80 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-5xl mb-2">📷</div>
              <p>No Image Available</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-display font-semibold text-white mb-4">
            {product.title}
          </h1>

          <p className="text-2xl font-bold text-emerald-300 mb-4">
            ₹{product.price}
          </p>

          <p className="text-white/70 mb-6">{product.description}</p>

          <div className="space-y-2 text-white/80">
            <div><strong>Category:</strong> {product.category}</div>
            {product.brand && <div><strong>Brand:</strong> {product.brand}</div>}
            <div><strong>Condition:</strong> {product.condition}</div>
            <div><strong>Year:</strong> {product.year}</div>

            <div className="pt-3 text-sm text-white/50">
              Listed on: {new Date(product.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-panel-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display font-semibold text-white">
            Similar recommendations
          </h2>
          {!recommendationLoading && (
            <span className="text-sm text-white/60">
              {recommendations.length} items
            </span>
          )}
        </div>

        {recommendationLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-white/60">No similar items available right now.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item) => {
              const recImage = getImageUrl(item.image_url);
              return (
                <div
                  key={item.id}
                  className="glass-panel rounded-2xl p-4 flex flex-col hover:border-white/20 transition"
                >
                  <div className="h-40 w-full bg-slate-900/40 rounded-xl overflow-hidden mb-4">
                    {recImage ? (
                      <img
                        src={recImage}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/40 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      {item.category}
                    </p>
                    <h3 className="text-lg font-semibold text-white line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-emerald-300 font-bold mt-2">
                      ₹{item.price}
                    </p>
                  </div>
                  <Link
                    to={`/product/${item.id}`}
                    className="mt-4 btn-gradient text-sm justify-center"
                  >
                    View details
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
