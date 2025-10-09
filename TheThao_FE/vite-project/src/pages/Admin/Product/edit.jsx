// // src/pages/Admin/Product/edit.jsx
// import { useState, useEffect, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// const API_BASE = "http://127.0.0.1:8000/api";

// export default function EditProduct() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const token = useMemo(() => localStorage.getItem("admin_token") || "", []);

//     const [form, setForm] = useState({
//         name: "",
//         slug: "",
//         brand_id: "",
//         category_id: "",
//         price_root: "",
//         price_sale: "",
//         qty: "",
//         detail: "",
//         description: "",
//         status: 1,
//         thumbnail: null, // file
//     });

//     const [preview, setPreview] = useState(null);
//     const [categories, setCategories] = useState([]);
//     const [brands, setBrands] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");

//     // load brands + categories
//     useEffect(() => {
//         (async () => {
//             try {
//                 const [rc, rb] = await Promise.all([
//                     fetch(`${API_BASE}/categories`),
//                     fetch(`${API_BASE}/brands?status=active`),
//                 ]);
//                 const jc = await rc.json().catch(() => ({}));
//                 const jb = await rb.json().catch(() => ({}));
//                 setCategories(Array.isArray(jc) ? jc : jc.data ?? []);
//                 setBrands(Array.isArray(jb) ? jb : jb.data ?? []);
//             } catch (e) {
//                 console.error(e);
//             }
//         })();
//     }, []);

//     // load product
//     // load product
//     useEffect(() => {
//         const fetchProduct = async () => {
//             try {
//                 const res = await fetch(`${API_BASE}/admin/products/${id}`, {
//                     headers: {
//                         Accept: "application/json",
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });

//                 const raw = await res.text();
//                 let payload = {};
//                 try { payload = raw ? JSON.parse(raw) : {}; } catch { payload = {}; }

//                 if (!res.ok) {
//                     const msg = payload?.message || `HTTP ${res.status}`;
//                     throw new Error(msg === "Product not found" ? "Không tìm thấy sản phẩm" : msg);
//                 }

//                 // Hỗ trợ 2 dạng trả về:
//                 // - trực tiếp: { id, name, ... }
//                 // - bọc: { message, data: { id, name, ... } }
//                 const p = (payload && typeof payload === "object" && payload.data) ? payload.data : payload;

//                 setForm((prev) => ({
//                     ...prev,
//                     name: p.name ?? "",
//                     slug: p.slug ?? "",
//                     brand_id: p.brand_id ?? "",
//                     category_id: p.category_id ?? "",
//                     price_root: p.price_root ?? "",
//                     price_sale: p.price_sale ?? "",
//                     qty: p.qty ?? "",
//                     detail: p.detail ?? "",
//                     description: p.description ?? "",
//                     status: p.status ?? 1,
//                     thumbnail: null,
//                 }));
//                 setPreview(p.thumbnail_url || null);
//             } catch (err) {
//                 console.error(err);
//                 setError(err.message || "Không tải được dữ liệu sản phẩm");
//             }
//         };
//         fetchProduct();
//     }, [id, token]);


//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setForm((s) => ({ ...s, [name]: value }));
//         if (name === "name" && !form.slug) {
//             const slug = value
//                 .toLowerCase()
//                 .normalize("NFD")
//                 .replace(/[\u0300-\u036f]/g, "")
//                 .replace(/[^a-z0-9]+/g, "-")
//                 .replace(/(^-|-$)/g, "");
//             setForm((s) => ({ ...s, slug }));
//         }
//     };

//     const handleFile = (e) => {
//         const file = e.target.files?.[0];
//         setForm((s) => ({ ...s, thumbnail: file || null }));
//         setPreview(file ? URL.createObjectURL(file) : preview);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError("");
//         setSuccess("");

//         try {
//             const fd = new FormData();

//             // chỉ append field có giá trị (tránh override null)
//             const payload = {
//                 ...form,
//                 status: String(form.status) === "0" ? 0 : 1,
//             };

