// src/pages/Admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const ADMIN_LOGIN_URL = `${API_BASE}/api/admin/login`;

const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_USER_KEY = "admin_user";

export default function AdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const navState = location.state || {};

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const validate = () => {
        const e = {};
        if (!form.email) e.email = "Vui lòng nhập email";
        if (!form.password) e.password = "Vui lòng nhập mật khẩu";
        return e;
    };

    const submit = async (e) => {
        e.preventDefault();
        setServerError("");
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length) return;

        setLoading(true);
        try {
            const res = await fetch(ADMIN_LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (res.status === 401) setServerError("Sai email hoặc mật khẩu.");
                else if (res.status === 403) setServerError("Chỉ Admin được phép đăng nhập.");
                else if (res.status === 422) {
                    setErrors({
                        email: data?.errors?.email?.[0],
                        password: data?.errors?.password?.[0],
                    });
                    setServerError(data?.message || "Dữ liệu không hợp lệ.");
                } else {
                    setServerError(data?.message || `Đăng nhập thất bại (HTTP ${res.status}).`);
                }
                return;
            }

            const { token, user } = data;
            if (!token || !user) {
                setServerError("Phản hồi đăng nhập không hợp lệ.");
                return;
            }

            const role = String(user?.roles || user?.role || "").toLowerCase();
            if (role !== "admin") {
                setServerError("Chỉ Admin được phép đăng nhập.");
                return;
            }

            // ✅ Lưu RIÊNG cho Admin (đừng dùng "token"/"user" để tránh ảnh hưởng Customer)
            localStorage.setItem(ADMIN_TOKEN_KEY, token);                 // CHANGED
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));   // CHANGED
            localStorage.setItem("admin_session", "1");

            const from = navState.from;
            const target =
                typeof from === "string" && from.startsWith("/admin") ? from
                    : (from && from.pathname) || "/admin";
            navigate(target, { replace: true });
        } catch {
            setServerError("Không thể kết nối máy chủ. Kiểm tra BE & CORS.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
            }}
        >
            <img
                src="http://127.0.0.1:8000/assets/images/banner2.jpg"
                alt="Admin Banner"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "blur(4px) brightness(0.6)",
                    zIndex: 0,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    zIndex: 1,
                }}
            />
            <div
                style={{
                    width: "100%",
                    maxWidth: 460,
                    background: "rgba(255,255,255,0.92)",
                    padding: "32px 28px",
                    borderRadius: 16,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                    zIndex: 2,
                }}
            >
                <h2
                    style={{
                        marginBottom: 24,
                        textAlign: "center",
                        color: "#023ea5c6",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                    }}
                >
                    Đăng nhập Quản trị
                </h2>

                {(navState.fromAdmin || navState.denied) && (
                    <div
                        style={{
                            color: "#8a6d3b",
                            marginBottom: 16,
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: "#fff3cd",
                            border: "1px solid #ffeeba",
                        }}
                    >
                        {navState.denied || "Bạn cần đăng nhập để vào trang Quản trị."}
                    </div>
                )}

                {serverError && (
                    <div
                        style={{
                            color: "#d32f2f",
                            marginBottom: 16,
                            padding: "10px 12px",
                            borderRadius: 8,
                            background: "#fdecea",
                        }}
                    >
                        {serverError}
                    </div>
                )}

                <form onSubmit={submit} noValidate>
                    <div style={{ marginBottom: 18 }}>
                        <label htmlFor="email" style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            placeholder="admin@domain.com"
                            style={{
                                display: "block",
                                width: "90%",
                                maxWidth: 380,
                                margin: "0 auto",
                                padding: "10px 14px",
                                borderRadius: 10,
                                border: "1px solid #ccc",
                                outline: "none",
                                backgroundColor: "#fff",
                                transition: "all 0.2s",
                            }}
                            onFocus={(e) => (e.target.style.border = "1px solid #1e88e5")}
                            onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
                        />
                        {errors.email && (
                            <div style={{ color: "#b42318", fontSize: 12, marginTop: 6 }}>
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <label htmlFor="password" style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
                            Mật khẩu
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                id="password"
                                name="password"
                                type={showPass ? "text" : "password"}
                                value={form.password}
                                onChange={onChange}
                                placeholder="••••••••"
                                style={{
                                    display: "block",
                                    width: "90%",
                                    maxWidth: 380,
                                    margin: "0 auto",
                                    padding: "10px 44px 10px 14px",
                                    borderRadius: 10,
                                    border: "1px solid #ccc",
                                    outline: "none",
                                    backgroundColor: "#fff",
                                    transition: "all 0.2s",
                                }}
                                onFocus={(e) => (e.target.style.border = "1px solid #1e88e5")}
                                onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((s) => !s)}
                                style={{
                                    position: "absolute",
                                    right: "calc(5% + 8px)",
                                    top: 2,
                                    transform: "translateY(50%)",
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #e5e7eb",
                                    background: "#fafafa",
                                    cursor: "pointer",
                                }}
                            >
                                {showPass ? "Ẩn" : "Hiện"}
                            </button>
                        </div>
                        {errors.password && (
                            <div style={{ color: "#b42318", fontSize: 12, marginTop: 6 }}>
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: 10,
                            border: 0,
                            cursor: loading ? "not-allowed" : "pointer",
                            background: loading ? "#9ccc65" : "#023ea5c6",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: 16,
                            transition: "background 0.2s",
                        }}
                    >
                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </button>

                    <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", textAlign: "center" }}>
                        Chỉ tài khoản <b>roles = 'admin'</b> mới đăng nhập được.
                    </div>
                </form>
            </div>
        </div>
    );
}
