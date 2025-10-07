// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";

// /* ===== Config ===== */
// const API_BASE = import.meta?.env?.VITE_API_BASE || "http://127.0.0.1:8000";
// const ENV_ORDER = (import.meta?.env?.VITE_ORDER_ENDPOINT || "").trim();
// const PROFILE_ENDPOINT = (import.meta?.env?.VITE_PROFILE_ENDPOINT || "").trim();

// const api = (path) =>
//     path.startsWith("http")
//         ? path
//         : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

// function normalizeToken(raw) {
//     if (!raw) return null;
//     try {
//         const parsed = JSON.parse(raw);
//         return parsed?.access_token || parsed?.token || raw;
//     } catch {
//         return raw;
//     }
// }

// function extractList(json) {
//     if (!json) return null;
//     if (Array.isArray(json)) return json;
//     const keys = ["data", "orders", "items", "result", "results", "rows", "list", "payload"];
//     for (const k of keys) {
//         const v = json?.[k];
//         if (Array.isArray(v)) return v;
//         if (Array.isArray(v?.data)) return v.data;
//     }
//     let found = null;
//     const walk = (obj, depth = 0) => {
//         if (found || depth > 3 || !obj || typeof obj !== "object") return;
//         if (Array.isArray(obj)) { found = obj; return; }
//         for (const [, v] of Object.entries(obj)) { if (!found) walk(v, depth + 1); }
//     };
//     walk(json, 0);
//     return found;
// }

// export default function Account() {
//     const navigate = useNavigate();

//     const [user, setUser] = useState(null);
//     const [profile, setProfile] = useState(null);
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [err, setErr] = useState("");

//     const token = useMemo(() => {
//         const t1 = localStorage.getItem("token");
//         const t2 = localStorage.getItem("access_token");
//         return normalizeToken(t1 || t2);
//     }, []);

//     const headers = useMemo(
//         () => ({
//             Accept: "application/json",
//             "Content-Type": "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         }),
//         [token]
//     );

//     useEffect(() => {
//         let u = null;
//         try { u = JSON.parse(localStorage.getItem("user") || "null"); } catch { }
//         if (!token || !u) {
//             navigate("/login", { replace: true, state: { denied: "Vui lòng đăng nhập để xem Tài khoản." } });
//             return;
//         }
//         setUser(u);

//         const run = async () => {
//             setLoading(true);
//             setErr("");

//             // PROFILE
//             let prof = u;
//             if (PROFILE_ENDPOINT) {
//                 try {
//                     const res = await fetch(api(PROFILE_ENDPOINT), { headers });
//                     if (res.ok) {
//                         const data = await res.json();
//                         prof = data?.data || data || u;
//                     }
//                 } catch { }
//             }
//             setProfile(prof);

//             // ORDERS
//             const userId = u?.id || u?.user?.id;
//             const envEndpoints = ENV_ORDER
//                 ? ENV_ORDER.split(",").map((s) =>
//                     (s || "").trim().replace(":id", userId || "").replace("{id}", userId || "")
//                 )
//                 : [];

//             const defaultEndpoints = [
//                 "/api/orders/mine",
//                 "/api/my-orders",
//                 "/api/user/orders",
//                 userId ? `/api/users/${userId}/orders` : null,
//                 userId ? `/api/orders?user_id=${userId}` : null,
//                 userId ? `/api/order/list-by-user/${userId}` : null,
//                 userId ? `/api/orders/user/${userId}` : null,
//                 userId ? `/api/order/user/${userId}` : null,
//                 "/api/don-hang-cua-toi",
//                 "/api/don-hang",
//                 "/api/orders",
//                 "/api/order",
//             ].filter(Boolean);

//             const endpoints = [...envEndpoints, ...defaultEndpoints];

//             let list = null;
//             for (const ep of endpoints) {
//                 try {
//                     const res = await fetch(api(ep), { headers });
//                     if (!res.ok) continue;
//                     const json = await res.json();
//                     const arr = extractList(json);
//                     if (arr) {
//                         list = arr;
//                         if (userId) {
//                             list = arr.filter(
//                                 (o) =>
//                                     o?.user_id === userId ||
//                                     o?.customer_id === userId ||
//                                     o?.user?.id === userId ||
//                                     o?.customer?.id === userId
//                             );
//                         }
//                         break;
//                     }
//                 } catch { }
//             }

