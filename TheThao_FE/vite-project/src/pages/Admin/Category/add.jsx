// src/pages/Admin/Category/add.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function AddCategory() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        sort_order: "",
        parent_id: "",
        image: "",
        status: 1, // 0|1 (integer)
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        // Tự tạo slug khi slug đang trống
        if (name === "name" && !form.slug) {
            const s = value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setForm((prev) => ({ ...prev, slug: s }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 👉 chuẩn hoá dữ liệu gửi đi
            const payload = {
                name: form.name,
                slug: form.slug || form.name, // phòng trường hợp slug bỏ trống
                description: form.description || "",
                sort_order: form.sort_order === "" ? 0 : Number(form.sort_order),
                parent_id: form.parent_id === "" ? null : Number(form.parent_id),
                image: form.image || null,
                status: Number(form.status), // Laravel yêu cầu integer
            };

            // 👉 bắt buộc có token vì /admin có middleware auth:sanctum
            const token = localStorage.getItem("token") || "";
            if (!token) {
                throw new Error("Bạn chưa đăng nhập (thiếu token). Vui lòng đăng nhập lại.");
            }

            const res = await fetch(`${API_BASE}/admin/categories`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            // Xử lý lỗi Laravel validation 422
            if (!res.ok) {
                let message = `Thêm thất bại (HTTP ${res.status})`;
                try {
                    const errData = await res.json();
                    if (errData?.errors) {
                        const msgs = Object.values(errData.errors).flat().join("\n");
                        message = msgs || errData.message || message;
                    } else if (errData?.message) {
                        message = errData.message;
                    }
                } catch {
                    const txt = await res.text();
                    if (txt) console.error("Server error:", txt);
                }
                throw new Error(message);
            }

            const data = await res.json();
            alert(data.message || "Thêm danh mục thành công!");
            navigate("/admin/categories");
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra khi thêm danh mục.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section style={{ padding: 20 }}>
            <div
                style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    maxWidth: 980,
                    margin: "0 auto",
                }}
            >
                <h1 style={{ fontSize: 24, marginBottom: 16, fontWeight: 700 }}>
                    Thêm danh mục
                </h1>

                {error && (
                    <p className="whitespace-pre-line" style={{ color: "red", marginBottom: 12 }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                    {/* Lưới 2 cột giống các form khác */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                            alignItems: "start",
                        }}
                    >
                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Tên danh mục</span>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                style={{
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Slug (tùy chọn)</span>
                            <input
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                style={{
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Thứ tự hiển thị (mặc định 0)</span>
                            <input
                                type="number"
                                name="sort_order"
                                value={form.sort_order}
                                onChange={handleChange}
                                style={{
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Parent ID (nếu có)</span>
                            <input
                                type="number"
                                name="parent_id"
                                value={form.parent_id}
                                onChange={handleChange}
                                style={{
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Ảnh (đường dẫn / tên file)</span>
                            <input
                                name="image"
                                value={form.image}
                                onChange={handleChange}
                                placeholder="VD: categories/football.png"
                                style={{
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Trạng thái</span>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                style={{
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                }}
                            >
                                <option value={1}>Hiển thị</option>
                                <option value={0}>Nháp</option>
                            </select>
                        </label>
                    </div>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>Mô tả</span>
                        <textarea
                            name="description"
                            rows={4}
                            value={form.description}
                            onChange={handleChange}
                            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
                        />
                    </label>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/categories")}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid #999",
                                background: "transparent",
                                cursor: "pointer",
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid #0f62fe",
                                background: "#0f62fe",
                                color: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            {loading ? "Đang lưu…" : "Lưu danh mục"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
