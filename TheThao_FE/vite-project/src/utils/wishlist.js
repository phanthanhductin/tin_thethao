// src/utils/wishlist.js
export const API = "http://127.0.0.1:8000/api";
const KEY = "wishlist_ids";

export function getWishlistIds() {
    try { const arr = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(arr) ? arr : []; }
    catch { return []; }
}
export function isLiked(id) {
    return getWishlistIds().includes(Number(id));
}
export function toggleWishlist(id) {
    const ids = getWishlistIds();
    const pid = Number(id);
    const i = ids.indexOf(pid);
    let liked;
    if (i >= 0) { ids.splice(i, 1); liked = false; }
    else { ids.unshift(pid); liked = true; }
    localStorage.setItem(KEY, JSON.stringify(ids));
    // Thông báo cho toàn app (đếm wishlist…)
    window.dispatchEvent(new CustomEvent("wishlist-changed", { detail: ids.length }));

    // Đồng bộ server nếu có token (không chặn UI)
    const token = localStorage.getItem("token");
    if (token) {
        fetch(`${API}/wishlist/toggle/${pid}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }).catch(() => { });
    }
    return liked;
}
