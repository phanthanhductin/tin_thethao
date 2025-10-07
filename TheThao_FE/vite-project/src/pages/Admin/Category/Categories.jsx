import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HOST = "http://127.0.0.1:8000";
const API_BASE = `${HOST}/api`;

export default function Categories() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState([]); // ✅ Danh sách tick
  const navigate = useNavigate();

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`${API_BASE}/categories`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data ?? [];
        setRows(list);
      } catch (e) {
        if (e.name !== "AbortError") setErr("Không tải được danh mục.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // ✅ Xóa (soft delete)
  const handleDelete = async (id) => {
    if (!window.confirm(`Xóa danh mục #${id}?`)) return;
    try {
      const token = localStorage.getItem("admin_token") || "";
      if (!token) {
        alert("Bạn cần đăng nhập admin để xóa.");
        return;
      }

      const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      let payload = null;
      try {
        payload = await res.json();
      } catch {}

      if (!res.ok) {
        const msg = payload?.message || `Xóa thất bại (HTTP ${res.status})`;
        throw new Error(msg);
      }

      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      alert(e.message || "Không xóa được danh mục.");
    }
  };

  // ✅ Xóa nhiều mục đã chọn
  const handleBulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Chuyển ${selected.length} danh mục vào thùng rác?`)) return;

    for (const id of selected) {
      await handleDelete(id);
    }
    setSelected([]);
  };

  return (
    <section style={{ padding: 20 }}>
      {/* ==== Header ==== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: 24 }}>Quản lý danh mục</h1>
        <div>
          <button
            onClick={() => navigate("/admin/categories/add")}
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
            onClick={() => navigate("/admin/categories/trash")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              marginLeft: 8,
              background: "#616161",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            🗑️ Thùng rác
          </button>

          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                marginLeft: 8,
                background: "#c62828",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Xóa đã chọn ({selected.length})
            </button>
          )}
        </div>
      </div>

      {/* ==== Table ==== */}
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
              minWidth: 700,
            }}
          >
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? rows.map((r) => r.id) : []
                      )
                    }
                    checked={selected.length === rows.length && rows.length > 0}
                  />
                </th>
                <th align="left">ID</th>
                <th align="left">Tên</th>
                <th align="left">Slug</th>
                <th align="center">Ảnh</th>
                <th align="left">Mô tả</th>
                <th align="center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #eee" }}>
                  <td align="center">
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      onChange={() =>
                        setSelected((sel) =>
                          sel.includes(c.id)
                            ? sel.filter((x) => x !== c.id)
                            : [...sel, c.id]
                        )
                      }
                    />
                  </td>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td align="center">
                    <img
                      src={c.image_url || `${HOST}/storage/${c.image}`}
                      alt={c.name}
                      style={{
                        width: 60,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  </td>
                  <td>{c.description}</td>
                  <td align="center">
                    <button
                      onClick={() =>
                        navigate(`/admin/categories/edit/${c.id}`)
                      }
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
                      onClick={() => handleDelete(c.id)}
                      style={{
                        padding: "4px 10px",
                        background: "#c62828",
                        color: "#fff",
                        border: 0,
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={7} align="center" style={{ padding: 18, color: "#777" }}>
                    Trống
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
