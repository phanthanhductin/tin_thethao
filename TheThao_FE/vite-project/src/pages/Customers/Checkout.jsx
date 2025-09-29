// src/pages/Customers/Checkout.jsx
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
    payment_method: "COD",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
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
        alert("✅ Đặt hàng thành công! Mã đơn hàng: " + data.order_id);
        setCart([]);
        navigate("/");
      } else {
        setError(data.message || "Có lỗi xảy ra.");
      }
    } catch (err) {
      setError("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "40px auto",
        padding: 20,
        fontFamily: "Montserrat, Arial, sans-serif",
        background: "#121212",
        color: "#f5f5f5",
        borderRadius: 16,
        boxShadow: "0 0 18px rgba(0,255,170,0.2)",
      }}
    >
      <h2
        style={{
          marginBottom: 30,
          color: "#00e676",
          fontSize: 28,
          fontWeight: 900,
          textTransform: "uppercase",
          textAlign: "center",
          textShadow: "0 0 10px rgba(0,230,118,0.6)",
        }}
      >
        🧾 Thanh toán
      </h2>

      {cart.length === 0 ? (
        <p style={{ textAlign: "center", color: "#ff5252" }}>
          ⚠️ Giỏ hàng của bạn đang trống, vui lòng quay lại chọn sản phẩm.
        </p>
      ) : (
        <>
          {error && (
            <p
              style={{
                color: "#ff5252",
                background: "rgba(255,82,82,0.1)",
                padding: "12px 14px",
                borderRadius: 10,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 24,
              alignItems: "flex-start",
            }}
          >
            {/* Form thông tin */}
            <form
              onSubmit={handleSubmit}
              style={{
                background: "#1e1e1e",
                padding: 24,
                borderRadius: 14,
                boxShadow: "0 0 12px rgba(0,229,255,0.15)",
              }}
            >
              <h3 style={{ marginBottom: 18, color: "#00e5ff" }}>
                Thông tin khách hàng
              </h3>

              <div style={{ marginBottom: 14 }}>
                <label>Họ và tên</label>
                <input
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #333",
                    marginTop: 6,
                    background: "#2a2a2a",
                    color: "#fff",
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label>Số điện thoại</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #333",
                    marginTop: 6,
                    background: "#2a2a2a",
                    color: "#fff",
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #333",
                    marginTop: 6,
                    background: "#2a2a2a",
                    color: "#fff",
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label>Địa chỉ giao hàng</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #333",
                    marginTop: 6,
                    background: "#2a2a2a",
                    color: "#fff",
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label>Phương thức thanh toán</label>
                <select
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #333",
                    marginTop: 6,
                    background: "#2a2a2a",
                    color: "#fff",
                  }}
                >
                  <option value="COD">Thanh toán khi nhận hàng</option>
                  <option value="Bank">Chuyển khoản ngân hàng</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "linear-gradient(90deg,#00c853,#ff6d00)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  boxShadow: "0 0 12px rgba(255,109,0,0.4)",
                  transition: "transform .2s ease, box-shadow .2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 0 18px rgba(0,229,255,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 0 12px rgba(255,109,0,0.4)";
                }}
              >
                {loading ? "⏳ Đang xử lý..." : "✅ Xác nhận đặt hàng"}
              </button>
            </form>

            {/* Thông tin giỏ hàng */}
            <div
              style={{
                background: "#1e1e1e",
                padding: 24,
                borderRadius: 14,
                boxShadow: "0 0 12px rgba(0,255,170,0.15)",
              }}
            >
              <h3 style={{ marginBottom: 16, color: "#ff7043" }}>
                Đơn hàng của bạn
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {cart.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      borderBottom: "1px dashed #333",
                      paddingBottom: 6,
                    }}
                  >
                    <span>
                      {item.name} x {item.qty}
                    </span>
                    <span style={{ color: "#00e5ff" }}>
                      {(item.price * item.qty).toLocaleString()} đ
                    </span>
                  </li>
                ))}
              </ul>

              <h3
                style={{
                  marginTop: 20,
                  color: "#ff5252",
                  fontWeight: 800,
                  fontSize: 20,
                  textAlign: "right",
                  textShadow: "0 0 6px rgba(255,82,82,0.6)",
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
