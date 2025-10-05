// src/utils/adminApi.js
const API_ROOT = (import.meta?.env?.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");
const ADMIN_BASE = `${API_ROOT}/api/admin`;

export function getAdminToken() {
    const raw = localStorage.getItem("admin_token");
    if (!raw) return null;
    try {
        const obj = JSON.parse(raw);
        return obj?.access_token || obj?.token || raw;
    } catch {
        return raw; // đã là chuỗi token
    }
}

export async function adminFetch(path, options = {}) {
    const token = getAdminToken();

    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const url = path.startsWith("http")
        ? path
        : `${ADMIN_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

    const res = await fetch(url, { ...options, headers });

    // Token sai/hết hạn → dọn session & chuyển về /admin/login
    if (res.status === 401) {
        try {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_user");
            localStorage.removeItem("admin_session");
        } catch { }
        // Đưa về trang login admin (kèm thông tin quay lại)
        const from = location.pathname + location.search;
        const q = new URLSearchParams({ from, msg: "Phiên đăng nhập admin đã hết hạn." });
        if (!location.pathname.startsWith("/admin/login")) {
            location.href = `/admin/login?${q.toString()}`;
        }
        throw new Error("401 Unauthorized");
    }

    return res;
}
