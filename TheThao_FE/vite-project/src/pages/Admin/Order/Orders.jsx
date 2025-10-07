// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const API_BASE = "http://127.0.0.1:8000/api";
// const VND = new Intl.NumberFormat("vi-VN");

// const badgeStyle = (status) => {
//   const ok = status === 1 || status === "Completed";
//   return {
//     display: "inline-block",
//     padding: "2px 8px",
//     borderRadius: 999,
//     background: ok ? "#e7f9ee" : "#fff6e6",
//     color: ok ? "#0a7a3f" : "#a35b00",
//     fontSize: 12,
//     fontWeight: 600,
//   };
// };

// const humanStatus = (s) => {
//   if (typeof s === "string") return s;
//   switch (Number(s)) {
//     case 0: return "Pending";
//     case 1: return "Completed";
//     case 2: return "Cancelled";
//     default: return "Unknown";
//   }
// };

// export default function Orders() {
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     let ignore = false;

//     (async () => {
//       try {
//         setLoading(true);
//         setErr("");

//         const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
//         const url = `${API_BASE}/admin/orders?per_page=100${search ? `&search=${encodeURIComponent(search)}` : ""
//           }`;

//         const res = await fetch(url, {
//           headers: {
//             Accept: "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data = await res.json();
//         const list = Array.isArray(data) ? data : data?.data ?? [];
//         if (!ignore) setOrders(list);
//       } catch (e) {
//         if (!ignore) setErr("Không tải được danh sách đơn hàng.");
//         console.error(e);
//       } finally {
//         if (!ignore) setLoading(false);
//       }
//     })();

//     return () => { ignore = true; };
//   }, [search]);

//   return (
//     <section style={{ padding: 20 }}>
//       {/* Toolbar (giống Products) */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           gap: 10,
//         }}
//       >
//         <h1 style={{ fontSize: 24 }}>Quản lý đơn hàng</h1>

//         <div style={{ display: "flex", gap: 8 }}>
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Tìm theo mã đơn / tên / email / sđt"
//             style={{
//               height: 36,
//               padding: "0 10px",
//               border: "1px solid #ddd",
//               borderRadius: 8,
//               minWidth: 260,
//             }}
//           />
//           <button
//             onClick={() => setSearch("")}
//             style={{
//               padding: "8px 12px",
//               borderRadius: 8,
//               border: "1px solid #ccc",
//               background: "#fff",
//               cursor: "pointer",
//             }}
//           >
//             Xóa tìm
//           </button>
//         </div>
//       </div>

//       {/* States */}
//       {loading && <p>Đang tải dữ liệu…</p>}
//       {err && <p style={{ color: "red" }}>{err}</p>}

