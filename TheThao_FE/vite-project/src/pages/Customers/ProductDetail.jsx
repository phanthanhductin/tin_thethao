// // src/pages/Customers/ProductDetail.jsx
// import { useEffect, useMemo, useState } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import HeartButton from "../../components/HeartButton";
// import ProductReviews from "../../components/ProductReviews";
// import ProductCardHome from "../../components/ProductCardHome";

// const API = "http://127.0.0.1:8000/api";
// const PLACEHOLDER = "https://placehold.co/400x300?text=No+Image";
// const VND = new Intl.NumberFormat("vi-VN");

// /* Gradient mềm (pastel) — đồng bộ với ProductCardHome */
// const SOFT_GRADIENT =
//   "linear-gradient(135deg, #a5b4fc 0%, #93c5fd 45%, #67e8f9 100%)";

// /* Map tên màu → mã màu (có cả tiếng Việt) */
// const COLOR_MAP = {
//   black: "#111111",
//   trắng: "#ffffff",
//   white: "#ffffff",
//   đen: "#111111",
//   đỏ: "#e53935",
//   "đỏ đô": "#8b0000",
//   cam: "#fb8c00",
//   orange: "#fb8c00",
//   vàng: "#fdd835",
//   yellow: "#fdd835",
//   xanh: "#1e88e5",
//   "xanh dương": "#1e88e5",
//   "xanh lá": "#43a047",
//   green: "#43a047",
//   blue: "#1e88e5",
//   hồng: "#ec407a",
//   tím: "#8e24aa",
//   xám: "#9e9e9e",
//   grey: "#9e9e9e",
// };

// // Chuyển text -> mã màu, hoặc trả null để hiển thị chip chữ
// function colorToHex(name = "") {
//   const raw = String(name).trim().toLowerCase();
//   if (!raw) return null;
//   if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;
//   return COLOR_MAP[raw] || null;
// }

// export default function ProductDetail({ addToCart }) {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [product, setProduct] = useState(null);
//   const [related, setRelated] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   // Biến thể + số lượng
//   const [selColor, setSelColor] = useState("");
//   const [selSize, setSelSize] = useState("");
//   const [qtyPick, setQtyPick] = useState(1);

//   useEffect(() => {
//     const ac = new AbortController();
//     (async () => {
//       try {
//         setLoading(true);
//         setErr("");

//         // 1) Chi tiết
//         const res = await fetch(`${API}/products/${id}`, { signal: ac.signal });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         setProduct(data);

//         // 2) Liên quan (theo category)
//         if (data?.category_id) {
//           const r = await fetch(
//             `${API}/categories/${data.category_id}/products`,
//             { signal: ac.signal }
//           );
//           if (r.ok) {
//             const all = await r.json();
//             const list = (Array.isArray(all) ? all : all?.data ?? [])
//               .filter((x) => x.id !== Number(id))
//               .slice(0, 8);
//             setRelated(list);
//           }
//         }
//       } catch (e) {
//         if (e.name !== "AbortError") setErr("Không tải được sản phẩm.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//     return () => ac.abort();
//   }, [id]);

//   const variants = product?.variants || [];

//   // Tập màu/size trong variants
//   const colors = useMemo(
//     () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))),
//     [variants]
//   );
//   const sizes = useMemo(
//     () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))),
//     [variants]
//   );

//   // helper stock
//   const inStockVariant = (v) =>
//     Number(v?.qty ?? 0) > 0 ||
//     String(v?.status).toLowerCase() === "active" ||
//     String(v?.status) === "1";

//   // Các size còn hàng theo màu đã chọn
//   const sizeOptionsForColor = useMemo(() => {
//     if (!selColor)
//       return new Set(
//         sizes.filter((s) => variants.some((v) => v.size === s && inStockVariant(v)))
//       );
//     return new Set(
//       variants
//         .filter((v) => v.color === selColor && inStockVariant(v))
//         .map((v) => v.size)
//         .filter(Boolean)
//     );
//   }, [selColor, sizes, variants]);

//   // Các màu còn hàng theo size đã chọn
//   const colorOptionsForSize = useMemo(() => {
//     if (!selSize)
//       return new Set(
//         colors.filter((c) => variants.some((v) => v.color === c && inStockVariant(v)))
//       );
//     return new Set(
//       variants
//         .filter((v) => v.size === selSize && inStockVariant(v))
//         .map((v) => v.color)
//         .filter(Boolean)
//     );
//   }, [selSize, colors, variants]);

//   // Biến thể đang khớp chọn
//   const activeVariant = useMemo(() => {
//     if (!variants.length) return null;
//     return (
//       variants.find(
//         (v) =>
//           (selColor ? v.color === selColor : true) &&
//           (selSize ? v.size === selSize : true)
//       ) || null
//     );
//   }, [variants, selColor, selSize]);

