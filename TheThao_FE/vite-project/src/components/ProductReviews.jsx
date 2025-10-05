import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

// helper: parse JSON an toàn (fallback text/empty)
async function safeJson(resp) {
    try {
        const ct = resp.headers.get("content-type") || "";
        if (ct.includes("application/json")) return await resp.json();
        // Có thể là HTML lỗi -> thử parse từ text
        const txt = await resp.text();
        try { return JSON.parse(txt); } catch { return { message: txt }; }
    } catch {
        return null;
    }
}

export default function ProductReviews({ productId }) {
    const [list, setList] = useState([]);
    const [meta, setMeta] = useState({ avg_rating: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem("token");

    const load = async () => {
        setLoading(true);
        setErr("");
        try {
            const r = await fetch(`${API}/products/${productId}/reviews`, {
                headers: { Accept: "application/json" },
            });
            const json = await safeJson(r);

            if (!r.ok) {
                const msg =
                    (json && (json.message || json.error || json.errors?.[0])) ||
                    `Không tải được đánh giá (HTTP ${r.status}).`;
                setErr(String(msg));
                setList([]);
                setMeta({ avg_rating: 0, total: 0 });
                return; // ❗ KHÔNG throw -> tránh error boundary
            }

            const data = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
            const m = json?.meta || {};
            setList(data);
            setMeta({
                avg_rating: Math.round((Number(m.avg_rating || 0) + Number.EPSILON) * 10) / 10,
                total: Number(m.total || data.length || 0),
            });
        } catch {
            setErr("Không tải được đánh giá. Vui lòng thử lại sau.");
            setList([]);
            setMeta({ avg_rating: 0, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const submit = async (e) => {
        e.preventDefault();
        if (!token) { alert("Bạn cần đăng nhập để đánh giá."); return; }

        setSubmitting(true);
        setErr("");
        try {
            const r = await fetch(`${API}/products/${productId}/reviews`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rating, content }),
            });

            const json = await safeJson(r);
            if (!r.ok) {
                const msg =
                    (json && (json.message || json.error || json.errors?.[0])) ||
                    `Gửi đánh giá thất bại (HTTP ${r.status}).`;
                setErr(String(msg));
                return; // ❗ không throw
            }

            setContent("");
            setRating(5);
            await load();
        } catch {
            setErr("Không gửi được đánh giá. Kiểm tra kết nối mạng và thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
                Đánh giá & Bình luận • ★ {meta.avg_rating || 0} ({meta.total || 0})
            </h3>

            {err ? (
                <div
                    role="alert"
                    style={{
                        background: "#2b1d1d",
                        border: "1px solid #c62828",
                        color: "#ffcdd2",
                        padding: 12,
                        borderRadius: 10,
                        marginBottom: 10,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {err}
                </div>
            ) : null}

            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    {list.length === 0 ? (
                        <div style={{ opacity: 0.85 }}>Chưa có đánh giá nào.</div>
                    ) : (
                        list.map((c) => (
                            <div key={c.id} style={{ background: "#1f1f1f", borderRadius: 10, padding: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <strong>{c?.user?.name || "Người dùng"}</strong>
                                    <span style={{ color: "#ffd166" }}>
                                        {"★".repeat(Number(c.rating) || 0)}
                                        {"☆".repeat(5 - (Number(c.rating) || 0))}
                                    </span>
                                </div>
                                <div style={{ color: "#ddd", whiteSpace: "pre-wrap" }}>{c.content}</div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <form
                onSubmit={submit}
                style={{ marginTop: 16, background: "#172026", padding: 12, borderRadius: 10 }}
            >
                <div style={{ marginBottom: 8 }}>
                    <label>Chọn sao: </label>
                    <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        disabled={submitting}
                    >
                        {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                                {n} ★
                            </option>
                        ))}
                    </select>
                </div>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Cảm nhận của bạn…"
                    rows={3}
                    style={{ width: "100%", borderRadius: 8, padding: 10 }}
                    disabled={submitting}
                />

                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            background: submitting ? "#4caf50aa" : "#00c853",
                            color: "#fff",
                            border: 0,
                            padding: "8px 14px",
                            borderRadius: 8,
                            cursor: submitting ? "not-allowed" : "pointer",
                        }}
                    >
                        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                    <button
                        type="button"
                        onClick={load}
                        disabled={loading || submitting}
                        style={{
                            background: "#263238",
                            color: "#cfd8dc",
                            border: "1px solid #455a64",
                            padding: "8px 12px",
                            borderRadius: 8,
                            cursor: loading || submitting ? "not-allowed" : "pointer",
                        }}
                        title="Tải lại đánh giá"
                    >
                        Tải lại
                    </button>
                </div>
            </form>
        </div>
    );
}
