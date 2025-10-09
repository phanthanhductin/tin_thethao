// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const API_ROOT = "http://127.0.0.1:8000";       // không có /api
// const API_BASE = `${API_ROOT}/api`;             // có /api
// const PLACEHOLDER = "https://placehold.co/120x90?text=No+Img";

// // 👉 URL tổng hợp tồn kho theo IDs (ưu tiên DB)
// const STOCK_SUMMARY_URL = (ids) =>
//   `${API_BASE}/admin/stock/summary?product_ids=${ids.join(",")}`;

// /** Helper: trích đúng object paginator dù BE trả trực tiếp hay bọc trong {data: {...}} */
// function pickPaginator(payload) {
//   // Case A: trực tiếp { data:[], current_page,... }
//   if (payload && Array.isArray(payload.data) && typeof payload.current_page !== "undefined") {
//     return payload;
//   }
//   // Case B: bọc { message, data: { data:[], current_page,... } }
//   if (payload && payload.data && Array.isArray(payload.data.data) && typeof payload.data.current_page !== "undefined") {
//     return payload.data;
//   }
//   // Case C: bản thân payload là mảng (không phải paginate) -> quy về list trống meta 1/1
//   if (Array.isArray(payload)) {
//     return { data: payload, current_page: 1, last_page: 1, total: payload.length, per_page: payload.length || 10 };
//   }
//   // Fallback
//   return { data: [], current_page: 1, last_page: 1, total: 0, per_page: 10 };
// }

// export default function Products() {
//   const [items, setItems] = useState([]);     // danh sách sản phẩm (trang hiện tại)
//   const [stocks, setStocks] = useState({});   // map { [productId]: qty }
//   const [q, setQ] = useState("");             // lọc cục bộ theo tên/slug (trang hiện tại)
//   const [loading, setLoading] = useState(true);
//   const [stockLoading, setStockLoading] = useState(false);
//   const [err, setErr] = useState("");
//   const [deletingId, setDeletingId] = useState(null);
//   const [selected, setSelected] = useState([]);
//   const [viewItem, setViewItem] = useState(null);

//   // 🔢 Phân trang
//   const [page, setPage] = useState(1);
//   const [perPage, setPerPage] = useState(10);
//   const [meta, setMeta] = useState({
//     current_page: 1,
//     last_page: 1,
//     total: 0,
//     per_page: 10,
//   });

//   const navigate = useNavigate();

//   // ===== Load danh sách sản phẩm theo trang =====
//   useEffect(() => {
//     const ac = new AbortController();
//     const token = localStorage.getItem("admin_token");

//     (async () => {
//       try {
//         setLoading(true);
//         setErr("");

//         const url = `${API_BASE}/admin/products?page=${page}&per_page=${perPage}`;
//         const res = await fetch(url, {
//           signal: ac.signal,
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const raw = await res.json();

//         // ✅ Bắt đúng paginator
//         const pg = pickPaginator(raw);
//         const list = pg.data ?? [];
//         setItems(Array.isArray(list) ? list : []);

//         // Lưu meta phân trang
//         setMeta({
//           current_page: Number(pg.current_page ?? page),
//           last_page: Number(pg.last_page ?? 1),
//           total: Number(pg.total ?? (Array.isArray(list) ? list.length : 0)),
//           per_page: Number(pg.per_page ?? perPage),
//         });

//         // reset lựa chọn khi đổi trang
//         setSelected([]);

//         // ===== Sau khi có product ids -> gọi tổng hợp tồn kho từ DB =====
//         const ids = (Array.isArray(list) ? list : []).map((x) => x.id).filter(Boolean);
//         if (ids.length) {
//           try {
//             setStockLoading(true);
//             const res2 = await fetch(STOCK_SUMMARY_URL(ids), {
//               signal: ac.signal,
//               headers: {
//                 Accept: "application/json",
//                 Authorization: `Bearer ${token}`,
//               },
//             });
//             if (res2.ok) {
//               const sum = await res2.json();
//               const map = sum?.data ?? {};
//               setStocks(map);
//             }
//           } catch {
//             // fallback
//           } finally {
//             setStockLoading(false);
//           }
//         } else {
//           setStocks({});
//         }
//       } catch (e) {
//         if (e.name !== "AbortError") setErr("Không tải được danh sách sản phẩm.");
//         setItems([]);
//         setMeta({ current_page: 1, last_page: 1, total: 0, per_page: perPage });
//       } finally {
//         setLoading(false);
//       }
//     })();

