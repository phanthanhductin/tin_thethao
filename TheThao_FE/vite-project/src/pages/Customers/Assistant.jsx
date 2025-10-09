import { useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api"; // khớp với cấu hình hiện tại của bạn

export default function Assistant() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Xin chào 👋! Mình là trợ lý AI. Bạn cần hỗ trợ gì?" }
    ]);
    const [loading, setLoading] = useState(false);

    const send = async () => {
        const prompt = input.trim();
        if (!prompt) return;
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
                setMessages((m) => [...m, { role: "assistant", content: "⚠️ Lỗi gọi AI. Vui lòng thử lại." }]);
            }
        } catch (e) {
            setMessages((m) => [...m, { role: "assistant", content: "⚠️ Lỗi mạng khi gọi API." }]);
        } finally {
            setLoading(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold mb-4">Trợ lý AI</h1>

                <div className="border rounded-xl p-4 space-y-3 bg-slate-50">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`p-3 rounded-lg ${m.role === "user" ? "bg-white border" : "bg-indigo-50 border border-indigo-100"
                                }`}
                        >
                            <div className="text-xs uppercase opacity-60 mb-1">
                                {m.role === "user" ? "Bạn" : "AI"}
                            </div>
                            <div className="whitespace-pre-wrap">{m.content}</div>
                        </div>
                    ))}
                    {loading && <div className="text-sm opacity-70">AI đang soạn trả lời…</div>}
                </div>

                <div className="mt-4 flex gap-2">
                    <textarea
                        className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring"
                        placeholder="Nhập câu hỏi… (Enter để gửi, Shift+Enter xuống dòng)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        rows={3}
                    />
                    <button
                        onClick={send}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                    >
                        Gửi
                    </button>
                </div>
            </div>
        </div>
    );
}