//             setOrders(Array.isArray(list) ? list : []);
//             setLoading(false);
//         };

//         run().catch(() => setLoading(false));
//     }, [navigate, headers, token]);

//     const fmt = {
//         money(n) {
//             const num = Number(n || 0);
//             try { return num.toLocaleString("vi-VN") + "₫"; } catch { return `${num}₫`; }
//         },
//         date(s) {
//             if (!s) return "";
//             try { return new Date(s).toLocaleString("vi-VN"); } catch { return s; }
//         },
//     };

//     const normalizeOrder = (o) => ({
//         id: o?.id ?? o?.order_id ?? o?.code ?? o?.order_code ?? "-",
//         code: o?.code ?? o?.order_code ?? o?.id ?? "-",
//         created_at: o?.created_at ?? o?.createdAt ?? o?.date ?? "",
//         status: o?.status_text ?? o?.status ?? (o?.is_completed ? "Hoàn tất" : "Đang xử lý"),
//         payment_status: o?.payment_status ?? (o?.is_paid ? "Đã thanh toán" : "Chưa thanh toán"),
//         payment_method: o?.payment_method ?? o?.method ?? o?.payment ?? "",
//         total: o?.total ?? o?.grand_total ?? o?.amount ?? o?.total_price ?? o?.sum ?? 0,
//         user_id: o?.user_id ?? o?.customer_id ?? o?.user?.id ?? o?.customer?.id,
//     });

//     const normalized = orders.map(normalizeOrder);
//     const orderCount = normalized.length;
//     const orderSum = normalized.reduce((s, x) => s + Number(x.total || 0), 0);

//     const avatarUrl =
//         profile?.avatar || profile?.avatar_url || profile?.photo || profile?.photo_url ||
//         user?.avatar || user?.avatar_url || "";
//     const initial = String(profile?.name || user?.name || "?").trim().charAt(0).toUpperCase();

//     const statusText = (st) => {
//         if (typeof st === "number" || /^\d+$/.test(String(st))) {
//             const n = Number(st);
//             if (n === 0) return "Chờ xử lý";
//             if (n === 1) return "Đang giao";
//             if (n === 2) return "Hoàn tất";
//             if (n === -1) return "Đã hủy";
//         }
//         return String(st || "Đang xử lý");
//     };

//     // Header columns render bằng array để tránh whitespace text node
//     const columns = ["Mã đơn", "Ngày đặt", "Trạng thái", "Thanh toán", "Tổng tiền", ""];

//     return (
//         <div className="account-page">
//             <style>{`
//         /* ===== Theme variables to match Products/Contact ===== */
//         .account-page{
//           --bg:#f8fafc;
//           --ink:#0b1220;
//           --muted:#334155;
//           --line:rgba(2,6,23,.08);
//           --card:#ffffff;
//           --accent1:#6366f1; /* indigo */
//           --accent2:#06b6d4; /* cyan */
//           --shadow:0 6px 18px rgba(2,6,23,.06);
//           --shadow-lg:0 12px 36px rgba(2,6,23,.10);
//           padding: 110px 0 32px;
//           background: var(--bg);
//           color: var(--ink);
//           font-family: "Montserrat", Arial, sans-serif;
//         }
//         .container { width: min(1180px, 92vw); margin: 0 auto; }

//         .grid { display: grid; grid-template-columns: 400px 1fr; gap: 24px; }
//         @media (max-width: 1024px){ .grid { grid-template-columns: 1fr; } }

//         .card { background:var(--card); border:1px solid var(--line); border-radius:16px; box-shadow:var(--shadow); overflow:hidden; }

//         /* ===== Profile ===== */
//         .profile-head {
//           background: linear-gradient(120deg, var(--accent1), var(--accent2));
//           height: 120px; position: relative;
//         }
//         .avatar-xl {
//           width: 110px; height: 110px; border-radius: 999px; overflow: hidden;
//           background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), rgba(255,255,255,.7));
//           color:#0b1220; font-weight:900; font-size:40px;
//           display:grid; place-items:center; border:5px solid #fff;
//           position:absolute; left: 24px; bottom: -55px; box-shadow:0 10px 24px rgba(2,6,23,.25);
//         }
//         .avatar-xl img { width:100%; height:100%; object-fit:cover; }