//     return () => ac.abort();
//   }, [page, perPage]);

//   // ===== Helper tồn kho =====
//   const getQty = (p) => {
//     const id = p?.id;
//     if (id != null && Object.prototype.hasOwnProperty.call(stocks, id))
//       return Number(stocks[id] ?? 0);
//     return Number(p?.qty ?? 0);
//   };

//   // ===== Xoá sản phẩm =====
//   async function handleDelete(id) {
//     const token = localStorage.getItem("admin_token");
//     if (!window.confirm("Bạn chắc chắn muốn xoá sản phẩm này?")) return;
//     try {
//       setDeletingId(id);
//       const res = await fetch(`${API_BASE}/admin/products/${id}`, {
//         method: "DELETE",
//         headers: {
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(data.message || "Xoá thất bại");

//       // Cập nhật danh sách trang hiện tại (xóa item)
//       setItems((prev) => prev.filter((x) => x.id !== id));
//       setStocks((prev) => {
//         const n = { ...prev };
//         delete n[id];
//         return n;
//       });
//       alert("✅ Đã chuyển sản phẩm vào thùng rác");
//     } catch (err) {
//       console.error(err);
//       alert(`❌ Lỗi xoá: ${err.message}`);
//     } finally {
//       setDeletingId(null);
//     }
//   }

//   async function handleBulkDelete() {
//     if (!selected.length) return alert("Chưa chọn sản phẩm nào");
//     if (!window.confirm(`Xoá ${selected.length} sản phẩm?`)) return;
//     for (const id of selected) await handleDelete(id);
//     setSelected([]);
//   }

//   // ===== Lọc cục bộ theo tên/slug (trên TRANG hiện tại) =====
//   const filtered = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!s) return items;
//     return items.filter(
//       (x) =>
//         x.name?.toLowerCase().includes(s) ||
//         x.slug?.toLowerCase().includes(s)
//     );
//   }, [q, items]);

//   const toggleSelect = (id) =>
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );

//   const allChecked =
//     filtered.length > 0 && selected.length === filtered.length;

//   const toggleAll = () =>
//     setSelected(allChecked ? [] : filtered.map((x) => x.id));

//   // ===== Pagination helpers =====
//   const canPrev = meta.current_page > 1;
//   const canNext = meta.current_page < meta.last_page;

//   const gotoPage = (p) => {
//     if (p < 1 || p > meta.last_page || p === meta.current_page) return;
//     setPage(p);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const buildPageNumbers = () => {
//     const total = meta.last_page;
//     const cur = meta.current_page;
//     const delta = 1; // hiển thị xung quanh trang hiện tại
//     const pages = new Set([1, total]);

//     for (let i = cur - delta; i <= cur + delta; i++) {
//       if (i >= 1 && i <= total) pages.add(i);
//     }
//     if (total >= 2) {
//       pages.add(2);
//       pages.add(total - 1);
//     }
//     return Array.from(pages).sort((a, b) => a - b);
//   };

//   const pages = buildPageNumbers();

//   // ===== Render =====
//   return (
//     <section style={{ padding: 20 }}>
//       {/* Thanh tiêu đề */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           gap: 10,
//           flexWrap: "wrap",
//         }}
//       >
//         <h1 style={{ fontSize: 24, fontWeight: 700 }}>
//           Quản lý sản phẩm {stockLoading ? "· đang tải tồn kho…" : ""}
//         </h1>

//         <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Tìm tên/slug… (trang hiện tại)"
//             style={{
//               height: 36,
//               padding: "0 10px",
//               border: "1px solid #ddd",
//               borderRadius: 8,
//             }}
//           />