//   // Nếu đổi màu làm size hiện tại không hợp lệ -> reset size
//   useEffect(() => {
//     if (selColor && selSize && !sizeOptionsForColor.has(selSize)) {
//       setSelSize("");
//     }
//   }, [selColor, selSize, sizeOptionsForColor]);

//   // Nếu đổi size làm màu hiện tại không hợp lệ -> reset màu
//   useEffect(() => {
//     if (selSize && selColor && !colorOptionsForSize.has(selColor)) {
//       setSelColor("");
//     }
//   }, [selSize, selColor, colorOptionsForSize]);

//   if (loading) return <p style={{ padding: 20, color: "#2563eb" }}>Đang tải...</p>;
//   if (err) return <p style={{ padding: 20, color: "#ef4444" }}>{err}</p>;
//   if (!product) return <p style={{ padding: 20 }}>Sản phẩm không tồn tại.</p>;

//   // ====== GIÁ & GIẢM ======
//   const basePrice = Number(product.price_root ?? 0);
//   const salePrice = Number(product.price_sale ?? 0);
//   const effectiveBase = salePrice > 0 ? salePrice : basePrice;

//   const showPrice = activeVariant
//     ? Number(activeVariant.price_sale) > 0
//       ? Number(activeVariant.price_sale)
//       : Number(activeVariant.price_root) || effectiveBase
//     : effectiveBase;

//   let strikePrice = null;
//   let discountPct = 0;
//   if (
//     activeVariant &&
//     Number(activeVariant.price_sale) > 0 &&
//     Number(activeVariant.price_root) > 0 &&
//     Number(activeVariant.price_sale) < Number(activeVariant.price_root)
//   ) {
//     strikePrice = Number(activeVariant.price_root);
//     discountPct = Math.round(
//       100 - (Number(activeVariant.price_sale) / strikePrice) * 100
//     );
//   } else if (!activeVariant && salePrice > 0 && basePrice > 0 && salePrice < basePrice) {
//     strikePrice = basePrice;
//     discountPct = Math.round(100 - (salePrice / basePrice) * 100);
//   }

//   // ====== KHO ======
//   const productInStock =
//     Number(product.qty) > 0 ||
//     String(product.status).toLowerCase() === "active" ||
//     String(product.status) === "1";

//   const inStock = activeVariant ? inStockVariant(activeVariant) : productInStock;
//   const stockLeft = activeVariant ? Number(activeVariant.qty ?? 0) : Number(product.qty ?? 0);
//   const maxQtyPick = Math.max(1, stockLeft || 1);

//   const imgSrc = product.thumbnail_url || product.thumbnail || PLACEHOLDER;

//   const handleAddToCart = () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       alert("⚠️ Bạn cần đăng nhập trước khi thêm sản phẩm!");
//       navigate("/login", { state: { from: `/products/${id}` } });
//       return;
//     }
//     if (variants.length && !activeVariant) {
//       alert("Vui lòng chọn màu/size trước khi thêm giỏ!");
//       return;
//     }
//     if (typeof addToCart === "function") {
//       for (let i = 0; i < qtyPick; i++) {
//         addToCart({
//           ...product,
//           price: showPrice,
//           variant: activeVariant
//             ? { id: activeVariant.id, color: activeVariant.color, size: activeVariant.size }
//             : null,
//         });
//       }
//       alert(`🎉 Đã thêm ${qtyPick} vào giỏ hàng!`);
//     }
//   };

//   return (
//     <div
//       style={{
//         padding: "100px 20px 40px",
//         fontFamily: "Montserrat, Arial, sans-serif",
//         background: "#ffffff",
//         color: "#0f172a",
//       }}
//     >
//       <Link to="/products" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
//         ← Quay lại danh sách
//       </Link>

//       <div
//         style={{
//           display: "flex",
//           gap: 30,
//           marginTop: 22,
//           flexWrap: "wrap",
//           background: "#ffffff",
//           padding: 22,
//           borderRadius: 16,
//           border: "1px solid rgba(2,6,23,.08)",
//           boxShadow: "0 8px 24px rgba(2,6,23,.06)",
//           position: "relative",
//         }}
//       >
//         {/* Badge % giảm giá */}
//         {discountPct > 0 && (
//           <div
//             style={{
//               position: "absolute",
//               left: 14,
//               top: 14,
//               zIndex: 3,
//               background: "linear-gradient(135deg,#ff1744,#ff9100)",
//               color: "#fff",
//               fontWeight: 900,
//               padding: "6px 10px",
//               borderRadius: 12,
//               boxShadow: "0 4px 14px rgba(0,0,0,.15)",
//             }}
//           >
//             -{discountPct}%
//           </div>
//         )}

