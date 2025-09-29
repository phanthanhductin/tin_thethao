import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const PLACEHOLDER = "https://placehold.co/300x200?text=No+Image";
const VND = new Intl.NumberFormat("vi-VN");

export default function CategoryProducts({ addToCart }) {
  const { id } = useParams(); // category id từ URL
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState(null); // thông tin danh mục
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // lấy thông tin danh mục
        const resCat = await fetch(`${API_BASE}/categories/${id}`, {
          signal: ac.signal,
        });
        if (!resCat.ok) throw new Error(`HTTP ${resCat.status}`);
        const catData = await resCat.json();
        setCat(catData);

        // lấy sản phẩm thuộc danh mục
        const resProds = await fetch(`${API_BASE}/categories/${id}/products`, {
          signal: ac.signal,
        });
        if (!resProds.ok) throw new Error(`HTTP ${resProds.status}`);

        const data = await resProds.json();
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setItems(list);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Lỗi:", e);
          setErr("Không tải được sản phẩm hoặc danh mục.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id]);

  if (loading) return <p style={{ padding: 20, color: "#00e676" }}>Đang tải...</p>;
  if (err) return <p style={{ padding: 20, color: "#ff5252" }}>{err}</p>;

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Montserrat, Arial, sans-serif",
        background: "#121212",
        color: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Tiêu đề + ảnh danh mục */}
      {cat && (
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h2
            style={{
              marginBottom: 12,
              fontSize: 28,
              fontWeight: 800,
              color: "#00e676",
              textTransform: "uppercase",
              textShadow: "0 0 10px rgba(0,230,118,0.6)",
            }}
          >
            {cat.name}
          </h2>
        </div>
      )}

      <p style={{ marginBottom: 16, textAlign: "center" }}>
        <Link
          to="/products"
          style={{
            color: "#00e5ff",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ← Xem tất cả sản phẩm
        </Link>
      </p>

      {items.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa" }}>Không có sản phẩm.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 24,
          }}
        >
          {items.map((p) => {
            const price = Number(p.price ?? 0);
            const img =
              p.thumbnail_url || p.image_url || p.thumbnail || p.image || PLACEHOLDER;

            return (
              <div
                key={p.id}
                style={{
                  background: "#1e1e1e",
                  borderRadius: 12,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                  padding: 16,
                  textAlign: "center",
                  transition: "transform .2s ease, box-shadow .2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(0,229,255,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 10px rgba(0,0,0,0.4)";
                }}
              >
                <Link
                  to={`/products/${p.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      height: 140,
                      borderRadius: 8,
                      overflow: "hidden",
                      marginBottom: 10,
                      background: "#2a2a2a",
                    }}
                  >
                    <img
                      src={img}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                      loading="lazy"
                    />
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 6,
                      color: "#fff",
                    }}
                  >
                    {p.name}
                  </h3>
                </Link>

                <div
                  style={{
                    fontWeight: 700,
                    color: "#ff7043",
                    marginTop: 6,
                  }}
                >
                  {price > 0 ? `${VND.format(price)} đ` : "Liên hệ"}
                </div>

                {typeof addToCart === "function" && (
                  <button
                    onClick={() => addToCart(p)}
                    style={{
                      marginTop: 12,
                      background: "linear-gradient(90deg,#00c853,#ff6d00)",
                      color: "#fff",
                      border: 0,
                      padding: "8px 14px",
                      borderRadius: 20,
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "transform .2s ease, box-shadow .2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow =
                        "0 0 12px rgba(255,109,0,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    + Thêm vào giỏ
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