//           {/* chọn số dòng / trang */}
//           <select
//             value={perPage}
//             onChange={(e) => {
//               setPerPage(Number(e.target.value));
//               setPage(1); // quay về trang 1 khi đổi perPage
//             }}
//             style={{ height: 36, borderRadius: 8, border: "1px solid #ddd" }}
//             title="Số dòng mỗi trang"
//           >
//             {[5, 10, 20, 30, 50, 100].map((n) => (
//               <option key={n} value={n}>
//                 {n}/trang
//               </option>
//             ))}
//           </select>

//           <button
//             onClick={() => navigate("/admin/products/add")}
//             style={{
//               padding: "8px 12px",
//               borderRadius: 8,
//               border: "1px solid #0f62fe",
//               background: "#0f62fe",
//               color: "#fff",
//               cursor: "pointer",
//             }}
//           >
//             + Add
//           </button>
//           <button
//             onClick={handleBulkDelete}
//             disabled={!selected.length}
//             style={{
//               padding: "8px 12px",
//               borderRadius: 8,
//               border: "1px solid #e11d48",
//               background: selected.length ? "#e11d48" : "#fca5a5",
//               color: "#fff",
//               cursor: selected.length ? "pointer" : "not-allowed",
//             }}
//           >
//             🗑 Xoá chọn ({selected.length})
//           </button>
//           <button
//             onClick={() => navigate("/admin/products/trash")}
//             style={{
//               padding: "8px 12px",
//               borderRadius: 8,
//               border: "1px solid #6b7280",
//               background: "#6b7280",
//               color: "#fff",
//               cursor: "pointer",
//             }}
//           >
//             🗂 Thùng rác
//           </button>
//         </div>
//       </div>

//       {/* Bảng sản phẩm */}
//       {loading && <p>Đang tải dữ liệu…</p>}
//       {err && <p style={{ color: "red" }}>{err}</p>}

