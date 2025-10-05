import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";
const VND = new Intl.NumberFormat("vi-VN");

const badgeStyle = (status) => {
  const ok = status === 1 || status === "Completed";
  return {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    background: ok ? "#e7f9ee" : "#fff6e6",
    color: ok ? "#0a7a3f" : "#a35b00",
    fontSize: 12,
  };
};

const humanStatus = (s) => {
  if (typeof s === "string") return s;
  switch (Number(s)) {
    case 0: return "Pending";
    case 1: return "Completed";
    case 2: return "Cancelled";
    default: return "Unknown";
  }
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 🔑 PHẢI LÀ admin_token (đăng nhập qua /api/admin/login)
        const token = localStorage.getItem("admin_token") || "";
        if (!token) {
          throw new Error("Bạn chưa đăng nhập admin (thiếu admin_token).");
        }

        const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // đọc body 1 lần rồi phân tích
        const text = await res.text();
        let body = {};
        try { body = text ? JSON.parse(text) : {}; } catch { /* ignore */ }

        if (!res.ok) {
          if (res.status === 401) throw new Error("Bạn chưa đăng nhập admin hoặc token đã hết hạn.");
          if (res.status === 403) throw new Error(body?.message || "Token không có quyền admin (ability 'admin').");
          throw new Error(body?.message ? `HTTP ${res.status} - ${body.message}` : `HTTP ${res.status}`);
        }

        if (!ignore) setOrder(body);
      } catch (e) {
        console.error(e);
        if (!ignore) setErr(e.message || "Không tải được chi tiết đơn hàng.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (err) return <p style={{ color: "#d32f2f" }}>{err}</p>;
  if (!order) return <p>Không tìm thấy đơn hàng.</p>;

  const items = order.items || [];
  const total = Number(order.total ?? items.reduce((s, i) => s + Number(i.price || 0) * Number(i.qty || 0), 0));


    return (
        <section>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h1 style={{ fontSize: 22 }}>Order #{order.id}</h1>
                <Link to="/admin/orders" style={{ border: "1px solid #ddd", padding: "6px 10px", borderRadius: 6 }}>
                    ← Quay lại
                </Link>
            </div>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
                <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                    <h3>Thông tin khách hàng</h3>
                    <div>Tên: <b>{order.name}</b></div>
                    <div>Email: {order.email}</div>
                    <div>SĐT: {order.phone}</div>
                    <div>Địa chỉ: {order.address}</div>
                    {order.note && <div>Ghi chú: {order.note}</div>}
                </div>

                <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                    <h3>Trạng thái</h3>
                    <span style={badgeStyle(order.status)}>{humanStatus(order.status)}</span>
                    <div style={{ marginTop: 6 }}>
                        Tạo lúc: {order.created_at ? new Date(order.created_at).toLocaleString() : "-"}
                    </div>
                    {order.updated_at && <div>Cập nhật: {new Date(order.updated_at).toLocaleString()}</div>}
                </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                <h3>Sản phẩm</h3>
                <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#fafafa" }}>
                            <th>#</th>
                            <th align="left">Sản phẩm</th>
                            <th align="center">Ảnh</th>
                            <th align="right">Giá</th>
                            <th align="right">SL</th>
                            <th align="right">Tạm tính</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it, idx) => {
                            const price = Number(it.price ?? 0);
                            const qty = Number(it.qty ?? 0);
                            const subtotal = Number(it.subtotal ?? price * qty);
                            const name = it.product_name || it.name || "Sản phẩm";
                            const img = it.product_image;

                            return (
                                <tr key={it.id || `${idx}-${name}`} style={{ borderTop: "1px solid #eee" }}>
                                    <td>{idx + 1}</td>
                                    <td>{name}</td>
                                    <td align="center">
                                        {img ? (
                                            <img
                                                src={img}
                                                alt={name}
                                                style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }}
                                                onError={(e) => (e.currentTarget.src = "https://placehold.co/56x56")}
                                            />
                                        ) : (
                                            <span style={{ color: "#999" }}>—</span>
                                        )}
                                    </td>
                                    <td align="right">₫{VND.format(price)}</td>
                                    <td align="right">{qty}</td>
                                    <td align="right">₫{VND.format(subtotal)}</td>
                                </tr>
                            );
                        })}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={6} align="center" style={{ color: "#666" }}>
                                    Không có sản phẩm.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: "1px solid #eee" }}>
                            {/* bảng có 6 cột → gộp 5 cột bên trái */}
                            <td colSpan={5} align="right"><b>Tổng cộng</b></td>
                            <td align="right"><b>₫{VND.format(total)}</b></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
}