//         .profile-body { padding: 70px 20px 18px 20px; }
//         .name { font-size:22px; font-weight:900; margin: 0 0 4px 0; }
//         .email { color:var(--muted); font-weight:700; overflow-wrap:anywhere; word-break:break-word; margin-bottom: 14px; }
//         .divider { height:1px; background:rgba(2,6,23,.06); margin: 8px 0 14px; }

//         .info-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; }
//         @media (max-width: 480px){ .info-grid { grid-template-columns: 1fr; } }
//         .info-item { display:flex; align-items:flex-start; gap:10px; }
//         .icon { width:28px; height:28px; border-radius:8px; background:rgba(99,102,241,.12); display:grid; place-items:center; color:#4f46e5; font-weight:900; flex: 0 0 28px; }
//         .kv { line-height:1.25; }
//         .kv .label { font-size:12px; color:#6b7280; font-weight:800; }
//         .kv .value { font-weight:800; color:#0b1220; overflow-wrap:anywhere; word-break:break-word; }

//         /* ===== Orders ===== */
//         .orders-head { padding: 14px 16px; display:flex; align-items:center; justify-content:space-between; }
//         .title {
//           font-size: clamp(20px, 2.5vw, 22px);
//           font-weight: 1000;
//           letter-spacing:.4px;
//           position: relative;
//           color:#0f172a;
//           background: linear-gradient(180deg,#0b1220 0%,#121a2e 70%,#1f2937 100%);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           text-shadow: 0 1px 0 #000, 0 2px 6px rgba(13,24,54,.18);
//         }
//         .title::after{
//           content:"";
//           position:absolute; left:0; bottom:-6px; width:100%; height:4px; border-radius:6px;
//           background: linear-gradient(90deg, var(--accent1), var(--accent2) 75%, rgba(99,102,241,0));
//           box-shadow: 0 1px 8px rgba(99,102,241,.35);
//         }

//         .stats { display:flex; gap:10px; flex-wrap:wrap; }
//         .chip {
//           background: linear-gradient(180deg, rgba(99,102,241,.10), rgba(6,182,212,.10));
//           border:1px solid rgba(2,6,23,.06);
//           border-radius:999px; padding:6px 10px; font-weight:900; font-size:12px; color:#0b1220;
//         }

//         .table-wrap{
//           margin: 6px 16px 16px 16px;
//           border:1px solid var(--line);
//           border-radius:14px;
//           overflow:hidden;
//           background:var(--card);
//           box-shadow:var(--shadow);
//         }
//         table { width:100%; border-collapse:collapse; }
//         thead th {
//           background: linear-gradient(180deg, rgba(99,102,241,.06), rgba(99,102,241,.0));
//           font-weight:900; padding:12px 10px; text-align:left; color:#0b1220;
//           border-bottom:1px solid var(--line);
//         }
//         tbody td { padding:12px 10px; }
//         tbody tr { border-bottom:1px solid var(--line); }
//         tbody tr:nth-child(odd) { background:#fcfdff; }

//         .badge {
//           font-weight:900; font-size:12px; padding:6px 10px; border-radius:999px;
//           background: rgba(99,102,241,.12); color:#3730a3; display:inline-block;
//         }
//         .badge.gray { background:#eef2ff; color:#4338ca; }

//         .btn-link{
//           display:inline-block; padding:6px 10px; border-radius:10px;
//           border:1px solid rgba(99,102,241,.35);
//           background:#fff; font-weight:900; text-decoration:none; color:#3730a3;
//           transition: box-shadow .15s ease, transform .15s ease, background .15s ease;
//         }
//         .btn-link:hover{
//           background: rgba(99,102,241,.08);
//           box-shadow: 0 6px 16px rgba(2,6,23,.12);
//           transform: translateY(-1px);
//         }
//       `}</style>

