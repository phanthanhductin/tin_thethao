import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = (import.meta?.env?.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/+$/, "");
const API = `${API_BASE}/api`;
const PLACEHOLDER = "https://placehold.co/1200x800?text=News+Cover";

/* ===== CSS nhúng tại chỗ ===== */
const styles = `
:root{
  --news-bg: linear-gradient(135deg, #fdf2f8 0%, #eef2ff 60%, #ecfeff 100%);
  --card-bg:#fff; --card-border:rgba(2,6,23,.08);
  --muted:#64748b; --title:#0f172a; --brand:#6d28d9; --brand-2:#2563eb; --ring:rgba(99,102,241,.25);
}
@media (prefers-color-scheme: dark){
  :root{ --news-bg:linear-gradient(135deg,#1f2937 0%,#0f172a 60%,#0b1320 100%);
    --card-bg:#0b1320cc; --card-border:rgba(148,163,184,.14); --muted:#94a3b8; --title:#e2e8f0; --ring:rgba(99,102,241,.35);}
}
.news-page{min-height:100vh;background:#f8fafc;}
.news-hero{background:var(--news-bg);padding:56px 20px 36px;position:relative;overflow:hidden}
.news-hero__inner{max-width:1120px;margin:0 auto;text-align:center}
.news-kicker{display:inline-block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--brand-2);font-weight:800;background:#ffffffcc;border:1px solid var(--card-border);padding:6px 10px;border-radius:999px;backdrop-filter:blur(6px)}
.news-hero h1{margin:10px 0 6px;font-size:clamp(28px,3.8vw,40px);font-weight:900;letter-spacing:-.02em;color:var(--title)}
.news-hero__desc{max-width:720px;margin:0 auto;color:var(--muted)}
.news-search{margin:20px auto 0;display:grid;grid-template-columns:40px 1fr 40px auto;gap:10px;max-width:720px;background:#fff;border:1px solid var(--card-border);border-radius:14px;box-shadow:0 6px 18px rgba(2,6,23,.06);padding:8px}
.news-search__icon{display:grid;place-items:center;opacity:.6}
.news-search__input{height:40px;border:0;outline:none;padding:0 2px;font-size:14px}
.news-search__clear{height:40px;border:0;background:transparent;font-size:16px;opacity:.6;cursor:pointer}
.news-search__clear:hover{opacity:1}
.news-search__btn{height:40px;padding:0 16px;border-radius:10px;border:1px solid #0000;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#fff;font-weight:700;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}
.news-search__btn:active{transform:translateY(1px)}
.news-kpis{margin-top:18px;display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
.news-kpis .kpi{display:flex;align-items:baseline;gap:8px;padding:8px 12px;border:1px solid var(--card-border);border-radius:12px;background:#fff}
.news-kpis .kpi b{font-size:18px}
.news-kpis .kpi span{font-size:12px;color:var(--muted)}
.news-container{max-width:1120px;margin:0 auto;padding:24px 20px 56px}
.news-alert{padding:12px 14px;border:1px solid var(--card-border);border-radius:12px;background:#fff;color:#0f172a;margin-bottom:14px}
.news-alert.error{background:#fef2f2;border-color:#fecaca;color:#b91c1c}
.news-grid{display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:18px}
@media (min-width:640px){.news-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1024px){.news-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.news-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:16px;overflow:hidden;box-shadow:0 6px 18px rgba(2,6,23,.06);transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
.news-card:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(2,6,23,.12);border-color:rgba(99,102,241,.35)}
.news-card__media{position:relative;display:block;aspect-ratio:16/10;background:#f1f5f9;overflow:hidden}
.news-card__media img{width:100%;height:100%;object-fit:cover;transition:transform .35s ease}
.news-card:hover .news-card__media img{transform:scale(1.04)}
.media-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.25),rgba(0,0,0,0));opacity:.15;pointer-events:none}
.badge-new{position:absolute;top:10px;left:10px;background:#22c55e;color:#fff;font-size:12px;font-weight:800;padding:4px 8px;border-radius:999px;box-shadow:0 8px 20px rgba(34,197,94,.3)}
.news-card__body{padding:14px}
.news-card__title{font-size:16px;font-weight:800;letter-spacing:-.01em;color:var(--title);margin:2px 0 6px}
.news-card__title a{color:inherit;text-decoration:none;background-image:linear-gradient(currentColor,currentColor);background-size:0% 2px;background-repeat:no-repeat;background-position:0 100%;transition:background-size .25s ease}
.news-card:hover .news-card__title a{background-size:100% 2px}
.news-card__summary{color:var(--muted);font-size:14px;line-height:1.55;margin-bottom:10px}
.clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.news-card__meta{display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--muted);font-size:12px}
.readmore{display:inline-flex;align-items:center;gap:6px;font-weight:700;color:var(--brand-2);text-decoration:none}
.news-skeleton{border:1px solid var(--card-border);border-radius:16px;background:#fff;overflow:hidden;padding-bottom:14px}
.ph-cover{aspect-ratio:16/10;background:linear-gradient(90deg,#e2e8f0 0%,#f1f5f9 50%,#e2e8f0 100%);background-size:200% 100%;animation:shimmer 1.2s infinite linear}
.ph-line{height:12px;margin:12px 14px 0;border-radius:8px;background:linear-gradient(90deg,#e2e8f0,#f1f5f9,#e2e8f0);background-size:200% 100%;animation:shimmer 1.2s infinite linear}
.ph-line.w-80{width:80%}.ph-line.w-60{width:60%}
@keyframes shimmer{0%{background-position:0% 0}100%{background-position:-200% 0}}
.news-empty{text-align:center;background:#fff;border:1px solid var(--card-border);border-radius:16px;padding:32px 20px}
.news-empty .icon-wrap{width:48px;height:48px;display:grid;place-items:center;margin:0 auto 8px;border-radius:12px;background:#f1f5f9}
.news-empty h3{margin:6px 0;font-size:18px}
.news-empty p{color:var(--muted)}
.news-pagination{margin-top:20px;display:flex;align-items:center;justify-content:center;gap:8px}
.page-btn{height:40px;padding:0 12px;border-radius:10px;border:1px solid var(--card-border);background:#fff;cursor:pointer}
.page-btn:disabled{opacity:.5;cursor:not-allowed}
.page-list{display:flex;gap:6px;list-style:none;padding:0;margin:0}
.page-num{min-width:40px;height:40px;padding:0 10px;border-radius:10px;border:1px solid var(--card-border);background:#fff;cursor:pointer;font-weight:700}
.page-num.active{border-color:var(--ring);box-shadow:0 0 0 4px var(--ring);background:linear-gradient(135deg,#eef2ff,#ecfeff)}
.page-dots{min-width:40px;height:40px;display:grid;place-items:center;color:var(--muted)}
`;