//             Object.entries(payload).forEach(([k, v]) => {
//                 if (v !== null && v !== "") {
//                     // BE nhận file "thumbnail"
//                     if (k === "thumbnail" && v) {
//                         fd.append("thumbnail", v);
//                     } else {
//                         fd.append(k, v);
//                     }
//                 }
//             });
//             fd.append("_method", "PUT");

//             const res = await fetch(`${API_BASE}/admin/products/${id}`, {
//                 method: "POST",
//                 headers: {
//                     Accept: "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: fd,
//             });

//             const data = await res.json().catch(() => ({}));
//             if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

//             setSuccess("Cập nhật sản phẩm thành công!");
//             setTimeout(() => navigate("/admin/products"), 900);
//         } catch (err) {
//             console.error(err);
//             setError(err.message || "Có lỗi xảy ra");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <section style={{ padding: 20 }}>
//             <div
//                 style={{
//                     background: "white",
//                     borderRadius: 12,
//                     padding: 20,
//                     boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
//                     maxWidth: 980,
//                     margin: "0 auto",
//                 }}
//             >
//                 <h1 style={{ fontSize: 24, marginBottom: 16, fontWeight: 700 }}>
//                     Chỉnh sửa sản phẩm
//                 </h1>

//                 {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}
//                 {success && <p style={{ color: "green", marginBottom: 12 }}>{success}</p>}

//                 <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
//                     <div
//                         style={{
//                             display: "grid",
//                             gridTemplateColumns: "1fr 1fr",
//                             gap: 12,
//                             alignItems: "start",
//                         }}
//                     >
//                         <label style={{ display: "grid", gap: 6 }}>
//                             <span>Tên sản phẩm</span>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={form.name}
//                                 onChange={handleChange}
//                                 required
//                                 style={{
//                                     height: 36,
//                                     padding: "0 10px",
//                                     border: "1px solid #ddd",
//                                     borderRadius: 8,
//                                 }}
//                             />
//                         </label>

//                         <label style={{ display: "grid", gap: 6 }}>
//                             <span>Slug</span>
//                             <input
//                                 type="text"
//                                 name="slug"
//                                 value={form.slug}
//                                 onChange={handleChange}
//                                 style={{
//                                     height: 36,
//                                     padding: "0 10px",
//                                     border: "1px solid #ddd",
//                                     borderRadius: 8,
//                                 }}
//                             />
//                         </label>

//                         {/* Brand select */}
//                         <label style={{ display: "grid", gap: 6 }}>
//                             <span>Thương hiệu</span>
//                             <select
//                                 name="brand_id"
//                                 value={form.brand_id ?? ""}
//                                 onChange={handleChange}
//                                 required
//                                 style={{
//                                     height: 36,
//                                     padding: "0 10px",
//                                     border: "1px solid #ddd",
//                                     borderRadius: 8,
//                                 }}
//                             >
//                                 <option value="">-- chọn thương hiệu --</option>
//                                 {brands.map((b) => (
//                                     <option key={b.id} value={b.id}>
//                                         {b.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </label>

//                         {/* Category select */}
//                         <label style={{ display: "grid", gap: 6 }}>
//                             <span>Danh mục</span>
//                             <select
//                                 name="category_id"
//                                 value={form.category_id ?? ""}
//                                 onChange={handleChange}
//                                 required
//                                 style={{
//                                     height: 36,
//                                     padding: "0 10px",
//                                     border: "1px solid #ddd",
//                                     borderRadius: 8,
//                                 }}
//                             >
//                                 <option value="">-- chọn danh mục --</option>
//                                 {categories.map((c) => (
//                                     <option key={c.id} value={c.id}>
//                                         {c.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </label>

//                         <label style={{ display: "grid", gap: 6 }}>
//                             <span>Giá gốc</span>
//                             <input
//                                 type="number"
//                                 name="price_root"
//                                 value={form.price_root}
//                                 onChange={handleChange}
//                                 min="0"
//                                 style={{
//                                     height: 36,
//                                     padding: "0 10px",
//                                     border: "1px solid #ddd",
//                                     borderRadius: 8,
//                                 }}
//                             />
//                         </label>