//         {/* ♥ */}
//         <div style={{ position: "absolute", right: 16, top: 16, zIndex: 2 }}>
//           <HeartButton productId={Number(id)} />
//         </div>

//         {/* Ảnh */}
//         <div style={{ flex: "1 1 340px" }}>
//           <img
//             src={imgSrc}
//             alt={product.name}
//             style={{
//               width: 460,
//               maxWidth: "100%",
//               borderRadius: 12,
//               objectFit: "cover",
//               boxShadow: "0 8px 24px rgba(2,6,23,.12)",
//               border: "1px solid rgba(2,6,23,.06)",
//             }}
//             onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
//           />
//         </div>

//         {/* Thông tin */}
//         <div style={{ flex: "2 1 460px" }}>
//           <h2
//             style={{
//               fontSize: "clamp(22px, 3.6vw, 32px)",
//               fontWeight: 800,
//               marginBottom: 10,
//               color: "#0f172a",
//             }}
//           >
//             {product.name}
//           </h2>
//           <p style={{ fontSize: 15, marginBottom: 12, color: "#475569" }}>
//             {product.brand_name ?? "Thương hiệu: đang cập nhật"}
//           </p>

//           {/* Giá + gạch + tiết kiệm */}
//           <div style={{ marginBottom: 12 }}>
//             <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
//               <div style={{ fontSize: 28, fontWeight: 900, color: "#ef4444" }}>
//                 {showPrice > 0 ? `${VND.format(showPrice)} đ` : "Liên hệ"}
//               </div>
//               {strikePrice && (
//                 <div style={{ color: "#64748b", textDecoration: "line-through" }}>
//                   {VND.format(strikePrice)} đ
//                 </div>
//               )}
//             </div>
//             {strikePrice && showPrice > 0 && strikePrice > showPrice && (
//               <div style={{ marginTop: 4, color: "#2563eb", fontWeight: 700 }}>
//                 Tiết kiệm {VND.format(strikePrice - showPrice)} đ
//               </div>
//             )}
//           </div>

//           {/* Trạng thái kho + còn N cái */}
//           <div style={{ marginBottom: 14, color: "#334155" }}>
//             Trạng thái:{" "}
//             <strong style={{ color: inStock ? "#16a34a" : "#f97316" }}>
//               {inStock ? "Còn hàng" : "Hết hàng"}
//             </strong>
//             {inStock && stockLeft > 0 && (
//               <span style={{ marginLeft: 10, color: "#6b7280" }}>
//                 {stockLeft <= 5
//                   ? `• Chỉ còn ${stockLeft} sản phẩm`
//                   : `• Còn ${stockLeft} sản phẩm`}
//               </span>
//             )}
//           </div>

//           {/* Biến thể */}
//           {!!variants.length && (
//             <div style={{ display: "grid", gap: 14, margin: "10px 0 18px" }}>
//               {/* Màu */}
//               {!!colors.length && (
//                 <div>
//                   <div
//                     style={{
//                       marginBottom: 8,
//                       color: "#334155",
//                       fontWeight: 800,
//                       letterSpacing: 0.3,
//                     }}
//                   >
//                     Màu sắc {selColor ? `• ${selColor}` : ""}
//                   </div>
//                   <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//                     {colors.map((c) => {
//                       const hex = colorToHex(c);
//                       const enabled = colorOptionsForSize.has(c);
//                       const selected = selColor === c;
//                       return (
//                         <button
//                           key={c}
//                           onClick={() => enabled && setSelColor(selected ? "" : c)}
//                           title={c}
//                           style={{
//                             width: 34,
//                             height: 34,
//                             borderRadius: 999,
//                             display: "grid",
//                             placeItems: "center",
//                             border: selected ? "3px solid #6366f1" : "1px solid #e2e8f0",
//                             background: hex || "#ffffff",
//                             color: "#0f172a",
//                             cursor: enabled ? "pointer" : "not-allowed",
//                             opacity: enabled ? 1 : 0.35,
//                           }}
//                         >
//                           {!hex && (
//                             <span style={{ fontSize: 11, padding: "0 6px" }}>{c}</span>
//                           )}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Size */}
//               {!!sizes.length && (
//                 <div>
//                   <div
//                     style={{
//                       marginBottom: 8,
//                       color: "#334155",
//                       fontWeight: 800,
//                       letterSpacing: 0.3,
//                     }}
//                   >
//                     Kích cỡ {selSize ? `• ${selSize}` : ""}
//                   </div>
//                   <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//                     {sizes.map((s) => {
//                       const enabled = sizeOptionsForColor.has(s);
//                       const selected = selSize === s;
//                       return (
//                         <button
//                           key={s}
//                           onClick={() => enabled && setSelSize(selected ? "" : s)}
//                           style={{
//                             padding: "8px 12px",
//                             borderRadius: 10,
//                             border: selected ? "2px solid #6366f1" : "1px solid #e2e8f0",
//                             background: "#ffffff",
//                             color: enabled ? "#0f172a" : "#94a3b8",
//                             cursor: enabled ? "pointer" : "not-allowed",
//                             opacity: enabled ? 1 : 0.5,
//                             fontWeight: 800,
//                             minWidth: 48,
//                             textAlign: "center",
//                           }}
//                         >
//                           {s}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {(selColor || selSize) && (
//                 <button
//                   onClick={() => {
//                     setSelColor("");
//                     setSelSize("");
//                   }}
//                   style={{
//                     alignSelf: "start",
//                     marginTop: 4,
//                     background: "transparent",
//                     color: "#2563eb",
//                     border: "1px dashed #cbd5e1",
//                     padding: "6px 10px",
//                     borderRadius: 8,
//                     cursor: "pointer",
//                     fontWeight: 700,
//                   }}
//                 >
//                   Xoá lựa chọn
//                 </button>
//               )}
//             </div>
//           )}