//       {!loading && (
//         <>
//           <div style={{ overflowX: "auto", marginTop: 12 }}>
//             <table
//               width="100%"
//               cellPadding={8}
//               style={{
//                 borderCollapse: "collapse",
//                 background: "#fff",
//                 borderRadius: 8,
//               }}
//             >
//               <thead>
//                 <tr style={{ background: "#fafafa" }}>
//                   <th>
//                     <input
//                       type="checkbox"
//                       checked={allChecked}
//                       onChange={toggleAll}
//                     />
//                   </th>
//                   <th align="left">ID</th>
//                   <th align="left">Tên</th>
//                   <th align="left">Slug</th>
//                   <th align="right">Giá gốc</th>
//                   <th align="right">Giá sale</th>
//                   <th align="right">Tồn kho (DB)</th>
//                   <th align="center">Ảnh</th>
//                   <th align="center">Hành động</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((p) => (
//                   <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
//                     <td>
//                       <input
//                         type="checkbox"
//                         checked={selected.includes(p.id)}
//                         onChange={() => toggleSelect(p.id)}
//                       />
//                     </td>
//                     <td>{p.id}</td>
//                     <td>{p.name}</td>
//                     <td>{p.slug}</td>
//                     <td align="right">
//                       ₫{(p.price_root || 0).toLocaleString("vi-VN")}
//                     </td>
//                     <td align="right">
//                       ₫{(p.price_sale || 0).toLocaleString("vi-VN")}
//                     </td>
//                     <td align="right">{getQty(p).toLocaleString("vi-VN")}</td>
//                     <td align="center">
//                       <img
//                         src={p.thumbnail_url || PLACEHOLDER}
//                         alt={p.name}
//                         style={{
//                           width: 60,
//                           height: 40,
//                           objectFit: "cover",
//                           borderRadius: 4,
//                         }}
//                         onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
//                       />
//                     </td>
//                     <td align="center">
//                       <button
//                         onClick={() => setViewItem(p)}
//                         style={{
//                           padding: "4px 10px",
//                           marginRight: 4,
//                           background: "#2563eb",
//                           color: "#fff",
//                           border: 0,
//                           borderRadius: 6,
//                           cursor: "pointer",
//                         }}
//                       >
//                         👁 Xem
//                       </button>
//                       <button
//                         onClick={() => navigate(`/admin/products/edit/${p.id}`)}
//                         style={{
//                           padding: "4px 10px",
//                           marginRight: 4,
//                           background: "#2e7d32",
//                           color: "#fff",
//                           border: 0,
//                           borderRadius: 6,
//                           cursor: "pointer",
//                         }}
//                       >
//                         ✏️ Sửa
//                       </button>
//                       <button
//                         onClick={() => handleDelete(p.id)}
//                         disabled={deletingId === p.id}
//                         style={{
//                           padding: "4px 10px",
//                           background:
//                             deletingId === p.id ? "#ef9a9a" : "#c62828",
//                           color: "#fff",
//                           border: 0,
//                           borderRadius: 6,
//                           cursor:
//                             deletingId === p.id ? "not-allowed" : "pointer",
//                         }}
//                       >
//                         {deletingId === p.id ? "Đang xoá..." : "🗑 Xóa"}
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {!filtered.length && (
//                   <tr>
//                     <td
//                       colSpan={9}
//                       align="center"
//                       style={{ padding: 18, color: "#777" }}
//                     >
//                       Không có dữ liệu
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Thanh phân trang */}
//           <div
//             style={{
//               marginTop: 12,
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               flexWrap: "wrap",
//               gap: 10,
//             }}
//           >
//             <div style={{ color: "#555" }}>
//               Tổng: <b>{Number(meta.total).toLocaleString("vi-VN")}</b> — Trang{" "}
//               <b>{meta.current_page}</b>/<b>{meta.last_page}</b>
//             </div>

//             <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
//               <button
//                 onClick={() => gotoPage(1)}
//                 disabled={!canPrev}
//                 style={btnPager(!canPrev)}
//               >
//                 « Đầu
//               </button>
//               <button
//                 onClick={() => gotoPage(meta.current_page - 1)}
//                 disabled={!canPrev}
//                 style={btnPager(!canPrev)}
//               >
//                 ‹ Trước
//               </button>

//               {pages.map((p, idx) => {
//                 const prev = pages[idx - 1];
//                 const needDots = prev && p - prev > 1;
//                 return (
//                   <span key={p} style={{ display: "inline-flex", gap: 6 }}>
//                     {needDots && <span style={{ padding: "6px 8px" }}>…</span>}
//                     <button
//                       onClick={() => gotoPage(p)}
//                       disabled={p === meta.current_page}
//                       style={btnNumber(p === meta.current_page)}
//                       title={`Trang ${p}`}
//                     >
//                       {p}
//                     </button>
//                   </span>
//                 );
//               })}

//               <button
//                 onClick={() => gotoPage(meta.current_page + 1)}
//                 disabled={!canNext}
//                 style={btnPager(!canNext)}
//               >
//                 Sau ›
//               </button>
//               <button
//                 onClick={() => gotoPage(meta.last_page)}
//                 disabled={!canNext}
//                 style={btnPager(!canNext)}
//               >
//                 Cuối »
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Modal xem chi tiết */}
//       {viewItem && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             background: "rgba(0,0,0,0.5)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000,
//           }}
//           onClick={() => setViewItem(null)}
//         >
//           <div
//             style={{
//               background: "#fff",
//               borderRadius: 10,
//               padding: 20,
//               width: 550,
//               maxHeight: "90vh",
//               overflowY: "auto",
//               boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <h2 style={{ fontSize: 20, marginBottom: 10, fontWeight: 700 }}>
//               🏷 {viewItem.name}
//             </h2>

