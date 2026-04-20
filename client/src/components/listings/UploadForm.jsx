import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing, uploadImages } from "../../services/api";
import { LISTING_CATEGORY_OPTIONS } from "../../utils/constants";

const UploadForm = () => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		category: "",
		brand: "",
		condition: "good",
		price: "",
		year: new Date().getFullYear(),
		images: [],
	});

	const [imagePreviews, setImagePreviews] = useState([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleChange = (e) => {
		const { name, value, type, files } = e.target;

		if (type === "file") {
			const selectedFiles = Array.from(files);
			const newImages = [...formData.images, ...selectedFiles];
			setFormData((prev) => ({ ...prev, images: newImages }));

			// Create previews
			const newPreviews = selectedFiles.map((file) => {
				return new Promise((resolve) => {
					const reader = new FileReader();
					reader.onload = (event) => resolve(event.target.result);
					reader.readAsDataURL(file);
				});
			});

			Promise.all(newPreviews).then((previews) => {
				setImagePreviews((prev) => [...prev, ...previews]);
			});
			return;
		}

		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const removeImage = (index) => {
		const newImages = formData.images.filter((_, i) => i !== index);
		const newPreviews = imagePreviews.filter((_, i) => i !== index);
		setFormData((prev) => ({ ...prev, images: newImages }));
		setImagePreviews(newPreviews);
	};

	const moveImage = (fromIndex, toIndex) => {
		const newImages = [...formData.images];
		const newPreviews = [...imagePreviews];

		const [movedImage] = newImages.splice(fromIndex, 1);
		const [movedPreview] = newPreviews.splice(fromIndex, 1);

		newImages.splice(toIndex, 0, movedImage);
		newPreviews.splice(toIndex, 0, movedPreview);

		setFormData((prev) => ({ ...prev, images: newImages }));
		setImagePreviews(newPreviews);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		try {
			let imageUrls = [];
			if (formData.images.length > 0) {
				const uploadRes = await uploadImages(formData.images);
				if (!uploadRes.success) {
					throw new Error(uploadRes.error);
				}
				imageUrls = uploadRes.urls;
			}

			const payload = {
				title: formData.title,
				description: formData.description,
				category: formData.category,
				brand: formData.brand,
				condition: formData.condition,
				price: Number(formData.price),
				year: Number(formData.year),
				image_urls: imageUrls,
			};

			const result = await createListing(payload);
			if (result.success) {
				setMessage("Product listed successfully.");
				setFormData({
					title: "",
					description: "",
					category: "",
					brand: "",
					condition: "good",
					price: "",
					year: new Date().getFullYear(),
					images: [],
				});
				setImagePreviews([]);
				setTimeout(() => navigate("/browse?my_inventory=1"), 800);
			}
		} catch (err) {
			setMessage(err.message);
		} finally {
			setLoading(false);
		}
	};

	const fieldClass =
		"input-field placeholder-gray-500 text-sm md:text-base rounded-2xl";

	return (
		<div className="glass-panel-dark overflow-hidden p-0 shadow-2xl transition-colors duration-300 border border-white/10">
			{/* Header with Gradient Background */}
			<div className="bg-gradient-to-r from-teal-600/20 to-emerald-600/20 p-8 md:p-12 border-b border-white/5 transition-colors duration-300">
				<h2 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-white/70 transition-colors duration-300">
					Marketplace Submission
				</h2>
				<p className="mt-2 text-gray-700 dark:text-white/60 transition-colors duration-300 max-w-2xl">
					Upload crisp imagery, highlight condition, and let our ML-driven
					marketplace polish the presentation and suggest verified buyers for
					you.
				</p>
			</div>

			<div className="p-8 md:p-12">
				<form onSubmit={handleSubmit} className="space-y-8">
					<div className="grid gap-6 sm:gap-10 md:grid-cols-2">
						<div className="space-y-4">
							<label className="glass-panel flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 dark:border-white/20 p-8 text-center cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all duration-300">
								<div className="rounded-2xl bg-brand-500/10 p-5 text-brand-600 dark:text-brand-400 transition-colors duration-300 group-hover:scale-110">
									<svg
										className="w-8 h-8"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<div>
									<p className="text-xl font-bold text-slate-800 dark:text-white">
										Upload Product Images
									</p>
									<p className="mt-1 text-sm text-slate-500 dark:text-white/40 max-w-[200px] mx-auto">
										High-resolution PNG, JPG, or WEBP (Max 8MB each)
									</p>
								</div>
								<span className="btn-gradient !py-2 !px-6 !text-xs !rounded-full shadow-lg shadow-brand-500/20">
									Choose Files
								</span>
								<input
									type="file"
									name="images"
									accept="image/*"
									multiple
									onChange={handleChange}
									className="hidden"
								/>
							</label>

							{/* Image Previews with Reordering */}
							{imagePreviews.length > 0 && (
								<div className="space-y-3">
									<h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40">
										Image Order (First image will be primary)
									</h3>
									<div className="grid grid-cols-2 gap-3">
										{imagePreviews.map((preview, index) => (
											<div key={index} className="relative group">
												<img
													src={preview}
													alt={`Preview ${index + 1}`}
													className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-white/10"
												/>
												<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
													<button
														type="button"
														onClick={() => removeImage(index)}
														className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
														title="Remove"
													>
														<svg
															className="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
													{index > 0 && (
														<button
															type="button"
															onClick={() => moveImage(index, index - 1)}
															className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
															title="Move Up"
														>
															<svg
																className="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth="2"
																	d="M5 15l7-7 7 7"
																/>
															</svg>
														</button>
													)}
													{index < imagePreviews.length - 1 && (
														<button
															type="button"
															onClick={() => moveImage(index, index + 1)}
															className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
															title="Move Down"
														>
															<svg
																className="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth="2"
																	d="M19 9l-7 7-7-7"
																/>
															</svg>
														</button>
													)}
												</div>
												<div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
													{index + 1}
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						<div className="space-y-6">
							<div>
								<label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 flex items-center gap-2">
									<svg
										className="w-4 h-4 text-brand-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
									Product title *
								</label>
								<input
									type="text"
									name="title"
									value={formData.title}
									onChange={handleChange}
									required
									placeholder="Example: MacBook Pro 14”, 2023"
									className={fieldClass}
								/>
							</div>
							<div>
								<label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 flex items-center gap-2">
									<svg
										className="w-4 h-4 text-brand-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M4 6h16M4 12h16M4 18h7"
										/>
									</svg>
									Description *
								</label>
								<textarea
									name="description"
									value={formData.description}
									onChange={handleChange}
									rows="5"
									required
									placeholder="Highlight key specs, condition, and any included accessories..."
									className={`${fieldClass} min-h-[160px] resize-none leading-relaxed`}
								/>
							</div>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<div>
							<label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 block">
								Category *
							</label>
							<select
								name="category"
								value={formData.category}
								onChange={handleChange}
								required
								className={fieldClass}
							>
								<option value="">Select category</option>
								{LISTING_CATEGORY_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 block">
								Brand
							</label>
							<input
								type="text"
								name="brand"
								value={formData.brand}
								onChange={handleChange}
								placeholder="Samsung, Nike, Apple..."
								className={fieldClass}
							/>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<div>
							<label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 block">
								Condition
							</label>
							<select
								name="condition"
								value={formData.condition}
								onChange={handleChange}
								className={fieldClass}
							>
								<option value="excellent">Like New (Mint)</option>
								<option value="good">Good (Normal wear)</option>
								<option value="fair">Fair (Visible use)</option>
								<option value="poor">Needs Repair (Used for parts)</option>
							</select>
						</div>
						<div>
							<label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 block">
								Purchase year
							</label>
							<input
								type="number"
								name="year"
								min="1900"
								max={new Date().getFullYear()}
								value={formData.year}
								onChange={handleChange}
								className={fieldClass}
							/>
						</div>
					</div>

					<div>
						<label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 flex items-center gap-2">
							<svg
								className="w-4 h-4 text-brand-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Price (₹) *
						</label>
						<input
							type="number"
							name="price"
							value={formData.price}
							onChange={handleChange}
							required
							placeholder="Enter listing amount"
							className={`${fieldClass} text-xl font-bold py-5`}
						/>
					</div>

					<div className="pt-4">
						<button
							type="submit"
							disabled={loading}
							className="btn-gradient w-full justify-center py-5 text-xl font-bold shadow-2xl shadow-brand-500/30 hover:shadow-brand-500/50 disabled:opacity-60 transition-all duration-300 uppercase tracking-widest"
						>
							{loading ? (
								<span className="flex items-center gap-3">
									<div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Finalizing Listing...
								</span>
							) : (
								"Publish to Marketplace"
							)}
						</button>
						<p className="mt-4 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em]">
							Verified listings reach 3x more potential buyers.
						</p>
					</div>

					{message && (
						<div
							className={`rounded-2xl border p-5 text-center transition-all duration-300 shadow-lg ${
								message.toLowerCase().includes("success")
									? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
									: "border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400"
							}`}
						>
							<p className="font-bold flex items-center justify-center gap-2">
								{message.toLowerCase().includes("success") ? "✓" : "!"}{" "}
								{message}
							</p>
						</div>
					)}
				</form>
			</div>
		</div>
	);
};

export default UploadForm;













// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { createListing, uploadImage, predictPrice, verifyLogo } from "../../services/api";
// import { LISTING_CATEGORY_OPTIONS } from "../../utils/constants";

// const UploadForm = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "",
//     brand: "",
//     condition: "good",
//     price: "",
//     original_price: "",
//     year: new Date().getFullYear(),
//     image: null,
//   });

//   const [imagePreview, setImagePreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const [aiPrice, setAiPrice] = useState(null);
//   const [priceLoading, setPriceLoading] = useState(false);
//   const [logoVerified, setLogoVerified] = useState(null);
//   const [logoLoading, setLogoLoading] = useState(false);

//   const handlePredictPrice = async () => {
//     if (!formData.category || !formData.condition || !formData.year || !formData.original_price) {
//       setMessage("Please fill Category, Original Price, Condition, and Year to get an AI price suggestion.");
//       return;
//     }
//     setPriceLoading(true);
//     try {
//       const payload = {
//         category: formData.category,
//         brand: formData.brand || "Generic",
//         original_price: Number(formData.original_price),
//         age_years: new Date().getFullYear() - Number(formData.year),
//         condition: formData.condition === "excellent" ? "Excellent" : 
//                    formData.condition === "good" ? "Good" :
//                    formData.condition === "fair" ? "Fair" : "Poor",
//         usage_hours: 0
//       };
//       const res = await predictPrice(payload);
//       if (res.success && res.data && res.data.predicted_price) {
//         setAiPrice(res.data.predicted_price);
//         setFormData(prev => ({ ...prev, price: res.data.predicted_price }));
//         setMessage("AI Price correctly applied.");
//       } else {
//         setMessage(res.error || "Failed to fetch AI price.");
//       }
//     } catch (err) {
//       setMessage("Failed to fetch AI price: " + err.message);
//     } finally {
//       setPriceLoading(false);
//     }
//   };

//   const handleVerifyLogo = async () => {
//     if (!formData.image || !formData.brand) {
//       setMessage("Please upload an image and specify a brand to verify authenticity.");
//       return;
//     }
//     setLogoLoading(true);
//     try {
//       const res = await verifyLogo({ imageFile: formData.image, brand: formData.brand });
//       if (res.success) {
//         setLogoVerified({
//           isMatch: res.is_match,
//           confidence: res.confidence
//         });
//         if (res.is_match) {
//           setMessage(`Brand Verified! Confidence: ${(res.confidence * 100).toFixed(1)}%`);
//         } else {
//           setMessage("Warning: Image doesn't appear to match the selected brand.");
//         }
//       }
//     } catch (err) {
//       setMessage("Logo verification failed: " + err.message);
//     } finally {
//       setLogoLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, type, files } = e.target;

//     if (type === "file") {
//       const file = files?.[0];
//       setFormData((prev) => ({ ...prev, image: file || null }));

//       if (file) {
//         const reader = new FileReader();
//         reader.onload = (event) => setImagePreview(event.target.result);
//         reader.readAsDataURL(file);
//       } else {
//         setImagePreview("");
//       }
//       return;
//     }

//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");

//     try {
//       let imageFilename = "";
//       if (formData.image) {
//         const uploadRes = await uploadImage(formData.image);
//         if (!uploadRes.success) {
//           throw new Error(uploadRes.error);
//         }
//         imageFilename = uploadRes.filename;
//       }

//       const payload = {
//         title: formData.title,
//         description: formData.description,
//         category: formData.category,
//         brand: formData.brand,
//         condition: formData.condition,
//         price: Number(formData.price),
//         year: Number(formData.year),
//         image_url: imageFilename ? `/uploads/${imageFilename}` : "",
//       };

//       const result = await createListing(payload);
//       if (result.success) {
//         setMessage("Product listed successfully.");
//         setFormData({
//           title: "",
//           description: "",
//           category: "",
//           brand: "",
//           condition: "good",
//           price: "",
//           year: new Date().getFullYear(),
//           image: null,
//         });
//         setImagePreview("");
//         setTimeout(() => navigate("/browse"), 1500);
//       }
//     } catch (err) {
//       setMessage(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fieldClass =
//     "input-field placeholder-gray-500 text-sm md:text-base rounded-2xl";

//   return (

//     <div className="glass-panel-dark overflow-hidden p-0 shadow-2xl transition-colors duration-300 border border-white/10">
//       {/* Header with Gradient Background */}
//       <div className="bg-gradient-to-r from-teal-600/20 to-emerald-600/20 p-8 md:p-12 border-b border-white/5 transition-colors duration-300">
//         <h2 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-white/70 transition-colors duration-300">
//           Marketplace Submission
//         </h2>
//         <p className="mt-2 text-gray-700 dark:text-white/60 transition-colors duration-300 max-w-2xl">
//           Upload crisp imagery, highlight condition, and let our ML-driven marketplace
//           polish the presentation and suggest verified buyers for you.
//         </p>
//       </div>

//       <div className="p-8 md:p-12">
//         <form onSubmit={handleSubmit} className="space-y-8">
//           <div className="grid gap-10 lg:grid-cols-2">
//             <label className="glass-panel flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 dark:border-white/20 p-8 text-center cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all duration-300">
//               {imagePreview ? (
//                 <>
//                   <img
//                     src={imagePreview}
//                     alt="Preview"
//                     className="h-64 w-full rounded-2xl object-cover shadow-xl"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setImagePreview("");
//                       setFormData((prev) => ({ ...prev, image: null }));
//                       setLogoVerified(null);
//                     }}
//                     className="text-sm font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors duration-300 underline underline-offset-4"
//                   >
//                     Remove image
//                   </button>
//                   {imagePreview && formData.brand && (
//                     <div className="mt-2 w-full max-w-[240px] flex items-center gap-2 relative">
//                       <button
//                         type="button"
//                         onClick={handleVerifyLogo}
//                         disabled={logoLoading}
//                         className="text-xs font-bold px-4 py-2 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full hover:bg-brand-500/20 transition-colors flex items-center justify-center gap-2 flex-1"
//                       >
//                         {logoLoading ? "Verifying..." : "🤖 Verify Authenticity"}
//                       </button>
//                       <div className="relative group/tooltip shrink-0">
//                         <svg className="w-5 h-5 text-slate-400 hover:text-brand-500 cursor-pointer transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//                         <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-48 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50 pointer-events-none">
//                           <p className="text-[10px] text-left leading-relaxed font-mono text-slate-300">Powered by <span className="text-brand-400 font-bold">LogoGuard CNN</span>. Analyzes product image features against authenticated brand databases.</p>
//                           <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                   {logoVerified && (
//                     <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-lg ${logoVerified.isMatch ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'}`}>
//                       {logoVerified.isMatch ? `✓ Authentic Brand (${(logoVerified.confidence * 100).toFixed(0)}%)` : "⚠ Potential Fake"}
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <>
//                   <div className="rounded-2xl bg-brand-500/10 p-5 text-brand-600 dark:text-brand-400 transition-colors duration-300 group-hover:scale-110">
//                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
//                   </div>
//                   <div>
//                     <p className="text-xl font-bold text-slate-800 dark:text-white">Upload Product Shot</p>
//                     <p className="mt-1 text-sm text-slate-500 dark:text-white/40 max-w-[200px] mx-auto">
//                       High-resolution PNG, JPG, or WEBP (Max 8MB)
//                     </p>
//                   </div>
//                   <span className="btn-gradient !py-2 !px-6 !text-xs !rounded-full shadow-lg shadow-brand-500/20">Choose File</span>
//                 </>
//               )}
//               <input
//                 type="file"
//                 name="image"
//                 accept="image/*"
//                 onChange={handleChange}
//                 className="hidden"
//               />
//             </label>

//             <div className="space-y-6">
//               <div>
//                 <label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 flex items-center gap-2">
//                   <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
//                   Product title *
//                 </label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                   placeholder="Example: MacBook Pro 14”, 2023"
//                   className={fieldClass}
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 flex items-center gap-2">
//                   <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
//                   Description *
//                 </label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   rows="5"
//                   required
//                   placeholder="Highlight key specs, condition, and any included accessories..."
//                   className={`${fieldClass} min-h-[160px] resize-none leading-relaxed`}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="grid gap-6 md:grid-cols-2">
//             <div>
//               <label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 block">
//                 Category *
//               </label>
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 className={fieldClass}
//               >
//                 <option value="">Select category</option>
//                 {LISTING_CATEGORY_OPTIONS.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 block">Brand</label>
//               <input
//                 type="text"
//                 name="brand"
//                 value={formData.brand}
//                 onChange={handleChange}
//                 placeholder="Samsung, Nike, Apple..."
//                 className={fieldClass}
//               />
//             </div>
//           </div>

//           <div className="grid gap-6 md:grid-cols-3">
//             <div>
//               <label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 block">
//                 Condition
//               </label>
//               <select
//                 name="condition"
//                 value={formData.condition}
//                 onChange={handleChange}
//                 className={fieldClass}
//               >
//                 <option value="excellent">Like New (Mint)</option>
//                 <option value="good">Good (Normal wear)</option>
//                 <option value="fair">Fair (Visible use)</option>
//                 <option value="poor">Needs Repair (Used for parts)</option>
//               </select>
//             </div>
//             <div>
//               <label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 block">
//                 Original Price (₹)
//               </label>
//               <input
//                 type="number"
//                 name="original_price"
//                 value={formData.original_price}
//                 onChange={handleChange}
//                 placeholder="Required for AI"
//                 className={fieldClass}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-2 block">
//                 Purchase year
//               </label>
//               <input
//                 type="number"
//                 name="year"
//                 min="1900"
//                 max={new Date().getFullYear()}
//                 value={formData.year}
//                 onChange={handleChange}
//                 className={fieldClass}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-white/40 mb-3 flex items-center gap-2">
//               <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//               Price (₹) *
//             </label>
            
//             <div className="flex flex-col md:flex-row items-center gap-4">
//               <div className="relative w-full md:w-1/2">
//                 <input
//                   type="number"
//                   name="price"
//                   value={formData.price}
//                   onChange={handleChange}
//                   required
//                   placeholder="Enter listing amount"
//                   className={`${fieldClass} w-full text-xl font-bold py-5`}
//                 />
//                 {aiPrice && (
//                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.2)]">
//                     AI Suggested
//                   </div>
//                 )}
//               </div>

//               <div className="w-full md:w-1/2 flex items-center gap-3">
//                 <button
//                   type="button"
//                   onClick={handlePredictPrice}
//                   disabled={priceLoading}
//                   className="flex-1 group relative flex items-center justify-center gap-2 px-6 py-4 rounded-2xl overflow-hidden transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed bg-slate-900 border border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus:ring-2 focus:ring-emerald-500/50"
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-brand-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient"></div>
                  
//                   {priceLoading ? (
//                     <div className="flex items-center gap-3 text-emerald-400 font-bold relative z-10 text-sm">
//                       <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
//                       Running RF Regressor...
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-bold tracking-wide relative z-10">
//                       <svg className="w-5 h-5 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
//                       Generate AI Pricing
//                     </div>
//                   )}
//                 </button>
                
//                 <div className="relative group/tooltip shrink-0">
//                   <div className="w-[52px] h-[52px] rounded-2xl bg-slate-800/50 flex items-center justify-center border border-white/5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer">
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//                   </div>
//                   <div className="absolute right-0 bottom-full mb-3 w-64 p-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50 pointer-events-none text-left">
//                     <p className="text-[10px] leading-relaxed font-mono text-slate-300">Powered by a <span className="text-emerald-400 font-bold">Multi-feature Random Forest Regressor</span> trained on real-time market data to suggest fair value.</p>
//                     <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="pt-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className="btn-gradient w-full justify-center py-5 text-xl font-bold shadow-2xl shadow-brand-500/30 hover:shadow-brand-500/50 disabled:opacity-60 transition-all duration-300 uppercase tracking-widest"
//             >
//               {loading ? (
//                 <span className="flex items-center gap-3">
//                   <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                   Finalizing Listing...
//                 </span>
//               ) : "Publish to Marketplace"}
//             </button>
//             <p className="mt-4 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em]">
//               Verified listings reach 3x more potential buyers.
//             </p>
//           </div>

//           {message && (
//             <div className={`rounded-2xl border p-5 text-center transition-all duration-300 shadow-lg ${message.toLowerCase().includes('success')
//                 ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
//                 : 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400'
//               }`}>
//               <p className="font-bold flex items-center justify-center gap-2">
//                 {message.toLowerCase().includes('success') ? '✓' : '!'} {message}
//               </p>
//             </div>
//           )}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default UploadForm;
