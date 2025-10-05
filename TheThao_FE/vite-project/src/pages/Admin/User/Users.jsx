// src/pages/Admin/User/Users.jsx
import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null); // giống Products: khoá nút khi xoá

  const token = localStorage.getItem("admin_token") || localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e) {
      setErr("Không tải được danh sách người dùng.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xoá: cùng pattern như Products (confirm + disabled + màu nền khác khi xoá)
  const removeUser = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá người dùng này?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert("✅ Đã xoá người dùng");
    } catch (e) {
      console.error("Delete error:", e);
      alert("❌ Xoá thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  // Lọc: giống Products (client-side keyword)
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return users;
    return users.filter(
      (u) =>
        String(u.id).includes(kw) ||
        (u.name || "").toLowerCase().includes(kw) ||
        (u.email || "").toLowerCase().includes(kw) ||
        (u.username || "").toLowerCase().includes(kw) ||
        (u.roles || "").toLowerCase().includes(kw)
    );
  }, [q, users]);

  return (
    <section style={{ padding: 20 }}>
      {/* Toolbar giống Products */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <h1 style={{ fontSize: 24 }}>Quản lý người dùng</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên/email/username/role…"
            style={{
              height: 36,
              padding: "0 10px",
              border: "1px solid #ddd",
              borderRadius: 8,
              minWidth: 260,
            }}
          />
          <button
            onClick={() => alert("Chức năng thêm user đang phát triển")}
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

      {!loading && !err && (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th align="left">ID</th>
                <th align="left">Tên</th>
                <th align="left">Email</th>
                <th align="left">Username</th>
                <th align="left">Vai trò</th>
                <th align="left">Trạng thái</th>
                <th align="center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid #eee" }}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.username}</td>
                  <td style={{ textTransform: "capitalize" }}>{u.roles || "-"}</td>
                  <td>{u.status === 1 ? "Hoạt động" : "Khoá"}</td>
                  <td align="center">
                    {/* Giữ đúng pattern nút như Products */}

                    <button
                      onClick={() => removeUser(u.id)}
                      disabled={deletingId === u.id}
                      style={{
                        padding: "4px 10px",
                        background: deletingId === u.id ? "#ef9a9a" : "#c62828",
                        color: "#fff",
                        border: 0,
                        borderRadius: 6,
                        cursor: deletingId === u.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {deletingId === u.id ? "Đang xoá..." : "Xóa"}
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} align="center" style={{ padding: 18, color: "#777" }}>
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
