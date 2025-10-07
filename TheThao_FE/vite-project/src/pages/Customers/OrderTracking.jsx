// src/pages/Customers/OrderTracking.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";
const PLACEHOLDER = "https://placehold.co/80x60?text=No+Img";

export const STATUS_STEPS = [
  { key: "pending",   label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "ready",     label: "Chờ vận chuyển" },
  { key: "shipping",  label: "Đang giao" },
  { key: "delivered", label: "Giao thành công" },
];

const ACTIVE_POLL = new Set(["confirmed", "ready", "shipping"]);

const normalizeStatusKey = (s) => {
  const str = String(s ?? "").toLowerCase().trim();
  const map = {
    "0":"pending","1":"confirmed","2":"ready","3":"shipping","4":"delivered",
    pending:"pending",confirmed:"confirmed",ready:"ready",shipping:"shipping",
    shipped:"shipping",delivered:"delivered",paid:"confirmed",
    processing:"ready",completed:"delivered",success:"delivered",
    canceled:"canceled",cancelled:"canceled",
  };
  return map[str] || "pending";
};

export default function OrderTracking() {
  const navigate = useNavigate();

  const [code, setCode] = useState(
    () =>
      new URLSearchParams(location.search).get("code") ||
      localStorage.getItem("last_order_code") ||
      ""
  );
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Modal hủy đơn
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const pollRef = useRef(null);

  const fmt = (v) => (v == null ? 0 : Number(v)).toLocaleString("vi-VN");
  const fmtTime = (t) =>
    t ? (isNaN(new Date(t)) ? String(t) : new Date(t).toLocaleString("vi-VN")) : "";

  const statusKey = useMemo(() => {
    const raw =
      order?.status_step ?? order?.step_code ?? order?.status_key ?? order?.status;
    return normalizeStatusKey(raw);
  }, [order]);

  const currentStep = useMemo(
    () => Math.max(0, ["pending", "confirmed", "ready", "shipping", "delivered"].indexOf(statusKey)),
    [statusKey]
  );

  const customerName = useMemo(() => {
    if (!order) return "—";
    const localUser = (() => {
      try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
    })();
    return (
      order?.shipping_name ||
      order?.customer_name ||
      order?.customer?.name ||
      order?.user?.name ||
      order?.recipient_name ||
      localUser?.name ||
      "—"
    );
  }, [order]);

  // const money = useMemo(() => {
  //   if (!order) return { subtotal: 0, shippingFee: 0, discount: 0, total: 0 };
  //   const items = (order.items || order.order_items || []).map((it) => ({
  //     qty: it.qty ?? it.quantity ?? 0,
  //     price: Number(it.price ?? 0),
  //   }));
  //   const subtotal =
  //     order.subtotal != null
  //       ? Number(order.subtotal)
  //       : items.reduce((s, it) => s + it.qty * it.price, 0);
  //   const shippingFee = Number(order.shipping_fee ?? 0);
  //   const discount = Number(order.discount ?? 0);
  //   const total = order.total != null ? Number(order.total) : subtotal + shippingFee - discount;
  //   return { subtotal, shippingFee, discount, total };
  // }, [order]);

const money = useMemo(() => {
  if (!order) return { subtotal: 0, shippingFee: 0, discount: 0, total: 0 };

  const items = (order.items || order.order_items || []).map((it) => ({
    qty: it.qty ?? it.quantity ?? 0,
    price: Number(it.price ?? 0),
  }));

  const subtotal =
    order.subtotal != null
      ? Number(order.subtotal)
      : items.reduce((s, it) => s + it.qty * it.price, 0);

  const shippingFee = Number(order.shipping_fee ?? 0);

  // 🔥 Ưu tiên giảm giá từ coupon
  // const couponDiscount =
  //   Number(order.coupon_discount ?? order.coupon_amount ?? 0) ||
  //   (order.coupon?.discount_value ?? 0);

  // const baseDiscount = Number(order.discount ?? 0);
  // const discount = couponDiscount > 0 ? couponDiscount : baseDiscount;
// Ưu tiên lấy từ cột discount trong DB
const discount =
  Number(order.discount ?? 0) ||
  Number(order.coupon_discount ?? order.coupon_amount ?? 0) ||
  (order.coupon?.discount_value ?? 0);

  const total =
    order.total != null
      ? Number(order.total)
      : subtotal + shippingFee - discount;

  return { subtotal, shippingFee, discount, total };
}, [order]);


  const timelineTimes = useMemo(
    () => ({
      pending: order?.created_at || order?.createdAt || order?.placed_at,
      confirmed: order?.confirmed_at || order?.paid_at,
      ready: order?.ready_at || order?.processing_at || order?.packed_at,
      shipping: order?.shipped_at,
      delivered: order?.delivered_at,
    }),
    [order]
  );

  const carrierName =
    order?.carrier || order?.shipping_provider || order?.courier;
  const trackingNo =
    order?.tracking_no ||
    order?.tracking_number ||
    order?.shipment?.tracking_number;

  const carrierTrackUrl = trackingNo
    ? ((n, c = (carrierName || "").toLowerCase()) =>
        c.includes("ghtk")
          ? `https://i.ghtk.vn/${n}`
          : c.includes("ghn")
          ? `https://donhang.ghn.vn/?order_code=${n}`
          : c.includes("viettel")
          ? `https://viettelpost.com.vn/tra-cuu-don-hang?code=${n}`
          : c.includes("vnpost")
          ? `https://www.vnpost.vn/tra-cuu-hanh-trinh/buu-pham?code=${n}`
          : c.includes("j&t") || c.includes("jnt")
          ? `https://jtexpress.vn/vi/tracking?billcode=${n}`
          : `https://www.google.com/search?q=${encodeURIComponent(
              `tra cứu vận đơn ${n}`
            )}`)(trackingNo)
    : "";

  const needsHydrate = (it) => {
    const hasName = !!(it.name || it.product?.name);
    const hasPrice =
      it.price != null ||
      it.product?.price != null ||
      it.product?.price_sale != null ||
      it.product?.price_root != null;
    const hasThumb =
      !!(it.thumbnail_url ||
      it.product_image ||
      it.image_url ||
      it.thumbnail ||
      it.product?.thumbnail_url ||
      it.product?.thumbnail);
    return !(hasName && hasPrice && hasThumb);
  };

  const fetchProductById = async (pid, signal) => {
    for (const url of [
      `${API_BASE}/products/${pid}`,
      `${API_BASE}/product/${pid}`,
      `${API_BASE}/items/${pid}`,
    ]) {
      try {
        const r = await fetch(url, { signal, headers: { Accept: "application/json" } });
        if (r.ok) {
          const d = await r.json();
          return d.data || d.product || d;
        }
      } catch {}
    }
    return null;
  };

  const hydrateItems = async (items, signal) => {
    if (!Array.isArray(items) || !items.length) return [];
    const cache = new Map();
    const get = async (pid) => {
      if (cache.has(pid)) return cache.get(pid);
      const p = await fetchProductById(pid, signal);
      cache.set(pid, p);
      return p;
    };
    const out = [];
    for (const it of items) {
      if (!needsHydrate(it)) { out.push(it); continue; }
      const pid = it.product_id || it.productId || it.product?.id;
      const p = pid ? await get(pid) : it.product || null;
      out.push({
        ...it,
        name: it.name || p?.name || `#${pid || it.id}`,
        price: it.price ?? p?.price_sale ?? p?.price_root ?? p?.price ?? 0,
        thumbnail_url:
          it.thumbnail_url ||
          it.product_image ||
          it.image_url ||
          it.thumbnail ||
          p?.thumbnail_url ||
          p?.image_url ||
          p?.thumbnail ||
          PLACEHOLDER,
      });
    }
    return out;
  };

  const fetchOrder = async (signal) => {
    if (!code.trim()) return;
    setLoading(true);
    setErr("");
    try {
      let o = null;

      try {
        const ra = await fetch(
          `${API_BASE}/orders/track?code=${encodeURIComponent(code)}${
            phone ? `&phone=${encodeURIComponent(phone)}` : ""
          }`,
          { signal, headers: { Accept: "application/json" } }
        );
        if (ra.ok) {
          const da = await ra.json();
          o = da.data || da.order || da;
        }
      } catch {}

      if (!o || !Array.isArray(o.items) || !o.items.length) {
        try {
          const rb = await fetch(`${API_BASE}/orders/${encodeURIComponent(code)}`, {
            signal,
            headers: { Accept: "application/json" },
          });
          if (rb.ok) {
            const db = await rb.json();
            const ob = db.data || db.order || db;
            o = { ...(o || {}), ...ob, items: ob.items || o?.items || [] };
          }
        } catch {}
      }

      if (!o) throw new Error("Order not found");
      setOrder(o);

      const hydrated = await hydrateItems(o.items || o.order_items || [], signal);
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

  useEffect(() => {
    if (!statusKey || !ACTIVE_POLL.has(statusKey)) {
      clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(() => {
      const ac = new AbortController();
      fetchOrder(ac.signal);
    }, 15000);
    return () => clearInterval(pollRef.current);
  }, [statusKey]);

  useEffect(() => {
    if (code) {
      const ac = new AbortController();
      fetchOrder(ac.signal);
      return () => ac.abort();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canCancel = order && ["pending", "confirmed"].includes(statusKey);

  // ==== Modal hủy đơn ====
  const openCancelModal = () => {
    setCancelReason("");
    setCancelError("");
    setShowCancelModal(true);
  };
  const closeCancelModal = () => {
    if (canceling) return;
    setShowCancelModal(false);
  };
  const submitCancel = async (e) => {
    e?.preventDefault();
    if (!order) return;
    setCanceling(true);
    setCancelError("");

    try {
      const payload = {
        code: order.code || order.id,
        reason: cancelReason || undefined,
      };

      const tries = [
        { url: `${API_BASE}/orders/${order.code || order.id}/cancel`, method: "POST", body: { reason: payload.reason } },
        { url: `${API_BASE}/orders/cancel`, method: "POST", body: payload },
        { url: `${API_BASE}/orders/${order.code || order.id}`, method: "PATCH", body: { status: "canceled", reason: payload.reason } },
      ];

      let ok = false;
      let lastRes = null;

      for (const t of tries) {
        try {
          const r = await fetch(t.url, {
            method: t.method,
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: t.body ? JSON.stringify(t.body) : undefined,
          });
          lastRes = r;
          if (r.ok) { ok = true; break; }
        } catch {}
      }

      if (!ok) {
        let msg = "Không hủy được đơn. Vui lòng thử lại.";
        try {
          const j = await lastRes.json();
          msg = j.message || j.error || msg;
        } catch {}
        setCancelError(msg);
        return;
      }

      setOrder((p) => (p ? { ...p, status: "canceled", status_key: "canceled" } : p));
      alert("✅ Hủy đơn hàng thành công!");
      setShowCancelModal(false);
      navigate("/canceled-orders");
    } finally {
      setCanceling(false);
    }
  };

  const reorder = () => {
    if (!order) return;
    const src = order.items || order.order_items || [];
    const load = () => { try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; } };
    const save = (v) => localStorage.setItem("cart", JSON.stringify(v));
    const cur = load(); const out = [...cur];
    for (const it of src) {
      const id = it.product_id || it.product?.id || it.id;
      if (!id) continue;
      const name  = it.name || it.product?.name || `#${id}`;
      const qty   = it.qty ?? it.quantity ?? 1;
      const price = Number(it.price ?? it.product?.price_sale ?? it.product?.price_root ?? it.product?.price ?? 0);
      const thumb = it.thumbnail_url || it.product_image || it.image_url || it.thumbnail || PLACEHOLDER;
      const idx = out.findIndex((x) => x.id === id);
      if (idx >= 0) out[idx].qty += qty; else out.push({ id, name, price, qty, thumbnail_url: thumb });
    }
    save(out);
    alert("🛒 Đã thêm lại các sản phẩm vào giỏ!");
    navigate("/cart");
  };

  const reviewFirst = () => {
    const it = (order?.items || order?.order_items || [])[0];
    const pid = it?.product_id || it?.productId || it?.product?.id;
    if (pid) navigate(`/products/${pid}/reviews`);
  };

  return (
    <div className="track-page">
      <div className="track-card">
        <div className="topbar">
          <button className="back-home" onClick={() => navigate("/")}>
            <span className="home-ico" aria-hidden>🏠</span> Về trang chủ
          </button>
        </div>

        <h2 className="track-title">📦 Theo dõi đơn hàng</h2>

        <form onSubmit={onSearch} className="track-form">
          <input
            className="track-input"
            placeholder="Nhập mã đơn (VD: 23 hoặc SV-2025-0001)"
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
          {/* Header */}
          <div className="order-head">
            <div className="order-left">
              <div className="order-code">
                Mã đơn: <b>{order.code || order.id}</b>
                <button
                  className="copy-btn"
                  onClick={() => navigator.clipboard.writeText(order.code || order.id)}
                >
                  Sao chép
                </button>
              </div>

              <div className="order-meta">
                <span className="meta-chip">👤 {customerName}</span>
                <span className="meta-chip total">Tổng: ₫{fmt(money.total)}</span>
                {order?.updated_at && (
                  <span className="meta-chip muted">Cập nhật: {fmtTime(order.updated_at)}</span>
                )}
              </div>
            </div>

            <div className="order-actions">
              {canCancel && (
                <button
                  className="btn solid danger"
                  onClick={openCancelModal}
                  disabled={canceling}
                  title="Hủy đơn hàng"
                >
                  {canceling ? "Đang hủy..." : "Hủy đơn"}
                </button>
              )}
              {statusKey === "delivered" && (
                <>
                  <button className="btn solid" onClick={reorder}>Mua lại</button>
                  <button className="btn outline" onClick={reviewFirst}>Đánh giá</button>
                </>
              )}
            </div>

            <div className={`status-badge s-${statusKey}`}>
              {STATUS_STEPS.find((s) => s.key === statusKey)?.label ||
                (statusKey === "canceled" ? "Đã hủy" : statusKey)}
            </div>
          </div>

          {/* Vận chuyển */}
          {(carrierName || trackingNo) && (
            <div className="panel">
              <h4>🚚 Vận chuyển</h4>
              <div className="ship-wrap">
                <div><span>Đơn vị:</span> {carrierName || "—"}</div>
                <div className="trackline">
                  <span>Mã vận đơn:</span>
                  <code className="code">{trackingNo || "—"}</code>
                  {trackingNo && (
                    <>
                      <button className="copy-btn" onClick={() => navigator.clipboard.writeText(trackingNo)}>
                        Copy
                      </button>
                      <a className="btn-link" href={carrierTrackUrl} target="_blank" rel="noreferrer">
                        Tra cứu
                      </a>
                    </>
                  )}
                </div>
                {order?.estimated_delivery && (
                  <div><span>Dự kiến giao:</span> {fmtTime(order.estimated_delivery)}</div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="timeline">
            {STATUS_STEPS.map((s, i) => (
              <div key={s.key} className={`step ${i <= currentStep ? "done" : ""}`}>
                <div className="dot" />
                <div className="label">
                  {s.label}
                  {timelineTimes[s.key] && <div className="ts">{fmtTime(timelineTimes[s.key])}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Info + money */}
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
                {/* <div><span>Giảm giá:</span> -₫{fmt(money.discount)}</div>
                <div className="total"><span>Phải trả:</span> ₫{fmt(money.total)}</div>
                <div><span>Phương thức:</span> {order?.payment_method || "—"}</div> */}

                <div><span>Giảm giá:</span> -₫{fmt(money.discount)}</div>
{(order?.coupon?.code || order?.coupon_code) && (
  <div><span>Mã giảm giá:</span> {order.coupon?.code || order.coupon_code}</div>
)}

<div className="total"><span>Phải trả:</span> ₫{fmt(money.total)}</div>
<div>
  <span>Phương thức:</span> 
  {order?.payment_method || order?.payment || order?.method || "—"}
</div>

              </div>
            </div>
          </div>

          {/* Items */}
          <div className="panel">
            <h4>🧺 Sản phẩm</h4>
            <div className="items">
              {(order.items || order.order_items || []).map((it) => (
                <div key={it.id || `${it.product_id}-${it.variant_id || ""}`} className="item">
                  <img
                    src={it.thumbnail_url || it.product_image || it.image_url || it.thumbnail || PLACEHOLDER}
                    alt={it.name}
                    onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  />
                  <div className="item-info">
                    <div className="item-name">{it.name}</div>
                    <div className="item-sub">SL: {it.qty ?? it.quantity ?? 0} × ₫{fmt(it.price)}</div>
                  </div>
                  <div className="item-total">₫{fmt((it.qty || it.quantity || 0) * (it.price || 0))}</div>

                  {statusKey === "delivered" && (
                    <div>
                      <button
                        className="btn outline"
                        onClick={() => {
                          const pid = it?.product_id || it?.productId || it?.product?.id;
                          if (pid) navigate(`/products/${pid}/reviews`);
                          else alert("Không tìm được product_id để mở form đánh giá.");
                        }}
                      >
                        Đánh giá
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {(!order.items || (order.items || order.order_items || []).length === 0) && (
                <div className="muted">Không có sản phẩm.</div>
              )}
            </div>
          </div>

          {/* History */}
          {(order.history || order.logs) && (
            <div className="panel">
              <h4>🕑 Lịch sử đơn hàng</h4>
              <div className="history">
                {(order.history || order.logs).map((h, i) => (
                  <div key={i} className="hrow">
                    <div className="hwhen">{fmtTime(h.at || h.created_at || h.time)}</div>
                    <div className="hstatus">{h.status || h.event}</div>
                    <div className="hmsg">{h.message || h.note || ""}</div>
                    {h.location && <div className="hloc">📍 {h.location}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal xác nhận hủy */}
      {showCancelModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h3 className="modal-title">Xác nhận hủy đơn</h3>
            <p className="modal-text">
              Bạn có chắc muốn hủy đơn <b>{order?.code || order?.id}</b>?
            </p>

            <label className="modal-label">
              Lý do hủy (không bắt buộc)
              <textarea
                className="modal-textarea"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Thay đổi sản phẩm, đặt nhầm..."
              />
            </label>

            {cancelError && <div className="modal-error">❌ {cancelError}</div>}

            <div className="modal-actions">
              <button className="btn outline" onClick={closeCancelModal} disabled={canceling}>
                Bỏ qua
              </button>
              <button className="btn solid danger" onClick={submitCancel} disabled={canceling}>
                {canceling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS */}
      <style>{`
        :root { --e:cubic-bezier(.2,.8,.2,1); }
        .track-page{max-width:1000px;margin:0 auto;padding:20px;}
        .track-card{
          background:linear-gradient(180deg,#ffffff 0%, #f6fffb 100%);
          border:1px solid #e6f4ef;border-radius:16px;padding:16px;
          box-shadow:0 10px 24px rgba(16,185,129,.08);
        }
        .topbar{display:flex;justify-content:flex-start;margin-bottom:8px;}
        .home-ico{margin-right:6px}
        .back-home{
          display:inline-flex;align-items:center;gap:6px;
          padding:8px 12px;border-radius:12px;border:1px solid #d1fae5;
          background:#ecfdf5;color:#065f46;font-weight:900;cursor:pointer;
          transition:transform .2s var(--e),box-shadow .2s var(--e),filter .2s var(--e);
        }
        .back-home:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(16,185,129,.18);filter:brightness(1.02);}
        .track-title{
          margin:0 0 10px;font-size:22px;font-weight:900;
          background:linear-gradient(90deg,#16a34a,#10b981);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        }
        .track-form{display:flex;gap:10px;flex-wrap:wrap}
        .track-input{
          flex:1;min-width:220px;height:42px;padding:0 12px;border-radius:12px;border:1px solid #e6f0ea;
          transition:box-shadow .2s var(--e),border-color .2s var(--e)
        }
        .track-input:focus{outline:none;border-color:#a7f3d0;box-shadow:0 0 0 4px rgba(167,243,208,.35)}
        .track-btn{
          height:42px;padding:0 18px;border:0;border-radius:12px;cursor:pointer;
          background:linear-gradient(135deg,#34d399,#10b981);color:#fff;font-weight:900;
          box-shadow:0 10px 20px rgba(16,185,129,.25);transition:transform .2s var(--e),filter .2s var(--e)
        }
        .track-btn:hover{transform:translateY(-1px);filter:brightness(1.04)}
        .track-error{color:#dc2626;margin-top:10px}
        .track-result{margin-top:16px;display:grid;gap:16px}
        .order-head{
          background:#fff;border:1px solid #eef2f7;border-radius:16px;padding:12px 14px;
          display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:10px;
          box-shadow:0 6px 18px rgba(0,0,0,.04)
        }
        .order-left{display:flex;flex-direction:column;gap:8px}
        .order-code{font-weight:900}
        .order-meta{display:flex;gap:8px;flex-wrap:wrap}
        .meta-chip{
          padding:6px 10px;border-radius:999px;font-weight:800;font-size:12px;
          background:#f0fdf4;border:1px solid #bbf7d0;color:#065f46
        }
        .meta-chip.total{background:#eff6ff;border-color:#bfdbfe;color:#1e40af}
        .meta-chip.muted{background:#f8fafc;border-color:#e2e8f0;color:#334155}
        .order-actions{display:flex;gap:8px;justify-self:end}
        .btn{padding:9px 12px;border-radius:12px;font-weight:900;cursor:pointer;transition:transform .2s var(--e),box-shadow .2s var(--e),background .2s var(--e)}
        .btn.solid{border:1px solid #10b981;background:#10b981;color:#fff}
        .btn.solid:hover{background:#059669;transform:translateY(-1px);box-shadow:0 8px 18px rgba(16,185,129,.25)}
        .btn.outline{border:1px solid #10b981;background:#fff;color:#065f46}
        .btn.outline:hover{background:#ecfdf5}
        .btn.danger{border-color:#ef4444;background:#ef4444}
        .btn.danger:hover{background:#dc2626}
        .copy-btn{margin-left:10px;font-size:12px;border:1px solid #e6eef6;background:#fff;border-radius:8px;padding:4px 8px;cursor:pointer}
        .btn-link{margin-left:8px;font-size:12px;padding:4px 8px;border-radius:8px;background:#f1f5ff;color:#1e3a8a;text-decoration:none}
        .status-badge{padding:6px 10px;border-radius:999px;font-weight:900;font-size:12px;color:#065f46;background:#ecfdf5;border:1px solid #a7f3d0;justify-self:end}
        .status-badge.s-pending{background:#fff7ed;border-color:#fed7aa;color:#9a3412}
        .status-badge.s-confirmed{background:#eef2ff;border-color:#c7d2fe;color:#3730a3}
        .status-badge.s-ready{background:#f0f9ff;border-color:#bae6fd;color:#075985}
        .status-badge.s-shipping{background:#ecfeff;border-color:#a5f3fc;color:#155e75}
        .status-badge.s-delivered{background:#ecfdf5;border-color:#a7f3d0;color:#065f46}
        .status-badge.s-canceled{background:#fef2f2;border-color:#fecaca;color:#991b1b}
        .timeline{
          background:#fff;border:1px solid #eef2f7;border-radius:16px;padding:18px;display:flex;justify-content:space-between;
          box-shadow:0 6px 18px rgba(0,0,0,.04)
        }
        .step{text-align:center;width:20%;position:relative}
        .step .dot{width:14px;height:14px;border-radius:999px;margin:0 auto 8px;background:#e5e7eb;border:2px solid #e5e7eb;transition:background .2s var(--e),border-color .2s var(--e)}
        .step.done .dot{background:#10b981;border-color:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.15)}
        .step .label{font-size:12px;color:#374151;font-weight:900}
        .step .label .ts{margin-top:4px;font-weight:700;color:#6b7280;font-size:11px}
        .grid-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
        .panel{background:#fff;border:1px solid #eef2f7;border-radius:16px;padding:14px;box-shadow:0 6px 18px rgba(0,0,0,.04)}
        .panel h4{margin:0 0 10px;font-size:16px;font-weight:900}
        .info>div{margin:6px 0;color:#374151}
        .info span{color:#6b7280;margin-right:6px}
        .info .total{font-weight:900;color:#059669}
        .ship-wrap{display:grid;gap:8px}
        .trackline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .code{background:#f8fafc;padding:2px 6px;border-radius:6px}
        .items{display:flex;flex-direction:column;gap:10px}
        .item{display:grid;grid-template-columns:64px 1fr auto auto;align-items:center;gap:12px;padding:8px;border-radius:12px;border:1px solid #f1f5f9}
        .item img{width:64px;height:48px;object-fit:cover;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,.06)}
        .item-name{font-weight:900}
        .item-sub{font-size:13px;color:#6b7280}
        .item-total{font-weight:900;color:#111827}
        .muted{color:#6b7280}
        .history{display:flex;flex-direction:column;gap:10px}
        .hrow{display:grid;grid-template-columns:170px 140px 1fr auto;gap:8px;align-items:start;padding:8px;border:1px dashed #e5e7eb;border-radius:10px}
        .hwhen{color:#334155;font-weight:900}
        .hstatus{font-weight:900;color:#065f46}
        .hmsg{color:#374151}
        .hloc{color:#475569}

        /* Modal */
        .modal-backdrop{
          position:fixed;inset:0;background:rgba(0,0,0,.35);
          display:flex;align-items:center;justify-content:center;z-index:50;
          backdrop-filter:blur(2px);
        }
        .modal{
          width:min(520px,92vw);background:#fff;border-radius:16px;
          border:1px solid #e5e7eb;box-shadow:0 18px 40px rgba(0,0,0,.18);
          padding:16px;
        }
        .modal-title{margin:0 0 6px;font-size:18px;font-weight:900}
        .modal-text{margin:0 0 10px;color:#374151}
        .modal-label{display:block;font-weight:700;color:#374151;margin-bottom:6px}
        .modal-textarea{
          width:100%;min-height:90px;border:1px solid #e5e7eb;border-radius:12px;
          padding:10px;resize:vertical;outline:none;
          transition:border-color .2s var(--e), box-shadow .2s var(--e)
        }
        .modal-textarea:focus{border-color:#a7f3d0;box-shadow:0 0 0 4px rgba(167,243,208,.35)}
        .modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}
        .modal-error{margin-top:8px;color:#b91c1c;font-weight:700}
      `}</style>
    </div>
  );
}
