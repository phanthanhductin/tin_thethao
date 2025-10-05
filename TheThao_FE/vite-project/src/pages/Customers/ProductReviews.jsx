// src/components/ProductReviews.jsx
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000/api";

export default function ProductReviews({ productId }) {
    const [list, setList] = useState([]);
    const [meta, setMeta] = useState({ avg_rating: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");

    const token = localStorage.getItem("token");

    const load = async () => {
        setLoading(true);
        try {
            const r = await fetch(`${API}/products/${productId}/reviews`);
            const json = await r.json();
            setList(Array.isArray(json?.data) ? json.data : json);
            setMeta(json?.meta || {});
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [productId]);

    const submit = async (e) => {
        e.preventDefault();
        if (!token) { alert("Bạn cần đăng nhập để đánh giá."); return; }
        const r = await fetch(`${API}/products/${productId}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rating, content }),
        });
        if (r.ok) {
            setContent(""); setRating(5); await load();
        } else {
            alert("Gửi đánh giá thất bại.");
        }
    };

    return (
        <div style={{ marginTop: 30 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
                Đánh giá & Bình luận • ★ {meta.avg_rating || 0} ({meta.total || 0})
            </h3>

            {loading ? <p>Đang tải...</p> : (
                <div style={{ display: "grid", gap: 12 }}>
                    {list.length === 0 ? <div>Chưa có đánh giá nào.</div> : list.map((c) => (
                        <div key={c.id} style={{ background: "#1f1f1f", borderRadius: 10, padding: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <strong>{c?.user?.name || "Người dùng"}</strong>
                                <span style={{ color: "#ffd166" }}>{"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}</span>
                            </div>
                            <div style={{ color: "#ddd", whiteSpace: "pre-wrap" }}>{c.content}</div>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={submit} style={{ marginTop: 16, background: "#172026", padding: 12, borderRadius: 10 }}>
                <div style={{ marginBottom: 8 }}>
                    <label>Chọn sao: </label>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Cảm nhận của bạn…"
                    rows={3}
                    style={{ width: "100%", borderRadius: 8, padding: 10 }}
                />
                <div style={{ marginTop: 8 }}>
                    <button type="submit" style={{ background: "#00c853", color: "#fff", border: 0, padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>
                        Gửi đánh giá
                    </button>
                </div>
            </form>
        </div>
    );
}