//             <div style={{ textAlign: "center", marginBottom: 10 }}>
//               <img
//                 src={viewItem.thumbnail_url || PLACEHOLDER}
//                 alt={viewItem.name}
//                 style={{
//                   width: 200,
//                   height: 150,
//                   objectFit: "cover",
//                   borderRadius: 6,
//                   boxShadow: "0 0 6px rgba(0,0,0,0.2)",
//                 }}
//                 onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
//               />
//             </div>

//             <p><b>Slug:</b> {viewItem.slug}</p>
//             <p>
//               <b>Giá:</b> ₫{Number(viewItem.price_sale ?? 0).toLocaleString("vi-VN")}{" "}
//               <span style={{ color: "#888" }}>
//                 (Gốc: ₫{Number(viewItem.price_root ?? 0).toLocaleString("vi-VN")})
//               </span>
//             </p>
//             <p><b>Tồn kho (DB):</b> {getQty(viewItem).toLocaleString("vi-VN")}</p>
//             <p><b>Trạng thái:</b> {viewItem.status}</p>

//             <div style={{ marginTop: 10 }}>
//               <p><b>Mô tả:</b></p>
//               <div
//                 dangerouslySetInnerHTML={{
//                   __html:
//                     viewItem.description?.trim()
//                       ? viewItem.description
//                       : "<em>Không có mô tả</em>",
//                 }}
//                 style={{
//                   color: "#333",
//                   lineHeight: "1.6",
//                   background: "#f8fafc",
//                   padding: "8px 10px",
//                   borderRadius: 6,
//                 }}
//               />
//             </div>

//             <div style={{ marginTop: 10 }}>
//               <p><b>Chi tiết:</b></p>
//               <div
//                 dangerouslySetInnerHTML={{
//                   __html:
//                     viewItem.detail?.trim()
//                       ? viewItem.detail
//                       : "<em>Không có chi tiết</em>",
//                 }}
//                 style={{
//                   color: "#333",
//                   lineHeight: "1.6",
//                   background: "#f8fafc",
//                   padding: "8px 10px",
//                   borderRadius: 6,
//                 }}
//               />
//             </div>

//             <div style={{ textAlign: "right", marginTop: 20 }}>
//               <button
//                 onClick={() => setViewItem(null)}
//                 style={{
//                   padding: "8px 16px",
//                   background: "#0f62fe",
//                   color: "#fff",
//                   border: 0,
//                   borderRadius: 6,
//                   cursor: "pointer",
//                 }}
//               >
//                 Đóng
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }

// // ===== Styles helper cho nút phân trang =====
// function btnPager(disabled) {
//   return {
//     padding: "6px 10px",
//     borderRadius: 8,
//     border: "1px solid #ddd",
//     background: disabled ? "#f3f4f6" : "#fff",
//     color: disabled ? "#9ca3af" : "#111",
//     cursor: disabled ? "not-allowed" : "pointer",
//   };
// }
// function btnNumber(active) {
//   return {
//     padding: "6px 10px",
//     borderRadius: 8,
//     border: active ? "1px solid #2563eb" : "1px solid #ddd",
//     background: active ? "#2563eb" : "#fff",
//     color: active ? "#fff" : "#111",
//     cursor: active ? "default" : "pointer",
//     minWidth: 40,
//   };
// }


import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_ROOT = "http://127.0.0.1:8000";       // không có /api
const API_BASE = `${API_ROOT}/api`;             // có /api
const PLACEHOLDER = "https://placehold.co/120x90?text=No+Img";

// 👉 URL tổng hợp tồn kho theo IDs (ưu tiên DB)
const STOCK_SUMMARY_URL = (ids) =>
  `${API_BASE}/admin/stock/summary?product_ids=${ids.join(",")}`;

/** Helper: trích đúng object paginator dù BE trả trực tiếp hay bọc trong {data: {...}} */
function pickPaginator(payload) {
  // Case A: trực tiếp { data:[], current_page,... }
  if (payload && Array.isArray(payload.data) && typeof payload.current_page !== "undefined") {
    return payload;
  }
  // Case B: bọc { message, data: { data:[], current_page,... } }
  if (payload && payload.data && Array.isArray(payload.data.data) && typeof payload.data.current_page !== "undefined") {
    return payload.data;
  }
  // Case C: payload là mảng -> chuẩn hóa
  if (Array.isArray(payload)) {
    return { data: payload, current_page: 1, last_page: 1, total: payload.length, per_page: payload.length || 10 };
  }
  return { data: [], current_page: 1, last_page: 1, total: 0, per_page: 10 };
}