//                         <label style={{ display: "grid", gap: 6 }}>
//                             <span>Giá sale</span>
//                             <input
//                                 type="number"
//                                 name="price_sale"
//                                 value={form.price_sale}
//                                 onChange={handleChange}
//                                 min="0"
//                                 style={{
//                                     height: 36,
//                                     padding: "0 10px",
//                                     border: "1px solid #ddd",
//                                     borderRadius: 8,
//                                 }}
//                             />
//                         </label>

//                         <label style={{ display: "grid", gap: 6 }}>
//                             <span>Tồn kho</span>
//                             <input
//                                 type="number"
//                                 name="qty"
//                                 value={form.qty}
//                                 onChange={handleChange}
//                                 min="0"
//                                 style={{
//                                     height: 36,
//                                     padding: "0 10px",
//                                     border: "1px solid #ddd",
//                                     borderRadius: 8,
//                                 }}
//                             />
//                         </label>

//                         <label style={{ display: "grid", gap: 6 }}>
//                             <span>Trạng thái</span>
//                             <select
//                                 name="status"
//                                 value={form.status}
//                                 onChange={handleChange}
//                                 style={{
//                                     height: 36,
//                                     padding: "0 10px",
//                                     border: "1px solid #ddd",
//                                     borderRadius: 8,
//                                 }}
//                             >
//                                 <option value={1}>Hiển thị</option>
//                                 <option value={0}>Ẩn</option>
//                             </select>
//                         </label>

//                         <label style={{ display: "grid", gap: 6 }}>
//                             <span>Ảnh sản phẩm</span>
//                             <input type="file" accept="image/*" onChange={handleFile} />
//                         </label>

//                         <div />
//                     </div>

//                     {preview && (
//                         <img
//                             src={preview}
//                             alt="preview"
//                             style={{
//                                 width: 180,
//                                 height: 130,
//                                 objectFit: "cover",
//                                 borderRadius: 10,
//                                 border: "1px solid #eee",
//                             }}
//                         />
//                     )}

//                     <label style={{ display: "grid", gap: 6 }}>
//                         <span>Mô tả</span>
//                         <textarea
//                             name="description"
//                             value={form.description}
//                             onChange={handleChange}
//                             rows={4}
//                             style={{
//                                 padding: 10,
//                                 border: "1px solid #ddd",
//                                 borderRadius: 8,
//                             }}
//                         />
//                     </label>

//                     <label style={{ display: "grid", gap: 6 }}>
//                         <span>Chi tiết</span>
//                         <textarea
//                             name="detail"
//                             value={form.detail}
//                             onChange={handleChange}
//                             rows={4}
//                             style={{
//                                 padding: 10,
//                                 border: "1px solid #ddd",
//                                 borderRadius: 8,
//                             }}
//                         />
//                     </label>

