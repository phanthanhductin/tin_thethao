import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";
const PLACEHOLDER = "https://placehold.co/120x90?text=No+Img";

export default function Products() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const navigate = useNavigate();

  // ===== Load danh sách sản phẩm =====
  useEffect(() => {
    const ac = new AbortController();
    const token = localStorage.getItem("admin_token");

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${API_BASE}/admin/products`, {
          signal: ac.signal,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
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

  // ===== Xoá sản phẩm =====
  async function handleDelete(id) {
    const token = localStorage.getItem("admin_token");
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
      if (!res.ok) throw new Error(data.message || "Xoá thất bại");
      setItems((prev) => prev.filter((x) => x.id !== id));
      alert("✅ Đã chuyển sản phẩm vào thùng rác");
    } catch (err) {
      console.error(err);
      alert(`❌ Lỗi xoá: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkDelete() {
    if (!selected.length) return alert("Chưa chọn sản phẩm nào");
    if (!window.confirm(`Xoá ${selected.length} sản phẩm?`)) return;
    for (const id of selected) await handleDelete(id);
    setSelected([]);
  }

  // ===== Lọc tìm kiếm =====
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (x) =>
        x.name?.toLowerCase().includes(s) ||
        x.slug?.toLowerCase().includes(s)
    );
  }, [q, items]);

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const allChecked =
    filtered.length > 0 && selected.length === filtered.length;

  const toggleAll = () =>
    setSelected(allChecked ? [] : filtered.map((x) => x.id));

  // ===== Render =====
  return (
    <section style={{ padding: 20 }}>
      {/* Thanh tiêu đề */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý sản phẩm</h1>
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
          <button
            onClick={handleBulkDelete}
            disabled={!selected.length}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e11d48",
              background: selected.length ? "#e11d48" : "#fca5a5",
              color: "#fff",
              cursor: selected.length ? "pointer" : "not-allowed",
            }}
          >
            🗑 Xoá chọn ({selected.length})
          </button>
          <button
            onClick={() => navigate("/admin/products/trash")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #6b7280",
              background: "#6b7280",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            🗂 Thùng rác
          </button>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      {loading && <p>Đang tải dữ liệu…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

      {!loading && (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table
            width="100%"
            cellPadding={8}
            style={{
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: 8,
            }}
          >
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                  />
                </th>
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
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.slug}</td>
                  <td align="right">
                    ₫{(p.price_root || 0).toLocaleString("vi-VN")}
                  </td>
                  <td align="right">
                    ₫{(p.price_sale || 0).toLocaleString("vi-VN")}
                  </td>
                  <td align="right">{p.qty}</td>
                  <td align="center">
                    <img
                      src={p.thumbnail_url || PLACEHOLDER}
                      alt={p.name}
                      style={{
                        width: 60,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                      onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                    />
                  </td>
                  <td align="center">
                    <button
                      onClick={() => setViewItem(p)}
                      style={{
                        padding: "4px 10px",
                        marginRight: 4,
                        background: "#2563eb",
                        color: "#fff",
                        border: 0,
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      👁 Xem
                    </button>
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
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      style={{
                        padding: "4px 10px",
                        background:
                          deletingId === p.id ? "#ef9a9a" : "#c62828",
                        color: "#fff",
                        border: 0,
                        borderRadius: 6,
                        cursor:
                          deletingId === p.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {deletingId === p.id ? "Đang xoá..." : "🗑 Xóa"}
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={9} align="center" style={{ padding: 18, color: "#777" }}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Modal xem chi tiết */}
      {viewItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setViewItem(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 20,
              width: 550,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 20, marginBottom: 10, fontWeight: 700 }}>
              🏷 {viewItem.name}
            </h2>
            <img
              src={viewItem.thumbnail_url || PLACEHOLDER}
              alt={viewItem.name}
              style={{
                width: "100%",
                height: 280,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 10,
              }}
            />
            <p><b>Slug:</b> {viewItem.slug}</p>
            <p>
              <b>Giá:</b> ₫{viewItem.price_sale?.toLocaleString("vi-VN")}{" "}
              <span style={{ color: "#888" }}>
                (Gốc: ₫{viewItem.price_root?.toLocaleString("vi-VN")})
              </span>
            </p>
            <p><b>Tồn kho:</b> {viewItem.qty}</p>
            <p><b>Trạng thái:</b> {viewItem.status}</p>

            {/* ✅ Mô tả và chi tiết hiển thị HTML thật */}
            <div style={{ marginTop: 10 }}>
              <p><b>Mô tả:</b></p>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    viewItem.description?.trim()
                      ? viewItem.description
                      : "<em>Không có mô tả</em>",
                }}
                style={{
                  color: "#333",
                  lineHeight: "1.6",
                  background: "#f8fafc",
                  padding: "8px 10px",
                  borderRadius: 6,
                }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <p><b>Chi tiết:</b></p>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    viewItem.detail?.trim()
                      ? viewItem.detail
                      : "<em>Không có chi tiết</em>",
                }}
                style={{
                  color: "#333",
                  lineHeight: "1.6",
                  background: "#f8fafc",
                  padding: "8px 10px",
                  borderRadius: 6,
                }}
              />
            </div>

            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button
                onClick={() => setViewItem(null)}
                style={{
                  padding: "8px 16px",
                  background: "#0f62fe",
                  color: "#fff",
                  border: 0,
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
