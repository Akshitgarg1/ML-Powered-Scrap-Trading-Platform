import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMessageThreads, getProduct } from "../services/api";
import { formatPrice } from "../utils/formatPrice";
import { getImageUrl } from "../utils/imageUtils";

const MyOrders = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [inquiries, setInquiries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchInquiries = async () => {
		if (!user?.uid) return;
		try {
			setLoading(true);
			setError(null);
			const res = await getMessageThreads(user.uid);

			if (res?.success) {
				// Filter to buyer inquiries
				const buyerThreads = (res.threads || []).filter(
					(t) => t.buyer_id === user.uid,
				);

				// Enrich with product data
				const enriched = await Promise.all(
					buyerThreads.map(async (t) => {
						try {
							if (!t.product_id) return { ...t, product: null };
							const pRes = await getProduct(t.product_id);
							return { ...t, product: pRes?.success ? pRes.product : null };
						} catch {
							return { ...t, product: null };
						}
					}),
				);

				setInquiries(enriched);
			} else {
				setInquiries([]);
			}
		} catch (err) {
			console.error("Error fetching inquiries:", err);
			setError("Failed to load your inquiries: " + err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			fetchInquiries();
		}
	}, [user]);

	if (loading) {
		return (
			<div className="section-container mt-12 mb-24 flex items-center justify-center">
				<div className="text-center">
					<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-500 mx-auto mb-4"></div>
					<p className="text-slate-600 dark:text-slate-400">Loading your inquiries...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="section-container mt-6 sm:mt-12 mb-12 sm:mb-24 px-4 sm:px-6">
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
					<div>
						<h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white mb-2">
							Purchase <span className="text-gradient">Inquiries</span>
						</h1>
						<p className="text-slate-600 dark:text-slate-400">
							Track the items you've inquired about and communicate directly with sellers.
						</p>
					</div>
					<button
						onClick={() => navigate("/browse")}
						className="btn-gradient !py-2.5 !px-5 text-sm font-semibold"
					>
						Browse Marketplace
					</button>
				</div>

				{inquiries.length === 0 ? (
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
									d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
							No Inquiries Yet
						</h3>
						<p className="text-slate-600 dark:text-slate-400 mb-6">
							You haven't initiated chat on any items yet. Browse the marketplace and chat with sellers directly!
						</p>
						<button onClick={() => navigate("/browse")} className="btn-gradient">
							Explore Marketplace
						</button>
					</div>
				) : (
					<div className="space-y-4">
						{inquiries.map((item) => {
							const product = item.product;
							const lastMsg = item.last_message?.content || "Conversation started";

							return (
								<div
									key={item.id}
									className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-lg transition-all duration-300"
								>
									<div className="flex items-center gap-4">
										{/* Product Thumbnail */}
										<div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex-shrink-0">
											{product?.image_url ? (
												<img
													src={getImageUrl(product.image_url)}
													alt={product?.title || "Item"}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
													No Image
												</div>
											)}
										</div>

										{/* Details */}
										<div>
											<h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
												{product?.title || `Item ${item.product_id?.slice(0, 8)}...`}
											</h3>
											<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
												Seller: {item.seller_id?.slice(0, 10)}...
											</p>
											<p className="text-xs text-slate-600 dark:text-slate-300 italic truncate max-w-md">
												"{lastMsg}"
											</p>
										</div>
									</div>

									{/* Price and Action */}
									<div className="flex items-center gap-4 self-end sm:self-center">
										{product?.price && (
											<span className="text-xl font-display font-black text-slate-900 dark:text-white">
												{formatPrice(product.price)}
											</span>
										)}
										<Link
											to={`/messages/${item.id}`}
											className="btn-gradient !py-2.5 !px-5 text-sm font-semibold whitespace-nowrap"
										>
											Open Chat →
										</Link>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default MyOrders;
