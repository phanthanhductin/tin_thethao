import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        slug: "",
        brand_id: "",
        category_id: "",
        price_root: "",
        price_sale: "",
        qty: "",
        detail: "",
        description: "",
        status: 1,
        thumbnail: null,
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem("admin_token");

                const res = await fetch(`${API_BASE}/admin/products/${id}`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    if (res.status === 401) throw new Error("Bạn chưa đăng nhập hoặc token hết hạn");
                    throw new Error("Không lấy được dữ liệu sản phẩm");
                }

                const data = await res.json();
                setForm((prev) => ({
                    ...prev,
                    name: data.name || "",
                    slug: data.slug || "",
                    brand_id: data.brand_id || "",
                    category_id: data.category_id || "",
                    price_root: data.price_root || "",
                    price_sale: data.price_sale || "",
                    qty: data.qty || "",
                    detail: data.detail || "",
                    description: data.description || "",
                    status: data.status ?? 1,
                    thumbnail: null,
                }));
                setPreview(data.thumbnail_url || null);
            } catch (err) {
                console.error(err);
                setError(err.message || "Không tải được dữ liệu sản phẩm");
            }
        };

        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        setForm((s) => ({ ...s, thumbnail: file }));
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("admin_token");

            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (v !== null && v !== "") fd.append(k, v);
            });
            fd.append("_method", "PUT");

            const res = await fetch(`${API_BASE}/admin/products/${id}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: fd,
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

            setSuccess("Cập nhật sản phẩm thành công!");
            setTimeout(() => navigate("/admin/products"), 1200);
        } catch (err) {
            console.error(err);
            setError(err.message || "Có lỗi xảy ra");
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
                    Chỉnh sửa sản phẩm
                </h1>

                {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}
                {success && <p style={{ color: "green", marginBottom: 12 }}>{success}</p>}

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                    {/* Lưới 2 cột giống AddProduct */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                            alignItems: "start",
                        }}
                    >
                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Tên sản phẩm</span>
                            <input
                                type="text"
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
                                type="text"
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
                            <span>Brand ID</span>
                            <input
                                type="number"
                                name="brand_id"
                                value={form.brand_id}
                                onChange={handleChange}
                                min="1"
                                style={{
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Category ID</span>
                            <input
                                type="number"
                                name="category_id"
                                value={form.category_id}
                                onChange={handleChange}
                                min="1"
                                style={{
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Giá gốc</span>
                            <input
                                type="number"
                                name="price_root"
                                value={form.price_root}
                                onChange={handleChange}
                                min="0"
                                style={{
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Giá sale</span>
                            <input
                                type="number"
                                name="price_sale"
                                value={form.price_sale}
                                onChange={handleChange}
                                min="0"
                                style={{
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                }}
                            />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Tồn kho</span>
                            <input
                                type="number"
                                name="qty"
                                value={form.qty}
                                onChange={handleChange}
                                min="0"
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

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Ảnh sản phẩm</span>
                            <input type="file" accept="image/*" onChange={handleFile} />
                        </label>

                        {/* Ô trống để lấp grid 2 cột (giữ bố cục đẹp) */}
                        <div />
                    </div>

                    {preview && (
                        <img
                            src={preview}
                            alt="preview"
                            style={{
                                width: 180,
                                height: 130,
                                objectFit: "cover",
                                borderRadius: 10,
                                border: "1px solid #eee",
                            }}
                        />
                    )}

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>Mô tả</span>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                            style={{
                                padding: 10,
                                border: "1px solid #ddd",
                                borderRadius: 8,
                            }}
                        />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>Chi tiết</span>
                        <textarea
                            name="detail"
                            value={form.detail}
                            onChange={handleChange}
                            rows={4}
                            style={{
                                padding: 10,
                                border: "1px solid #ddd",
                                borderRadius: 8,
                            }}
                        />
                    </label>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/products")}
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
                            disabled={loading}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid #0f62fe",
                                background: "#0f62fe",
                                color: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            {loading ? "Đang lưu…" : "Cập nhật"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
