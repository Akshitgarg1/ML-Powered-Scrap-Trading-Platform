import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyListings, deleteListing } from "../services/api";
import { formatPrice } from "../utils/formatPrice";
import { getImageUrl } from "../utils/imageUtils";

const toDate = (timestamp) => {
	const value = Number(timestamp);
	if (!value) return new Date();
	return new Date(value < 1e12 ? value * 1000 : value);
};

const MySoldItems = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [deletingId, setDeletingId] = useState(null);

	const loadListings = async () => {
		try {
			setLoading(true);
			setError(null);
			const listingsRes = await getMyListings();
			if (listingsRes?.success) {
				setProducts(listingsRes.products || []);
			} else {
				setError("Unable to load listings.");
			}
		} catch (err) {
			console.error("Error fetching listings:", err);
			setError("Failed to load listings: " + err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			loadListings();
		}
	}, [user]);

	const handleDelete = async (productId) => {
		if (!window.confirm("Are you sure you want to remove this product listing?")) {
			return;
		}
		setDeletingId(productId);
		try {
			const res = await deleteListing(productId);
			if (res?.success) {
				setProducts((prev) => prev.filter((p) => p.id !== productId));
			} else {
				alert(res?.error || "Failed to delete listing.");
			}
		} catch (err) {
			alert("Error deleting listing: " + err.message);
		} finally {
			setDeletingId(null);
		}
	};

	if (loading) {
		return (
			<div className="section-container mt-12 mb-24 flex items-center justify-center">
				<div className="text-center">
					<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-500 mx-auto mb-4"></div>
					<p className="text-slate-600 dark:text-slate-400">Loading your listings...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="section-container mt-12 mb-24 text-center">
				<p className="text-red-500 font-bold mb-4">{error}</p>
				<button onClick={loadListings} className="btn-secondary">
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="section-container mt-6 sm:mt-12 mb-12 sm:mb-24 px-4 sm:px-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
					<div>
						<h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white mb-2">
							My <span className="text-gradient">Listings</span>
						</h1>
						<p className="text-slate-600 dark:text-slate-400">
							Manage the items you've posted on the marketplace.
						</p>
					</div>
					<div className="flex gap-3">
						<button
							onClick={() => navigate("/messages")}
							className="btn-secondary !py-2.5 !px-5 text-sm font-semibold"
						>
							View Messages
						</button>
						<button
							onClick={() => navigate("/sell")}
							className="btn-gradient !py-2.5 !px-5 text-sm font-semibold"
						>
							+ List New Item
						</button>
					</div>
				</div>

				{products.length === 0 ? (
					<div className="glass-panel p-12 text-center max-w-lg mx-auto">
						<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-500/10 flex items-center justify-center">
							<svg
								className="w-8 h-8 text-brand-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
							No Items Listed Yet
						</h3>
						<p className="text-slate-600 dark:text-slate-400 mb-6">
							You haven't listed any items for sale yet. Start selling by listing your first product!
						</p>
						<button onClick={() => navigate("/sell")} className="btn-gradient">
							List Your First Item
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{products.map((product) => (
							<div
								key={product.id}
								className="glass-panel p-5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
							>
								<div>
									{/* Product Image */}
									<div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 mb-4 relative">
										{product.images?.[0] || product.image_url ? (
											<img
												src={getImageUrl(product.images?.[0] || product.image_url)}
												alt={product.title}
												className="w-full h-full object-cover"
												onError={(e) => {
													e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
												}}
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-slate-400">
												No Image Available
											</div>
										)}
										<span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950/70 backdrop-blur-md text-white">
											{product.condition || "Standard"}
										</span>
									</div>

									{/* Product Info */}
									<h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 truncate">
										{product.title}
									</h3>
									<p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
										Category: {product.category || "General"}
									</p>
									<p className="text-2xl font-display font-black text-brand-600 dark:text-brand-400 mb-4">
										{formatPrice(product.price)}
									</p>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
									<Link
										to={`/product/${product.id}`}
										className="flex-1 btn-secondary !py-2 text-center text-xs font-semibold"
									>
										View Details
									</Link>
									<button
										onClick={() => handleDelete(product.id)}
										disabled={deletingId === product.id}
										className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50 border border-rose-200 dark:border-rose-900/30"
									>
										{deletingId === product.id ? "Deleting..." : "Delete"}
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default MySoldItems;
