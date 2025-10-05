// src/pages/Customers/OrderTracking.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api"; // Laravel API
const PLACEHOLDER = "https://placehold.co/80x60?text=No+Img";

const STATUS_STEPS = [
    { key: "pending", label: "Chờ xác nhận" },
    { key: "paid", label: "Đã thanh toán" },
    { key: "processing", label: "Đang chuẩn bị" },
    { key: "shipping", label: "Đang giao" },
    { key: "delivered", label: "Đã giao" },
];

const ACTIVE_POLL = new Set(["processing", "shipping"]); // auto refresh

export default function OrderTracking() {
    const navigate = useNavigate();

    const [code, setCode] = useState(() =>
        new URLSearchParams(location.search).get("code") ||
        localStorage.getItem("last_order_code") ||
        ""
    );
    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const pollRef = useRef(null);

    const fmt = (v) => (v == null ? 0 : Number(v)).toLocaleString("vi-VN");

    // === Back ===
    const goBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/account");
    };

    // ======== Derived: bước hiện tại ========
    const currentStep = useMemo(() => {
        if (!order?.status) return 0;
        const idx = STATUS_STEPS.findIndex((s) => s.key === order.status);
        return Math.max(0, idx);
    }, [order?.status]);

    // ======== Derived: tên khách hàng (đa nguồn) ========
    const customerName = useMemo(() => {
        if (!order) return "—";
        const localUser = (() => {
            try {
                return JSON.parse(localStorage.getItem("user") || "null");
            } catch {
                return null;
            }
        })();
        return (
            order.shipping_name ||
            order.customer_name ||
            order.customer?.name ||
            order.user?.name ||
            order.recipient_name ||
            localUser?.name ||
            "—"
        );
    }, [order]);

    // ======== Tính tiền fallback ========
    const money = useMemo(() => {
        if (!order) return { subtotal: 0, shippingFee: 0, discount: 0, total: 0 };
        const items = (order.items || order.order_items || []).map((it) => ({
            qty: it.qty ?? it.quantity ?? 0,
            price: Number(it.price ?? 0),
        }));
        const subtotalApi = order.subtotal != null ? Number(order.subtotal) : null;
        const subtotalCalc = items.reduce((s, it) => s + it.qty * it.price, 0);
        const subtotal = subtotalApi ?? subtotalCalc;

        const shippingFee = order.shipping_fee != null ? Number(order.shipping_fee) : 0;
        const discount = order.discount != null ? Number(order.discount) : 0;

        const totalApi = order.total != null ? Number(order.total) : null;
        const total = totalApi ?? subtotal + shippingFee - discount;

        return { subtotal, shippingFee, discount, total };
    }, [order]);

    // ======== Item hydrate helpers ========
    const needsHydrate = (it) => {
        const hasName = !!(it.name || it.product?.name);
        const hasPrice =
            it.price != null ||
            it.product?.price != null ||
            it.product?.price_sale != null ||
            it.product?.price_root != null;
        const hasThumb =
            !!(it.thumbnail_url || it.image_url || it.thumbnail || it.product?.thumbnail_url || it.product?.thumbnail);
        return !(hasName && hasPrice && hasThumb);
    };

    const fetchProductById = async (pid, signal) => {
        const endpoints = [
            `${API_BASE}/products/${pid}`,
            `${API_BASE}/product/${pid}`,
            `${API_BASE}/items/${pid}`,
        ];
        for (const url of endpoints) {
            try {
                const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
                if (res.ok) {
                    const data = await res.json();
                    return data.data || data.product || data;
                }
            } catch { }
        }
        return null;
    };

    const hydrateItems = async (items, signal) => {
        if (!Array.isArray(items) || items.length === 0) return [];
        const prodCache = new Map();

        const getProd = async (pid) => {
            if (prodCache.has(pid)) return prodCache.get(pid);
            const p = await fetchProductById(pid, signal);
            prodCache.set(pid, p);
            return p;
        };

        const out = [];
        for (const it of items) {
            if (!needsHydrate(it)) {
                out.push(it);
                continue;
            }
            const pid = it.product_id || it.productId || it.product?.id;
            const p = pid ? await getProd(pid) : it.product || null;

            const name = it.name || p?.name || `#${pid || it.id}`;
            const price = it.price ?? p?.price_sale ?? p?.price_root ?? p?.price ?? 0;
            const thumb =
                it.thumbnail_url ||
                it.image_url ||
                it.thumbnail ||
                p?.thumbnail_url ||
                p?.image_url ||
                p?.thumbnail ||
                PLACEHOLDER;

            out.push({ ...it, name, price, thumbnail_url: thumb });
        }
        return out;
    };

    // ======== Fetch order + hydrate (CHỈ GỌI /orders/track) ========
    const fetchOrder = async (signal) => {
        if (!code.trim()) return;
        setLoading(true);
        setErr("");

        try {
            const u = new URL(`${API_BASE}/orders/track`);
            u.searchParams.set("code", code.trim());
            if (phone.trim()) u.searchParams.set("phone", phone.trim());

            const res = await fetch(u.toString(), { signal, headers: { Accept: "application/json" } });
            if (res.status === 404) {
                setOrder(null);
                setErr("Không tìm thấy đơn hàng. Hãy kiểm tra mã đơn/số điện thoại.");
                return;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            const o = data.data || data.order || data;
            setOrder(o); // show ngay

            try {
                localStorage.setItem("last_order_code", String(o.code || code).trim());
            } catch { }

            const rawItems = o.items || o.order_items || [];
            const hydrated = await hydrateItems(rawItems, signal);

            setOrder((prev) => ({ ...prev, items: hydrated }));
        } catch (e) {
            if (e.name !== "AbortError") {
                console.error(e);
                setErr("Không tìm thấy đơn hàng. Hãy kiểm tra mã đơn/số điện thoại.");
                setOrder(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const onSearch = (e) => {
        e.preventDefault();
        const ac = new AbortController();
        fetchOrder(ac.signal);
        return () => ac.abort();
    };

    // Auto refresh
    useEffect(() => {
        if (!order?.status || !ACTIVE_POLL.has(order.status)) {
            clearInterval(pollRef.current);
            return;
        }
        pollRef.current = setInterval(() => {
            const ac = new AbortController();
            fetchOrder(ac.signal);
        }, 15000);
        return () => clearInterval(pollRef.current);
    }, [order?.status]);

    // Tự fetch khi có ?code
    useEffect(() => {
        if (code) {
            const ac = new AbortController();
            fetchOrder(ac.signal);
            return () => ac.abort();
        }
    }, []); // eslint-disable-line

    return (
        <div className="track-page">
            {/* NÚT QUAY LẠI — dính ngay dưới topbar, luôn nổi và dễ thấy */}


            <div className="track-card">
                <h2 className="track-title">📦 Theo dõi đơn hàng</h2>

                <form onSubmit={onSearch} className="track-form">
                    <input
                        className="track-input"
                        placeholder="Nhập mã đơn (VD: SV-2025-0001)"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <input
                        className="track-input"
                        placeholder="Số điện thoại (không bắt buộc)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <button className="track-btn" type="submit" disabled={loading}>
                        {loading ? "Đang tìm..." : "Tra cứu"}
                    </button>
                </form>

                {err && <p className="track-error">❌ {err}</p>}
            </div>

            {order && (
                <div className="track-result">
                    {/* Header đơn */}
                    <div className="order-head">
                        <div className="order-left">
                            <div className="order-code">
                                Mã đơn: <b>{order.code || order.id}</b>
                                <button
                                    className="copy-btn"
                                    onClick={() => navigator.clipboard.writeText(order.code || order.id)}
                                    title="Sao chép"
                                >
                                    Sao chép
                                </button>
                            </div>
                            <div className="order-meta">
                                <span className="meta-chip">👤 {customerName}</span>
                                <span className="meta-chip total">Tổng: ₫{fmt(money.total)}</span>
                            </div>
                        </div>

                        <div className={`status-badge s-${order.status}`}>
                            {STATUS_STEPS.find((s) => s.key === order.status)?.label || order.status}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="timeline">
                        {STATUS_STEPS.map((s, i) => (
                            <div key={s.key} className={`step ${i <= currentStep ? "done" : ""}`}>
                                <div className="dot" />
                                <div className="label">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Thông tin giao hàng + tiền */}
                    <div className="grid-two">
                        <div className="panel">
                            <h4>📍 Thông tin giao hàng</h4>
                            <div className="info">
                                <div><span>Khách:</span> {customerName}</div>
                                <div><span>Điện thoại:</span> {order?.shipping_phone || order?.phone || "—"}</div>
                                <div><span>Địa chỉ:</span> {order?.shipping_address || order?.address || "—"}</div>
                                <div><span>Ghi chú:</span> {order?.note || "—"}</div>
                            </div>
                        </div>

                        <div className="panel">
                            <h4>💵 Thanh toán</h4>
                            <div className="info">
                                <div><span>Tổng tiền hàng:</span> ₫{fmt(money.subtotal)}</div>
                                <div><span>Phí vận chuyển:</span> ₫{fmt(money.shippingFee)}</div>
                                <div><span>Giảm giá:</span> -₫{fmt(money.discount)}</div>
                                <div className="total"><span>Phải trả:</span> ₫{fmt(money.total)}</div>
                                <div><span>Phương thức:</span> {order?.payment_method || "—"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="panel">
                        <h4>🧺 Sản phẩm</h4>
                        <div className="items">
                            {(order.items || order.order_items || []).map((it) => (
                                <div
                                    key={it.id || `${it.product_id}-${it.variant_id || ""}`}
                                    className="item"
                                >
                                    <img
                                        src={it.thumbnail_url || it.image_url || it.thumbnail || PLACEHOLDER}
                                        alt={it.name}
                                        onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                                    />
                                    <div className="item-info">
                                        <div className="item-name">{it.name}</div>
                                        <div className="item-sub">
                                            SL: {it.qty ?? it.quantity ?? 0} × ₫{fmt(it.price)}
                                        </div>
                                    </div>
                                    <div className="item-total">
                                        ₫{fmt((it.qty || it.quantity || 0) * (it.price || 0))}
                                    </div>
                                </div>
                            ))}
                            {(!order.items || (order.items || order.order_items || []).length === 0) && (
                                <div className="muted">Không có sản phẩm.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CSS */}
            <style>{`
        :root { --e: cubic-bezier(.2,.8,.2,1); --green:#10b981; --emerald:#059669; --muted:#6b7280; --topbar-h: 64px; }

        /* chừa chỗ cho topbar cố định */
        .track-page { max-width: 1000px; margin: 0 auto; padding: calc(var(--topbar-h) + 16px) 16px 20px; }

        /* Nút quay lại sticky ngay dưới topbar */
        .track-back{
          position: sticky;
          top: calc(var(--topbar-h) + 8px);
          z-index: 70;
          margin-bottom: 8px;
        }
        .back-btn{
          background:#fff;
          border:1px solid #0676e6ff;
          border-radius:999px;
          padding:8px 14px;
          font-weight:900;
          cursor:pointer;
          box-shadow: 0 6px 18px rgba(0,0,0,.06);
        }
        .back-btn:hover{ filter:brightness(1.02); }

        .track-card {
          background: linear-gradient(180deg,#ffffff 0%, #5492e3ff 100%);
          border:1px solid #3030ecff; border-radius:14px; padding:16px;
          box-shadow:0 8px 20px rgba(0,0,0,.05);
        }
        .track-title {
          margin:0 0 10px; font-size:22px; font-weight:800;
          background: linear-gradient(90deg,#16a34a,#22c55e);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .track-form { display:flex; gap:10px; flex-wrap:wrap; }
        .track-input {
          flex:1; min-width:220px; height:40px; padding:0 12px; border-radius:10px; border:1px solid #82cefaff;
          transition: box-shadow .2s var(--e), border-color .2s var(--e);
        }
        .track-input:focus { outline:none; border-color:#cfeee3; box-shadow:0 0 0 4px rgba(207,238,227,.35); }
        .track-btn {
          height:40px; padding:0 16px; border:0; border-radius:10px; cursor:pointer;
          background: linear-gradient(135deg,#34d399,#10b981); color:#fff; font-weight:800;
          box-shadow:0 8px 16px rgba(16,185,129,.25); transition: transform .2s var(--e), filter .2s var(--e);
        }
        .track-btn:hover { transform:translateY(-1px); filter:brightness(1.03); }
        .track-error { color:#dc2626; margin-top:10px; }

        .track-result { margin-top:16px; display:grid; gap:16px; }
        .order-head {
          background:#fff; border:1px solid #eef2f7; border-radius:14px; padding:12px 14px;
          display:flex; align-items:center; justify-content:space-between; gap:10px;
          box-shadow:0 6px 18px rgba(0,0,0,.04);
        }
        .order-left { display:flex; flex-direction:column; gap:8px; }
        .order-code { font-weight:800; }
        .order-meta { display:flex; gap:8px; flex-wrap:wrap; }
        .meta-chip {
          padding:6px 10px; border-radius:999px; font-weight:700; font-size:12px;
          background:#f0fdf4; border:1px solid #bbf7d0; color:#065f46;
        }
        .meta-chip.total { background:#eff6ff; border-color:#bfdbfe; color:#1e40af; }

        .copy-btn{ margin-left:10px; font-size:12px; border:1px solid #e6eef6; background:#fff; border-radius:8px; padding:4px 8px; cursor:pointer; }

        .status-badge{
          padding:6px 10px; border-radius:999px; font-weight:800; font-size:12px; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0;
        }
        .status-badge.s-pending{ background:#fff7ed; border-color:#fed7aa; color:#9a3412; }
        .status-badge.s-paid{ background:#eef2ff; border-color:#c7d2fe; color:#3730a3; }
        .status-badge.s-processing{ background:#f0f9ff; border-color:#bae6fd; color:#075985; }
        .status-badge.s-shipping{ background:#ecfeff; border-color:#a5f3fc; color:#155e75; }
        .status-badge.s-delivered{ background:#ecfdf5; border-color:#a7f3d0; color:#065f46; }

        .timeline{
          background:#fff; border:1px solid #eef2f7; border-radius:14px; padding:18px; display:flex; justify-content:space-between;
          box-shadow:0 6px 18px rgba(0,0,0,.04);
        }
        .step{ text-align:center; width:20%; position:relative; }
        .step .dot{
          width:14px; height:14px; border-radius:999px; margin:0 auto 8px;
          background:#e5e7eb; border:2px solid #e5e7eb; transition:background .2s var(--e), border-color .2s var(--e);
        }
        .step.done .dot{ background:#10b981; border-color:#10b981; box-shadow:0 0 0 4px rgba(16,185,129,.15); }
        .step .label{ font-size:12px; color:#374151; font-weight:700; }

        .grid-two{ display:grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap:16px; }
        .panel{
          background:#fff; border:1px solid #eef2f7; border-radius:14px; padding:14px;
          box-shadow:0 6px 18px rgba(0,0,0,.04);
        }
        .panel h4{ margin:0 0 10px; font-size:16px; font-weight:800; }
        .info > div{ margin:6px 0; color:#374151; }
        .info span{ color:#6b7280; margin-right:6px; }
        .info .total{ font-weight:900; color:#059669; }

        .items{ display:flex; flex-direction:column; gap:10px; }
        .item{ display:grid; grid-template-columns: 64px 1fr auto; align-items:center; gap:12px; padding:8px; border-radius:12px; border:1px solid #f1f5f9; }
        .item img{ width:64px; height:48px; object-fit:cover; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,.06); }
        .item-name{ font-weight:800; }
        .item-sub{ font-size:13px; color:#6b7280; }
        .item-total{ font-weight:800; color:#111827; }
        .muted{ color:#6b7280; }
      `}</style>
        </div>
    );
}
