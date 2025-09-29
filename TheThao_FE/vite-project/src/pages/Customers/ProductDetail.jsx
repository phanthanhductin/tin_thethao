import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";
const PLACEHOLDER = "https://placehold.co/400x300?text=No+Image";
const VND = new Intl.NumberFormat("vi-VN");

export default function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) Chi tiết sản phẩm
        const res = await fetch(`${API_BASE}/products/${id}`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProduct(data);

        // 2) Sản phẩm liên quan
        if (data?.category_id) {
          const r = await fetch(`${API_BASE}/categories/${data.category_id}/products`, { signal: ac.signal });
          if (r.ok) {
            const all = await r.json();
            const list = (Array.isArray(all) ? all : all?.data ?? [])
              .filter(x => x.id !== Number(id))
              .slice(0, 8);
            setRelated(list);
          }
        }
      } catch (e) {
        if (e.name !== "AbortError") setErr("Không tải được sản phẩm.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [id]);

  if (loading) return <p style={{ padding: 20, color: "#00e676" }}>Đang tải...</p>;
  if (err) return <p style={{ padding: 20, color: "#ff5252" }}>{err}</p>;
  if (!product) return <p style={{ padding: 20 }}>Sản phẩm không tồn tại.</p>;

  const price = Number(product.price ?? 0);
  const imgSrc = product.thumbnail_url || product.thumbnail || PLACEHOLDER;

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Bạn cần đăng nhập trước khi thêm sản phẩm!");
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    if (typeof addToCart === "function") {
      addToCart(product);
      alert("🎉 Sản phẩm đã được thêm vào giỏ hàng!");
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
      <Link to="/products" style={{ color: "#00e676", fontWeight: 600 }}>
        ← Quay lại danh sách
      </Link>

      <div
        style={{
          display: "flex",
          gap: 30,
          marginTop: 30,
          flexWrap: "wrap",
          background: "#1e1e1e",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 0 20px rgba(0,230,118,0.2)",
        }}
      >
        {/* Ảnh */}
        <div style={{ flex: "1 1 300px" }}>
          <img
            src={imgSrc}
            alt={product.name}
            style={{
              width: 400,
              maxWidth: "100%",
              borderRadius: 12,
              objectFit: "cover",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
          />
        </div>

        {/* Thông tin */}
        <div style={{ flex: "2 1 400px" }}>
          <h2
            style={{
              fontSize: 30,
              fontWeight: 800,
              marginBottom: 12,
              color: "#00e676",
              textShadow: "0 0 8px rgba(0,230,118,0.6)",
            }}
          >
            {product.name}
          </h2>
          <p style={{ fontSize: 16, marginBottom: 12, color: "#bbb" }}>
            {product.brand_name ?? "Chưa cập nhật"}
          </p>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#ff5252",
              marginBottom: 20,
            }}
          >
            {price > 0 ? `${VND.format(price)} đ` : "Liên hệ"}
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              background: "linear-gradient(90deg,#00c853,#ff6d00)",
              color: "#fff",
              border: 0,
              padding: "12px 22px",
              borderRadius: 30,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              boxShadow: "0 0 12px rgba(255,109,0,0.6)",
              transition: "transform .2s ease, box-shadow .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 0 18px rgba(0,255,170,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 0 12px rgba(255,109,0,0.6)";
            }}
          >
            🛒 Thêm vào giỏ
          </button>
        </div>
      </div>

      {/* Mô tả chi tiết */}
      <div
        style={{
          marginTop: 40,
          background: "#1c1c1c",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 0 12px rgba(0,229,255,0.3)",
        }}
      >
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 10,
            color: "#00e5ff",
          }}
        >
          Chi tiết sản phẩm
        </h3>
        <p style={{ whiteSpace: "pre-line", color: "#ddd", lineHeight: 1.6 }}>
          {product.description || "Chưa có mô tả."}
        </p>
      </div>

      {/* Sản phẩm liên quan */}
      {!!related.length && (
        <div style={{ marginTop: 50 }}>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 20,
              color: "#ff7043",
              textTransform: "uppercase",
              textShadow: "0 0 8px rgba(255,112,67,0.6)",
            }}
          >
            Sản phẩm liên quan
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
            }}
          >
            {related.map((p) => {
              const rImg = p.thumbnail_url || p.thumbnail || PLACEHOLDER;
              const rPrice = Number(p.price ?? 0);
              return (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      background: "#1e1e1e",
                      borderRadius: 12,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                      padding: 14,
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
                    <div
                      style={{
                        height: 140,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#2a2a2a",
                        marginBottom: 10,
                      }}
                    >
                      <img
                        src={rImg}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                        loading="lazy"
                      />
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        marginBottom: 6,
                        color: "#fff",
                      }}
                    >
                      {p.name}
                    </div>
                    <div style={{ color: "#00e676", fontWeight: 700 }}>
                      {rPrice > 0 ? `${VND.format(rPrice)} đ` : "Liên hệ"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
