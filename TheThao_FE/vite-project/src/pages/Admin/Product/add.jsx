import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000"; // Laravel API

export default function AddProduct() {
    const nav = useNavigate();
    const [form, setForm] = useState({
        name: "",
        slug: "",
        price_root: "",
        price_sale: "",
        qty: "",
        status: "active", // active | draft
        category_id: "",
        description: "",
    });
    const [thumb, setThumb] = useState(null);     // File object
    const [preview, setPreview] = useState("");   // preview url
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [categories, setCategories] = useState([]);

    // --- (optional) nạp danh mục cho select
    useState(() => {
        (async () => {
            try {
                const r = await fetch(`${API_BASE}/admin/categories`);
                const j = await r.json();
                setCategories(Array.isArray(j) ? j : j.data ?? []);
            } catch (_) { }
        })();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (name === "name" && !form.slug) {
            // tạo slug đơn giản
            const s = value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setForm((f) => ({ ...f, slug: s }));
        }
    };

    const onFile = (e) => {
        const file = e.target.files?.[0];
        setThumb(file || null);
        setPreview(file ? URL.createObjectURL(file) : "");
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErr("");

        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
            if (thumb) fd.append("thumbnail", thumb); // tên field Laravel sẽ đọc

            const res = await fetch(`${API_BASE}/admin/products`, {
                method: "POST",
                body: fd,
                // Nếu dùng token, mở dòng dưới và thay TOKEN
                // headers: { Authorization: `Bearer ${TOKEN}` },
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(`HTTP ${res.status} - ${t}`);
            }

            // tạo thành công → quay về danh sách
            nav("/admin/products");
        } catch (e) {
            console.error(e);
            setErr("Không thêm được sản phẩm. Vui lòng kiểm tra dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section style={{ padding: 20, maxWidth: 900 }}>
            <h1 style={{ fontSize: 24, marginBottom: 14 }}>Thêm sản phẩm</h1>
            {err && <p style={{ color: "red" }}>{err}</p>}

            <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label>
                        Tên
                        <input
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            required
                            style={{ width: "100%", height: 36, padding: "0 10px" }}
                        />
                    </label>

                    <label>
                        Slug
                        <input
                            name="slug"
                            value={form.slug}
                            onChange={onChange}
                            required
                            style={{ width: "100%", height: 36, padding: "0 10px" }}
                        />
                    </label>

                    <label>
                        Giá gốc
                        <input
                            name="price_root"
                            type="number"
                            min="0"
                            value={form.price_root}
                            onChange={onChange}
                            required
                            style={{ width: "100%", height: 36, padding: "0 10px" }}
                        />
                    </label>

                    <label>
                        Giá sale
                        <input
                            name="price_sale"
                            type="number"
                            min="0"
                            value={form.price_sale}
                            onChange={onChange}
                            style={{ width: "100%", height: 36, padding: "0 10px" }}
                        />
                    </label>

                    <label>
                        Tồn kho
                        <input
                            name="qty"
                            type="number"
                            min="0"
                            value={form.qty}
                            onChange={onChange}
                            required
                            style={{ width: "100%", height: 36, padding: "0 10px" }}
                        />
                    </label>

                    <label>
                        Trạng thái
                        <select name="status" value={form.status} onChange={onChange} style={{ height: 36 }}>
                            <option value="active">Hiển thị</option>
                            <option value="draft">Nháp</option>
                        </select>
                    </label>

                    <label>
                        Danh mục
                        <select
                            name="category_id"
                            value={form.category_id}
                            onChange={onChange}
                            style={{ height: 36 }}
                        >
                            <option value="">-- chọn --</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Ảnh đại diện
                        <input type="file" accept="image/*" onChange={onFile} />
                    </label>
                </div>

                {preview && (
                    <img
                        src={preview}
                        alt="preview"
                        style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 6 }}
                    />
                )}

                <label>
                    Mô tả
                    <textarea
                        name="description"
                        rows={5}
                        value={form.description}
                        onChange={onChange}
                        style={{ width: "100%", padding: 10 }}
                    />
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        type="button"
                        onClick={() => nav("/admin/products")}
                        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #888" }}
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
                        {loading ? "Đang lưu…" : "Lưu sản phẩm"}
                    </button>
                </div>
            </form>
        </section>
    );
}
