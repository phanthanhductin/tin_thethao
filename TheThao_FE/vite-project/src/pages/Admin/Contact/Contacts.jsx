import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const api = (p) => (p.startsWith("http") ? p : `${API_BASE}${p.startsWith("/") ? "" : "/"}${p}`);

export default function AdminContacts() {
    const token = useMemo(() => localStorage.getItem("admin_token"), []);
    const headers = useMemo(() => ({ Accept: "application/json", Authorization: `Bearer ${token}` }), [token]);

    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState(""); // "" | 0 | 1
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [open, setOpen] = useState(false);
    const [view, setView] = useState(null); // contact detail
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true); setErr("");
            const url = api(`/api/admin/contacts?q=${encodeURIComponent(q)}${status !== "" ? `&status=${status}` : ""}&per_page=200`);
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const j = await res.json();
            const list = Array.isArray(j) ? j : j.data ?? [];
            setItems(list);
        } catch (e) {
            setErr(e.message || "Load error");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);
    useEffect(() => {
        const t = setTimeout(fetchData, 400);
        return () => clearTimeout(t);
    }, [q, status]);

    const openView = async (id) => {
        try {
            const res = await fetch(api(`/api/admin/contacts/${id}`), { headers });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const j = await res.json();
            setView(j);
            setOpen(true);
            // đánh dấu read_at ở BE đã xử lý trong adminShow
        } catch (e) {
            alert(e.message || "Không tải được liên hệ");
        }
    };

    const saveStatus = async () => {
        if (!view) return;
        try {
            setSaving(true);
            const fd = new FormData();
            fd.append("status", view.status ?? 0);
            if (view.note) fd.append("note", view.note);
            const res = await fetch(api(`/api/admin/contacts/${view.id}`), {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setOpen(false);
            await fetchData();
        } catch (e) {
            alert(e.message || "Lưu thất bại");
        } finally { setSaving(false); }
    };

    const onDelete = async (id) => {
        if (!confirm("Xoá liên hệ này?")) return;
        try {
            setDeletingId(id);
            const res = await fetch(api(`/api/admin/contacts/${id}`), { method: "DELETE", headers });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setItems((prev) => prev.filter((x) => x.id !== id));
        } catch (e) {
            alert(e.message || "Lỗi xoá");
        } finally { setDeletingId(null); }
    };

    const pill = (s) => {
        const ok = Number(s) === 1;
        return (
            <span style={{
                display: "inline-block", padding: "2px 8px", borderRadius: 999,
                fontSize: 12, fontWeight: 600, color: ok ? "#0b6b3a" : "#475569",
                background: ok ? "#d1fae5" : "#e2e8f0"
            }}>
                {ok ? "đã xử lý" : "mới"}
            </span>
        );
    };

    return (
        <section style={{ padding: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản trị Liên hệ</h1>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Tìm tên/email/điện thoại…"
                        style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8, minWidth: 260 }}
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 8 }}
                    >
                        <option value="">Tất cả</option>
                        <option value="0">Mới</option>
                        <option value="1">Đã xử lý</option>
                    </select>
                </div>
            </div>

            {loading && <p>Đang tải dữ liệu…</p>}
            {err && <p style={{ color: "red" }}>{err}</p>}

            {!loading && (
                <div style={{ overflowX: "auto" }}>
                    <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse", background: "#fff" }}>
                        <thead>
                            <tr style={{ background: "#fafafa" }}>
                                <th align="left">ID</th>
                                <th align="left">Tên</th>
                                <th align="left">Email</th>
                                <th align="left">Điện thoại</th>
                                <th align="left">Chủ đề</th>
                                <th align="left">Trạng thái</th>
                                <th align="left">Ngày</th>
                                <th align="center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(c => (
                                <tr key={c.id} style={{ borderTop: "1px solid #eee" }}>
                                    <td>{c.id}</td>
                                    <td>{c.name}</td>
                                    <td>{c.email}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.subject}</td>
                                    <td>{pill(c.status)}</td>
                                    <td>{String(c.created_at || "").replace("T", " ").slice(0, 19)}</td>
                                    <td align="center">
                                        <button
                                            onClick={() => openView(c.id)}
                                            style={{ padding: "4px 10px", marginRight: 4, background: "#0f62fe", color: "#fff", border: 0, borderRadius: 6, cursor: "pointer" }}
                                        >Xem</button>
                                        <button
                                            onClick={() => onDelete(c.id)}
                                            disabled={deletingId === c.id}
                                            style={{ padding: "4px 10px", background: deletingId === c.id ? "#ef9a9a" : "#c62828", color: "#fff", border: 0, borderRadius: 6 }}
                                        >{deletingId === c.id ? "Đang xoá..." : "Xóa"}</button>
                                    </td>
                                </tr>
                            ))}
                            {!items.length && (
                                <tr><td colSpan={8} align="center" style={{ padding: 18, color: "#777" }}>Không có dữ liệu</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal xem/chỉnh trạng thái */}
            {open && view && (
                <div
                    onClick={() => setOpen(false)}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ width: 760, maxWidth: "92vw", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.2)", overflow: "hidden" }}>
                        <div style={{ padding: 14, background: "linear-gradient(90deg,#4f46e5 0%,#0ea5e9 100%)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 700 }}>Chi tiết liên hệ</div>
                            <button onClick={() => setOpen(false)} style={{ padding: "6px 10px", background: "rgba(255,255,255,.2)", border: 0, borderRadius: 8, color: "#fff" }}>Đóng</button>
                        </div>

                        <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <div style={{ marginBottom: 8 }}><b>Tên:</b> {view.name}</div>
                                <div style={{ marginBottom: 8 }}><b>Email:</b> {view.email || "-"}</div>
                                <div style={{ marginBottom: 8 }}><b>Điện thoại:</b> {view.phone || "-"}</div>
                                <div style={{ marginBottom: 8 }}><b>Chủ đề:</b> {view.subject || "-"}</div>
                                <div style={{ marginBottom: 8 }}><b>Ngày gửi:</b> {String(view.created_at || "").replace("T", " ").slice(0, 19)}</div>
                                <div style={{ marginBottom: 8 }}><b>Đã đọc:</b> {view.read_at ? String(view.read_at).replace("T", " ").slice(0, 19) : "Chưa"}</div>
                            </div>
                            <div>
                                <div style={{ marginBottom: 8 }}><b>Nội dung</b></div>
                                <div style={{ whiteSpace: "pre-wrap", border: "1px solid #eee", borderRadius: 8, padding: 10, minHeight: 120 }}>{view.message}</div>
                            </div>
                        </div>

                        <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13 }}>Trạng thái</label>
                                <select
                                    value={view.status ?? 0}
                                    onChange={(e) => setView(v => ({ ...v, status: Number(e.target.value) }))}
                                    style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 10 }}
                                >
                                    <option value={0}>Mới</option>
                                    <option value={1}>Đã xử lý</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13 }}>Ghi chú nội bộ</label>
                                <input
                                    value={view.note || ""}
                                    onChange={(e) => setView(v => ({ ...v, note: e.target.value }))}
                                    placeholder="Ghi chú cho team..."
                                    style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 10 }}
                                />
                            </div>
                        </div>

                        <div style={{ padding: 16, display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid #eee" }}>
                            <button onClick={() => setOpen(false)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}>Huỷ</button>
                            <button onClick={saveStatus} disabled={saving}
                                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #0f62fe", background: saving ? "#9bbcff" : "#0f62fe", color: "#fff" }}>
                                {saving ? "Đang lưu…" : "Lưu"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
