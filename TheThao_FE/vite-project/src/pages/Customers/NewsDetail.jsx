import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE = (import.meta?.env?.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/+$/, "");
const API = `${API_BASE}/api`;
const PLACEHOLDER = "https://placehold.co/1600x900?text=News+Cover";

/* ===== Helpers ===== */
function toAbs(x) {
    if (!x) return "";
    const s = String(x).trim();
    if (/^data:image\//i.test(s)) return s;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^\/\//.test(s)) return `${window.location.protocol}${s}`;
    if (s.startsWith("/")) return `${API_BASE}${s}`;
    if (/^(storage|uploads|images|img)\//i.test(s)) return `${API_BASE}/${s}`;
    return `${API_BASE}/storage/${s}`;
}
// sanitize đơn giản: bỏ <script> và on* inline (hỗ trợ "..." và '...')
function sanitize(html) {
    if (!html) return "";
    return String(html)
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/\son\w+=(?:"[^"]*"|'[^']*')/gi, "");
}
// Ước tính thời lượng đọc ~200 từ/phút
function readingTime(html) {
    const words = String(html || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

/* ===== CSS riêng cho trang chi tiết ===== */
const styles = `
.nd{min-height:100vh;background:#f8fafc;color:#0f172a}
.nd a{color:#2563eb;text-decoration:none}
.nd a:hover{text-decoration:underline}

/* progress bar */
.nd-progress{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#6366f1,#06b6d4);width:0;z-index:50}

/* HERO – sáng, ít che ảnh */
.nd-hero{position:relative;isolation:isolate;min-height:46vh}
.nd-hero__bg{
  position:absolute;inset:0;
  background-size:cover;background-position:center 40%;
  filter:brightness(1.05);
  transform:scale(1.01);
  z-index:-2;
}
.nd-hero__mask{
  position:absolute;inset:0;
  background:linear-gradient(to top,rgba(0,0,0,.35) 0%,rgba(0,0,0,.18) 40%,rgba(0,0,0,.06) 70%,rgba(0,0,0,0) 100%);
  z-index:-1;
}
.nd-hero__inner{max-width:900px;margin:0 auto;padding:64px 16px 28px}
.nd-breadcrumb{display:flex;gap:8px;align-items:center;color:#cbd5e1;font-size:13px}
.nd-breadcrumb a{color:#cbd5e1}
.nd-title{margin:8px 0 10px;font-size:clamp(26px,4vw,40px);line-height:1.1;font-weight:900;letter-spacing:-.02em;color:#fff}
.nd-meta{display:flex;gap:10px;flex-wrap:wrap}
.nd-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:12px;color:#ecfeff;background:rgba(15,23,42,.35);backdrop-filter:blur(6px);border:1px solid rgba(148,163,184,.25)}

/* MAIN */
.nd-main{max-width:900px;margin:0 auto;padding:18px 16px 60px}
.nd-summary{background:#ffffff; border:1px solid rgba(2,6,23,.08); box-shadow:0 8px 22px rgba(2,6,23,.06);
            padding:14px;border-radius:14px;color:#334155}

/* article (prose) */
.nd-article{margin-top:16px;background:#fff;border:1px solid rgba(2,6,23,.08);border-radius:16px;box-shadow:0 10px 26px rgba(2,6,23,.06);padding:22px}
.nd-article h1,.nd-article h2,.nd-article h3{font-weight:900;letter-spacing:-.01em;color:#0f172a;margin:18px 0 10px}
.nd-article h1{font-size:28px}.nd-article h2{font-size:22px}.nd-article h3{font-size:18px}
.nd-article p{margin:10px 0;line-height:1.7;color:#334155}
.nd-article ul, .nd-article ol{padding-left:22px;margin:10px 0;color:#334155}
.nd-article blockquote{margin:14px 0;padding:12px 16px;border-left:4px solid #6366f1;background:#f8fafc;color:#1f2937;border-radius:8px}
.nd-article code{background:#0b132010;border:1px solid #e2e8f0;border-radius:6px;padding:2px 6px;font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace}
.nd-article table{width:100%;border-collapse:separate;border-spacing:0;margin:14px 0;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden}
.nd-article th,.nd-article td{padding:10px;border-bottom:1px solid #e2e8f0}
.nd-article thead th{background:#f8fafc;font-weight:800}
.nd-article img{max-width:100%;height:auto;border-radius:12px}

/* share bar */
.nd-share{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
.nd-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;font-weight:800;cursor:pointer}
.nd-btn:hover{box-shadow:0 8px 18px rgba(2,6,23,.08)}
.nd-btn--primary{border:0;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;box-shadow:0 10px 22px rgba(37,99,235,.25)}
/* nút lên đầu trang – màu nổi bật */
.nd-btn--top{border:0;background:linear-gradient(135deg,#22c55e,#06b6d4);color:#fff;font-weight:800;box-shadow:0 10px 22px rgba(16,185,129,.25)}
.nd-btn--top:hover{filter:saturate(1.05);box-shadow:0 12px 26px rgba(16,185,129,.32)}
.nd-btn--top:active{transform:translateY(1px)}
`;

export default function NewsDetail() {
    const { slugOrId } = useParams();
    const [item, setItem] = useState(null);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

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
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        })();
    }, [slugOrId]);

    // progress bar
    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const total = h.scrollHeight - h.clientHeight;
            setProgress(total > 0 ? Math.min(100, Math.max(0, (h.scrollTop / total) * 100)) : 0);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (loading) {
        return (
            <div className="nd">
                <style>{styles}</style>
                <div className="nd-progress" style={{ width: `${progress}%` }} />
                <div className="mx-auto" style={{ maxWidth: 900, padding: "28px 16px" }}>
                    <div className="animate-pulse space-y-4">
                        <div style={{ height: 32, width: "70%", borderRadius: 12, background: "#e2e8f0" }} />
                        <div style={{ aspectRatio: "16/9", width: "100%", borderRadius: 16, background: "#e2e8f0" }} />
                        <div style={{ height: 14, width: "100%", borderRadius: 8, background: "#e2e8f0" }} />
                        <div style={{ height: 14, width: "80%", borderRadius: 8, background: "#e2e8f0" }} />
                    </div>
                </div>
            </div>
        );
    }

    if (err || !item) {
        return (
            <div className="nd">
                <style>{styles}</style>
                <div className="nd-progress" style={{ width: `${progress}%` }} />
                <div className="nd-main">
                    <div className="nd-summary" style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#b91c1c" }}>
                        {err || "Không tìm thấy bài viết"}
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <Link to="/news">← Quay lại Tin tức</Link>
                    </div>
                </div>
            </div>
        );
    }

    const cover = toAbs(item.thumbnail || item.image_url || item.image || item.thumb || item.cover || "") || PLACEHOLDER;
    const date = item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : "";
    const rtime = readingTime(item.content);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert("Đã sao chép liên kết!");
        } catch {
            alert("Không thể sao chép liên kết.");
        }
    };

    return (
        <div className="nd">
            <style>{styles}</style>
            <div className="nd-progress" style={{ width: `${progress}%` }} />

            {/* HERO */}
            <header className="nd-hero">
                <div className="nd-hero__bg" style={{ backgroundImage: `url('${cover}')` }} aria-hidden="true" />
                <div className="nd-hero__mask" aria-hidden="true" />
                <div className="nd-hero__inner">
                    <nav className="nd-breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span aria-hidden="true">›</span>
                        <Link to="/news">Tin tức</Link>
                    </nav>
                    <h1 className="nd-title">{item.title}</h1>
                    <div className="nd-meta">
                        <span className="nd-chip">
                            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2v2H5v2H3v14h18V6h-2V4h-2V2H7zm0 4h10v2H7V6zm0 4h10v8H7v-8z" /></svg>
                            {date || "—"}
                        </span>
                        <span className="nd-chip">
                            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0-6a2 2 0 012 2v1.09A7.002 7.002 0 0119.91 10H21a2 2 0 110 4h-1.09A7.002 7.002 0 0114 19.91V21a2 2 0 11-4 0v-1.09A7.002 7.002 0 014.09 14H3a2 2 0 110-4h1.09A7.002 7.002 0 0110 4.09V3a2 2 0 012-2z" /></svg>
                            {rtime} phút đọc
                        </span>
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main className="nd-main">
                {item.summary && <p className="nd-summary">{item.summary}</p>}

                <article
                    className="nd-article"
                    dangerouslySetInnerHTML={{
                        __html: sanitize(item.content || "") || "<p>(Không có nội dung)</p>",
                    }}
                />

                <div className="nd-share">
                    <button className="nd-btn nd-btn--primary" onClick={copyLink} title="Sao chép liên kết">
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.9 12a5 5 0 017.78-4.03l1.41 1.41-1.42 1.42-1.4-1.4a3 3 0 10.01 4.24l1.41-1.41 1.42 1.42-1.41 1.41A5 5 0 113.9 12zm16.2 0a5 5 0 01-8.19 3.82l-1.41-1.41 1.42-1.42 1.4 1.4a3 3 0 10-.01-4.24l-1.41 1.41-1.42-1.42 1.41-1.41A5 5 0 0120.1 12z" /></svg>
                        Sao chép link
                    </button>
                    <a className="nd-btn" href="/news">← Về trang Tin tức</a>
                    <button className="nd-btn nd-btn--top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        Lên đầu trang ↑
                    </button>
                </div>
            </main>
        </div>
    );
}