//           {/* Số lượng */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 10,
//               margin: "6px 0 18px",
//             }}
//           >
//             <span style={{ color: "#334155", fontWeight: 800 }}>Số lượng</span>
//             <div
//               style={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 border: "1px solid #e2e8f0",
//                 borderRadius: 10,
//                 overflow: "hidden",
//                 background: "#fff",
//               }}
//             >
//               <button
//                 onClick={() => setQtyPick((n) => Math.max(1, n - 1))}
//                 style={{
//                   width: 36,
//                   height: 34,
//                   background: "#f8fafc",
//                   color: "#0f172a",
//                   border: "none",
//                   cursor: "pointer",
//                   fontWeight: 900,
//                 }}
//               >
//                 −
//               </button>
//               <input
//                 value={qtyPick}
//                 onChange={(e) => {
//                   const n = Math.max(1, Math.min(maxQtyPick, Number(e.target.value) || 1));
//                   setQtyPick(n);
//                 }}
//                 style={{
//                   width: 48,
//                   height: 34,
//                   textAlign: "center",
//                   background: "#fff",
//                   color: "#0f172a",
//                   border: "none",
//                   fontWeight: 800,
//                 }}
//               />
//               <button
//                 onClick={() => setQtyPick((n) => Math.min(maxQtyPick, n + 1))}
//                 style={{
//                   width: 36,
//                   height: 34,
//                   background: "#f8fafc",
//                   color: "#0f172a",
//                   border: "none",
//                   cursor: "pointer",
//                   fontWeight: 900,
//                 }}
//               >
//                 +
//               </button>
//             </div>
//             {inStock && stockLeft > 0 && (
//               <span style={{ color: "#64748b" }}>(Tối đa {maxQtyPick})</span>
//             )}
//           </div>

//           {/* CTA */}
//           <button
//             onClick={handleAddToCart}
//             disabled={!inStock}
//             style={{
//               background: inStock
//                 ? `linear-gradient(0deg, rgba(255,255,255,.08), rgba(255,255,255,.08)), ${SOFT_GRADIENT}`
//                 : "#cbd5e1",
//               color: "#fff",
//               border: 0,
//               padding: "12px 22px",
//               borderRadius: 30,
//               cursor: inStock ? "pointer" : "not-allowed",
//               fontSize: 16,
//               fontWeight: 900,
//               boxShadow: inStock ? "0 8px 20px rgba(2,6,23,.12)" : "none",
//               transition: "transform .2s ease, box-shadow .2s ease, filter .2s ease",
//             }}
//             onMouseEnter={(e) => {
//               if (!inStock) return;
//               e.currentTarget.style.transform = "scale(1.03)";
//               e.currentTarget.style.boxShadow = "0 12px 28px rgba(2,6,23,.16)";
//               e.currentTarget.style.filter = "saturate(1.05)";
//             }}
//             onMouseLeave={(e) => {
//               if (!inStock) return;
//               e.currentTarget.style.transform = "scale(1)";
//               e.currentTarget.style.boxShadow = "0 8px 20px rgba(2,6,23,.12)";
//               e.currentTarget.style.filter = "saturate(1)";
//             }}
//           >
//             🛒 Thêm vào giỏ
//           </button>

