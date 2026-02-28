// src/services/api.js

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Global response interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ECONNREFUSED") {
      throw new Error("Cannot connect to server. Make sure backend is running.");
    }
    if (err.response) {
      throw new Error(err.response.data.error || "Server error");
    }
    if (err.request) {
      throw new Error("No response from server. Check your internet connection.");
    }
    throw new Error("Request failed: " + err.message);
  }
);

// ---------------------- AI ENDPOINTS ----------------------

export const predictPrice = async (data) => {
  const res = await api.post("/ai/predict-price", data);
  return res.data;
};

export const getPriceRange = async () => {
  const res = await api.get("/ai/price-range");
  return res.data;
};

export const healthCheck = async () => {
  const res = await api.get("/health");
  return res.data;
};

// ---------------------- IMAGE SEARCH ----------------------

export const imageSearch = async (imageFile) => {
  const form = new FormData();
  form.append("image", imageFile);

  const res = await api.post("/image/search", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const imageHealthCheck = async () => {
  const res = await api.get("/image/health");
  return res.data;
};

// ---------------------- FAKE LOGO VERIFICATION ----------------------

export const getLogoBrands = async () => {
  const res = await api.get("/logo/brands");
  return res.data;
};

export const verifyLogo = async ({ imageFile, brand }) => {
  const form = new FormData();
  form.append("image", imageFile);
  if (brand) {
    form.append("brand", brand);
  }

  const res = await api.post("/logo/verify", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// ---------------------- RECOMMENDATIONS ----------------------

export const getProductRecommendations = async (id) => {
  const res = await api.get(`/products/listings/${id}/recommendations`);
  return res.data;
};

// ---------------------- PRODUCT LISTINGS ----------------------

export const createListing = async (data) => {
  const res = await api.post("/products/listings", data);
  return res.data;
};

export const getListings = async (filters = {}) => {
  const res = await api.get("/products/listings", { params: filters });
  return res.data;
};

export const getProduct = async (id) => {
  const res = await api.get(`/products/listings/${id}`);
  return res.data;
};

export const deleteListing = async (id) => {
  const res = await api.delete(`/products/listings/${id}`);
  return res.data;
};

export const productsHealthCheck = async () => {
  const res = await api.get("/products/health");
  return res.data;
};

// ---------------------- IMAGE UPLOAD ----------------------

export const uploadImage = async (imageFile) => {
  const form = new FormData();
  form.append("image", imageFile);

  const res = await api.post("/products/upload-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// Feedback endpoints
export const submitProductFeedback = async (feedbackData) => {
  const res = await api.post("/feedback/product", feedbackData);
  return res.data;
};

export const getProductFeedback = async (productId) => {
  const res = await api.get(`/feedback/product/${productId}`);
  return res.data;
};

// ---------------------- ESCROW TRANSACTIONS ----------------------

export const initializeEscrow = async (data) => {
  const res = await api.post("/escrow/order", data);
  return res.data;
};

export const processEscrowAction = async (data) => {
  const res = await api.post("/escrow/process-action", data);
  return res.data;
};

export const getEscrowDetails = async (escrowId) => {
  const res = await api.get(`/escrow/${escrowId}`);
  return res.data;
};

export default api;
