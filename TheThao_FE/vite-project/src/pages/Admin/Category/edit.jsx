// src/pages/Admin/Category/edit.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function EditCategory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        sort_order: "",
        parent_id: "",
        image: "",
        status: 1, // 0 | 1 (số)
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Lấy dữ liệu category cũ (public)
    useEffect(() => {
        (async () => {
            try {
                setError("");
                const res = await fetch(`${API_BASE}/categories/${id}`, {
                    headers: { Accept: "application/json" },
                });
                if (!res.ok) throw new Error(`Không tải được dữ liệu (HTTP ${res.status})`);
                const data = await res.json();

                setForm({
                    name: data.name ?? "",
                    slug: data.slug ?? "",
                    description: data.description ?? "",
                    sort_order: data.sort_order ?? "",
                    parent_id: data.parent_id ?? "",
                    image: data.image ?? "",
                    status: typeof data.status === "number" ? data.status : 1,
                });
            } catch (e) {
                setError(e.message || "Không tải được dữ liệu");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // helper ép kiểu
    const toIntOrNull = (v) => {
        if (v === "" || v === null || v === undefined) return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    };
    const toIntOrZero = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const next = { ...prev, [name]: value };
            // auto slug khi đang trống slug và gõ name
            if (name === "name" && !prev.slug) {
                const s = value
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                next.slug = s;
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            if (!form.name) throw new Error("Vui lòng nhập tên danh mục");

            const token = localStorage.getItem("token") || "";

            const payload = {
                name: form.name,
                slug: form.slug,
                description: form.description,
                sort_order: toIntOrZero(form.sort_order),
                parent_id: toIntOrNull(form.parent_id),
                image: form.image || "",
                status: toIntOrZero(form.status) === 0 ? 0 : 1, // đảm bảo integer 0|1
            };

            // --- Cách 1: PUT JSON tới /api/admin/categories/:id ---
            let res = await fetch(`${API_BASE}/admin/categories/${id}`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            // Fallback nếu server/proxy không cho PUT (405) -> POST + _method=PUT
            if (res.status === 405) {
                const fd = new FormData();
                Object.entries(payload).forEach(([k, v]) => fd.append(k, v ?? ""));
                fd.append("_method", "PUT");

                res = await fetch(`${API_BASE}/admin/categories/${id}`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: fd,
                });
            }

            let data = {};
            try {
                data = await res.json();
            } catch {
                // ignore
            }

            if (!res.ok) {
                const msg =
                    data?.message ||
                    (data?.errors ? Object.values(data.errors).flat().join(", ") : "") ||
                    `HTTP ${res.status}`;
                throw new Error(msg);
            }

            alert("✅ Cập nhật danh mục thành công!");
            navigate("/admin/categories");
        } catch (err) {
            setError(err.message || "Cập nhật thất bại");
        }
    };

    if (loading) return <p>Đang tải...</p>;

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
                    Sửa danh mục
                </h1>

                {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                    {/* Lưới 2 cột giống Add */}
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
                            <span>Slug</span>
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
                            <span>Thứ tự hiển thị</span>
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
                                <option value={0}>Ẩn</option>
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
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
