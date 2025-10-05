import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function AddProduct() {
    const nav = useNavigate();

    const [form, setForm] = useState({
        name: "",
        slug: "",
        brand_id: "",
        category_id: "",
        price_root: "",
        price_sale: "",
        qty: "",
        status: "active",
        description: "",
        detail: "",
    });

    const [thumb, setThumb] = useState(null);
    const [preview, setPreview] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch(`${API_BASE}/categories`);
                const j = await r.json();
                setCategories(Array.isArray(j) ? j : j.data ?? []);
            } catch (e) {
                console.error("Không tải được danh mục", e);
            }
        })();
    }, []);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (name === "name" && !form.slug) {
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
            if (!form.brand_id) throw new Error("Vui lòng nhập brand_id");
            if (!form.category_id) throw new Error("Vui lòng chọn danh mục");

            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
            if (thumb) fd.append("thumbnail", thumb);

            const token = localStorage.getItem("admin_token") || "";
            const res = await fetch(`${API_BASE}/admin/products`, {
                method: "POST",
                body: fd,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(`HTTP ${res.status} - ${t}`);
            }

            setForm({
                name: "",
                slug: "",
                brand_id: "",
                category_id: "",
                price_root: "",
                price_sale: "",
                qty: "",
                status: "active",
                description: "",
                detail: "",
            });
            setThumb(null);
            setPreview("");

            nav("/admin/products");
        } catch (e) {
            console.error(e);
            setErr(e.message || "Không thêm được sản phẩm. Vui lòng kiểm tra dữ liệu.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <section style={{ padding: 20 }}>
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                <h1 style={{ fontSize: 24, marginBottom: 16, fontWeight: 700 }}>Thêm sản phẩm</h1>

                {err && <p style={{ color: "red", marginBottom: 12 }}>{err}</p>}

                <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Tên</span>
                            <input name="name" value={form.name} onChange={onChange} required
                                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }} />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Slug</span>
                            <input name="slug" value={form.slug} onChange={onChange} required
                                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }} />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Brand ID</span>
                            {/* Nếu bạn có API /brands thì thay input này bằng select brand */}
                            <input name="brand_id" type="number" min="1" value={form.brand_id} onChange={onChange} required
                                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }} />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Danh mục</span>
                            <select name="category_id" value={form.category_id} onChange={onChange} required
                                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}>
                                <option value="">-- chọn --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Giá gốc</span>
                            <input name="price_root" type="number" min="0" value={form.price_root} onChange={onChange} required
                                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }} />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Giá sale</span>
                            <input name="price_sale" type="number" min="0" value={form.price_sale} onChange={onChange}
                                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }} />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Tồn kho</span>
                            <input name="qty" type="number" min="0" value={form.qty} onChange={onChange}
                                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }} />
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Trạng thái</span>
                            <select name="status" value={form.status} onChange={onChange}
                                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}>
                                <option value="active">Hiển thị</option>
                                <option value="draft">Nháp</option>
                            </select>
                        </label>

                        <label style={{ display: "grid", gap: 6 }}>
                            <span>Ảnh đại diện</span>
                            <input type="file" accept="image/*" onChange={onFile} />
                        </label>
                    </div>

                    {preview && (
                        <img src={preview} alt="preview"
                            style={{ width: 180, height: 130, objectFit: "cover", borderRadius: 10, border: "1px solid #eee" }} />
                    )}

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>Mô tả</span>
                        <textarea name="description" rows={4} value={form.description} onChange={onChange}
                            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                        <span>Chi tiết</span>
                        <textarea name="detail" rows={4} value={form.detail} onChange={onChange}
                            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }} />
                    </label>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" onClick={() => nav("/admin/products")}
                            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #999", background: "transparent" }}>
                            Hủy
                        </button>
                        <button disabled={loading} type="submit"
                            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #0f62fe", background: "#0f62fe", color: "#fff" }}>
                            {loading ? "Đang lưu…" : "Lưu sản phẩm"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
