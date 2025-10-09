// src/components/FloatingAIWidget.jsx
import { useEffect, useRef, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api"; // đổi nếu backend khác

export default function FloatingAIWidget() {
    const BTN_SIZE = 64;
    const storeKey = "ai_fab_pos_v1";

    const [pos, setPos] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(storeKey) || "null");
            if (saved && typeof saved.x === "number" && typeof saved.y === "number") return saved;
        } catch { }
        return { x: 20, y: 80 }; // mặc định: cách mép trái 20px, mép dưới 80px
    });

    const [open, setOpen] = useState(false);
    const [dragging, setDragging] = useState(false);
    const startRef = useRef({ mx: 0, my: 0, x: 0, y: 0 });

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Xin chào 👋 Bạn hỏi gì mình giúp nè!" },
    ]);

    useEffect(() => {
        localStorage.setItem(storeKey, JSON.stringify(pos));
    }, [pos]);

    const onDown = (e) => {
        setDragging(true);
        const p = "touches" in e ? e.touches[0] : e;
        startRef.current = { mx: p.clientX, my: p.clientY, x: pos.x, y: pos.y };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onUp);
    };

    const onMove = (e) => {
        if (!dragging) return;
        const p = "touches" in e ? e.touches[0] : e;
        if ("touches" in e) e.preventDefault();
        const dx = p.clientX - startRef.current.mx;
        const dy = p.clientY - startRef.current.my;
        setPos({
            x: Math.max(8, startRef.current.x + dx),
            y: Math.max(8, startRef.current.y + dy),
        });
    };

    const onUp = () => {
        setDragging(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onUp);
    };

    const send = async () => {
        const prompt = input.trim();
        if (!prompt || loading) return;
        setMessages((m) => [...m, { role: "user", content: prompt }]);
        setInput("");
        setLoading(true);
        try {
            const history = messages.map(({ role, content }) => ({ role, content }));
            const res = await fetch(`${API_BASE}/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, history }),
            });
            const data = await res.json();
            if (data?.ok) {
                setMessages((m) => [...m, { role: "assistant", content: data.answer || "(không có nội dung)" }]);
            } else {
                setMessages((m) => [...m, { role: "assistant", content: "⚠️ Lỗi gọi AI. Thử lại nhé." }]);
            }
        } catch {
            setMessages((m) => [...m, { role: "assistant", content: "⚠️ Lỗi mạng khi gọi API." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                aria-label="AI Assistant"
                onClick={() => !dragging && setOpen((v) => !v)}
                onMouseDown={onDown}
                onTouchStart={onDown}
                style={{
                    position: "fixed",
                    left: pos.x,
                    bottom: pos.y,
                    width: BTN_SIZE,
                    height: BTN_SIZE,
                    borderRadius: "9999px",
                    background: "linear-gradient(135deg,#6366f1,#22d3ee)",
                    color: "#fff",
                    boxShadow: "0 10px 20px rgba(0,0,0,.15)",
                    border: "0",
                    cursor: dragging ? "grabbing" : "grab",
                    zIndex: 9999,
                }}
            >
                🤖
            </button>

            {open && (
                <div
                    style={{
                        position: "fixed",
                        right: 16,
                        bottom: BTN_SIZE + 24,
                        width: 360,
                        maxWidth: "95vw",
                        height: 480,
                        maxHeight: "70vh",
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 16,
                        boxShadow: "0 18px 50px rgba(0,0,0,.18)",
                        display: "flex",
                        flexDirection: "column",
                        zIndex: 9998,
                    }}
                >
                    <div
                        style={{
                            padding: "10px 12px",
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            background: "linear-gradient(135deg,#eef2ff,#ecfeff)",
                        }}
                    >
                        <div style={{ fontWeight: 800, color: "#1f2937" }}>Trợ lý AI</div>
                        <button
                            onClick={() => setOpen(false)}
                            style={{ border: 0, background: "transparent", fontSize: 18, cursor: "pointer" }}
                            title="Đóng"
                        >
                            ×
                        </button>
                    </div>

                    <div style={{ flex: 1, overflow: "auto", padding: 12, background: "#fafafa" }}>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: 8,
                                    background: m.role === "user" ? "#fff" : "#eef2ff",
                                    border: "1px solid #e5e7eb",
                                    padding: "8px 10px",
                                    borderRadius: 10,
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                <div style={{ opacity: 0.6, fontSize: 12, marginBottom: 2 }}>
                                    {m.role === "user" ? "Bạn" : "AI"}
                                </div>
                                {m.content}
                            </div>
                        ))}
                        {loading && <div style={{ fontSize: 12, opacity: 0.75 }}>AI đang soạn trả lời…</div>}
                    </div>

                    <div style={{ padding: 10, borderTop: "1px solid #f1f5f9", background: "#fff" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        send();
                                    }
                                }}
                                placeholder="Nhập câu hỏi… (Enter để gửi)"
                                rows={2}
                                style={{
                                    flex: 1,
                                    resize: "none",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 10,
                                    padding: "8px 10px",
                                    outline: "none",
                                }}
                            />
                            <button
                                onClick={send}
                                disabled={loading || !input.trim()}
                                style={{
                                    minWidth: 80,
                                    border: 0,
                                    borderRadius: 10,
                                    background: "linear-gradient(135deg,#6366f1,#22d3ee)",
                                    color: "#fff",
                                    fontWeight: 700,
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