/** ✅ Helper: trả URL ảnh ưu tiên thumbnail_url, fallback /storage/<thumbnail> */
const getThumbUrl = (p) =>
  p?.thumbnail_url ||
  (p?.thumbnail ? `${API_ROOT}/storage/${p.thumbnail}` : PLACEHOLDER);

export default function Products() {
  const [items, setItems] = useState([]);     // danh sách sản phẩm (trang hiện tại)
  const [stocks, setStocks] = useState({});   // map { [productId]: qty }
  const [q, setQ] = useState("");             // lọc cục bộ theo tên/slug (trang hiện tại)
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [viewItem, setViewItem] = useState(null);

  // 🔢 Phân trang
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });

  const navigate = useNavigate();

  // ===== Load danh sách sản phẩm theo trang =====
  useEffect(() => {
    const ac = new AbortController();
    const token = localStorage.getItem("admin_token");

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const url = `${API_BASE}/admin/products?page=${page}&per_page=${perPage}`;
        const res = await fetch(url, {
          signal: ac.signal,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();

        // ✅ Bắt đúng paginator
        const pg = pickPaginator(raw);
        const list = pg.data ?? [];
        setItems(Array.isArray(list) ? list : []);

        // Lưu meta phân trang
        setMeta({
          current_page: Number(pg.current_page ?? page),
          last_page: Number(pg.last_page ?? 1),
          total: Number(pg.total ?? (Array.isArray(list) ? list.length : 0)),
          per_page: Number(pg.per_page ?? perPage),
        });

        // reset lựa chọn khi đổi trang
        setSelected([]);

        // ===== Sau khi có product ids -> gọi tổng hợp tồn kho từ DB =====
        const ids = (Array.isArray(list) ? list : []).map((x) => x.id).filter(Boolean);
        if (ids.length) {
          try {
            setStockLoading(true);
            const res2 = await fetch(STOCK_SUMMARY_URL(ids), {
              signal: ac.signal,
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            if (res2.ok) {
              const sum = await res2.json();
              const map = sum?.data ?? {};
              setStocks(map);
            }
          } catch {
            // fallback
          } finally {
            setStockLoading(false);
          }
        } else {
          setStocks({});
        }
      } catch (e) {
        if (e.name !== "AbortError") setErr("Không tải được danh sách sản phẩm.");
        setItems([]);
        setMeta({ current_page: 1, last_page: 1, total: 0, per_page: perPage });
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [page, perPage]);

  // ===== Helper tồn kho =====
  const getQty = (p) => {
    const id = p?.id;
    if (id != null && Object.prototype.hasOwnProperty.call(stocks, id))
      return Number(stocks[id] ?? 0);
    return Number(p?.qty ?? 0);
  };

  // ===== Xoá sản phẩm =====
  async function handleDelete(id) {
    const token = localStorage.getItem("admin_token");
    if (!window.confirm("Bạn chắc chắn muốn xoá sản phẩm này?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Xoá thất bại");

      // Cập nhật danh sách trang hiện tại (xóa item)
      setItems((prev) => prev.filter((x) => x.id !== id));
      setStocks((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      alert("✅ Đã chuyển sản phẩm vào thùng rác");
    } catch (err) {
      console.error(err);
      alert(`❌ Lỗi xoá: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkDelete() {
    if (!selected.length) return alert("Chưa chọn sản phẩm nào");
    if (!window.confirm(`Xoá ${selected.length} sản phẩm?`)) return;
    for (const id of selected) await handleDelete(id);
    setSelected([]);
  }

  // ===== Lọc cục bộ theo tên/slug (trên TRANG hiện tại) =====
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (x) =>
        x.name?.toLowerCase().includes(s) ||
        x.slug?.toLowerCase().includes(s)
    );
  }, [q, items]);

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const allChecked =
    filtered.length > 0 && selected.length === filtered.length;

  const toggleAll = () =>
    setSelected(allChecked ? [] : filtered.map((x) => x.id));

  // ===== Pagination helpers =====
  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.last_page;

  const gotoPage = (p) => {
    if (p < 1 || p > meta.last_page || p === meta.current_page) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPageNumbers = () => {
    const total = meta.last_page;
    const cur = meta.current_page;
    const delta = 1; // hiển thị xung quanh trang hiện tại
    const pages = new Set([1, total]);

    for (let i = cur - delta; i <= cur + delta; i++) {
      if (i >= 1 && i <= total) pages.add(i);
    }
    if (total >= 2) {
      pages.add(2);
      pages.add(total - 1);
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const pages = buildPageNumbers();

  // ===== Render =====
  return (
    <section style={{ padding: 20 }}>
      {/* Thanh tiêu đề */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>
          Quản lý sản phẩm {stockLoading ? "· đang tải tồn kho…" : ""}
        </h1>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên/slug… (trang hiện tại)"
            style={{
              height: 36,
              padding: "0 10px",
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          />

          {/* chọn số dòng / trang */}
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1); // quay về trang 1 khi đổi perPage
            }}
            style={{ height: 36, borderRadius: 8, border: "1px solid #ddd" }}
            title="Số dòng mỗi trang"
          >
            {[5, 10, 20, 30, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}/trang
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate("/admin/products/add")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #0f62fe",
              background: "#0f62fe",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            + Add
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={!selected.length}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e11d48",
              background: selected.length ? "#e11d48" : "#fca5a5",
              color: "#fff",
              cursor: selected.length ? "pointer" : "not-allowed",
            }}
          >
            🗑 Xoá chọn ({selected.length})
          </button>
          <button
            onClick={() => navigate("/admin/products/trash")}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #6b7280",
              background: "#6b7280",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            🗂 Thùng rác
          </button>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      {loading && <p>Đang tải dữ liệu…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}

      {!loading && (
        <>
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table
              width="100%"
              cellPadding={8}
              style={{
                borderCollapse: "collapse",
                background: "#fff",
                borderRadius: 8,
              }}
            >
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                    />
                  </th>
                  <th align="left">ID</th>
                  <th align="left">Tên</th>
                  <th align="left">Slug</th>
                  <th align="right">Giá gốc</th>
                  <th align="right">Giá sale</th>
                  <th align="right">Tồn kho (DB)</th>
                  <th align="center">Ảnh</th>
                  <th align="center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.slug}</td>
                    <td align="right">
                      ₫{(p.price_root || 0).toLocaleString("vi-VN")}
                    </td>
                    <td align="right">
                      ₫{(p.price_sale || 0).toLocaleString("vi-VN")}
                    </td>
                    <td align="right">{getQty(p).toLocaleString("vi-VN")}</td>
                    <td align="center">
                      <img
                        src={getThumbUrl(p)}
                        alt={p.name}
                        style={{
                          width: 60,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                      />
                    </td>
                    <td align="center">
                      <button
                        onClick={() => setViewItem(p)}
                        style={{
                          padding: "4px 10px",
                          marginRight: 4,
                          background: "#2563eb",
                          color: "#fff",
                          border: 0,
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        👁 Xem
                      </button>
                      <button
                        onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                        style={{
                          padding: "4px 10px",
                          marginRight: 4,
                          background: "#2e7d32",
                          color: "#fff",
                          border: 0,
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        style={{
                          padding: "4px 10px",
                          background:
                            deletingId === p.id ? "#ef9a9a" : "#c62828",
                          color: "#fff",
                          border: 0,
                          borderRadius: 6,
                          cursor:
                            deletingId === p.id ? "not-allowed" : "pointer",
                        }}
                      >
                        {deletingId === p.id ? "Đang xoá..." : "🗑 Xóa"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td
                      colSpan={9}
                      align="center"
                      style={{ padding: 18, color: "#777" }}
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Thanh phân trang */}
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ color: "#555" }}>
              Tổng: <b>{Number(meta.total).toLocaleString("vi-VN")}</b> — Trang{" "}
              <b>{meta.current_page}</b>/<b>{meta.last_page}</b>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => gotoPage(1)} disabled={!canPrev} style={btnPager(!canPrev)}>
                « Đầu
              </button>
              <button
                onClick={() => gotoPage(meta.current_page - 1)}
                disabled={!canPrev}
                style={btnPager(!canPrev)}
              >
                ‹ Trước
              </button>

              {pages.map((p, idx) => {
                const prev = pages[idx - 1];
                const needDots = prev && p - prev > 1;
                return (
                  <span key={p} style={{ display: "inline-flex", gap: 6 }}>
                    {needDots && <span style={{ padding: "6px 8px" }}>…</span>}
                    <button
                      onClick={() => gotoPage(p)}
                      disabled={p === meta.current_page}
                      style={btnNumber(p === meta.current_page)}
                      title={`Trang ${p}`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

              <button
                onClick={() => gotoPage(meta.current_page + 1)}
                disabled={!canNext}
                style={btnPager(!canNext)}
              >
                Sau ›
              </button>
              <button
                onClick={() => gotoPage(meta.last_page)}
                disabled={!canNext}
                style={btnPager(!canNext)}
              >
                Cuối »
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal xem chi tiết */}
      {viewItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setViewItem(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 20,
              width: 550,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 20, marginBottom: 10, fontWeight: 700 }}>
              🏷 {viewItem.name}
            </h2>

            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <img
                src={getThumbUrl(viewItem)}
                alt={viewItem.name}
                style={{
                  width: 200,
                  height: 150,
                  objectFit: "cover",
                  borderRadius: 6,
                  boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                }}
                onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
              />
            </div>

            <p><b>Slug:</b> {viewItem.slug}</p>
            <p>
              <b>Giá:</b> ₫{Number(viewItem.price_sale ?? 0).toLocaleString("vi-VN")}{" "}
              <span style={{ color: "#888" }}>
                (Gốc: ₫{Number(viewItem.price_root ?? 0).toLocaleString("vi-VN")})
              </span>
            </p>
            <p><b>Tồn kho (DB):</b> {getQty(viewItem).toLocaleString("vi-VN")}</p>
            <p><b>Trạng thái:</b> {viewItem.status}</p>

            <div style={{ marginTop: 10 }}>
              <p><b>Mô tả:</b></p>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    viewItem.description?.trim()
                      ? viewItem.description
                      : "<em>Không có mô tả</em>",
                }}
                style={{
                  color: "#333",
                  lineHeight: "1.6",
                  background: "#f8fafc",
                  padding: "8px 10px",
                  borderRadius: 6,
                }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <p><b>Chi tiết:</b></p>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    viewItem.detail?.trim()
                      ? viewItem.detail
                      : "<em>Không có chi tiết</em>",
                }}
                style={{
                  color: "#333",
                  lineHeight: "1.6",
                  background: "#f8fafc",
                  padding: "8px 10px",
                  borderRadius: 6,
                }}
              />
            </div>

            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button
                onClick={() => setViewItem(null)}
                style={{
                  padding: "8px 16px",
                  background: "#0f62fe",
                  color: "#fff",
                  border: 0,
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ===== Styles helper cho nút phân trang =====
function btnPager(disabled) {
  return {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: disabled ? "#f3f4f6" : "#fff",
    color: disabled ? "#9ca3af" : "#111",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
function btnNumber(active) {
  return {
    padding: "6px 10px",
    borderRadius: 8,
    border: active ? "1px solid #2563eb" : "1px solid #ddd",
    background: active ? "#2563eb" : "#fff",
    color: active ? "#fff" : "#111",
    cursor: active ? "default" : "pointer",
    minWidth: 40,
  };
}
