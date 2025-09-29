// src/pages/Customers/Cart.jsx
import { useNavigate } from "react-router-dom";

export default function Cart({ cart, setCart }) {
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // ✅ Tăng số lượng
  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // ✅ Giảm số lượng (không nhỏ hơn 1)
  const decreaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  // ✅ Xoá 1 sản phẩm
  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ Xoá toàn bộ giỏ
  const clearCart = () => {
    if (window.confirm("Bạn có chắc muốn xoá toàn bộ giỏ hàng?")) {
      setCart([]);
    }
  };

  return (
    <div
      style={{
        padding: "30px 20px",
        fontFamily: "Montserrat, Arial, sans-serif",
        background: "#121212",
        color: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          marginBottom: 16,
          color: "#00e676",
          textShadow: "0 0 10px rgba(0,230,118,0.6)",
        }}
      >
        🛒 Giỏ hàng
      </h2>

      {cart.length === 0 ? (
        <div
          style={{
            background: "#1e1e1e",
            borderRadius: 14,
            padding: 24,
            textAlign: "center",
            boxShadow: "0 0 16px rgba(0,229,255,0.2)",
          }}
        >
          <p style={{ color: "#aaa", marginBottom: 16 }}>Giỏ hàng trống</p>
          <button
            onClick={() => navigate("/products")}
            style={{
              background: "linear-gradient(90deg,#00c853,#ff6d00)",
              color: "#fff",
              border: 0,
              padding: "10px 16px",
              borderRadius: 24,
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 0 12px rgba(255,109,0,0.6)",
            }}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div
          style={{
            background: "#1e1e1e",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 0 16px rgba(0,229,255,0.2)",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 760,
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,229,255,0.12), rgba(0,230,118,0.12))",
                }}
              >
                <th
                  style={{
                    textAlign: "left",
                    padding: 12,
                    color: "#00e5ff",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Sản phẩm
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: 12,
                    color: "#00e5ff",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Ảnh
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: 12,
                    color: "#00e5ff",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Giá
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: 12,
                    color: "#00e5ff",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Số lượng
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: 12,
                    color: "#00e5ff",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Thành tiền
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: 12,
                    color: "#00e5ff",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: idx % 2 === 0 ? "#1a1a1a" : "#161616",
                  }}
                >
                  <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <img
                      src={
                        item.thumbnail_url ||
                        item.thumbnail ||
                        "https://placehold.co/80x60"
                      }
                      alt={item.name}
                      style={{
                        width: 90,
                        height: 68,
                        objectFit: "cover",
                        borderRadius: 8,
                        boxShadow: "0 0 8px rgba(0,0,0,0.4)",
                      }}
                      onError={(e) =>
                        (e.currentTarget.src = "https://placehold.co/80x60")
                      }
                      loading="lazy"
                    />
                  </td>
                  <td style={{ padding: 12, textAlign: "center", color: "#ddd" }}>
                    {item.price.toLocaleString()} đ
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#262626",
                        borderRadius: 20,
                        padding: "4px 8px",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                      }}
                    >
                      <button
                        onClick={() => decreaseQty(item.id)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          border: 0,
                          cursor: "pointer",
                          color: "#fff",
                          background: "#333",
                          transition: "transform .15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                        title="Giảm"
                      >
                        −
                      </button>
                      <span style={{ minWidth: 24, display: "inline-block" }}>
                        {item.qty}
                      </span>
                      <button
                        onClick={() => increaseQty(item.id)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          border: 0,
                          cursor: "pointer",
                          color: "#fff",
                          background: "#333",
                          transition: "transform .15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                        title="Tăng"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: 12,
                      textAlign: "center",
                      fontWeight: 700,
                      color: "#ff5252",
                    }}
                  >
                    {(item.price * item.qty).toLocaleString()} đ
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: "#d32f2f",
                        color: "#fff",
                        border: 0,
                        padding: "8px 12px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                        boxShadow: "0 0 10px rgba(211,47,47,0.4)",
                        transition: "transform .15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-1px)")
                      }
                      onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)"
                      )
                      }
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tổng cộng + hành động */}
          <div
            style={{
              marginTop: 22,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={clearCart}
              style={{
                background: "#616161",
                color: "#fff",
                border: 0,
                padding: "10px 14px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 0 10px rgba(255,255,255,0.12)",
              }}
            >
              🗑 Xoá toàn bộ
            </button>

            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              Tổng cộng:{" "}
              <span style={{ color: "#ff7043" }}>
                {total.toLocaleString()} đ
              </span>
            </h3>

            {/* ✅ Chuyển qua trang Checkout và truyền cart */}
            <button
              style={{
                background: "linear-gradient(90deg,#00c853,#ff6d00)",
                color: "#fff",
                padding: "10px 18px",
                border: 0,
                borderRadius: 28,
                cursor: "pointer",
                fontWeight: 800,
                boxShadow: "0 0 14px rgba(0,230,118,0.5)",
                transition: "transform .2s ease, box-shadow .2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
                e.currentTarget.style.boxShadow =
                  "0 0 18px rgba(255,109,0,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 0 14px rgba(0,230,118,0.5)";
              }}
              onClick={() => navigate("/checkout", { state: { cart } })}
            >
              Thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