//           {/* Quick info cards */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
//               gap: 10,
//               marginTop: 18,
//             }}
//           >
//             {[
//               ["🚚", "Giao nhanh 24-48h"],
//               ["🔁", "Đổi size trong 7 ngày"],
//               ["🛡️", "Hàng chính hãng"],
//             ].map(([ico, text]) => (
//               <div
//                 key={text}
//                 style={{
//                   background: "#f8fafc",
//                   border: "1px solid #e2e8f0",
//                   borderRadius: 10,
//                   padding: 10,
//                   display: "flex",
//                   gap: 8,
//                   alignItems: "center",
//                   color: "#334155",
//                   fontWeight: 600,
//                 }}
//               >
//                 <span style={{ fontSize: 18 }}>{ico}</span> {text}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Mô tả chi tiết */}
//       <div
//         style={{
//           marginTop: 26,
//           background: "#ffffff",
//           padding: 20,
//           borderRadius: 12,
//           border: "1px solid rgba(2,6,23,.08)",
//           boxShadow: "0 8px 20px rgba(2,6,23,.06)",
//         }}
//       >
//         <h3
//           style={{
//             fontSize: 18,
//             fontWeight: 900,
//             marginBottom: 8,
//             color: "#0f172a",
//           }}
//         >
//           Chi tiết sản phẩm
//         </h3>
//         <p style={{ whiteSpace: "pre-line", color: "#334155", lineHeight: 1.6 }}>
//           {product.detail || product.description || "Chưa có mô tả."}
//         </p>
//       </div>

//       {/* Reviews */}
//       <div className="reviews-white">
//         <ProductReviews productId={Number(id)} />
//       </div>
//       <style>{`
// /* Khung phần đánh giá – nền tối để chữ trắng dễ đọc */
// .reviews-white{
//   --bg:#0b1220;
//   --field:#0f172a;
//   --line:#334155;
//   --accent:#93c5fd;

//   background:var(--bg);
//   border:1px solid var(--line);
//   border-radius:12px;
//   padding:16px;
//   margin-top:24px;
// }

// /* Ép chữ trắng toàn bộ bên trong */
// .reviews-white, 
// .reviews-white *{
//   color:#fff !important;
// }

// /* Ô nhập liệu cũng tối + chữ trắng */
// .reviews-white input,
// .reviews-white textarea,
// .reviews-white select{
//   background:var(--field) !important;
//   border:1px solid var(--line) !important;
//   color:#fff !important;
// }

// /* Nút gửi/đánh giá dùng gradient dịu */
// .reviews-white button{
//   background:linear-gradient(135deg,#a5b4fc,#93c5fd,#67e8f9);
//   color:#fff; border:0; border-radius:10px;
//   padding:10px 14px; font-weight:800;
//   box-shadow:0 8px 20px rgba(2,6,23,.16);
// }

// /* Nếu có hiển thị sao/nhãn rating */
// .reviews-white .star,
// .reviews-white .rating label{
//   color:#ffd166 !important;
// }

// /* Link trong khu đánh giá */
// .reviews-white a{ color:var(--accent) !important; }
// `}</style>


//       {/* Sản phẩm liên quan — dùng ProductCardHome để đồng bộ */}
//       {!!related.length && (
//         <div style={{ marginTop: 34 }}>
//           <h3
//             style={{
//               fontSize: 20,
//               fontWeight: 900,
//               marginBottom: 16,
//               color: "#0f172a",
//               textTransform: "uppercase",
//             }}
//           >
//             Sản phẩm liên quan
//           </h3>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
//               gap: 20,
//             }}
//           >
//             {related.map((p) => (
//               <ProductCardHome key={p.id} p={p} />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";

const API = "http://127.0.0.1:8000/api";
const ALT = "http://127.0.0.1:8000";
const PLACEHOLDER = "https://placehold.co/400x300?text=No+Image";
const VND = new Intl.NumberFormat("vi-VN");

