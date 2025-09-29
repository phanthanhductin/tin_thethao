import { Link } from "react-router-dom";

const PLACEHOLDER = "https://placehold.co/300x200?text=No+Image";

export default function ProductCard({ p }) {
  const price = Number(p.price) || 0;
  const imgSrc = p.thumbnail_url || p.thumbnail || PLACEHOLDER;

  return (
    <div
      className="product-card"
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 8px #e0f2f1",
        padding: 16,
        width: 220,
        margin: 8,
        textAlign: "center",
        transition: "transform .2s ease, box-shadow .2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px #e0f2f1";
      }}
    >
      {/* ✅ Link sang chi tiết sản phẩm */}
      <Link
        to={`/products/${p.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="product-image" style={{ marginBottom: 10 }}>
          <img
            src={imgSrc}
            alt={p.name}
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 8,
              background: "#f9f9f9",
            }}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
        </div>

        <div className="product-info">
          {/* ✅ Tên sản phẩm */}
          <div
            className="name"
            style={{
              fontWeight: "bold",
              fontSize: 15,
              color: "#212121",
              minHeight: 40,
              lineHeight: 1.4,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2, // giới hạn 2 dòng
            }}
          >
            {p.name}
          </div>

          {/* ✅ Thương hiệu */}
          <div
            className="brand"
            style={{ color: "#388e3c", fontSize: 13, marginTop: 4 }}
          >
            {p.brand_name ? `${p.brand_name}` : "Farm Local"}
          </div>

          {/* ✅ Giá */}
          <div
            className="price"
            style={{
              color: "#2e7d32",
              fontWeight: "bold",
              marginTop: 6,
              fontSize: 15,
            }}
          >
            {price.toLocaleString()} đ
          </div>
        </div>
      </Link>
    </div>
  );
}
