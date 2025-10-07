import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

export default function Checkout({ setCart }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ nhận dữ liệu cart từ Cart.jsx
  const cart = location.state?.cart || [];

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    payment_method: "MoMo_QR", // COD | Bank | MoMo_QR | MoMo_CARD
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  async function placeOrderCODorBank() {
    const res = await fetch(`${API_BASE}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({
        ...form,
        items: cart,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      const orderCode =
        data?.code ||
        data?.order_code ||
        data?.order?.code ||
        data?.order_id ||
        data?.id;

      alert("✅ Đặt hàng thành công!" + (orderCode ? " Mã đơn: " + orderCode : ""));
      if (orderCode) localStorage.setItem("last_order_code", String(orderCode));

      // xóa giỏ (state + localStorage tuỳ app bạn)
      setCart([]);
      localStorage.setItem("cart", "[]");

      if (orderCode) {
        navigate(`/track?code=${encodeURIComponent(orderCode)}`, { replace: true });
      } else {
        navigate("/track", { replace: true });
      }
    } else {
      throw new Error(data?.message || "Có lỗi xảy ra.");
    }
  }

  async function createMoMoSession() {
    const momo_type = form.payment_method === "MoMo_CARD" ? "card" : "qr";

    const res = await fetch(`${API_BASE}/api/payments/momo/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({
        name: form.customer_name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        note: form.note,
        amount: total,
        items: cart,
        momo_type, // 👈 gửi loại QR/card về BE
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Không tạo được phiên thanh toán MoMo.");

    // 👇 Lưu thông tin để xử lý khi quay về
    const moOrderCode = data?.momo?.orderId || data?.orderId;
    const orderId = data?.order_id;
    if (moOrderCode) localStorage.setItem("momo_last_order_code", moOrderCode);
    if (orderId) localStorage.setItem("momo_last_order_id", String(orderId));
    localStorage.setItem("cart_backup", JSON.stringify(cart)); // phòng khi fail thì khôi phục

    const payUrl = data?.momo?.payUrl || data?.payUrl || data?.momo?.deeplink;
    if (!payUrl) throw new Error("Thiếu payUrl từ MoMo.");

    window.location.href = payUrl;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return setError("Giỏ hàng đang trống.");
    if (!form.customer_name || !form.phone || !form.email || !form.address)
      return setError("Vui lòng điền đầy đủ thông tin giao hàng.");

    setLoading(true);
    setError("");

    try {
      if (form.payment_method.startsWith("MoMo")) {
        await createMoMoSession(); // ✅ cả QR & Card đều đi lối này
      } else {
        await placeOrderCODorBank();
      }
    } catch (err) {
      setError(err?.message || "Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "30px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 20, color: "#388e3c" }}>🧾 Thanh toán</h2>

      {cart.length === 0 ? (
        <p>⚠️ Giỏ hàng của bạn đang trống, vui lòng quay lại chọn sản phẩm.</p>
      ) : (
        <>
          {error && (
            <p
              style={{
                color: "#d32f2f",
                background: "#fdecea",
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 20,
              alignItems: "flex-start",
            }}
          >
            {/* Form thông tin */}
            <form
              onSubmit={handleSubmit}
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginBottom: 16 }}>Thông tin khách hàng</h3>

              <div style={{ marginBottom: 12 }}>
                <label>Họ và tên</label>
                <input
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 10 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Số điện thoại</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 10 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 10 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Địa chỉ giao hàng</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  style={{ width: "100%", padding: 10 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Ghi chú (tuỳ chọn)</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={2}
                  style={{ width: "100%", padding: 10 }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label>Phương thức thanh toán</label>
                <select
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  style={{ width: "100%", padding: 10 }}
                >
                  <option value="COD">Thanh toán khi nhận hàng</option>
                  <option value="MoMo_QR">MoMo (QR)</option>
                  <option value="MoMo_CARD">MoMo (Thẻ/ATM)</option>
                </select>
                {form.payment_method.startsWith("MoMo") && (
                  <p style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
                    Bạn sẽ được chuyển sang cổng MoMo để thanh toán an toàn.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#388e3c",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 16,
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                {loading
                  ? "⏳ Đang xử lý..."
                  : form.payment_method.startsWith("MoMo")
                    ? "🟣 Thanh toán với MoMo"
                    : "✅ Xác nhận đặt hàng"}
              </button>
            </form>

            {/* Thông tin giỏ hàng */}
            <div
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginBottom: 16 }}>Đơn hàng của bạn</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {cart.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      borderBottom: "1px dashed #eee",
                      paddingBottom: 6,
                    }}
                  >
                    <span>
                      {item.name} x {item.qty}
                    </span>
                    <span>{(item.price * item.qty).toLocaleString()} đ</span>
                  </li>
                ))}
              </ul>

              <h3
                style={{
                  marginTop: 16,
                  color: "#d32f2f",
                  fontWeight: 700,
                  fontSize: 18,
                  textAlign: "right",
                }}
              >
                Tổng cộng: {total.toLocaleString()} đ
              </h3>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
