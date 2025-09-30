import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api"; // ✅ Laravel API (có /api)

export default function Products() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null); // ✅ khoá nút khi đang xoá
  const navigate = useNavigate();

  // Lấy sản phẩm từ API (admin, cần Bearer token)
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/admin/products`, {
          signal: ac.signal,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, // ✅ bắt buộc cho auth:sanctum
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        // adminIndex trả về dạng paginate => data.data là mảng
        const list = Array.isArray(data) ? data : data.data ?? [];
        setItems(list);
      } catch (e) {
        if (e.name !== "AbortError")
          setErr("Không tải được danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // Xoá sản phẩm (DELETE /admin/products/{id})
  async function handleDelete(id) {
    const token = localStorage.getItem("token");
    if (!window.confirm("Bạn chắc chắn muốn xoá sản phẩm này?")) return;

    try {
      setDeletingId(id);

      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Xoá thất bại");
      }

      // Cập nhật UI
      setItems((prev) => prev.filter((x) => x.id !== id));
      alert("✅ Đã xoá sản phẩm");
    } catch (err) {
      console.error(err);
      alert(`❌ Lỗi xoá: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  // Filter theo tên hoặc slug
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (x) =>
        x.name?.toLowerCase().includes(s) ||
        x.slug?.toLowerCase().includes(s)
    );
  }, [q, items]);

  return (
    <section style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h1 style={{ fontSize: 24 }}>Quản lý sản phẩm</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên/slug…"
            style={{
              height: 36,
              padding: "0 10px",
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          />
          <button
            onClick={() => navigate("/admin/products/add")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #0f62fe",
              background: "#0f62fe",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            + Add
          </button>
        </div>
      </div>

      {loading && <p>Đang tải dữ liệu…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

      {!loading && (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th align="left">ID</th>
                <th align="left">Tên</th>
                <th align="left">Slug</th>
                <th align="right">Giá gốc</th>
                <th align="right">Giá sale</th>
                <th align="right">Tồn kho</th>
                <th align="center">Ảnh</th>
                <th align="center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.slug}</td>

                  {/* Giá gốc */}
                  <td align="right">₫{(p.price_root || 0).toLocaleString("vi-VN")}</td>

                  {/* Giá sale */}
                  <td align="right">₫{(p.price_sale || 0).toLocaleString("vi-VN")}</td>

                  <td align="right">{p.qty}</td>
                  <td align="center">
                    <img
                      src={p.thumbnail_url /* do BE đã gắn sẵn thumbnail_url */}
                      alt={p.name}
                      style={{
                        width: 60,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </td>
                  <td align="center">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                      style={{
                        padding: "4px 10px",
                        marginRight: 4,
                        background: "#2e7d32",
                        color: "#fff",
                        border: 0,
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      style={{
                        padding: "4px 10px",
                        background: deletingId === p.id ? "#ef9a9a" : "#c62828",
                        color: "#fff",
                        border: 0,
                        borderRadius: 6,
                        cursor: deletingId === p.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {deletingId === p.id ? "Đang xoá..." : "Xóa"}
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={8} align="center" style={{ padding: 18, color: "#777" }}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