export default function News() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    async function load(p = 1, kw = q) {
        setLoading(true);
        setErr("");
        try {
            const url = `${API}/posts?page=${p}&per_page=12${kw ? `&q=${encodeURIComponent(kw)}` : ""}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setItems(data.data || data.items || []);
            setMeta({
                current_page: data.current_page || data.meta?.current_page || p,
                last_page: data.last_page || data.meta?.last_page || p,
                total: data.total || data.meta?.total || (data.data?.length ?? 0),
            });
            setPage(p);
        } catch (e) {
            setErr(String(e.message || e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(1); }, []);

    const onSearch = (e) => { e.preventDefault(); load(1, q); };
    const clearSearch = () => { if (!q) return; setQ(""); load(1, ""); };

    const pages = useMemo(() => buildPages(meta.current_page, meta.last_page), [meta]);

    return (
        <div className="news-page">
            <style>{styles}</style>

            {/* HERO */}
            <section className="news-hero">
                <div className="news-hero__inner">
                    <span className="news-kicker">Blog & News</span>
                    <h1>Tin tức mới nhất</h1>
                    <p className="news-hero__desc">
                        Cập nhật xu hướng thể thao, mẹo mua sắm thông minh, review sản phẩm và nhiều hơn nữa.
                    </p>

                    <form onSubmit={onSearch} className="news-search" role="search" aria-label="Tìm bài viết">
                        <span className="news-search__icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16a6.471 6.471 0 004.23-1.57l.27.28v.79L20 21.5 21.5 20 15.5 14zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5z" />
                            </svg>
                        </span>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Tìm bài viết, chủ đề, từ khoá…"
                            className="news-search__input"
                        />
                        {q && (
                            <button type="button" onClick={clearSearch} className="news-search__clear" aria-label="Xoá tìm kiếm">
                                ✕
                            </button>
                        )}
                        <button type="submit" className="news-search__btn">Tìm</button>
                    </form>

                    <div className="news-kpis">
                        <div className="kpi"><b>{meta.total}</b><span>Bài viết</span></div>
                        <div className="kpi"><b>{meta.last_page}</b><span>Số trang</span></div>
                        <div className="kpi"><b>24/7</b><span>Cập nhật</span></div>
                    </div>
                </div>
            </section>

            {/* BODY */}
            <div className="news-container">
                {err && (
                    <div className="news-alert error">
                        <b>Lỗi:</b> {err}
                    </div>
                )}

                {loading ? (
                    <GridSkeleton />
                ) : items.length === 0 ? (
                    <EmptyState onReset={clearSearch} />
                ) : (
                    <>
                        <div className="news-grid">
                            {items.map((p) => (
                                <NewsCard key={p.id} p={p} />
                            ))}
                        </div>

                        <nav className="news-pagination" aria-label="Phân trang">
                            <button className="page-btn" disabled={page <= 1} onClick={() => load(page - 1)}>
                                ← Trước
                            </button>

                            <ul className="page-list">
                                {pages.map((it, i) =>
                                    it === "…" ? (
                                        <li key={`dots-${i}`} className="page-dots">…</li>
                                    ) : (
                                        <li key={it}>
                                            <button
                                                className={`page-num ${it === meta.current_page ? "active" : ""}`}
                                                aria-current={it === meta.current_page ? "page" : undefined}
                                                onClick={() => load(it)}
                                            >
                                                {it}
                                            </button>
                                        </li>
                                    )
                                )}
                            </ul>

                            <button className="page-btn" disabled={page >= meta.last_page} onClick={() => load(page + 1)}>
                                Sau →
                            </button>
                        </nav>
                    </>
                )}
            </div>
        </div>
    );
}

function NewsCard({ p }) {
    const url = `/news/${p.slug || p.id}`;
    const rawImg = p.image_url || p.image || p.thumb || "";
    const img = toAbs(rawImg) || PLACEHOLDER;     // 👈 tuyệt đối hoá ở FE
    const isNew = isWithinDays(p.created_at, 7);
    const date = p.created_at ? formatVNDate(p.created_at) : "";

    return (
        <article className="news-card">
            <Link to={url} className="news-card__media" aria-label={p.title}>
                <img src={img} alt={p.title} loading="lazy" onError={(e) => (e.currentTarget.src = PLACEHOLDER)} />
                <span className="media-overlay" />
                {isNew && <span className="badge-new">Mới</span>}
            </Link>

            <div className="news-card__body">
                <h3 className="news-card__title">
                    <Link to={url}>{p.title}</Link>
                </h3>
                {p.summary && <p className="news-card__summary clamp-3">{p.summary}</p>}

                <div className="news-card__meta">
                    <time dateTime={p.created_at || ""}>{date}</time>
                    <Link to={url} className="readmore">
                        Đọc tiếp
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="ml-1">
                            <path d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8 8-8z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </article>
    );
}

function GridSkeleton() {
    return (
        <div className="news-grid">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="news-skeleton">
                    <div className="ph-cover" />
                    <div className="ph-line w-80" />
                    <div className="ph-line" />
                    <div className="ph-line w-60" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ onReset }) {
    return (
        <div className="news-empty">
            <div className="icon-wrap">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                    <path d="M21 6h-7.59l-2-2H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zm-1 12H4V6h6.59l2 2H20v10z" />
                </svg>
            </div>
            <h3>Không có bài viết phù hợp</h3>
            <p>Thử thay đổi từ khoá hoặc xem tất cả bài viết mới nhất.</p>
            <button className="news-search__btn" onClick={onReset}>Xoá lọc & xem tất cả</button>
        </div>
    );
}

/* ==== Helpers ==== */
function buildPages(current, last) {
    const c = Number(current || 1);
    const l = Number(last || 1);
    if (l <= 7) return Array.from({ length: l }, (_, i) => i + 1);
    const pages = [1];
    const left = Math.max(2, c - 1);
    const right = Math.min(l - 1, c + 1);
    if (left > 2) pages.push("…");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < l - 1) pages.push("…");
    pages.push(l);
    return pages;
}

function isWithinDays(dateStr, days = 7) {
    if (!dateStr) return false;
    const d = new Date(dateStr).getTime();
    if (Number.isNaN(d)) return false;
    return (Date.now() - d) <= days * 24 * 60 * 60 * 1000;
}

function formatVNDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch { return ""; }
}

/** Biến mọi đường dẫn ảnh (relative) thành URL tuyệt đối dựa vào API_BASE. */
function toAbs(x) {
    if (!x) return null;
    const s = String(x).trim();
    if (/^data:image\//i.test(s)) return s;               // data URL
    if (/^https?:\/\//i.test(s)) return s;                // đã tuyệt đối
    if (/^\/\//.test(s)) return `${window.location.protocol}${s}`; // protocol-relative
    if (s.startsWith("/")) return `${API_BASE}${s}`;      // /storage/... hoặc /uploads/...
    if (/^(storage|uploads|images|img)\//i.test(s)) return `${API_BASE}/${s}`;
    return `${API_BASE}/storage/${s}`;                    // fallback: coi như nằm trong storage
}
