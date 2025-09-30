import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard";

const API_BASE = "http://127.0.0.1:8000"; // Nếu API dùng prefix /api thì đổi thành "...:8000/api"
const PLACEHOLDER = "https://placehold.co/300x200?text=No+Image";

// Card danh mục tái sử dụng
function CategoryCard({ c, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "#1e1e1e",
        borderRadius: 12,
        boxShadow: "0 0 10px rgba(0,255,170,0.15)",
        padding: 16,
        minWidth: 360,
        width: 380,
        textAlign: "center",
        fontWeight: 600,
        fontSize: 18,
        color: "#00e676",
        border: "2px solid #00e676",
        cursor: "pointer",
        transition: "transform .2s ease, box-shadow .2s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
        e.currentTarget.style.boxShadow = "0 0 18px rgba(0,255,170,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 0 10px rgba(0,255,170,0.15)";
      }}
    >
      <div
        style={{
          height: 160,
          marginBottom: 8,
          overflow: "hidden",
          borderRadius: 8,
          background: "#2a2a2a",
        }}
      >
        {/* ✅ dùng c.image_url thay vì c.image */}
        <img
          src={c.image_url || PLACEHOLDER}
          alt={c.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
        />
      </div>
      {c.name}
    </button>
  );
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const resCats = await fetch(`${API_BASE}/categories`, { signal: ac.signal });
        if (!resCats.ok) throw new Error(`HTTP ${resCats.status}`);
        const cats = await resCats.json();
        setCategories(Array.isArray(cats) ? cats : cats?.data ?? []);

        const resProds = await fetch(`${API_BASE}/products`, { signal: ac.signal });
        if (!resProds.ok) throw new Error(`HTTP ${resProds.status}`);
        const prods = await resProds.json();

        const list = Array.isArray(prods) ? prods : prods?.data ?? [];
        setNewItems(list.slice(0, 4));
        setSaleItems(list.slice(-4));
      } catch (err) {
        if (err.name !== "AbortError") setError("Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // ====== Tạo 2 hàng sole: 2 trên + 3 dưới ======
  const topCats = categories.slice(0, 2);
  const bottomCats = categories.slice(2, 5);
  const restCats = categories.slice(5); // phần còn lại (nếu có), hiển thị grid thường

  return (
    <div
      style={{
        fontFamily: "Montserrat, Arial, sans-serif",
        background: "#121212",
        color: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Hero */}
      <section
        style={{
          position: "relative",
          textAlign: "center",
          color: "#fff",
          height: 420,
          overflow: "hidden",
        }}
      >
        <img
          src="http://127.0.0.1:8000/assets/images/banner.webp"
          alt="Banner"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,255,170,0.3), rgba(255,100,50,0.3))",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <h1
            style={{
              fontSize: 46,
              fontWeight: 900,
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "#00ffae",
              textShadow: "0 0 12px rgba(0,255,170,0.6)",
            }}
          >
            TheThao sports
          </h1>
          <p style={{ fontSize: 20, fontWeight: 500, marginBottom: 24 }}>
            Hiệu năng bùng nổ – Phong cách thể thao hiện đại
          </p>
          <button
            style={{
              padding: "12px 28px",
              borderRadius: 30,
              border: "none",
              background: "linear-gradient(90deg,#00c853,#ff6d00)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform .2s ease, box-shadow .2s ease",
              boxShadow: "0 0 12px rgba(0,255,170,0.4)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow = "0 0 18px rgba(255,109,0,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(0,255,170,0.4)";
            }}
          >
            Khám phá ngay
          </button>
        </div>
      </section>

      {/* Danh mục nổi bật */}
      <section style={{ margin: "50px 0" }}>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            marginBottom: 22,
            color: "#00e676",
            textAlign: "center",
            textTransform: "uppercase",
            textShadow: "0 0 8px rgba(0,230,118,0.6)",
          }}
        >
          Danh mục nổi bật
        </h2>

        {categories.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa" }}>Chưa có danh mục.</p>
        ) : (
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            {/* Hàng trên: 2 item */}
            <div
              style={{
                display: "flex",
                gap: 24,
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              {topCats.map((c) => (
                <CategoryCard
                  key={c.id}
                  c={c}
                  onClick={() => navigate(`/category/${c.id}`)}
                />
              ))}
            </div>

            {/* Hàng dưới: 3 item (tự căn giữa nên sẽ lệch/sole với hàng trên) */}
            <div
              style={{
                display: "flex",
                gap: 24,
                justifyContent: "center",
                marginBottom: restCats.length ? 28 : 0,
              }}
            >
              {bottomCats.map((c) => (
                <CategoryCard
                  key={c.id}
                  c={c}
                  onClick={() => navigate(`/category/${c.id}`)}
                  // slight visual offset để nhìn "sole" rõ hơn
                  style={{ transform: "translateY(6px)" }}
                />
              ))}
            </div>

            {/* Các danh mục còn lại (nếu có) */}
            {restCats.length > 0 && (
              <>
                <h3
                  style={{
                    textAlign: "center",
                    color: "#9e9e9e",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 14,
                  }}
                >
                  Các danh mục khác
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: 18,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {restCats.map((c) => (
                    <CategoryCard
                      key={c.id}
                      c={c}
                      onClick={() => navigate(`/category/${c.id}`)}
                      style={{ minWidth: 340, width: 360 }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Trạng thái */}
      {loading && (
        <p style={{ textAlign: "center", color: "#00e676" }}>Đang tải dữ liệu...</p>
      )}
      {error && <p style={{ textAlign: "center", color: "#ff5252" }}>{error}</p>}

      {/* Sản phẩm */}
      {!loading && !error && (
        <>
          <section style={{ margin: "50px 0" }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 18,
                color: "#00e5ff",
                textAlign: "center",
                borderBottom: "3px solid #00e5ff",
                display: "inline-block",
                paddingBottom: 6,
                textTransform: "uppercase",
                textShadow: "0 0 8px rgba(0,229,255,0.6)",
              }}
            >
              Sản phẩm mới
            </h2>
            <div
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {newItems.map((p) => (
                <ProductCard
                  key={p.id}
                  p={{ ...p, image: p.image_url || PLACEHOLDER }}
                />
              ))}
            </div>
          </section>

          <section style={{ margin: "50px 0" }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 18,
                color: "#ff7043",
                textAlign: "center",
                borderBottom: "3px solid #ff7043",
                display: "inline-block",
                paddingBottom: 6,
                textTransform: "uppercase",
                textShadow: "0 0 8px rgba(255,112,67,0.6)",
              }}
            >
              Đang giảm giá
            </h2>
            <div
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {saleItems.map((p) => (
                <ProductCard
                  key={p.id}
                  p={{ ...p, image: p.image_url || PLACEHOLDER }}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* About */}
      <section
        style={{
          background: "#1c1c1c",
          borderRadius: 16,
          boxShadow: "0 0 16px rgba(0,255,170,0.2)",
          padding: "32px 24px",
          margin: "50px auto 24px",
          maxWidth: 720,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 14,
            color: "#00e676",
            textTransform: "uppercase",
            textShadow: "0 0 8px rgba(0,230,118,0.6)",
          }}
        >
          ⚽ VỀ CHÚNG TÔI
        </h2>
        <p style={{ color: "#e0e0e0", fontSize: 16, lineHeight: 1.6 }}>
          THETHAO SPORTS mang đến trang phục & phụ kiện thể thao chính hãng, bền bỉ và thời thượng. Chúng tôi tối ưu hiệu năng cho từng chuyển động, để bạn tự tin luyện tập, thi đấu và phá vỡ giới hạn mỗi ngày.
        </p>
      </section>
    </div>
  );
}
