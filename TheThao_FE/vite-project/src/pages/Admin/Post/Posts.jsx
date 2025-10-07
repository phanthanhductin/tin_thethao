import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* API giống Products */
const API_BASE = "http://127.0.0.1:8000/api";

export default function Posts() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const nav = useNavigate();
    const token = useMemo(() => localStorage.getItem("admin_token"), []);

    /* ======================= LOAD LIST ======================= */
    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                setLoading(true);
                setErr("");
                const res = await fetch(
                    `${API_BASE}/admin/posts?q=${encodeURIComponent(q)}&per_page=200`,
                    {
                        signal: ac.signal,
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const list = Array.isArray(data) ? data : data.data ?? [];
                setItems(list);
            } catch (e) {
                if (e.name !== "AbortError")
                    setErr("Không tải được danh sách bài viết.");
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, [q, token]);

    /* ======================= DELETE ======================= */
    async function handleDelete(id) {
        if (!window.confirm("Bạn chắc chắn muốn xoá bài viết này?")) return;
        try {
            setDeletingId(id);
            const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
                method: "DELETE",
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Xoá thất bại");
            setItems((prev) => prev.filter((x) => x.id !== id));
            alert("✅ Đã xoá bài viết");
        } catch (err) {
            alert(`❌ Lỗi xoá: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    }

    /* ======================= FILTER ======================= */
    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return items;
        return items.filter(
            (x) =>
                x.title?.toLowerCase().includes(s) ||
                x.slug?.toLowerCase().includes(s)
        );
    }, [q, items]);

    /* ======================= UI ======================= */
    return (
        <section style={{ padding: 20 }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                }}
            >
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý bài viết</h1>

                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Tìm tiêu đề/slug…"
                        style={{
                            height: 36,
                            padding: "0 10px",
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            minWidth: 260,
                        }}
                    />
                    <button
                        onClick={() => nav("/admin/posts/add")} // <-- đúng route, chữ thường
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

            {/* Table */}
            {!loading && (
                <div style={{ overflowX: "auto" }}>
                    <table
                        width="100%"
                        cellPadding={8}
                        style={{ borderCollapse: "collapse", background: "#fff" }}
                    >
                        <thead>
                            <tr style={{ background: "#fafafa" }}>
                                <th align="left">ID</th>
                                <th align="left">Ảnh</th>
                                <th align="left">Tiêu đề</th>
                                <th align="left">Slug</th>
                                <th align="left">Trạng thái</th>
                                <th align="left">Ngày</th>
                                <th align="center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
                                    <td>{p.id}</td>
                                    <td>
                                        {p.image_url ? (
                                            <img
                                                src={p.image_url}
                                                alt=""
                                                style={{
                                                    width: 60,
                                                    height: 40,
                                                    objectFit: "cover",
                                                    borderRadius: 4,
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        ) : null}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{p.title}</td>
                                    <td>{p.slug}</td>
                                    <td>
                                        <span
                                            style={{
                                                display: "inline-block",
                                                padding: "2px 8px",
                                                borderRadius: 999,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color:
                                                    p.status === "published" || p.status === 1
                                                        ? "#0b6b3a"
                                                        : "#475569",
                                                background:
                                                    p.status === "published" || p.status === 1
                                                        ? "#d1fae5"
                                                        : "#e2e8f0",
                                            }}
                                        >
                                            {p.status === 1 ? "published" : p.status}
                                        </span>
                                    </td>
                                    <td>
                                        {(p.published_at || p.created_at || "")
                                            .replace("T", " ")
                                            .slice(0, 19)}
                                    </td>
                                    <td align="center">
                                        <button
                                            onClick={() => nav(`/admin/posts/edit/${p.id}`)}
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
                                                background:
                                                    deletingId === p.id ? "#ef9a9a" : "#c62828",
                                                color: "#fff",
                                                border: 0,
                                                borderRadius: 6,
                                                cursor:
                                                    deletingId === p.id ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            {deletingId === p.id ? "Đang xoá..." : "Xóa"}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {!filtered.length && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        align="center"
                                        style={{ padding: 18, color: "#777" }}
                                    >
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
