import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

/**
 * TopBarAuth có tìm kiếm + lưu kết quả:
 * - Lưu lịch sử từ khóa: localStorage.search_history = ["adidas","..."]
 * - Lưu kết quả gần nhất: localStorage.last_search_results = { q, at, items }
 * - Điều hướng: mặc định sang /products?q=...
 */
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
    search: "/products",        // ✅ Mặc định tìm kiếm sẽ chuyển đến /products
  },
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // ====== CONFIG API ======
  const API_BASE = "http://127.0.0.1:8000/api";

  // ====== STATE - user / cart ======
  const [user, setUser] = useState(null);
  const [cartLen, setCartLen] = useState(0);
  const [bump, setBump] = useState(false);

  // ====== STATE - search ======
  const [q, setQ] = useState("");
  const [openDrop, setOpenDrop] = useState(false);
  const [focused, setFocused] = useState(false);           // ✅ theo dõi focus
  const inputRef = useRef(null);
  const searchBoxRef = useRef(null);                       // ✅ ref để bắt click outside

  // ---- read user/cart from localStorage ----
  const readUser = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      setUser(u);
    } catch {
      setUser(null);
    }
  };
  const readCart = () => {
    try {
      const arr = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = Array.isArray(arr)
        ? arr.reduce((s, i) => s + (Number(i?.qty) || 1), 0)
        : 0;
      setCartLen(total);
    } catch {
      setCartLen(0);
    }
  };

  useEffect(() => {
    readUser();
    readCart();

    const onStorage = (e) => {
      if (!e || e.key === "user" || e.key === "token") readUser();
      if (!e || e.key === "cart") readCart();
    };
    const onAuthChanged = () => readUser();
    const onCartChanged = (e) => {
      if (e && typeof e.detail === "number") setCartLen(e.detail);
      else readCart();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("cart-changed", onCartChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("cart-changed", onCartChanged);
    };
  }, []);

  // nhẹ nhàng nảy khi tăng số
  useEffect(() => {
    setBump(true);
    const t = setTimeout(() => setBump(false), 220);
    return () => clearTimeout(t);
  }, [cartLen]);

  // ====== Prefill ô tìm kiếm từ URL (?q= hoặc ?keyword=) ======
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const query = sp.get("q") || sp.get("keyword") || "";
    setQ(query);
  }, [location.search]);

  // ====== Lịch sử tìm kiếm ======
  const history = useMemo(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("search_history") || "[]");
      return Array.isArray(arr) ? arr.slice(0, 8) : [];
    } catch {
      return [];
    }
  }, [location.key]); // cập nhật mỗi lần điều hướng

  const saveHistory = (term) => {
    try {
      const arr = JSON.parse(localStorage.getItem("search_history") || "[]");
      const list = Array.isArray(arr) ? arr : [];
      const next = [term, ...list.filter((x) => x !== term)].slice(0, 8);
      localStorage.setItem("search_history", JSON.stringify(next));
    } catch { }
  };

  // ====== Lưu kết quả tìm kiếm gần nhất ======
  const saveSearchResults = (term, payload) => {
    try {
      const data = Array.isArray(payload) ? payload : payload?.data ?? [];
      localStorage.setItem(
        "last_search_results",
        JSON.stringify({ q: term, at: Date.now(), items: data })
      );
      window.dispatchEvent(new CustomEvent("search-saved", { detail: { q: term, total: data.length } }));
    } catch { }
  };

  // ====== Submit tìm kiếm ======
  const doBackgroundFetchAndSave = async (term) => {
    try {
      if (!term) {
        localStorage.removeItem("last_search_results");
        return;
      }
      const res = await fetch(`${API_BASE}/products?keyword=${encodeURIComponent(term)}&per_page=48`);
      const json = await res.json().catch(() => ({}));
      saveSearchResults(term, json);
    } catch { }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const term = String(q || "").trim();

    if (term) {
      saveHistory(term);
      doBackgroundFetchAndSave(term); // fetch nền
    }

    // Điều hướng sang trang sản phẩm với ?q=...
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    navigate(`${routes.search}${params.toString() ? `?${params}` : ""}`);

    // Ẩn dropdown
    setOpenDrop(false);
    setFocused(false);
    inputRef.current?.blur();
  };

  // ====== Ẩn dropdown khi click ngoài / blur / scroll / đổi route ======
  useEffect(() => {
    const onDoc = (e) => {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(e.target)) {
        setOpenDrop(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setOpenDrop(false);
      setFocused(false);
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  useEffect(() => {
    // đổi route -> đóng dropdown
    setOpenDrop(false);
    setFocused(false);
  }, [location.pathname, location.search]);

  // ====== Logout ======
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await fetch("http://127.0.0.1:8000/api/logout", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => { });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
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
        /* ====== Topbar styles ====== */
        .topbar-auth{
          --topbar-h:64px;
          --green:#075a49;
          --deep:#063c35;
          --white:#fff;
          --accent:#10b7a5;
          --page-pad: 0px;      /* 0 = sát mép */
          --search-max: 780px;  /* rộng tối đa ô tìm kiếm */
        }
        .topbar-auth.is-fixed{ position:fixed; left:0; right:0; top:0; z-index:50; }

        .tba{ background:var(--green); color:var(--white); min-height:var(--topbar-h); box-shadow:0 2px 10px rgba(0,0,0,.18); }
        .tba-wrap{ width:100%; padding:0 var(--page-pad); }

        .tba-row{
          display:grid;
          grid-template-columns: 1fr auto minmax(300px, var(--search-max)) auto 1fr;
          align-items:center;
          column-gap:16px;
          padding:12px 0;
        }

        .tba-logo{ grid-column:2; justify-self:start; }
        .tba-logo img{ height:44px; }

        .tba-search{ grid-column:3; justify-self:center; width:100%; position:relative; }
        .tba-search .box{ display:flex; width:100%; position:relative; z-index:2; }
        .tba-search input{
          flex:1; padding:12px 14px; border:0; outline:none;
          border-radius:10px 0 0 10px; background:#fff; color:#111;
        }
        .tba-search button{
          border:0; background:var(--deep); color:#fff;
          padding:0 18px; border-radius:0 10px 10px 0; cursor:pointer;
        }

        /* Dropdown gợi ý */
        .tba-dd{
          position:absolute; top:100%; left:0; right:0; margin-top:6px; z-index:3;
          background:#ffffff; color:#0f172a; border-radius:12px; overflow:hidden;
          box-shadow:0 8px 28px rgba(0,0,0,.18);
          border:1px solid rgba(0,0,0,.06);
        }
        .tba-dd h5{
          margin:0; padding:10px 12px; font-size:12px; text-transform:uppercase;
          letter-spacing:.04em; color:#475569; background:#f8fafc; border-bottom:1px solid #e2e8f0;
        }
        .tba-dd .item{
          display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer;
        }
        .tba-dd .item:hover{ background:#f1f5f9; }
        .tba-dd .item i{ color:#64748b; }

        /* RIGHT COLUMN */
        .tba-right{ grid-column:4; justify-self:end; display:flex; align-items:center; gap:18px; font-weight:800; }
        .tba-right a{ color:#fff; text-decoration:none; }

        /* USER */
        .tba-user{ display:flex; align-items:center; gap:10px; }
        .tba-user-link{ display:inline-flex; align-items:center; gap:10px; color:#fff; text-decoration:none; }
        .tba-avatar{ width:32px; height:32px; border-radius:999px; background:var(--deep); color:#fff; display:grid; place-items:center; font-weight:900; }
        .tba-avatar .initial{ font-size:12px; line-height:1; }
        .tba-hello{ font-weight:800; }

        .tba-logout{ background:#d32f2f; color:#fff; border:0; border-radius:8px; padding:6px 10px; cursor:pointer; }

        /* CART */
        .tba-cart{ display:inline-flex; align-items:center; gap:10px; }
        .tba-cart-ico{ width:22px; height:22px; display:grid; place-items:center; }
        .tba-icon{ width:22px; height:22px; display:block; }

        /* pill */
        .tba-pill{
          display:inline-flex; align-items:center; justify-content:center;
          min-width:20px; height:20px; padding:0 6px; margin-left:8px;
          background:#fff; color:var(--accent);
          border-radius:999px; font-size:12px; font-weight:900; line-height:1;
          border:2px solid rgba(0,0,0,.06);
          box-shadow:0 1px 2px rgba(0,0,0,.25);
          transform-origin:center; transition:transform .18s ease;
        }
        .tba-pill.bump{ transform:scale(1.12); }

        /* Responsive */
        @media (max-width:900px){
          .tba-row{
            grid-template-columns: 1fr auto auto 1fr;
            row-gap:10px;
          }
          .tba-logo{ grid-column:2; }
          .tba-right{ grid-column:3; }
          .tba-search{ grid-column:1 / -1; justify-self:center; width:calc(100% - 16px); }
        }
      `}</style>

      <div className="tba">
        <div className="tba-wrap tba-row">
          {/* Logo (trái) */}
          <div className="tba-logo">
            <Link to={routes.home}>
              <img src={logoSrc} alt="Logo" />
            </Link>
          </div>

          {/* Search (giữa) */}
          <div className="tba-search" onKeyDown={(e) => { if (e.key === "Escape") setOpenDrop(false); }}>
            <form className="box" onSubmit={handleSearch} autoComplete="off">
              <input
                ref={inputRef}
                type="search"
                placeholder="Tìm sản phẩm..."
                value={q}
                onChange={(e) => { setQ(e.target.value); setOpenDrop(true); }}
                onFocus={() => setOpenDrop(true)}
              />
              <button type="submit" aria-label="Tìm">
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </form>

            {/* Dropdown lịch sử */}
            {openDrop && history.length > 0 && (
              <div className="tba-dd" role="listbox">
                <h5>Lịch sử tìm kiếm</h5>
                {history.map((term) => (
                  <div
                    key={term}
                    className="item"
                    role="option"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      // click lịch sử -> lưu + fetch nền + điều hướng /products?q=term
                      const t = String(term).trim();
                      if (t) {
                        saveHistory(t);
                        doBackgroundFetchAndSave(t);
                      }
                      setQ(t);
                      setOpenDrop(false);
                      const params = new URLSearchParams();
                      if (t) params.set("q", t);
                      navigate(`${routes.search}${params.toString() ? `?${params}` : ""}`);
                    }}
                  >
                    <i className="fa-regular fa-clock" />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: CART trước, USER/AUTH sau */}
          <div className="tba-right">
            {/* CART */}
            <Link
              to={routes.cart}
              className="tba-cart"
              title="Giỏ hàng"
              aria-label={`Giỏ hàng: ${totalCount} sản phẩm`}
            >
              <span className="tba-cart-ico" aria-hidden="true">
                <CartIcon className="tba-icon" />
              </span>
              <span className="label">Giỏ hàng</span>
              {totalCount > 0 && (
                <span className={`tba-pill ${bump ? "bump" : ""}`}>
                  {displayCount}
                </span>
              )}
            </Link>

            {/* USER / AUTH */}
            <div className="tba-user">
              {user ? (
                <>
                  {/* 👉 Bấm vào avatar/“Xin chào …” để tới /account */}
                  <Link
                    to={routes.account || "/account"}
                    className="tba-user-link"
                    title="Xem tài khoản"
                  >
                    <span className="tba-avatar" aria-hidden="true">
                      {user?.name ? (
                        <span className="initial">
                          {String(user.name).trim().charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <i className="fa-solid fa-user" />
                      )}
                    </span>
                    <span className="tba-hello">Xin chào, {user.name}</span>
                  </Link>

                  <button className="tba-logout" onClick={handleLogout}>
                    Đăng xuất
                  </button>
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

/* SVG icon (khỏi phụ thuộc CDN) */
function CartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
      <path d="M7 4h-2a1 1 0 1 0 0 2h1.2l1.7 8.5A2 2 0 0 0 9.8 16H18a1 1 0 1 0 0-2H9.8l-.2-1H18a2 2 0 0 0 1.9-1.5l1-4A2 2 0 0 0 19 5H8.3l-.3-1a2 2 0 0 0-1-.9ZM9 20.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M12 8.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 12 8.75Z" />
    </svg>
  );
}
