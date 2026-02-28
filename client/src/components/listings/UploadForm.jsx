import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing, uploadImage } from "../../services/api";
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
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      setFormData((prev) => ({ ...prev, image: file || null }));

      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => setImagePreview(event.target.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview("");
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageFilename = "";
      if (formData.image) {
        const uploadRes = await uploadImage(formData.image);
        if (!uploadRes.success) {
          throw new Error(uploadRes.error);
        }
        imageFilename = uploadRes.filename;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        brand: formData.brand,
        condition: formData.condition,
        price: Number(formData.price),
        year: Number(formData.year),
        image_url: imageFilename ? `/uploads/${imageFilename}` : "",
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
          image: null,
        });
        setImagePreview("");
        setTimeout(() => navigate("/browse"), 1500);
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
    <div className="glass-panel-dark p-8 md:p-12 transition-colors duration-300 border border-white/10">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-6 transition-colors duration-300">
        <h2 className="text-3xl font-display font-semibold text-gray-900 dark:text-white transition-colors duration-300">
          List your product
        </h2>
        <p className="text-gray-700 dark:text-white/70 transition-colors duration-300">
          Upload crisp imagery, highlight condition, and let our marketplace
          polish the presentation for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="glass-panel flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/25 p-6 text-center cursor-pointer hover:border-white/40 transition-colors duration-300">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full rounded-2xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setFormData((prev) => ({ ...prev, image: null }));
                  }}
                  className="text-sm font-medium text-rose-300 hover:text-rose-200 transition-colors duration-300"
                >
                  Remove image
                </button>
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-white/10 p-3 text-gray-900 dark:text-white transition-colors duration-300">
                  Upload preview
                </div>
                <p className="text-sm text-gray-700 dark:text-white/60 transition-colors duration-300">
                  PNG, JPG, JPEG, WEBP up to 8MB
                </p>
                <span className="btn-ghost">Choose file</span>
              </>
            )}
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-800 dark:text-white/80 transition-colors duration-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
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
              <label className="text-sm font-medium text-gray-800 dark:text-white/80 transition-colors duration-300 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
                placeholder="Highlight condition, accessories, upgrades..."
                className={`${fieldClass} min-h-[140px] resize-none`}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-white/80 transition-colors duration-300">
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
            <label className="text-sm font-medium text-gray-800 dark:text-white/80 transition-colors duration-300">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Samsung, Nike, IKEA..."
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-white/80 transition-colors duration-300">
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="excellent">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Needs Repair</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-white/80 transition-colors duration-300">
              Purchase year
            </label>
            <input
              type="number"
              name="year"
              min="2000"
              max={new Date().getFullYear()}
              value={formData.year}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-800 dark:text-white/80 transition-colors duration-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Price (₹) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="Enter listing amount"
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gradient w-full justify-center py-4 text-base disabled:opacity-60"
        >
          {loading ? "Listing product..." : "Publish listing"}
        </button>

        {message && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-gray-900 dark:text-white/80 transition-colors duration-300">
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default UploadForm;