//       {/* Table (giống Products: khung trắng + overflowX) */}
//       {!loading && !err && (
//         <div style={{ overflowX: "auto", marginTop: 12 }}>
//           <table
//             width="100%"
//             cellPadding={8}
//             style={{ borderCollapse: "collapse", background: "#fff" }}
//           >
//             <thead>
//               <tr style={{ background: "#fafafa" }}>
//                 <th align="left">Order #</th>
//                 <th align="left">Khách hàng</th>
//                 <th align="left">Email</th>
//                 <th align="left">SĐT</th>
//                 <th align="right">Tổng tiền</th>
//                 <th align="left">Trạng thái</th>
//                 <th align="center">Hành động</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((o) => (
//                 <tr key={o.id} style={{ borderTop: "1px solid #eee" }}>
//                   <td>{o.id}</td>
//                   <td>{o.name}</td>
//                   <td>{o.email}</td>
//                   <td>{o.phone}</td>
//                   <td align="right">₫{VND.format(Number(o.total ?? 0))}</td>
//                   <td>
//                     <span style={badgeStyle(o.status)}>{humanStatus(o.status)}</span>
//                   </td>
//                   <td align="center">
//                     <button
//                       onClick={() => navigate(`/admin/orders/${o.id}`)}
//                       style={{
//                         padding: "4px 10px",
//                         background: "#0f62fe",      // màu xanh giống nút +Add của Products
//                         color: "#fff",
//                         border: 0,
//                         borderRadius: 6,
//                         cursor: "pointer",
//                       }}
//                     >
//                       Xem
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {orders.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={7}
//                     align="center"
//                     style={{ color: "#666", padding: 16 }}
//                   >
//                     Không có đơn hàng.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </section>
//   );
// }



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";
const VND = new Intl.NumberFormat("vi-VN");

const STATUS_COLORS = {
  pending: { bg: "#fff8e1", color: "#b26a00" },
  confirmed: { bg: "#e3f2fd", color: "#1565c0" },
  ready: { bg: "#e8f5e9", color: "#2e7d32" },
  shipping: { bg: "#e0f7fa", color: "#00796b" },
  delivered: { bg: "#e8f5e9", color: "#1b5e20" },
  canceled: { bg: "#ffebee", color: "#c62828" },
};

const humanStatus = (key) => {
  const map = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    ready: "Chờ giao hàng",
    shipping: "Đang giao",
    delivered: "Giao thành công",
    canceled: "Đã hủy",
  };
  return map[key] || key;
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOrders();
  }, [search]);

  async function loadOrders() {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("admin_token") || localStorage.getItem("token");
      const url = `${API_BASE}/admin/orders?per_page=100${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setOrders(list);
    } catch (e) {
      console.error(e);
      setErr("Không tải được danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Cập nhật trạng thái đơn #${id} thành "${humanStatus(newStatus)}"?`))
      return;

    try {
      const token = localStorage.getItem("admin_token") || "";
      const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status} - ${t}`);
      }

      const updated = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: updated.data.status } : o))
      );
      alert("✅ Cập nhật trạng thái thành công!");
    } catch (e) {
      console.error(e);
      alert("❌ Lỗi khi cập nhật trạng thái đơn hàng!");
    }
  };

  return (
    <section style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <h1 style={{ fontSize: 24 }}>Quản lý đơn hàng</h1>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn / tên / email / sđt"
            style={{
              height: 36,
              padding: "0 10px",
              border: "1px solid #ddd",
              borderRadius: 8,
              minWidth: 260,
            }}
          />
          <button
            onClick={() => setSearch("")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Xóa tìm
          </button>
        </div>
      </div>

      {loading && <p>Đang tải dữ liệu…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

      {!loading && !err && (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table
            width="100%"
            cellPadding={8}
            style={{ borderCollapse: "collapse", background: "#fff" }}
          >
            <thead>
              <tr style={{ background: "#f5f6fa" }}>
                <th align="left">Mã đơn</th>
                <th align="left">Khách hàng</th>
                <th align="left">Email</th>
                <th align="left">SĐT</th>
                <th align="right">Tổng tiền</th>
                <th align="left">Trạng thái</th>
                <th align="center">Cập nhật</th>
                <th align="center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const sColor = STATUS_COLORS[o.status] || {};
                return (
                  <tr key={o.id} style={{ borderTop: "1px solid #eee" }}>
                    <td>#{o.id}</td>
                    <td>{o.name}</td>
                    <td>{o.email}</td>
                    <td>{o.phone}</td>
                    <td align="right">₫{VND.format(Number(o.total ?? 0))}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: sColor.bg,
                          color: sColor.color,
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {humanStatus(o.status)}
                      </span>
                    </td>
                    <td align="center">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          handleStatusChange(o.id, e.target.value)
                        }
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                        }}
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="ready">Chờ giao hàng</option>
                        <option value="shipping">Đang giao</option>
                        <option value="delivered">Giao thành công</option>
                        <option value="canceled">Đã hủy</option>
                      </select>
                    </td>
                    <td align="center">
                      <button
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                        style={{
                          padding: "4px 10px",
                          background: "#0f62fe",
                          color: "#fff",
                          border: 0,
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} align="center" style={{ color: "#666" }}>
                    Không có đơn hàng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
