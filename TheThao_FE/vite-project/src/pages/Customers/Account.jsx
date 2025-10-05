import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/* ===== Config ===== */
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://127.0.0.1:8000";
const ENV_ORDER = (import.meta?.env?.VITE_ORDER_ENDPOINT || "").trim();
const PROFILE_ENDPOINT = (import.meta?.env?.VITE_PROFILE_ENDPOINT || "").trim();

const api = (path) =>
    path.startsWith("http")
        ? path
        : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

function normalizeToken(raw) {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return parsed?.access_token || parsed?.token || raw;
    } catch {
        return raw;
    }
}

function extractList(json) {
    if (!json) return null;
    if (Array.isArray(json)) return json;
    const keys = ["data", "orders", "items", "result", "results", "rows", "list", "payload"];
    for (const k of keys) {
        const v = json?.[k];
        if (Array.isArray(v)) return v;
        if (Array.isArray(v?.data)) return v.data;
    }
    let found = null;
    const walk = (obj, depth = 0) => {
        if (found || depth > 3 || !obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) { found = obj; return; }
        for (const [, v] of Object.entries(obj)) { if (!found) walk(v, depth + 1); }
    };
    walk(json, 0);
    return found;
}

export default function Account() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const token = useMemo(() => {
        const t1 = localStorage.getItem("token");
        const t2 = localStorage.getItem("access_token");
        return normalizeToken(t1 || t2);
    }, []);

    const headers = useMemo(
        () => ({
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }),
        [token]
    );

    useEffect(() => {
        let u = null;
        try { u = JSON.parse(localStorage.getItem("user") || "null"); } catch { }
        if (!token || !u) {
            navigate("/login", { replace: true, state: { denied: "Vui lòng đăng nhập để xem Tài khoản." } });
            return;
        }
        setUser(u);

        const run = async () => {
            setLoading(true);
            setErr("");

            // PROFILE
            let prof = u;
            if (PROFILE_ENDPOINT) {
                try {
                    const res = await fetch(api(PROFILE_ENDPOINT), { headers });
                    if (res.ok) {
                        const data = await res.json();
                        prof = data?.data || data || u;
                    }
                } catch { }
            }
            setProfile(prof);

            // ORDERS
            const userId = u?.id || u?.user?.id;
            const envEndpoints = ENV_ORDER
                ? ENV_ORDER.split(",").map((s) =>
                    (s || "").trim().replace(":id", userId || "").replace("{id}", userId || "")
                )
                : [];

            const defaultEndpoints = [
                "/api/orders/mine",
                "/api/my-orders",
                "/api/user/orders",
                userId ? `/api/users/${userId}/orders` : null,
                userId ? `/api/orders?user_id=${userId}` : null,
                userId ? `/api/order/list-by-user/${userId}` : null,
                userId ? `/api/orders/user/${userId}` : null,
                userId ? `/api/order/user/${userId}` : null,
                "/api/don-hang-cua-toi",
                "/api/don-hang",
                "/api/orders",
                "/api/order",
            ].filter(Boolean);

            const endpoints = [...envEndpoints, ...defaultEndpoints];

            let list = null;
            for (const ep of endpoints) {
                try {
                    const res = await fetch(api(ep), { headers });
                    if (!res.ok) continue;
                    const json = await res.json();
                    const arr = extractList(json);
                    if (arr) {
                        list = arr;
                        if (userId) {
                            list = arr.filter(
                                (o) =>
                                    o?.user_id === userId ||
                                    o?.customer_id === userId ||
                                    o?.user?.id === userId ||
                                    o?.customer?.id === userId
                            );
                        }
                        break;
                    }
                } catch { }
            }

            setOrders(Array.isArray(list) ? list : []);
            setLoading(false);
        };

        run().catch(() => setLoading(false));
    }, [navigate, headers, token]);

    const fmt = {
        money(n) {
            const num = Number(n || 0);
            try { return num.toLocaleString("vi-VN") + "₫"; } catch { return `${num}₫`; }
        },
        date(s) {
            if (!s) return "";
            try { return new Date(s).toLocaleString("vi-VN"); } catch { return s; }
        },
    };

    const normalizeOrder = (o) => ({
        id: o?.id ?? o?.order_id ?? o?.code ?? o?.order_code ?? "-",
        code: o?.code ?? o?.order_code ?? o?.id ?? "-",
        created_at: o?.created_at ?? o?.createdAt ?? o?.date ?? "",
        status: o?.status_text ?? o?.status ?? (o?.is_completed ? "Hoàn tất" : "Đang xử lý"),
        payment_status: o?.payment_status ?? (o?.is_paid ? "Đã thanh toán" : "Chưa thanh toán"),
        payment_method: o?.payment_method ?? o?.method ?? o?.payment ?? "",
        total: o?.total ?? o?.grand_total ?? o?.amount ?? o?.total_price ?? o?.sum ?? 0,
        user_id: o?.user_id ?? o?.customer_id ?? o?.user?.id ?? o?.customer?.id,
    });

    const normalized = orders.map(normalizeOrder);
    const orderCount = normalized.length;
    const orderSum = normalized.reduce((s, x) => s + Number(x.total || 0), 0);

    const avatarUrl =
        profile?.avatar || profile?.avatar_url || profile?.photo || profile?.photo_url ||
        user?.avatar || user?.avatar_url || "";
    const initial = String(profile?.name || user?.name || "?").trim().charAt(0).toUpperCase();

    const statusText = (st) => {
        if (typeof st === "number" || /^\d+$/.test(String(st))) {
            const n = Number(st);
            if (n === 0) return "Chờ xử lý";
            if (n === 1) return "Đang giao";
            if (n === 2) return "Hoàn tất";
            if (n === -1) return "Đã hủy";
        }
        return String(st || "Đang xử lý");
    };

    // Header columns render bằng array để tránh whitespace text node
    const columns = ["Mã đơn", "Ngày đặt", "Trạng thái", "Thanh toán", "Tổng tiền", ""];

    return (
        <div className="account-page">
            <style>{`
        .account-page { padding: 96px 0 32px; }
        .container { width: min(1180px, 92vw); margin: 0 auto; }

        .grid { display: grid; grid-template-columns: 400px 1fr; gap: 24px; }
        @media (max-width: 1024px){ .grid { grid-template-columns: 1fr; } }

        .card { background:#fff; border-radius:16px; box-shadow:0 12px 36px rgba(0,0,0,.08); overflow:hidden; }

        .profile-head {
          background: linear-gradient(135deg, #0db5a6, #075a49);
          height: 120px; position: relative;
        }
        .avatar-xl {
          width: 110px; height: 110px; border-radius: 999px; overflow: hidden;
          background: #0db5a6; color:#fff; font-weight:900; font-size:40px;
          display:grid; place-items:center; border:5px solid #fff;
          position:absolute; left: 24px; bottom: -55px; box-shadow:0 10px 24px rgba(0,0,0,.25);
        }
        .avatar-xl img { width:100%; height:100%; object-fit:cover; }

        .profile-body { padding: 70px 20px 18px 20px; }
        .name { font-size:22px; font-weight:900; margin: 0 0 4px 0; }
        .email { color:#444; font-weight:700; overflow-wrap:anywhere; word-break:break-word; margin-bottom: 14px; }
        .divider { height:1px; background:#eef1f4; margin: 8px 0 14px; }

        .info-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; }
        @media (max-width: 480px){ .info-grid { grid-template-columns: 1fr; } }
        .info-item { display:flex; align-items:flex-start; gap:10px; }
        .icon { width:28px; height:28px; border-radius:8px; background:#f2fbfa; display:grid; place-items:center; color:#0aa; font-weight:900; flex: 0 0 28px; }
        .kv { line-height:1.25; }
        .kv .label { font-size:12px; color:#6b7280; font-weight:800; }
        .kv .value { font-weight:800; color:#222; overflow-wrap:anywhere; word-break:break-word; }

        .orders-head { padding: 14px 16px; display:flex; align-items:center; justify-content:space-between; }
        .title { font-size:22px; font-weight:900; }
        .stats { display:flex; gap:10px; flex-wrap:wrap; }
        .chip { background:#f4f6f8; border-radius:999px; padding:6px 10px; font-weight:900; font-size:12px; }

        table { width:100%; border-collapse:collapse; }
        thead th { background:#f6f7f9; font-weight:900; padding:12px 10px; text-align:left; }
        tbody td { padding:12px 10px; }
        tbody tr:nth-child(odd) { background:#fbfbfc; }
        .badge { font-weight:900; font-size:12px; padding:6px 10px; border-radius:999px; background:#eef6f6; color:#0c7; display:inline-block; }
        .badge.gray { background:#f1f1f1; color:#555; }

        .btn-link{
          display:inline-block; padding:6px 10px; border-radius:10px;
          background:#f4f6f8; font-weight:900; text-decoration:none; color:#111;
        }
        .btn-link:hover{ filter:brightness(.95); }
      `}</style>

            <div className="container">
                <div className="grid">
                    {/* LEFT: PROFILE */}
                    <section className="card">
                        <div className="profile-head">
                            <div className="avatar-xl" aria-hidden="true">
                                {avatarUrl ? <img src={avatarUrl} alt="Avatar" /> : <span>{initial}</span>}
                            </div>
                        </div>
                        <div className="profile-body">
                            <div className="name">{profile?.name ?? user?.name ?? "-"}</div>
                            <div className="email">{profile?.email ?? user?.email ?? "-"}</div>
                            <div className="divider" />
                            <div className="info-grid">
                                <div className="info-item">
                                    <div className="icon">ID</div>
                                    <div className="kv">
                                        <div className="label">Mã người dùng</div>
                                        <div className="value">{profile?.id ?? user?.id ?? "-"}</div>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="icon">☎</div>
                                    <div className="kv">
                                        <div className="label">Số điện thoại</div>
                                        <div className="value">{profile?.phone ?? profile?.phone_number ?? "-"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: ORDERS */}
                    <section className="card">
                        <div className="orders-head">
                            <div className="title">Đơn hàng của tôi</div>
                            <div className="stats">
                                <div className="chip">Số đơn: {orderCount}</div>
                                <div className="chip">Tổng chi: {fmt.money(orderSum)}</div>
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ padding: "0 16px 16px 16px" }}>Đang tải dữ liệu…</div>
                        ) : err ? (
                            <div style={{ padding: "0 16px 16px 16px" }}>{err}</div>
                        ) : orderCount === 0 ? (
                            <div style={{ padding: "0 16px 16px 16px" }}>Bạn chưa có đơn hàng nào.</div>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead><tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
                                    <tbody>{
                                        normalized.map((n, idx) => {
                                            const code = encodeURIComponent(String(n.code ?? n.id));
                                            const cells = [
                                                <td key="code">{n.code}</td>,
                                                <td key="date">{fmt.date(n.created_at)}</td>,
                                                <td key="status"><span className="badge gray">{statusText(n.status)}</span></td>,
                                                <td key="payment"><span className="badge">{n.payment_status || n.payment_method || "Chưa rõ"}</span></td>,
                                                <td key="total">{fmt.money(n.total)}</td>,
                                                <td key="link"><Link to={`/track?code=${code}`} className="btn-link">Chi tiết</Link></td>,
                                            ];
                                            return <tr key={n.id ?? idx}>{cells}</tr>;
                                        })
                                    }</tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
