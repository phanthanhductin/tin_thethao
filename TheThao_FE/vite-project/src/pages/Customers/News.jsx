import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = (import.meta?.env?.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/+$/, "");
const API = `${API_BASE}/api`;
const PLACEHOLDER = "https://placehold.co/1200x800?text=News+Cover";
const PAGE_SIZE = 6;

/* =============== Search history config =============== */
const HISTORY_KEY = "news_search_history_v1";
const HISTORY_MAX = 8;
const loadHistory = () => {
    try { const r = localStorage.getItem(HISTORY_KEY); const a = r ? JSON.parse(r) : []; return Array.isArray(a) ? a : []; } catch { return []; }
};
const saveHistory = (n) => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(n)); } catch { } };
const pushHistory = (kw) => {
    const k = String(kw || "").trim(); if (!k) return loadHistory();
    const cur = loadHistory().filter(x => x.toLowerCase() !== k.toLowerCase());
    const next = [k, ...cur].slice(0, HISTORY_MAX); saveHistory(next); return next;
};
const removeHistoryItem = (kw) => {
    const cur = loadHistory().filter(x => x.toLowerCase() !== String(kw || "").toLowerCase());
    saveHistory(cur); return cur;
};
const clearHistory = () => { saveHistory([]); return []; };

/* ===== CSS ===== */
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
.news-hero{background:var(--news-bg);padding:56px 20px 36px;position:relative;overflow:visible} /* <-- đổi visible */
.news-hero__inner{max-width:1120px;margin:0 auto;text-align:center;position:relative;z-index:1}
.news-kicker{display:inline-block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--brand-2);font-weight:800;background:#ffffffcc;border:1px solid var(--card-border);padding:6px 10px;border-radius:999px;backdrop-filter:blur(6px)}
.news-hero h1{margin:10px 0 6px;font-size:clamp(28px,3.8vw,40px);font-weight:900;letter-spacing:-.02em;color:var(--title)}
.news-hero__desc{max-width:720px;margin:0 auto;color:var(--muted)}

