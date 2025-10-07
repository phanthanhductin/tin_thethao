import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function TopBarAuth({
  logoSrc = "http://127.0.0.1:8000/assets/images/logo.webp",
  cartCount = 0,
  fixed = true,
  routes = {
    home: "/",
    login: "/login",
    register: "/register",
    cart: "/cart",
    account: "/account",
    search: "/products",
  },
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE = "http://127.0.0.1:8000/api";

  const [user, setUser] = useState(null);
  const [cartLen, setCartLen] = useState(0);
  const [bump, setBump] = useState(false);

  const [q, setQ] = useState("");
  const [openDrop, setOpenDrop] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const searchBoxRef = useRef(null);

  const [sugs, setSugs] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const debounceRef = useRef(null);

  const [history, setHistory] = useState([]);
  const readHistory = () => {
    try {
      const arr = JSON.parse(localStorage.getItem("search_history") || "[]");
      setHistory(Array.isArray(arr) ? arr.slice(0, 8) : []);
    } catch { setHistory([]); }
  };
  const writeHistory = (next) => {
    try { localStorage.setItem("search_history", JSON.stringify(next)); } catch { }
    setHistory(next.slice(0, 8));
  };
  const saveHistory = (term) => {
    const t = String(term || "").trim(); if (!t) return;
    try {
      const arr = JSON.parse(localStorage.getItem("search_history") || "[]");
      const list = Array.isArray(arr) ? arr : [];
      writeHistory([t, ...list.filter((x) => x.toLowerCase() !== t.toLowerCase())]);
    } catch { writeHistory([t]); }
  };
  const removeHistoryItem = (term) => {
    const t = String(term || "").trim().toLowerCase();
    writeHistory(history.filter((x) => String(x).toLowerCase() !== t));
  };
  const clearAllHistory = () => writeHistory([]);

  const readUser = () => { try { setUser(JSON.parse(localStorage.getItem("user") || "null")); } catch { setUser(null); } };
  const readCart = () => {
    try {
      const arr = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = Array.isArray(arr) ? arr.reduce((s, i) => s + (Number(i?.qty) || 1), 0) : 0;
      setCartLen(total);
    } catch { setCartLen(0); }
  };
  useEffect(() => {
    readUser(); readCart(); readHistory();
    const onStorage = (e) => { if (!e || e.key === "user" || e.key === "token") readUser(); if (!e || e.key === "cart") readCart(); if (!e || e.key === "search_history") readHistory(); };
    const onAuthChanged = () => readUser();
    const onCartChanged = (e) => { if (e && typeof e.detail === "number") setCartLen(e.detail); else readCart(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("cart-changed", onCartChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("cart-changed", onCartChanged);
    };
  }, []);

  useEffect(() => { setBump(true); const t = setTimeout(() => setBump(false), 220); return () => clearTimeout(t); }, [cartLen]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const query = sp.get("q") || sp.get("keyword") || "";
    setQ(query);
  }, [location.search]);

  useEffect(() => {
    if (!focused) { setSugs([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const kw = String(q || "").trim();
      if (!kw) { setSugs([]); return; }
      try {
        setSugLoading(true);
        const res = await fetch(`${API_BASE}/products?keyword=${encodeURIComponent(kw)}&per_page=8`);
        const json = await res.json().catch(() => ({}));
        const items = json.data || json.items || [];
        setSugs(items);
      } catch { } finally { setSugLoading(false); }
    }, 300);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [q, focused]);

  const saveSearchResults = (term, payload) => {
    try {
      const data = Array.isArray(payload) ? payload : payload?.data ?? [];
      localStorage.setItem("last_search_results", JSON.stringify({ q: term, at: Date.now(), items: data }));
      window.dispatchEvent(new CustomEvent("search-saved", { detail: { q: term, total: data.length } }));
    } catch { }
  };
  const doBackgroundFetchAndSave = async (term) => {
    try {
      if (!term) { localStorage.removeItem("last_search_results"); return; }
      const res = await fetch(`${API_BASE}/products?keyword=${encodeURIComponent(term)}&per_page=48`);
      const json = await res.json().catch(() => ({}));
      saveSearchResults(term, json);
    } catch { }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const term = String(q || "").trim();
    if (term) { saveHistory(term); doBackgroundFetchAndSave(term); }
    const params = new URLSearchParams(); if (term) params.set("q", term);
    navigate(`${routes.search}${params.toString() ? `?${params}` : ""}`);
    setOpenDrop(false); setFocused(false); inputRef.current?.blur();
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(e.target)) { setOpenDrop(false); setFocused(false); }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("touchstart", onDoc); };
  }, []);
  useEffect(() => {
    const onScroll = () => { setOpenDrop(false); setFocused(false); };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);
  useEffect(() => { setOpenDrop(false); setFocused(false); }, [location.pathname, location.search]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await fetch("http://127.0.0.1:8000/api/logout", {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        }).catch(() => { });
      }
    } catch (err) { console.error("Logout failed:", err); }
    finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("admin_session");
      window.dispatchEvent(new Event("auth-changed"));
      navigate(routes.login);
    }
  };

  const totalCount = cartCount || cartLen;
  const displayCount = totalCount > 99 ? "99+" : totalCount;

  return (
    <div className={`topbar-auth ${fixed ? "is-fixed" : ""}`}>
      <style>{`
        .topbar-auth{
          --topbar-h:64px;
          --white:#fff;
          --accent1:#6366f1; /* tím */
          --accent2:#06b6d4; /* cyan */
          --search-max:780px;
        }
        .topbar-auth.is-fixed{ position:fixed; left:0; right:0; top:0; z-index:60; }

        /* Thanh topbar với nền gradient loang + bo 2 góc dưới */
        .tba{
          position:relative; isolation:isolate;
          color:var(--white);
          min-height:var(--topbar-h);
        }
        .tba::before{
          content:"";
          position:absolute; inset:0;
          background:
            radial-gradient(130% 160% at -10% -30%, rgba(99,102,241,.35) 0%, rgba(99,102,241,0) 48%),
            radial-gradient(130% 160% at 110% -20%, rgba(6,182,212,.35) 0%, rgba(6,182,212,0) 50%),
            linear-gradient(90deg, var(--accent1) 0%, var(--accent2) 100%);
          border-radius:0 0 22px 22px;           /* 👈 bo tròn giống ảnh */
          box-shadow:0 8px 24px rgba(2,6,23,.22);
          z-index:-1;
        }

        .tba-wrap{ width:100%; }
        .tba-row{
          display:grid;
          grid-template-columns: 1fr auto minmax(300px, var(--search-max)) auto 1fr;
          align-items:center; column-gap:16px; padding:12px 0;
        }
        .tba-logo{ grid-column:2; } .tba-logo img{ height:44px; }

        .tba-search{ grid-column:3; justify-self:center; width:100%; position:relative; z-index:70; }
        .tba-search .box{ display:flex; width:100%; position:relative; z-index:2; }
        .tba-search input{
          flex:1; padding:12px 14px; border:0; outline:none; border-radius:10px 0 0 10px; background:#fff; color:#111;
          box-shadow:0 3px 10px rgba(2,6,23,.18);
        }
        .tba-search button{
          border:0; background:rgba(2,6,23,.55); color:#fff; padding:0 18px; border-radius:0 10px 10px 0; cursor:pointer;
        }

        /* Dropdown */
        .tba-dd{
          position:absolute; top:100%; left:0; right:0; margin-top:6px; z-index:80;
          background:#fff; color:#0f172a; border-radius:12px; overflow:hidden;
          box-shadow:0 12px 28px rgba(2,6,23,.28); border:1px solid rgba(2,6,23,.08);
          max-height:420px; overflow:auto;
        }
        .tba-dd h5{ margin:0; padding:10px 12px; font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:#475569; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between; }
        .tba-dd .clear-btn{ border:0; background:#fff; color:#ef4444; font-weight:800; border-radius:8px; padding:6px 10px; cursor:pointer; }
        .tba-dd .row{ display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; }
        .tba-dd .row:hover{ background:#f1f5f9; }
        .tba-dd .row .remove{ margin-left:auto; opacity:.7; border:0; background:transparent; cursor:pointer; }
        .tba-dd .row .remove:hover{ opacity:1; }

        .sug-img{ width:36px; height:36px; border-radius:8px; object-fit:cover; background:#eef2f7; }
        .sug-name{ font-weight:800; }
        .sug-price{ margin-left:auto; font-weight:900; color:#0f766e; }

        .tba-right{ grid-column:4; justify-self:end; display:flex; align-items:center; gap:18px; font-weight:800; }
        .tba-right a{ color:#fff; text-decoration:none; }

        .tba-user{ display:flex; align-items:center; gap:10px; }
        .tba-user-link{ display:inline-flex; align-items:center; gap:10px; color:#fff; text-decoration:none; }
        .tba-avatar{ width:32px; height:32px; border-radius:999px; background:rgba(255,255,255,.18); color:#fff; display:grid; place-items:center; font-weight:900; }
        .tba-avatar .initial{ font-size:12px; line-height:1; }
        .tba-hello{ font-weight:800; }
        .tba-logout{ background:#d32f2f; color:#fff; border:0; border-radius:8px; padding:6px 10px; cursor:pointer; }

        .tba-cart{ display:inline-flex; align-items:center; gap:10px; }
        .tba-cart-ico{ width:22px; height:22px; display:grid; place-items:center; }
        .tba-icon{ width:22px; height:22px; display:block; }
        .tba-pill{
          display:inline-flex; align-items:center; justify-content:center; min-width:20px; height:20px; padding:0 6px; margin-left:8px; background:#fff; color:#06b6d4;
          border-radius:999px; font-size:12px; font-weight:900; line-height:1; border:2px solid rgba(2,6,23,.06); box-shadow:0 1px 2px rgba(2,6,23,.25);
          transform-origin:center; transition:transform .18s ease;
        }
        .tba-pill.bump{ transform:scale(1.12); }

        @media (max-width:900px){
          .tba-row{ grid-template-columns: 1fr auto auto 1fr; row-gap:10px; }
          .tba-logo{ grid-column:2; }
          .tba-right{ grid-column:3; }
          .tba-search{ grid-column:1 / -1; justify-self:center; width:calc(100% - 16px); }
        }
      `}</style>

      <div className="tba">
        <div className="tba-wrap tba-row">
          {/* Logo */}
          <div className="tba-logo">
            <Link to={routes.home}><img src={logoSrc} alt="Logo" /></Link>
          </div>

          {/* Search */}
          <div
            className="tba-search"
            ref={searchBoxRef}
            onKeyDown={(e) => { if (e.key === "Escape") { setOpenDrop(false); setFocused(false); } }}
          >
            <form className="box" onSubmit={handleSearch} autoComplete="off">
              <input
                ref={inputRef}
                type="search"
                placeholder="Tìm sản phẩm..."
                value={q}
                onChange={(e) => { setQ(e.target.value); setOpenDrop(true); }}
                onFocus={() => { setOpenDrop(true); setFocused(true); }}
              />
              <button type="submit" aria-label="Tìm"><i className="fa-solid fa-magnifying-glass" /></button>
            </form>

            {/* Dropdown: lịch sử + gợi ý */}
            {openDrop && (history.length > 0 || focused) && (
              <div className="tba-dd" role="listbox">
                {history.length > 0 && (
                  <>
                    <h5>
                      Lịch sử tìm kiếm
                      <button className="clear-btn" onMouseDown={(e) => e.preventDefault()} onClick={clearAllHistory}>Xoá lịch sử</button>
                    </h5>
                    {history.map((term) => (
                      <div
                        key={term}
                        className="row"
                        role="option"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          const t = String(term).trim();
                          if (t) { saveHistory(t); doBackgroundFetchAndSave(t); }
                          setQ(t);
                          setOpenDrop(false); setFocused(false);
                          const params = new URLSearchParams(); if (t) params.set("q", t);
                          navigate(`${routes.search}${params.toString() ? `?${params}` : ""}`);
                        }}
                      >
                        <i className="fa-regular fa-clock" />
                        <span>{term}</span>
                        <button
                          className="remove"
                          title="Xoá khỏi lịch sử"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => { e.stopPropagation(); removeHistoryItem(term); }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {/* Gợi ý sản phẩm */}
                {focused && (
                  <>
                    <h5>Gợi ý sản phẩm {sugLoading ? "…" : ""}</h5>
                    {(sugs.length === 0 && String(q).trim() && !sugLoading) ? (
                      <div className="row" style={{ cursor: "default" }}>
                        <i className="fa-regular fa-circle-xmark" />
                        <span>Không có gợi ý phù hợp</span>
                      </div>
                    ) : (
                      sugs.map((p) => {
                        const img =
                          p.thumbnail || p.image_url || p.image || p.thumb || p.cover ||
                          "https://placehold.co/60x60?text=IMG";
                        const name = p.name || p.title || p.slug || `Sản phẩm #${p.id}`;
                        const price = p.sale_price ?? p.price;
                        return (
                          <div
                            key={p.id || name}
                            className="row"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const term = name;
                              saveHistory(term);
                              doBackgroundFetchAndSave(term);
                              setQ(term);
                              setOpenDrop(false); setFocused(false);
                              const params = new URLSearchParams(); params.set("q", term);
                              navigate(`${routes.search}?${params.toString()}`);
                            }}
                          >
                            <img src={img} alt={name} className="sug-img" onError={(e) => e.currentTarget.src = "https://placehold.co/60x60?text=IMG"} />
                            <span className="sug-name">{name}</span>
                            {price != null && <span className="sug-price">{Number(price).toLocaleString("vi-VN")}₫</span>}
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right section */}
          <div className="tba-right">
            <Link to={routes.cart} className="tba-cart" title="Giỏ hàng" aria-label={`Giỏ hàng: ${totalCount} sản phẩm`}>
              <span className="tba-cart-ico" aria-hidden="true"><CartIcon className="tba-icon" /></span>
              <span className="label">Giỏ hàng</span>
              {totalCount > 0 && <span className={`tba-pill ${bump ? "bump" : ""}`}>{displayCount}</span>}
            </Link>

            <div className="tba-user">
              {user ? (
                <>
                  <Link to={routes.account || "/account"} className="tba-user-link" title="Xem tài khoản">
                    <span className="tba-avatar" aria-hidden="true">
                      {user?.name ? <span className="initial">{String(user.name).trim().charAt(0).toUpperCase()}</span> : <i className="fa-solid fa-user" />}
                    </span>
                    <span className="tba-hello">Xin chào, {user.name}</span>
                  </Link>
                  <button className="tba-logout" onClick={handleLogout}>Đăng xuất</button>
                </>
              ) : (
                <>
                  <Link to={routes.login}>Đăng nhập</Link>
                  <span>|</span>
                  <Link to={routes.register}>Đăng ký</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
      <path d="M7 4h-2a1 1 0 1 0 0 2h1.2l1.7 8.5A2 2 0 0 0 9.8 16H18a1 1 0 1 0 0-2H9.8l-.2-1H18a2 2 0 0 0 1.9-1.5l1-4A2 2 0 0 0 19 5H8.3l-.3-1a2 2 0 0 0-1-.9ZM9 20.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M12 8.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 12 8.75Z" />
    </svg>
  );
}
