import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function TrashProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const ac = new AbortController();
    const token = localStorage.getItem("admin_token");

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${API_BASE}/admin/products/trash`, {
          signal: ac.signal,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setItems(Array.isArray(data.data) ? data.data : []);
      } catch {
        setErr("Không tải được thùng rác.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const restore = async (id) => {
    const token = localStorage.getItem("admin_token");
    if (!window.confirm("Khôi phục sản phẩm này?")) return;
    const res = await fetch(`${API_BASE}/admin/products/${id}/restore`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      alert("✅ Đã khôi phục sản phẩm!");
    } else alert("❌ Lỗi khi khôi phục");
  };

  const forceDelete = async (id) => {
    const token = localStorage.getItem("admin_token");
    if (!window.confirm("Xóa vĩnh viễn sản phẩm này?")) return;
    const res = await fetch(`${API_BASE}/admin/products/${id}/force`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      alert("🗑 Đã xoá vĩnh viễn!");
    } else alert("❌ Lỗi xoá vĩnh viễn");
  };

  return (
    <section style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24 }}>🗂 Thùng rác sản phẩm</h1>
        <button
          onClick={() => navigate("/admin/products")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #0f62fe",
            background: "#0f62fe",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ← Quay lại danh sách
        </button>
      </div>

      {loading && <p>Đang tải...</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

      {!loading && (
        <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse", background: "#fff", marginTop: 10 }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th>ID</th>
              <th>Tên</th>
              <th>Slug</th>
              <th>Ảnh</th>
              <th align="center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.slug}</td>
                <td align="center">
                  <img
                    src={p.thumbnail_url}
                    alt={p.name}
                    style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }}
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/60x40?text=No+Img")}
                  />
                </td>
                <td align="center">
                  <button
                    onClick={() => restore(p.id)}
                    style={{
                      padding: "4px 10px",
                      marginRight: 6,
                      background: "#15803d",
                      color: "#fff",
                      border: 0,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Khôi phục
                  </button>
                  <button
                    onClick={() => forceDelete(p.id)}
                    style={{
                      padding: "4px 10px",
                      background: "#b91c1c",
                      color: "#fff",
                      border: 0,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Xoá vĩnh viễn
                  </button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} align="center" style={{ padding: 20, color: "#777" }}>
                  Thùng rác trống
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