/* Search bar + panel */
.news-search{margin:20px auto 0;display:grid;grid-template-columns:44px 1fr auto;gap:10px;max-width:720px;background:#fff;border:2px solid #e2e8f0;border-radius:14px;box-shadow:0 8px 22px rgba(2,6,23,.08);padding:8px;transition:border-color .2s,box-shadow .2s;position:relative;z-index:60} /* z-index cao */
.news-search:focus-within{border-color:#818cf8; box-shadow:0 0 0 5px rgba(99,102,241,.15)}
.news-search__icon{display:grid;place-items:center;opacity:.7}
.news-search__input{height:44px;border:0;outline:none;padding:0 2px;font-size:15px}
.news-search__btn{height:44px;padding:0 18px;border-radius:12px;border:1px solid #0000;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#fff;font-weight:800;cursor:pointer;transition:transform .12s,box-shadow .12s}
.news-search__btn:hover{box-shadow:0 8px 20px rgba(37,99,235,.28)}
.news-search__btn:active{transform:translateY(1px)}

/* Dropdown */
.search-panel{grid-column:1/-1;position:absolute;left:8px;right:8px;top:calc(100% + 8px);z-index:80; /* cao hơn nữa */
  background:#fff;border:1px solid var(--card-border);border-radius:14px;box-shadow:0 20px 40px rgba(2,6,23,.18);text-align:left;
  max-height:360px;overflow:auto}
.sp-section{padding:10px 12px;border-bottom:1px solid rgba(2,6,23,.06)}
.sp-section:last-child{border-bottom:0}
.sp-title{font-size:12px;font-weight:800;color:#64748b;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
.history-list{display:flex;gap:8px;flex-wrap:wrap}
.history-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid #e2e8f0;border-radius:999px;background:#f8fafc;cursor:pointer;font-weight:700}
.history-chip:hover{border-color:#94a3b8;background:#fff}
.history-remove{border:0;background:transparent;cursor:pointer;opacity:.6}
.history-remove:hover{opacity:1}
.clear-history{margin-left:auto;border:0;background:#fff;color:#ef4444;font-weight:800;cursor:pointer}
.suggest-list{display:flex;flex-direction:column}
.suggest-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;cursor:pointer}
.suggest-item:hover{background:#f8fafc}
.suggest-title{font-weight:800;color:#0f172a;font-size:14px}
.suggest-time{margin-left:auto;font-size:12px;color:#64748b}

/* Grid 3x2 */
.news-container{max-width:1280px;margin:0 auto;padding:24px 20px 56px}
.news-grid{display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:18px}
@media (min-width:640px){.news-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1024px){.news-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (min-width:1280px){.news-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}

.news-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:16px;overflow:hidden;box-shadow:0 6px 18px rgba(2,6,23,.06);transition:transform .2s,box-shadow .2s,border-color .2s}
.news-card:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(2,6,23,.12);border-color:rgba(99,102,241,.35)}
.news-card__media{position:relative;display:block;aspect-ratio:16/10;background:#f1f5f9;overflow:hidden}
.news-card__media img{width:100%;height:100%;object-fit:cover;transition:transform .35s}
.news-card:hover .news-card__media img{transform:scale(1.04)}
.media-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.25),rgba(0,0,0,0));opacity:.15;pointer-events:none}
.news-card__body{padding:12px}
.news-card__title{font-size:15px;font-weight:800;letter-spacing:-.01em;color:var(--title);margin:0 0 6px}
.news-card__title a{color:inherit;text-decoration:none;background-image:linear-gradient(currentColor,currentColor);background-size:0% 2px;background-repeat:no-repeat;background-position:0 100%;transition:background-size .25s}
.news-card:hover .news-card__title a{background-size:100% 2px}
.news-card__summary{color:var(--muted);font-size:13px;line-height:1.55;margin-bottom:10px}
.clamp-3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.news-card__meta{display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--muted);font-size:12px}

/* Skeleton & empty */
.news-skeleton{border:1px solid var(--card-border);border-radius:16px;background:#fff;overflow:hidden;padding-bottom:12px}
.ph-cover{aspect-ratio:16/10;background:linear-gradient(90deg,#e2e8f0 0%,#f1f5f9 50%,#e2e8f0 100%);background-size:200% 100%;animation:shimmer 1.2s infinite linear}
.ph-line{height:12px;margin:10px 12px 0;border-radius:8px;background:linear-gradient(90deg,#e2e8f0,#f1f5f9,#e2e8f0);background-size:200% 100%;animation:shimmer 1.2s infinite linear}
.ph-line.w-80{width:80%}.ph-line.w-60{width:60%}
@keyframes shimmer{0%{background-position:0% 0}100%{background-position:-200% 0}}
.news-empty{text-align:center;background:#fff;border:1px solid var(--card-border);border-radius:16px;padding:32px 20px}
.news-empty .icon-wrap{width:48px;height:48px;display:grid;place-items:center;margin:0 auto 8px;border-radius:12px;background:#f1f5f9}
.news-empty h3{margin:6px 0;font-size:18px}
.news-empty p{color:#64748b}

/* Pagination */
.news-pagination{margin-top:22px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
.page-btn{height:42px;padding:0 16px;border-radius:12px;border:0;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;font-weight:800;cursor:pointer;box-shadow:0 8px 22px rgba(37,99,235,.25);transition:transform .12s,box-shadow .12s,filter .12s}
.page-btn:hover{filter:saturate(1.05);box-shadow:0 10px 26px rgba(37,99,235,.32)}
.page-btn:active{transform:translateY(1px)}
.page-btn[disabled]{cursor:not-allowed;opacity:.75;filter:grayscale(.15) saturate(.8);box-shadow:none;background:linear-gradient(135deg,#c7d2fe,#bae6fd);color:#475569}
.page-list{display:flex;gap:10px;list-style:none;padding:0;margin:0}
.page-num{min-width:44px;height:44px;padding:0 12px;border-radius:14px;border:2px solid #c7d2fe;background:#fff;cursor:pointer;font-weight:900;color:#0f172a;letter-spacing:.3px;transition:transform .12s,border-color .12s,box-shadow .12s,background .12s}
.page-num:hover{border-color:#818cf8;box-shadow:0 0 0 5px rgba(99,102,241,.15)}
.page-num.active{border:0;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;box-shadow:0 10px 26px rgba(37,99,235,.32),0 0 0 5px rgba(99,102,241,.18);transform:translateY(-1px)}
.page-num:focus-visible,.page-btn:focus-visible{outline:none;box-shadow:0 0 0 5px rgba(99,102,241,.25)}
.page-dots{min-width:44px;height:44px;display:grid;place-items:center;color:#94a3b8;border:2px dashed #e2e8f0;border-radius:14px;background:#fff}
`;

export default function News() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [history, setHistory] = useState(loadHistory());
    const [suggests, setSuggests] = useState([]);
    const timerRef = useRef(null);

    async function load(p = 1, kw = q) {
        setLoading(true); setErr("");
        try {
            const url = `${API}/posts?page=${p}&per_page=${PAGE_SIZE}${kw ? `&q=${encodeURIComponent(kw)}` : ""}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const rows = data.data || data.items || [];
            setItems(rows);
            const total = data.total || data.meta?.total || rows.length;
            const last = data.last_page || data.meta?.last_page || Math.max(1, Math.ceil(total / PAGE_SIZE));
            setMeta({ current_page: data.current_page || data.meta?.current_page || p, last_page: last, total });
            setPage(p);
        } catch (e) { setErr(String(e.message || e)); }
        finally { setLoading(false); }
    }
    useEffect(() => { load(1); }, []);

    // debounce suggest
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            const kw = q.trim(); if (!kw) { setSuggests([]); return; }
            try {
                const res = await fetch(`${API}/posts?page=1&per_page=5&q=${encodeURIComponent(kw)}`);
                const data = await res.json();
                setSuggests(data.data || data.items || []);
            } catch { }
        }, 300);
        return () => timerRef.current && clearTimeout(timerRef.current);
    }, [q]);

    const onSearch = (e) => {
        e.preventDefault();
        const kw = q.trim();
        const next = pushHistory(kw); setHistory(next);
        load(1, kw);
    };
    const clearSearch = () => { setQ(""); setSuggests([]); load(1, ""); };
    const useHistoryKeyword = (kw) => { setQ(kw); setHistory(pushHistory(kw)); load(1, kw); };
    const removeHistory = (kw, e) => { e.stopPropagation(); setHistory(removeHistoryItem(kw)); };
    const wipeHistory = () => { setHistory(clearHistory()); };
    const useSuggestion = (s) => { const kw = s.title || s.slug || ""; setQ(kw); setHistory(pushHistory(kw)); load(1, kw); };

    const pages = useMemo(() => buildPages(meta.current_page, meta.last_page), [meta]);

    return (
        <div className="news-page">
            <style>{styles}</style>

            {/* HERO */}
            <section className="news-hero">
                <div className="news-hero__inner">
                    <span className="news-kicker">Blog & News</span>
                    <h1>Tin tức mới nhất</h1>
                    <p className="news-hero__desc">Cập nhật xu hướng thể thao, mẹo mua sắm thông minh, review sản phẩm và nhiều hơn nữa.</p>

                    <form className="news-search" onSubmit={onSearch} role="search" aria-label="Tìm bài viết">
                        <span className="news-search__icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16a6.471 6.471 0 004.23-1.57l.27.28v.79L20 21.5 21.5 20 15.5 14zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5z" /></svg>
                        </span>
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm bài viết…" className="news-search__input" />
                        <button type="submit" className="news-search__btn">Tìm</button>

                        {(history.length > 0 || (q.trim() && suggests.length > 0)) && (
                            <div className="search-panel" role="listbox">
                                {history.length > 0 && (
                                    <div className="sp-section">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span className="sp-title">Lịch sử tìm kiếm</span>
                                            <button type="button" className="clear-history" onClick={wipeHistory}>Xoá lịch sử</button>
                                        </div>
                                        <div className="history-list">
                                            {history.map(h => (
                                                <span key={h} className="history-chip" onClick={() => useHistoryKeyword(h)}>
                                                    {h}
                                                    <button className="history-remove" title="Xoá" onClick={(e) => removeHistory(h, e)}>✕</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {q.trim() && suggests.length > 0 && (
                                    <div className="sp-section">
                                        <div className="sp-title">Gợi ý liên quan</div>
                                        <div className="suggest-list">
                                            {suggests.map(s => (
                                                <div key={s.id} className="suggest-item" onClick={() => useSuggestion(s)}>
                                                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                                    <span className="suggest-title">{s.title}</span>
                                                    <span className="suggest-time">{s.created_at ? new Date(s.created_at).toLocaleDateString("vi-VN") : ""}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </section>

            {/* BODY */}
            <div className="news-container">
                {err && <div className="news-alert error"><b>Lỗi:</b> {err}</div>}
                {loading ? <GridSkeleton /> : items.length === 0 ? <EmptyState onReset={clearSearch} /> : (
                    <>
                        <div className="news-grid">
                            {items.map(p => <NewsCard key={p.id} p={p} />)}
                        </div>
                        <nav className="news-pagination" aria-label="Phân trang">
                            <button className="page-btn" disabled={page <= 1} onClick={() => load(1)} title="Trang đầu">« Đầu</button>
                            <button className="page-btn" disabled={page <= 1} onClick={() => load(page - 1)} title="Trang trước">← Trước</button>
                            <ul className="page-list">
                                {pages.map((it, i) =>
                                    it === "…" ? <li key={`dots-${i}`} className="page-dots">…</li> :
                                        <li key={it}><button className={`page-num ${it === meta.current_page ? "active" : ""}`} aria-current={it === meta.current_page ? "page" : undefined} onClick={() => load(it)}>{it}</button></li>
                                )}
                            </ul>
                            <button className="page-btn" disabled={page >= meta.last_page} onClick={() => load(page + 1)} title="Trang sau">Sau →</button>
                            <button className="page-btn" disabled={page >= meta.last_page} onClick={() => load(meta.last_page)} title="Trang cuối">Cuối »</button>
                        </nav>
                    </>
                )}
            </div>
        </div>
    );
}

function NewsCard({ p }) {
    const url = `/news/${p.slug || p.id}`;
    const rawImg = p.thumbnail || p.image_url || p.image || p.thumb || p.cover || "";
    const img = toAbs(rawImg) || PLACEHOLDER;
    const date = p.created_at ? formatVNDate(p.created_at) : "";
    return (
        <article className="news-card">
            <Link to={url} className="news-card__media" aria-label={p.title}>
                <img src={img} alt={p.title} loading="lazy" onError={(e) => e.currentTarget.src = PLACEHOLDER} />
                <span className="media-overlay" />
            </Link>
            <div className="news-card__body">
                <h3 className="news-card__title"><Link to={url}>{p.title}</Link></h3>
                {p.summary && <p className="news-card__summary clamp-3">{p.summary}</p>}
                <div className="news-card__meta"><time dateTime={p.created_at || ""}>{date}</time></div>
            </div>
        </article>
    );
}

function GridSkeleton() {
    return (
        <div className="news-grid">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="news-skeleton">
                    <div className="ph-cover" /><div className="ph-line w-80" /><div className="ph-line" /><div className="ph-line w-60" />
                </div>
            ))}
        </div>
    );
}

function EmptyState({ onReset }) {
    return (
        <div className="news-empty">
            <div className="icon-wrap">
                <svg viewBox="0 0 24 24" width="24" height="24"><path d="M21 6h-7.59l-2-2H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zm-1 12H4V6h6.59l2 2H20v10z" /></svg>
            </div>
            <h3>Không có bài viết phù hợp</h3>
            <p>Thử thay đổi từ khoá hoặc xem tất cả bài viết mới nhất.</p>
            <button className="news-search__btn" onClick={onReset}>Xoá lọc & xem tất cả</button>
        </div>
    );
}

/* Helpers */
function buildPages(current, last) {
    const c = Number(current || 1), l = Number(last || 1);
    if (l <= 7) return Array.from({ length: l }, (_, i) => i + 1);
    const pages = [1], left = Math.max(2, c - 1), right = Math.min(l - 1, c + 1);
    if (left > 2) pages.push("…"); for (let i = left; i <= right; i++) pages.push(i);
    if (right < l - 1) pages.push("…"); pages.push(l); return pages;
}
function formatVNDate(s) { try { return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); } catch { return ""; } }
function toAbs(x) {
    if (!x) return null; const s = String(x).trim();
    if (/^data:image\//i.test(s)) return s; if (/^https?:\/\//i.test(s)) return s;
    if (/^\/\//.test(s)) return `${window.location.protocol}${s}`;
    if (s.startsWith("/")) return `${API_BASE}${s}`; if (/^(storage|uploads|images|img)\//i.test(s)) return `${API_BASE}/${s}`;
    return `${API_BASE}/storage/${s}`;
}
