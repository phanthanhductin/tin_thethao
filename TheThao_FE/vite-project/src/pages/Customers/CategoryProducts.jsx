// src/pages/Customers/CategoryProducts.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCardHome from "../../components/ProductCardHome";

const API_BASE = "http://127.0.0.1:8000/api";
const PLACEHOLDER = "https://placehold.co/300x200?text=No+Image";
const HEADER_OFFSET = 110;

/* Helpers giống Products.jsx */
const toNum = (x) => {
  if (x == null || x === "") return 0;
  if (typeof x === "string") return Number(x.replace(/[^\d.-]/g, "")) || 0;
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
};
const getPrice = (p) =>
  toNum(p.price_sale ?? p.sale_price ?? p.price ?? p.price_buy ?? p.amount);
const getRootPrice = (p) =>
  toNum(p.price_root ?? p.original_price ?? p.root_price);

export default function CategoryProducts() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) Thông tin danh mục
        const resCat = await fetch(`${API_BASE}/categories/${id}`, { signal: ac.signal });
        if (!resCat.ok) throw new Error(`HTTP ${resCat.status}`);
        const catJson = await resCat.json().catch(() => ({}));
        const c = Array.isArray(catJson) ? catJson[0] : catJson?.data ?? catJson;
        setCat({
          id: c?.id,
          name: c?.name || c?.title || `Danh mục #${id}`,
          description: c?.description || c?.desc || "",
        });

        // 2) Sản phẩm (đồng bộ shape với trang Products)
        const qs = new URLSearchParams({
          category_id: id,
          sort: "created_at:desc",
          per_page: "120",
        }).toString();
        const resProds = await fetch(`${API_BASE}/products?${qs}`, { signal: ac.signal });
        if (!resProds.ok) throw new Error(`HTTP ${resProds.status}`);

        const data = await resProds.json().catch(() => ({}));
        const list = Array.isArray(data) ? data : data?.data ?? [];

        // Chuẩn hoá cho ProductCardHome
        const normalized = list.map((p) => {
          const base = getRootPrice(p);
          const sale = getPrice(p);
          const price = sale || base || 0;
          const image = p.thumbnail_url || p.thumbnail || PLACEHOLDER;

          return {
            ...p,
            image,
            // set đủ các alias để card nào cũng đọc được
            price,                       // chính
            price_buy: price,
            amount: price,
            price_sale: sale || undefined,
            sale_price: sale || undefined,
            price_root: base || undefined,
            root_price: base || undefined,
            original_price: base || undefined,
          };
        });

        setItems(normalized);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setErr("Không tải được sản phẩm hoặc danh mục.");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [id]);

  if (loading)
    return <p style={{ padding: 20, color: "#2563eb", textAlign: "center" }}>Đang tải...</p>;
  if (err)
    return <p style={{ padding: 20, color: "#d32f2f", textAlign: "center" }}>{err}</p>;

  return (
    <div
      style={{
        padding: `${HEADER_OFFSET}px 20px 40px`,
        fontFamily: "Montserrat, Arial, sans-serif",
        background: "#f8fafc",
        color: "#0b1220",
      }}
    >
      <StyleTag />

      <header style={{ textAlign: "center", marginBottom: 8 }}>
        <h2 className="products-title">{cat?.name || "Danh mục"}</h2>
        <p style={{ margin: "6px auto 0", maxWidth: 820, color: "#334155", fontWeight: 700 }}>
          {cat?.description || "Khám phá các sản phẩm trong danh mục."}
        </p>
      </header>

      <p style={{ textAlign: "center", margin: "12px 0 18px" }}>
        <Link
          to="/products"
          style={{
            color: "#2563eb", fontWeight: 800, textDecoration: "none",
            border: "1px solid rgba(37,99,235,.25)", padding: "8px 12px", borderRadius: 10
          }}
        >
          ← Xem tất cả sản phẩm
        </Link>
      </p>

      {items.length === 0 ? (
        <p style={{ padding: 20, textAlign: "center", color: "#475569", fontWeight: 700 }}>
          Không có sản phẩm trong danh mục này.
        </p>
      ) : (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid4">
            {items.map((p) => (
              <ProductCardHome key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Style đồng bộ */
function StyleTag() {
  return (
    <style>{`
      .products-title{
        font-size: clamp(28px, 4.2vw, 44px);
        font-weight: 1000;
        line-height: 1.1;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        margin: 6px auto 22px;
        padding-bottom: 14px;
        display: inline-flex; gap: 12px; position: relative;
        color: #0f172a;
        background: linear-gradient(180deg,#0b1220 0%,#121a2e 70%,#1f2937 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        text-shadow: 0 1px 0 #000000ff, 0 2px 6px rgba(13,24,54,.18);
      }
      .products-title::after{
        content:""; position:absolute; left:0; bottom:0; width:100%; height:4px; border-radius:6px;
        background: linear-gradient(90deg,#6366f1 0%, #8b5cf6 75%, rgba(99,102,241,0) 100%);
        box-shadow: 0 1px 8px rgba(99,102,241,.35);
      }
      .grid4{ display:grid; grid-template-columns:repeat(4,1fr); gap:20px; align-items:stretch; }
      @media (max-width:1024px){ .grid4{ grid-template-columns:repeat(3,1fr); } }
      @media (max-width:768px){ .grid4{ grid-template-columns:repeat(2,1fr); } }
      @media (max-width:480px){ .grid4{ grid-template-columns:1fr; } }
    `}</style>
  );
}
