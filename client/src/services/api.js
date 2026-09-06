// src/services/api.js

import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api",
	headers: { "Content-Type": "application/json" },
	timeout: 60000,
});

// Global request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Global response interceptor
api.interceptors.response.use(
	(res) => res,
	(err) => {
		if (err.code === "ECONNREFUSED") {
			throw new Error(
				"Cannot connect to server. Make sure backend is running.",
			);
		}
		if (err.response) {
			if (err.response.status === 401) {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				window.location.href = "/signin";
				throw new Error("Session expired. Please sign in again.");
			}
			throw new Error(
				err.response.data.error || err.response.data.message || "Server error",
			);
		}
		if (err.request) {
			throw new Error(
				"No response from server. Check your internet connection.",
			);
		}
		throw new Error("Request failed: " + err.message);
	},
);


// ---------------------- RECOMMENDATIONS ----------------------

export const getProductRecommendations = async (id) => {
	const res = await api.get(`/products/listings/${id}/recommendations`);
	return res.data;
};

// ---------------------- PRODUCT LISTINGS ----------------------

export const createListing = async (data) => {
	const isFormData =
		typeof FormData !== "undefined" && data instanceof FormData;
	const config = isFormData
		? { headers: { "Content-Type": "multipart/form-data" } }
		: undefined;

	const res = await api.post("/products/listings", data, config);
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



export const getSellerProducts = async (sellerId) => {
	const res = await api.get(`/products/listings`, {
		params: { seller_id: sellerId },
	});
	return res.data;
};

export const getUserById = async (userId) => {
	const res = await api.get(`/auth/user/${userId}`);
	return res.data;
};

export const getUserWatchlist = async (userId) => {
	const res = await api.get(`/watchlist/${userId}`);
	return res.data;
};

export const addToWatchlist = async ({
	user_id,
	product_id,
	target_price = 0,
}) => {
	const res = await api.post(`/watchlist/`, {
		user_id,
		product_id,
		target_price,
	});
	return res.data;
};

export const removeFromWatchlist = async (userId, productId) => {
	const res = await api.delete(`/watchlist/${userId}/${productId}`);
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

export const uploadImages = async (imageFiles) => {
	const form = new FormData();
	imageFiles.forEach((file) => {
		form.append("images", file);
	});

	const res = await api.post("/products/upload-images", form, {
		headers: { "Content-Type": "multipart/form-data" },
	});

	return res.data;
};

// ---------------------- MY LISTINGS ----------------------

export const getMyListings = async () => {
	const res = await api.get("/products/my-listings");
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

export const deleteProductFeedback = async (feedbackId, userId) => {
	const res = await api.delete(`/feedback/product/${feedbackId}`, {
		data: { user_id: userId },
	});
	return res.data;
};

// ---------------------- NOTIFICATIONS ENDPOINTS ----------------------

export const getUserNotifications = async (
	userId,
	limit = 50,
	readFilter = null,
) => {
	const params = { limit };
	if (readFilter) params.read = readFilter;
	const res = await api.get(`/notifications/user/${userId}`, { params });
	return res.data;
};

export const getUnreadNotificationCount = async (userId) => {
	const res = await api.get(`/notifications/user/${userId}/unread-count`);
	return res.data;
};

export const markNotificationAsRead = async (notificationId, userId) => {
	const res = await api.post(`/notifications/${notificationId}/mark-read`, {
		user_id: userId,
	});
	return res.data;
};

export const markAllNotificationsAsRead = async (userId) => {
	const res = await api.post(`/notifications/user/${userId}/mark-all-read`);
	return res.data;
};

export const deleteNotification = async (notificationId, userId) => {
	const res = await api.delete(`/notifications/${notificationId}`, {
		data: { user_id: userId },
	});
	return res.data;
};

export const clearAllNotifications = async (userId) => {
	const res = await api.post(`/notifications/user/${userId}/clear`);
	return res.data;
};



// ---------------------- MESSAGING ENDPOINTS ----------------------

export const getMessageThreads = async (userId) => {
	const res = await api.get("/messaging/threads", {
		params: { user_id: userId },
	});
	return res.data;
};

export const getMessageThread = async (threadId) => {
	const res = await api.get(`/messaging/thread/${threadId}`);
	return res.data;
};

export const createOrGetMessageThread = async (
	productId,
	buyerId,
	sellerId,
) => {
	const res = await api.post("/messaging/thread", {
		product_id: productId,
		buyer_id: buyerId,
		seller_id: sellerId,
	});
	return res.data;
};

export const sendMessage = async (threadId, senderId, content) => {
	const res = await api.post(`/messaging/thread/${threadId}/message`, {
		sender_id: senderId,
		content: content,
	});
	return res.data;
};

export const markThreadRead = async (threadId, userId) => {
	const res = await api.post(`/messaging/thread/${threadId}/mark-read`, {
		user_id: userId,
	});
	return res.data;
};

export const markThreadSold = async (threadId, userId) => {
	const res = await api.post(`/messaging/thread/${threadId}/mark-sold`, {
		user_id: userId,
	});
	return res.data;
};

export const closeMessageThread = async (threadId, userId) => {
	const res = await api.post(`/messaging/thread/${threadId}/close`, {
		user_id: userId,
	});
	return res.data;
};

// ---------------------- AUTH ENDPOINTS ----------------------

export const getUserProfile = async (userId) => {
	const res = await api.get(`/auth/user/${userId}`);
	return res.data;
};

export const updateUserProfile = async (userId, profileData) => {
	const res = await api.put(`/auth/profile`, profileData);
	return res.data;
};

export default api;
