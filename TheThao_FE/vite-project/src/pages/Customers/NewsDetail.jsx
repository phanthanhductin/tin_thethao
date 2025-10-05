import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://127.0.0.1:8000";
const API = `${API_BASE}/api`;
const PLACEHOLDER = "https://placehold.co/1200x600?text=No+Image";

// sanitize rất đơn giản: loại script & inline on*
function sanitize(html) {
    if (!html) return "";
    return String(html)
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/\son\w+="[^"]*"/gi, "");
}

export default function NewsDetail() {
    const { slugOrId } = useParams();
    const [item, setItem] = useState(null);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setErr("");
            try {
                const res = await fetch(`${API}/posts/${encodeURIComponent(slugOrId)}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setItem(data);
            } catch (e) {
                setErr(String(e.message || e));
            } finally {
                setLoading(false);
            }
        })();
    }, [slugOrId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-3xl px-4 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-2/3 rounded bg-gray-200"></div>
                        <div className="aspect-[16/9] w-full rounded bg-gray-200"></div>
                        <div className="h-4 w-full rounded bg-gray-200"></div>
                        <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (err || !item) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-3xl px-4 py-8">
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                        {err || "Không tìm thấy bài viết"}
                    </div>
                    <div className="mt-4">
                        <Link to="/news" className="text-indigo-600 underline">← Quay lại Tin tức</Link>
                    </div>
                </div>
            </div>
        );
    }

    const date = item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : "";

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-3xl px-4 py-8">
                <Link to="/news" className="text-sm text-indigo-600 underline">← Tin tức</Link>
                <h1 className="mt-2 text-2xl font-bold">{item.title}</h1>
                <div className="mt-1 text-sm text-gray-500">{date}</div>

                <div className="mt-4 overflow-hidden rounded-2xl bg-gray-100">
                    <img
                        src={item.image_url || PLACEHOLDER}
                        alt={item.title}
                        className="h-auto w-full object-cover"
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                    />
                </div>

                {item.summary && (
                    <p className="mt-4 rounded-lg bg-white p-4 text-gray-700 shadow-sm">
                        {item.summary}
                    </p>
                )}

                <article
                    className="prose prose-indigo mt-6 max-w-none rounded-lg bg-white p-5 shadow-sm"
                    dangerouslySetInnerHTML={{ __html: sanitize(item.content || "") || "<p>(Không có nội dung)</p>" }}
                />
            </div>
        </div>
    );
}