export default function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [coupons, setCoupons] = useState([]);
  const [savingCode, setSavingCode] = useState("");

  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rev, setRev] = useState({ rating: 5, content: "" });

  const [qty, setQty] = useState(1);

  const [toast, setToast] = useState(null);
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 1800);
  };

  const getThumb = (p) =>
    p?.thumbnail_url || p?.thumbnail || p?.image_url || PLACEHOLDER;

  const priceRoot = (p) => Number(p?.price_root ?? p?.price ?? 0);
  const priceSale = (p) => Number(p?.price_sale ?? 0);
  const effectivePrice = (p) =>
    priceSale(p) > 0 && priceSale(p) < priceRoot(p) ? priceSale(p) : priceRoot(p);

  const discount = useMemo(() => {
    const r = priceRoot(product);
    const s = priceSale(product);
    if (r > 0 && s > 0 && s < r) {
      return Math.round(((r - s) / r) * 100);
    }
    return 0;
  }, [product]);

  // ✅ Tồn kho: lấy từ API (ProductController@show đã trả qty)
  const stock = Number(product?.qty ?? 0);
  const outOfStock = stock <= 0;

  const pushToCart = (item) => {
    if (outOfStock) {
      showToast("Sản phẩm đã hết hàng.", false);
      return;
    }
    if (item.qty > stock) {
      showToast(`Chỉ còn ${stock} sản phẩm trong kho.`, false);
      return;
    }

    if (addToCart) {
      addToCart(item);
      showToast("🛒 Đã thêm vào giỏ!", true);
      return;
    }
    const load = () => {
      try {
        return JSON.parse(localStorage.getItem("cart") || "[]");
      } catch {
        return [];
      }
    };
    const save = (v) => localStorage.setItem("cart", JSON.stringify(v));
    const cart = load();
    const idx = cart.findIndex((x) => x.id === item.id);
    if (idx >= 0) cart[idx].qty = Math.min(stock, cart[idx].qty + item.qty);
    else cart.push(item);
    save(cart);
    showToast("🛒 Đã thêm vào giỏ!", true);
    navigate("/cart");
  };

  // ---------- Fetch product + related ----------
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");

        let p = null;
        try {
          const r = await fetch(`${API}/products/${id}`, { signal: ac.signal });
          if (r.ok) {
            const d = await r.json();
            p = d.data || d.product || d;
          }
        } catch {}

        if (!p) {
          const r2 = await fetch(`${ALT}/products/${id}`, { signal: ac.signal });
          if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
          const d2 = await r2.json();
          p = d2.data || d2.product || d2;
        }

        setProduct(p);

        // Related theo category
        if (p?.category_id) {
          try {
            const rc = await fetch(`${API}/categories/${p.category_id}/products`, {
              signal: ac.signal,
            });
            if (rc.ok) {
              const dd = await rc.json();
              const list = Array.isArray(dd) ? dd : dd.data ?? [];
              setRelated(list.filter(it => it.id !== Number(id)).slice(0, 8));
            } else {
              setRelated([]);
            }
          } catch {
            setRelated([]);
          }
        } else {
          setRelated([]);
        }
      } catch (e) {
        console.error(e);
        setErr("Không tải được sản phẩm.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [id]);

  // ---------- Fetch coupons ----------
  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`${API}/coupons?product_id=${id}`, {
          signal: ac.signal,
        });
        if (!r.ok) {
          setCoupons([]);
          return;
        }
        const data = await r.json();
        setCoupons(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        setCoupons([]);
      }
    })();
    return () => ac.abort();
  }, [id]);

  // ---------- Reviews ----------
  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/products/${id}/reviews`, { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => setReviews(Array.isArray(d) ? d : d.data ?? []))
      .catch(() => setReviews([]));

    if (token) {
      fetch(`${API}/products/${id}/can-review`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: ac.signal,
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setCanReview(!!(d.can || d.allowed || d === true)))
        .catch(() => setCanReview(false));
    } else setCanReview(false);

    if (new URLSearchParams(location.search).get("review")) setShowForm(true);
    return () => ac.abort();
  }, [id, token, location.search]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast("Vui lòng đăng nhập để đánh giá.", false);
      return;
    }
    try {
      const res = await fetch(`${API}/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(rev.rating),
          content: rev.content.trim(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const lst = await fetch(`${API}/products/${id}/reviews`).then((r) =>
        r.json()
      );
      setReviews(Array.isArray(lst) ? lst : lst.data ?? []);
      setShowForm(false);
      setRev({ rating: 5, content: "" });
      showToast("Đã gửi đánh giá. Cảm ơn bạn!", true);
    } catch (err) {
      console.error(err);
      showToast("Gửi đánh giá thất bại.", false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Đang tải...</div>;
  if (err) return <div style={{ padding: 16, color: "#d32f2f" }}>{err}</div>;
  if (!product) return <div style={{ padding: 16 }}>Không tìm thấy sản phẩm.</div>;

  const couponText = (c) => {
    const head =
      c.type === "percent"
        ? `Giảm ${Number(c.value)}%`
        : `Giảm ${VND.format(Number(c.value))}đ`;
    const cap = c.max_discount ? ` (tối đa ${VND.format(Number(c.max_discount))}đ)` : "";
    const min = c.min_order ? ` • ĐH tối thiểu ${VND.format(Number(c.min_order))}đ` : "";
    return head + cap + min;
  };

  const dec = () => setQty((q) => Math.max(1, Number(q) - 1));

  // ✅ Tồn kho: giới hạn tăng số lượng theo stock
  const inc = () => setQty((q) => {
    const next = Number(q) + 1;
    if (outOfStock) return 1;
    return Math.min(stock, Math.min(99, next));
  });

  // ✅ Tồn kho: giới hạn nhập tay
  const onQtyInput = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    let n = Math.max(1, Math.min(99, Number(v || 1)));
    if (!outOfStock) n = Math.min(n, stock);
    setQty(n);
  };

  // ✅ CSS thêm nhãn tồn kho
  const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Poppins:wght@600;800;900&display=swap');
  :root{
    --pink-300:#fbcfe8; --green-300:#bbf7d0;
    --pink-100:#ffe8f2; --green-100:#eafff3;
    --ink:#0f172a; --muted:#64748b; --line:#e5e7eb;
  }
  .pd-page{padding:16px 24px;background:linear-gradient(180deg,#fff5fa,#f4fff9);font-family:Inter,sans-serif;}
  .pd-card{display:grid;grid-template-columns:minmax(300px,520px)1fr;gap:24px;background:#fff;border:1px solid #f1f5f9;border-radius:16px;box-shadow:0 14px 34px rgba(2,6,23,.06);padding:20px;}
  .pd-hero img{width:100%;height:100%;object-fit:cover;border-radius:12px;}
  .pd-title{font-family:Poppins,sans-serif;font-weight:900;font-size:28px;background:linear-gradient(90deg,var(--pink-300),var(--green-300));-webkit-background-clip:text;color:transparent;margin:0 0 8px;}
  .pd-meta{color:#475569; margin:4px 0 10px}
  .pd-meta a{color:#2563eb; text-decoration:none}
  .pd-prices{display:flex;align-items:center;gap:8px}
  .pd-price-now{font-size:28px;font-weight:900;color:#111}
  .pd-price-old{text-decoration:line-through;color:var(--muted)}
  .pd-badge-off{background:var(--pink-100);color:#be185d;font-weight:800;padding:2px 8px;border-radius:999px;font-size:12px;border:1px dashed var(--pink-300);}
  .pd-desc{color:#334155;line-height:1.6;margin:8px 0 12px}
  .pd-desc strong{font-weight:bold;color:#111;}
  .pd-desc em{font-style:italic;}
  .pd-desc p{margin-bottom:6px;}
  .pd-qty{display:flex;align-items:center;gap:12px;margin:12px 0}
  .pd-actions{display:flex;gap:10px;margin-top:8px;flex-wrap:wrap}
  .pd-btn-primary{padding:12px 18px;border:0;border-radius:12px;background:linear-gradient(135deg,var(--pink-300),var(--green-300));font-weight:900;cursor:pointer}
  .pd-btn-ghost{padding:12px 16px;border:1px solid var(--pink-300);border-radius:12px;background:#fff;font-weight:800;color:#9d174d}
  .stock{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-weight:800;font-size:12px;border:1px dashed #d1d5db;background:#f8fafc;color:#0f172a}
  .stock.low{background:#fff7ed;color:#9a3412;border-color:#fed7aa}
  .stock.out{background:#fee2e2;color:#991b1b;border-color:#fecaca}

  /* Related */
  .rel-wrap{margin-top:22px}
  .rel-title{font-weight:800; font-size:20px; margin:6px 0 12px}
  .rel-grid{display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px}
  .rel-card{background:#fff;border:1px solid #f1f5f9;border-radius:12px; overflow:hidden}
  .rel-card img{width:100%; height:150px; object-fit:cover}
  .rel-body{padding:10px}
  .rel-name{font-weight:700; font-size:14px; color:#0f172a; margin:0 0 4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden}
  .rel-price{font-weight:800}

  /* Reviews */
  .rv-wrap{margin-top:24px; background:#fff; border:1px solid #eef2f7; border-radius:12px; padding:16px}
  .rv-title{font-weight:800; font-size:20px; margin-bottom:10px}
  .rv-item{border-top:1px dashed #e5e7eb; padding:10px 0}
  .rv-stars{color:#f59e0b; font-size:14px; margin-right:6px}
  .rv-meta{color:#64748b; font-size:12px}
  .rv-form{margin-top:12px; display:grid; gap:8px}
  .rv-form textarea{min-height:90px; padding:10px; border:1px solid #e2e8f0; border-radius:8px}
  .rv-form button{align-self:start; padding:10px 14px; border:0; border-radius:10px; background:#111; color:#fff; font-weight:800}
  `;

  return (
    <div className="pd-page">
      <style>{styles}</style>

      {/* ====== Card chi tiết ====== */}
      <div className="pd-card">
        <div className="pd-hero">
          <img
            src={getThumb(product)}
            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
            alt={product?.name}
          />
        </div>

        <div>
          <h1 className="pd-title">{product?.name}</h1>

          {/* ✅ Brand & Danh mục */}
          <div className="pd-meta">
            {product?.brand_name && (
              <>Thương hiệu: <b>{product.brand_name}</b> · </>
            )}
            {product?.category_id && (
              <>
                Danh mục:{" "}
                <Link to={`/category/${product.category_id}`}>Xem danh mục</Link>
              </>
            )}
          </div>

          <div className="pd-prices">
            <div className="pd-price-now">
              ₫{VND.format(effectivePrice(product))}
            </div>
            {priceSale(product) > 0 && priceSale(product) < priceRoot(product) && (
              <>
                <div className="pd-price-old">
                  ₫{VND.format(priceRoot(product))}
                </div>
                {discount > 0 && (
                  <span className="pd-badge-off">-{discount}%</span>
                )}
              </>
            )}
          </div>

          {/* ✅ Hiển thị tồn kho */}
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <span className={`stock ${outOfStock ? "out" : stock <= 5 ? "low" : ""}`}>
              {outOfStock ? "Hết hàng" : `Còn ${VND.format(stock)} sản phẩm`}
            </span>
          </div>

          {/* ✅ Mô tả có HTML */}
          <div
            className="pd-desc"
            dangerouslySetInnerHTML={{
              __html: product?.description || "<em>Không có mô tả</em>",
            }}
          ></div>

          {/* ✅ Chi tiết sản phẩm */}
          {product?.detail && (
            <div
              className="pd-desc"
              dangerouslySetInnerHTML={{ __html: product.detail }}
            ></div>
          )}

          {/* Số lượng & hành động */}
          <div className="pd-qty">
            <button onClick={dec} style={{ padding: "6px 12px" }} disabled={outOfStock}>−</button>
            <input
              value={outOfStock ? 0 : qty}
              onChange={onQtyInput}
              disabled={outOfStock}
              style={{ width: 50, textAlign: "center" }}
            />
            <button onClick={inc} style={{ padding: "6px 12px" }} disabled={outOfStock}>+</button>
          </div>

          <div className="pd-actions">
            <button
              onClick={() =>
                pushToCart({
                  id: product.id,
                  name: product.name,
                  price: effectivePrice(product),
                  qty: outOfStock ? 0 : qty,
                  thumbnail_url: getThumb(product),
                })
              }
              className="pd-btn-primary"
              disabled={outOfStock}
              title={outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
            >
              {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
            </button>
            <Link to="/" className="pd-btn-ghost">
              ← Tiếp tục mua
            </Link>
          </div>
        </div>
      </div>

      {/* ====== Sản phẩm liên quan ====== */}
      {!!related.length && (
        <div className="rel-wrap">
          <div className="rel-title">Sản phẩm liên quan</div>
          <div className="rel-grid">
            {related.map((r) => (
              <Link key={r.id} to={`/product/${r.id}`} className="rel-card">
                <img
                  src={r.thumbnail_url || r.thumbnail || PLACEHOLDER}
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  alt={r.name}
                />
                <div className="rel-body">
                  <div className="rel-name">{r.name}</div>
                  <div className="rel-price">₫{VND.format(Number(r.price ?? r.price_sale ?? 0))}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ====== Đánh giá ====== */}
      <div className="rv-wrap">
        <div className="rv-title">Đánh giá</div>

        {reviews.length === 0 ? (
          <div className="rv-item" style={{ borderTop: "0" }}>
            Chưa có đánh giá nào.
          </div>
        ) : (
          reviews.map((rv) => (
            <div key={rv.id || rv.created_at} className="rv-item">
              <span className="rv-stars">{"★".repeat(rv.rating || 5)}</span>
              <span className="rv-meta">
                {rv.user_name || "Người dùng"} • {rv.created_at?.slice(0, 10)}
              </span>
              <div style={{ marginTop: 4 }}>{rv.content}</div>
            </div>
          ))
        )}

        {canReview && (
          <>
            <button
              onClick={() => setShowForm((s) => !s)}
              style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff" }}
            >
              {showForm ? "Ẩn form đánh giá" : "Viết đánh giá"}
            </button>

            {showForm && (
              <form className="rv-form" onSubmit={submitReview}>
                <div>
                  <label>Chấm sao: </label>
                  <select
                    value={rev.rating}
                    onChange={(e) => setRev((x) => ({ ...x, rating: e.target.value }))}
                  >
                    {[5,4,3,2,1].map((n) => (
                      <option key={n} value={n}>{n} sao</option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Cảm nhận của bạn…"
                  value={rev.content}
                  onChange={(e) => setRev((x) => ({ ...x, content: e.target.value }))}
                />
                <button type="submit">Gửi đánh giá</button>
              </form>
            )}
          </>
        )}
      </div>

      {/* Toast nhỏ */}
      {toast && (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            background: toast.ok ? "#16a34a" : "#dc2626",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