//             <div className="container">
//                 <div className="grid">
//                     {/* LEFT: PROFILE */}
//                     <section className="card">
//                         <div className="profile-head">
//                             <div className="avatar-xl" aria-hidden="true">
//                                 {avatarUrl ? <img src={avatarUrl} alt="Avatar" /> : <span>{initial}</span>}
//                             </div>
//                         </div>
//                         <div className="profile-body">
//                             <div className="name">{profile?.name ?? user?.name ?? "-"}</div>
//                             <div className="email">{profile?.email ?? user?.email ?? "-"}</div>
//                             <div className="divider" />
//                             <div className="info-grid">
//                                 <div className="info-item">
//                                     <div className="icon">ID</div>
//                                     <div className="kv">
//                                         <div className="label">Mã người dùng</div>
//                                         <div className="value">{profile?.id ?? user?.id ?? "-"}</div>
//                                     </div>
//                                 </div>
//                                 <div className="info-item">
//                                     <div className="icon">☎</div>
//                                     <div className="kv">
//                                         <div className="label">Số điện thoại</div>
//                                         <div className="value">{profile?.phone ?? profile?.phone_number ?? "-"}</div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </section>

//                     {/* RIGHT: ORDERS */}
//                     <section className="card">
//                         <div className="orders-head">
//                             <div className="title">Đơn hàng của tôi</div>
//                             <div className="stats">
//                                 <div className="chip">Số đơn: {orderCount}</div>
//                                 <div className="chip">Tổng chi: {fmt.money(orderSum)}</div>
//                             </div>
//                         </div>

//                         {loading ? (
//                             <div style={{ padding: "0 16px 16px 16px" }}>Đang tải dữ liệu…</div>
//                         ) : err ? (
//                             <div style={{ padding: "0 16px 16px 16px" }}>{err}</div>
//                         ) : orderCount === 0 ? (
//                             <div style={{ padding: "0 16px 16px 16px" }}>Bạn chưa có đơn hàng nào.</div>
//                         ) : (
//                             <div className="table-wrap">
//                                 <table>
//                                     <thead>
//                                         <tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
//                                     </thead>
//                                     <tbody>{
//                                         normalized.map((n, idx) => {
//                                             const code = encodeURIComponent(String(n.code ?? n.id));
//                                             const cells = [
//                                                 <td key="code">{n.code}</td>,
//                                                 <td key="date">{fmt.date(n.created_at)}</td>,
//                                                 <td key="status"><span className="badge gray">{statusText(n.status)}</span></td>,
//                                                 <td key="payment"><span className="badge">{n.payment_status || n.payment_method || "Chưa rõ"}</span></td>,
//                                                 <td key="total">{fmt.money(n.total)}</td>,
//                                                 <td key="link"><Link to={`/track?code=${code}`} className="btn-link">Chi tiết</Link></td>,
//                                             ];
//                                             return <tr key={n.id ?? idx}>{cells}</tr>;
//                                         })
//                                     }</tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </section>
//                 </div>
//             </div>
//         </div>
//     );
// }




import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const LOGOUT_URL = `${API_BASE}/api/logout`;

