export const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return `http://localhost:5000${url}`;
    return null;
};
