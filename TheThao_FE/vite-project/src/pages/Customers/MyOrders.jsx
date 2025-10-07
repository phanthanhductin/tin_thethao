import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErr("⚠️ Vui lòng đăng nhập để xem đơn hàng của bạn.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");

    fetch(`${API_BASE}/orders/mine`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Lỗi khi tải danh sách đơn hàng.");
        }
        return res.json();
      })
      .then((data) => {
        const arr = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setOrders(arr);
        if (!arr.length) setErr("Chưa có đơn hàng nào.");
      })
      .catch((e) => {
        console.error(e);
        setErr("Không thể tải danh sách đơn hàng.");
      })
      .finally(() => setLoading(false));
  }, []);

  const formatVND = (n) =>
    typeof n === "number"
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(n)
      : n ?? "-";

  const toTrack = (o) => {
    const code = o.code || o.id;
    navigate(`/track?code=${code}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        position: "relative",
        overflow: "hidden",
        background: "#f0fdf4", // nền xanh nhạt pastel
      }}
    >
      <AppleBackground />

      <div
        style={{
          width: "100%",
          maxWidth: 960,
          margin: "20px auto 0 auto",
          borderRadius: 20,
          background: "white",
          border: "1px solid rgba(148,163,184,.25)",
          boxShadow: "0 8px 30px rgba(0,0,0,.12)",
          position: "relative",
          zIndex: 2,
          overflow: "hidden",
        }}
      >
        {/* Header Pastel */}
        <div
          style={{
            padding: "16px 24px",
            background: "linear-gradient(to right, #bbf7d0, #fef9c3)", // xanh pastel → vàng pastel
            borderBottom: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <h1 className="text-xl font-bold text-emerald-800">
            🛍️ Đơn hàng của bạn
          </h1>
          <div className="text-sm text-emerald-900/70">
            Quản lý và theo dõi trạng thái đơn hàng dễ dàng.
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {loading && <p>Đang tải danh sách đơn hàng...</p>}
          {!loading && err && (
            <p className="text-red-600 font-medium">{err}</p>
          )}

          {!loading && !err && orders.length > 0 && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Ngày đặt</th>
                    <th className="px-4 py-3">Tổng tiền</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id || o.code}
                      className="border-t hover:bg-emerald-50/60 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-emerald-800">
                        {o.code || `#${o.id}`}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {(o.created_at || o.createdAt || "")
                          .slice(0, 19)
                          .replace("T", " ")}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {formatVND(o.total_price ?? o.total ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          style={{
                            background:
                              o.status === "pending"
                                ? "#fef3c7"
                                : o.status === "shipping"
                                ? "#dbeafe"
                                : o.status === "delivered"
                                ? "#bbf7d0"
                                : "#f3f4f6",
                            color:
                              o.status === "pending"
                                ? "#92400e"
                                : o.status === "shipping"
                                ? "#1e3a8a"
                                : o.status === "delivered"
                                ? "#065f46"
                                : "#374151",
                            padding: "3px 10px",
                            borderRadius: "8px",
                            fontWeight: 600,
                          }}
                        >
                          {o.status_label ||
                            o.status ||
                            "Chờ xử lý"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toTrack(o)}
                          style={{
                            background: "#bbf7d0",
                            color: "#065f46",
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontWeight: 600,
                            transition: "0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.background = "#86efac")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.background = "#bbf7d0")
                          }
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==== Icon nền pastel táo ==== */
function AppleBackground() {
  const apples = [
    { top: "20%", left: "10%" },
    { top: "70%", left: "15%" },
    { top: "40%", left: "80%" },
    { top: "80%", left: "70%" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      {apples.map((pos, i) => (
        <img
          key={i}
          src="https://cdn-icons-png.flaticon.com/512/415/415682.png"
          alt="apple"
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: 40,
            opacity: 0.08,
          }}
        />
      ))}
    </div>
  );
}