//                     <div style={{ display: "flex", gap: 8 }}>
//                         <button
//                             type="button"
//                             onClick={() => navigate("/admin/products")}
//                             style={{
//                                 padding: "8px 12px",
//                                 borderRadius: 8,
//                                 border: "1px solid #999",
//                                 background: "transparent",
//                                 cursor: "pointer",
//                             }}
//                         >
//                             Hủy
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             style={{
//                                 padding: "8px 12px",
//                                 borderRadius: 8,
//                                 border: "1px solid #0f62fe",
//                                 background: "#0f62fe",
//                                 color: "#fff",
//                                 cursor: "pointer",
//                             }}
//                         >
//                             {loading ? "Đang lưu…" : "Cập nhật"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </section>
//     );
// }



// src/pages/Admin/Product/edit.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("admin_token") || "", []);

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
    thumbnail: null, // file
  });

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===== Load brands + categories =====
  useEffect(() => {
    (async () => {
      try {
        const [rc, rb] = await Promise.all([
          fetch(`${API_BASE}/categories`, { headers: { Accept: "application/json" } }),
          fetch(`${API_BASE}/brands?status=active`, { headers: { Accept: "application/json" } }),
        ]);
        const jc = await rc.json().catch(() => ({}));
        const jb = await rb.json().catch(() => ({}));
        setCategories(Array.isArray(jc) ? jc : jc.data ?? []);
        setBrands(Array.isArray(jb) ? jb : jb.data ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // ===== Load product (GET public) =====
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/${id}`, {
          headers: { Accept: "application/json" }, // public -> không cần Bearer
        });

        const raw = await res.text();
        let payload = {};
        try {
          payload = raw ? JSON.parse(raw) : {};
        } catch {
          payload = {};
        }

        if (!res.ok) {
          const msg = payload?.message || `HTTP ${res.status}`;
          throw new Error(msg === "Product not found" ? "Không tìm thấy sản phẩm" : msg);
        }

        // Có thể trả trực tiếp hoặc trong data
        const p = payload && typeof payload === "object" && payload.data ? payload.data : payload;

        setForm((prev) => ({
          ...prev,
          name: p.name ?? "",
          slug: p.slug ?? "",
          brand_id: p.brand_id ?? "",
          category_id: p.category_id ?? "",
          price_root: p.price_root ?? "",
          price_sale: p.price_sale ?? "",
          qty: p.qty ?? "",
          detail: p.detail ?? "",
          description: p.description ?? "",
          status: p.status ?? 1,
          thumbnail: null,
        }));

        // preview: ưu tiên thumbnail_url, fallback /storage/thumbnail
        const thumb =
          p.thumbnail_url ||
          (p.thumbnail ? `${window.location.origin}/storage/${p.thumbnail}` : null);
        setPreview(thumb);
      } catch (err) {
        console.error(err);
        setError(err.message || "Không tải được dữ liệu sản phẩm");
      }
    };
    fetchProduct();
  }, [id]);

  // ===== Handlers =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !prev.slug) {
        next.slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return next;
    });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    setForm((s) => ({ ...s, thumbnail: file || null }));
    setPreview(file ? URL.createObjectURL(file) : preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const fd = new FormData();

      // Chuẩn hóa status về 0/1
      const payload = { ...form, status: String(form.status) === "0" ? 0 : 1 };

      Object.entries(payload).forEach(([k, v]) => {
        if (v !== null && v !== "") {
          if (k === "thumbnail" && v) fd.append("thumbnail", v);
          else fd.append(k, v);
        }
      });
      fd.append("_method", "PUT");

      // UPDATE qua admin route (cần Bearer)
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
      setTimeout(() => navigate("/admin/products"), 800);
    } catch (err) {
      console.error(err);
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // ===== UI =====
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
        <h1 style={{ fontSize: 24, marginBottom: 16, fontWeight: 700 }}>Chỉnh sửa sản phẩm</h1>

        {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: "green", marginBottom: 12 }}>{success}</p>}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
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
                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Slug</span>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Thương hiệu</span>
              <select
                name="brand_id"
                value={form.brand_id ?? ""}
                onChange={handleChange}
                required
                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}
              >
                <option value="">-- chọn thương hiệu --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Danh mục</span>
              <select
                name="category_id"
                value={form.category_id ?? ""}
                onChange={handleChange}
                required
                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}
              >
                <option value="">-- chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Giá gốc</span>
              <input
                type="number"
                name="price_root"
                value={form.price_root}
                onChange={handleChange}
                min="0"
                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}
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
                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}
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
                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Trạng thái</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}
              >
                <option value={1}>Hiển thị</option>
                <option value={0}>Ẩn</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Ảnh sản phẩm</span>
              <input type="file" accept="image/*" onChange={handleFile} />
            </label>

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
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Chi tiết</span>
            <textarea
              name="detail"
              value={form.detail}
              onChange={handleChange}
              rows={4}
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
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