export default function AccountOverview() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [compareCount, setCompareCount] = useState(0); // ✅ thêm state đếm sp so sánh

  // ✅ Ưu tiên user thường, nếu không có mới đọc admin
  useEffect(() => {
    try {
      const normalUser = JSON.parse(localStorage.getItem("user") || "null");
      const adminUser = JSON.parse(localStorage.getItem("admin_user") || "null");
      const u = normalUser ?? adminUser;
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  // ✅ Cập nhật số lượng sản phẩm so sánh
  useEffect(() => {
    const loadCompare = () => {
      try {
        const list = JSON.parse(localStorage.getItem("compare_list") || "[]");
        setCompareCount(list.length);
      } catch {
        setCompareCount(0);
      }
    };
    loadCompare();
    const onStorage = (e) => {
      if (e.key === "compare_list") loadCompare();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ✅ Đăng xuất
  const handleLogout = async () => {
    const adminToken = localStorage.getItem("admin_token");
    const customerToken = localStorage.getItem("token");
    const bearer = adminToken || customerToken;

    try {
      if (bearer) {
        await fetch(LOGOUT_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearer}`,
          },
        }).catch(() => {});
      }
    } catch {}

    // Xóa phiên
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_session");

    window.dispatchEvent(new Event("auth-changed"));
    navigate("/", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <BackgroundAnimals />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(186,230,253,0.6))",
          zIndex: 1,
        }}
      />
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          margin: "32px auto",
          padding: 24,
          borderRadius: 20,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(148,163,184,.25)",
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Header user info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 14,
              fontSize: 13,
              background: "#fef3c7",
              color: "#92400e",
              fontWeight: 600,
            }}
          >
            Xin chào{user?.name ? `, ${user.name}` : ""} 👋
          </div>
          <div
            style={{
              padding: "4px 10px",
              borderRadius: 14,
              fontSize: 13,
              background: "#d1fae5",
              color: "#065f46",
              fontWeight: 600,
            }}
          >
            {user?.email || "—"}
          </div>

          <div style={{ flex: 1 }} />
          <button
            onClick={handleLogout}
            style={{
              border: 0,
              padding: "8px 12px",
              borderRadius: 12,
              background: "#dc2626",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 6px 14px rgba(220,38,38,.35)",
            }}
          >
            Đăng xuất
          </button>
        </div>

        {/* Main */}
        <h1
          style={{
            margin: "20px 0 6px",
            fontSize: 28,
            fontWeight: 900,
            color: "#0f172a",
          }}
        >
          Tổng quan tài khoản
        </h1>
        <p style={{ margin: 0, color: "#334155" }}>
          Thông tin hồ sơ và trạng thái đăng nhập.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginTop: 20,
          }}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <StatusBadge />
            <Row label="Tên hiển thị" value={user?.name ?? "—"} />
            <Row label="E-mail" value={user?.email ?? "—"} />
            <Row label="ID người dùng" value={user?.id ?? user?._id ?? "—"} />
          </div>
          <div style={{ display: "grid", gap: 14 }}>
            <InsightCard
              title="Đơn hàng của tôi"
              value="—"
              hint={<Link to="/my-orders">Xem chi tiết</Link>}
              color="sky"
            />
            <InsightCard
              title="Đơn đã hủy"
              value="—"
              hint={<Link to="/canceled-orders">Xem chi tiết</Link>}
              color="rose"
            />
            {/* ✅ thêm thẻ so sánh */}
            <InsightCard
              title="So sánh sản phẩm"
              value={`${compareCount} sản phẩm`}
              hint={<Link to="/compare">Xem chi tiết</Link>}
              color="emerald"
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "#475569",
          }}
        >
          <span>© {new Date().getFullYear()}</span>
          <Link to="/" style={{ color: "#0ea5e9" }}>
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ==== Background con vật pastel ==== */
function BackgroundAnimals() {
  const animals = ["🐱", "🐰", "🐻", "🐼", "🐧", "🦊", "🐥"];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {animals.map((a, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${10 + i * 12}%`,
            left: `${(i * 20) % 90}%`,
            fontSize: 40,
            opacity: 0.7,
            animation: `floatY ${6 + i}s ease-in-out infinite alternate`,
          }}
        >
          {a}
        </span>
      ))}

      <style>
        {`
          @keyframes floatY {
            from { transform: translateY(0px); }
            to { transform: translateY(40px); }
          }
        `}
      </style>
    </div>
  );
}

/* ==== Components ==== */
function Row({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 14,
        background: "#f1f5f9",
        border: "1px solid #e2e8f0",
      }}
    >
      <span style={{ fontSize: 13, color: "#475569" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
        {String(value)}
      </span>
    </div>
  );
}

function StatusBadge() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 14,
        background: "#ecfdf5",
        border: "1px solid #a7f3d0",
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#10b981",
        }}
      />
      <div style={{ fontSize: 13 }}>
        <div style={{ fontWeight: 800, color: "#065f46" }}>Đang đăng nhập</div>
        <div style={{ color: "#047857" }}>Phiên đang hoạt động</div>
      </div>
    </div>
  );
}

function InsightCard({ title, value, hint, color }) {
  const tones = {
    sky: { bg: "#e0f2fe", title: "#0369a1", value: "#0ea5e9", hint: "#0284c7" },
    rose: { bg: "#ffe4e6", title: "#9f1239", value: "#e11d48", hint: "#be123c" },
    emerald: {
      bg: "#d1fae5",
      title: "#065f46",
      value: "#10b981",
      hint: "#047857",
    },
  };
  const tone = tones[color] || tones.sky;

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: tone.bg,
        border: `1px solid ${tone.value}`,
        boxShadow: "0 6px 18px rgba(0,0,0,.15)",
      }}
    >
      <div style={{ fontSize: 13, color: tone.title }}>{title}</div>
      <div
        style={{ marginTop: 6, fontSize: 24, fontWeight: 900, color: tone.value }}
      >
        {value}
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: tone.hint }}>{hint}</div>
    </div>
  );
}
