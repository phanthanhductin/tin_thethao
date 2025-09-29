// src/pages/Customers/Products.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";

const API_BASE = "http://127.0.0.1:8000";
const PLACEHOLDER = "https://placehold.co/300x200?text=No+Image";

export default function Products({ addToCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // ✅ Lấy tất cả sản phẩm
        const res = await fetch(`${API_BASE}/products`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setItems(list);
      } catch (e) {
        if (e.name !== "AbortError") setErr("Không tải được danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  if (loading)
    return (
      <p style={{ padding: 20, textAlign: "center", color: "#00e676" }}>
        Đang tải sản phẩm...
      </p>
    );
  if (err)
    return (
      <p style={{ padding: 20, textAlign: "center", color: "#ff5252" }}>{err}</p>
    );
  if (!items.length)
    return (
      <p style={{ padding: 20, textAlign: "center", color: "#aaa" }}>
        Chưa có sản phẩm.
      </p>
    );

  return (
    <div
      style={{
        padding: "40px 20px",
        fontFamily: "Montserrat, Arial, sans-serif",
        background: "#121212",
        color: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 900,
          marginBottom: 30,
          textAlign: "center",
          color: "#00e5ff",
          textTransform: "uppercase",
          letterSpacing: 1,
          textShadow: "0 0 10px rgba(0,229,255,0.6)",
          borderBottom: "3px solid #00e5ff",
          display: "inline-block",
          paddingBottom: 6,
        }}
      >
        🏆 Tất cả sản phẩm
      </h2>

      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {items.map((p) => (
          <div
            key={p.id}
            style={{
              position: "relative",
              background: "#1e1e1e",
              borderRadius: 14,
              padding: 12,
              boxShadow: "0 0 12px rgba(0,255,170,0.15)",
              transition: "transform .2s ease, box-shadow .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.03)";
              e.currentTarget.style.boxShadow =
                "0 0 18px rgba(0,229,255,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 0 12px rgba(0,255,170,0.15)";
            }}
          >
            {/* Card có Link sang /products/:id */}
            <ProductCard
              p={{
                ...p,
                image: p.thumbnail_url || p.thumbnail || PLACEHOLDER,
              }}
            />

            {typeof addToCart === "function" && (
              <button
                onClick={() => addToCart(p)}
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 16,
                  background: "linear-gradient(90deg,#00c853,#ff6d00)",
                  color: "#fff",
                  border: 0,
                  padding: "8px 14px",
                  borderRadius: 20,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 0 10px rgba(255,109,0,0.5)",
                  transition: "transform .2s ease, box-shadow .2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.08)";
                  e.currentTarget.style.boxShadow =
                    "0 0 16px rgba(0,255,170,0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 0 10px rgba(255,109,0,0.5)";
                }}
              >
                + Giỏ
              </button>
            )}
          </div>
        ))}
      </div>

      <p style={{ marginTop: 40, textAlign: "center" }}>
        <Link
          to="/"
          style={{
            color: "#00e676",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ← Về trang chủ
        </Link>
      </p>
    </div>
  );
}
