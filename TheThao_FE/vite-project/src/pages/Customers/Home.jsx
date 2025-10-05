// src/pages/Customers/Home.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCardHome from "../../components/ProductCardHome";
import ContactSection from "./ContactSection";

const API_BASE = "http://127.0.0.1:8000";
const PLACEHOLDER = "https://placehold.co/300x200?text=No+Image";

/* ====== BANNER SLIDES ====== */
const BANNERS = [
  { src: `${API_BASE}/assets/images/banner.webp`, alt: "Siêu ưu đãi thể thao", link: "/products" },
  { src: `${API_BASE}/assets/images/banner1.jpg`, alt: "Phong cách & hiệu năng", link: "/products?only_sale=1" },
  { src: `${API_BASE}/assets/images/banner11.jpg`, alt: "Bùng nổ mùa giải mới", link: "/category/1" },
];

/* ---------- Icon chevron ---------- */
function IconChevron({ dir = "left", size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
    >
      {dir === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

/* ---------- Style nút mũi tên ---------- */
function arrowStyle(side) {
  const base = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 5,
    width: 52,
    height: 52,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.5)",
    background: "rgba(0,0,0,.45)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    boxShadow: "0 10px 26px rgba(0,0,0,.35)",
    backdropFilter: "blur(4px)",
    transition: "transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease",
    outline: "none",
  };
  return side === "left" ? { ...base, left: 24 } : { ...base, right: 24 };
}

/* ---------- Slider tự động (Banner to + ảnh rõ) ---------- */
function BannerSlider({
  banners = [],
  heightCSS = "clamp(360px, 50vw, 640px)", // cao & responsive
  auto = 5000,
}) {
  const [idx, setIdx] = useState(0);
  const touch = useRef({ x: 0, dx: 0, active: false });
  const navigate = useNavigate();
  const count = banners.length || 0;

  const go = (n) => setIdx((p) => (count ? (p + n + count) % count : 0));
  const goTo = (i) => setIdx(() => (count ? (i + count) % count : 0));

  // Auto play
  useEffect(() => {
    if (!count || auto <= 0) return;
    const t = setInterval(() => go(1), auto);
    return () => clearInterval(t);
  }, [count, auto]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Touch
  const onTouchStart = (e) => {
    touch.current = { x: e.touches[0].clientX, dx: 0, active: true };
  };
  const onTouchMove = (e) => {
    if (!touch.current.active) return;
    touch.current.dx = e.touches[0].clientX - touch.current.x;
  };
  const onTouchEnd = () => {
    if (!touch.current.active) return;
    const dx = touch.current.dx;
    touch.current.active = false;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  if (!count) return null;

  return (
    <div
      style={{ position: "relative", height: heightCSS, overflow: "hidden" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Track */}
      <div
        style={{
          display: "flex",
          width: `${count * 100}%`,
          height: "100%",
          transform: `translateX(-${idx * (100 / count)}%)`,
          transition: "transform .55s ease",
        }}
      >
        {banners.map((b, i) => (
          <button
            key={i}
            type="button"
            onClick={() => b.link && navigate(b.link)}
            aria-label={b.alt || `Slide ${i + 1}`}
            style={{
              width: `${100 / count}%`,
              minWidth: `${100 / count}%`,
              height: "100%",
              border: 0,
              padding: 0,
              cursor: b.link ? "pointer" : "default",
              position: "relative",
              background: "#000",
            }}
          >
            <img
              src={b.src}
              alt={b.alt || ""}
              onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 40%",
                filter: "brightness(.78) contrast(1.05)", // ảnh sáng hơn, nét hơn
              }}
              loading={i === 0 ? "eager" : "lazy"}
            />

            {/* Overlay dưới nhẹ để chữ dễ đọc, không tối ảnh quá */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,.48), rgba(0,0,0,.18) 40%, rgba(0,0,0,0) 65%)",
              }}
            />
          </button>
        ))}
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Slide trước"
            style={arrowStyle("left")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1.07)";
              e.currentTarget.style.boxShadow = "0 14px 32px rgba(0,0,0,.45)";
              e.currentTarget.style.background = "rgba(0,0,0,.55)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.65)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(-50%)";
              e.currentTarget.style.boxShadow = "0 10px 26px rgba(0,0,0,.35)";
              e.currentTarget.style.background = "rgba(0,0,0,.45)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.5)";
            }}
          >
            <IconChevron dir="left" />
          </button>

          <button
            onClick={() => go(1)}
            aria-label="Slide sau"
            style={arrowStyle("right")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1.07)";
              e.currentTarget.style.boxShadow = "0 14px 32px rgba(0,0,0,.45)";
              e.currentTarget.style.background = "rgba(0,0,0,.55)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.65)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(-50%)";
              e.currentTarget.style.boxShadow = "0 10px 26px rgba(0,0,0,.35)";
              e.currentTarget.style.background = "rgba(0,0,0,.45)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.5)";
            }}
          >
            <IconChevron dir="right" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            zIndex: 6,
          }}
        >
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Tới slide ${i + 1}`}
              style={{
                width: i === idx ? 14 : 11,
                height: i === idx ? 14 : 11,
                borderRadius: 999,
                border: 0,
                background: i === idx ? "#00e676" : "rgba(255,255,255,.7)",
                transform: i === idx ? "scale(1.05)" : "scale(1)",
                transition: "transform .2s ease, background .2s ease, width .2s ease, height .2s ease",
                cursor: "pointer",
                boxShadow: i === idx ? "0 0 0 2px rgba(0,230,118,.25)" : "none",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Card danh mục ---------- */
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
        transition: "transform .18s ease, box-shadow .18s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.04)";
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
  const [suggestItems, setSuggestItems] = useState([]); // 1 hàng gợi ý
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

        const normalized = list.map((p) => ({
          ...p,
          price_root: Number(p.price_root ?? 0),
          price_sale: Number(p.price_sale ?? p.price ?? 0),
        }));

        // 4×2 cho mỗi section
        const _new = normalized.slice(0, 8);
        const _sale = normalized
          .filter((x) => x.price_root > 0 && x.price_sale > 0 && x.price_sale < x.price_root)
          .slice(0, 8);

        setNewItems(_new);
        setSaleItems(_sale);

        // Gợi ý: 1 hàng / 4 sp, loại trừ những gì đã hiển thị
        const exclude = new Set([..._new.map((x) => x.id), ..._sale.map((x) => x.id)]);
        let suggestion = normalized.filter((p) => !exclude.has(p.id)).slice(0, 4);
        if (suggestion.length < 4) {
          const filler = normalized.filter((p) => !suggestion.find((s) => s.id === p.id));
          suggestion = suggestion.concat(filler.slice(0, 4 - suggestion.length));
        }
        setSuggestItems(suggestion.slice(0, 4));
      } catch (err) {
        if (err.name !== "AbortError") setError("Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const topCats = categories.slice(0, 2);
  const bottomCats = categories.slice(2, 5);
  const restCats = categories.slice(5);

  return (
    <div
      style={{
        fontFamily: "Montserrat, Arial, sans-serif",
        background: "#343333ff",
        color: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* ====== HERO (Banner to & rõ ảnh) ====== */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <BannerSlider banners={BANNERS} heightCSS="clamp(360px, 50vw, 640px)" auto={5000} />
        {/* Radial nhẹ để chữ nổi khối mà không tối ảnh */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(50% 40% at 50% 45%, rgba(0,0,0,.18) 0%, rgba(0,0,0,0) 70%)",
            zIndex: 3,
          }}
        />
        <div
          style={{
            position: "absolute",
            zIndex: 4,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#fff",
            width: "min(92%, 1100px)",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 56px)",
              fontWeight: 900,
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "#00ffae",
              textShadow: "0 0 12px rgba(0,255,170,0.6)",
            }}
          >
            THETHAO SPORTS
          </h1>
          <p style={{ fontSize: "clamp(14px, 2.2vw, 22px)", fontWeight: 500, marginBottom: 24 }}>
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
              transition: "transform .18s ease, box-shadow .18s ease",
              boxShadow: "0 0 12px rgba(0,255,170,0.4)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.06)";
              e.currentTarget.style.boxShadow = "0 0 18px rgba(255,109,0,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(0,255,170,0.4)";
            }}
            onClick={() => navigate("/products")}
          >
            Khám phá ngay
          </button>
        </div>
      </section>

      {/* ====== DANH MỤC NỔI BẬT ====== */}
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
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 18 }}>
              {topCats.map((c) => (
                <CategoryCard key={c.id} c={c} onClick={() => navigate(`/category/${c.id}`)} />
              ))}
            </div>

            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: restCats.length ? 28 : 0 }}>
              {bottomCats.map((c) => (
                <CategoryCard
                  key={c.id}
                  c={c}
                  onClick={() => navigate(`/category/${c.id}`)}
                  style={{ transform: "translateY(6px)" }}
                />
              ))}
            </div>

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

      {/* ====== TRẠNG THÁI ====== */}
      {loading && <p style={{ textAlign: "center", color: "#00e676" }}>Đang tải dữ liệu...</p>}
      {error && <p style={{ textAlign: "center", color: "#ff5252" }}>{error}</p>}

      {/* ====== LƯỚI SẢN PHẨM (4 cột × 2 hàng) ====== */}
      {!loading && !error && (
        <>
          {/* Sản phẩm mới */}
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

            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 20,
                  alignItems: "stretch",
                }}
              >
                {newItems.slice(0, 8).map((p) => (
                  <ProductCardHome key={p.id} p={p} />
                ))}
              </div>
            </div>
          </section>

          {/* Đang giảm giá */}
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

            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 20,
                  alignItems: "stretch",
                }}
              >
                {saleItems.slice(0, 8).map((p) => (
                  <ProductCardHome key={p.id} p={p} />
                ))}
              </div>
            </div>
          </section>

          {/* Gợi ý cho bạn (1 hàng / 4 sp) */}
          <section style={{ margin: "40px 0" }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 18,
                color: "#B388FF",
                textAlign: "center",
                borderBottom: "3px solid #B388FF",
                display: "inline-block",
                paddingBottom: 6,
                textTransform: "uppercase",
                textShadow: "0 0 8px rgba(179,136,255,.5)",
              }}
            >
              Gợi ý cho bạn
            </h2>

            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 20,
                  alignItems: "stretch",
                }}
              >
                {suggestItems.slice(0, 4).map((p) => (
                  <ProductCardHome key={p.id} p={p} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ====== Footer/info ====== */}
      <ContactSection />

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
          ⚽ Chúng Tôi Xin Gửi Lời Cảm Ơn Đã Đồng Hành Cùng SPORT OH !
        </h2>
        <p style={{ color: "#e0e0e0", fontSize: 16, lineHeight: 1.6 }}>
          THETHAO SPORTS mang đến trang phục & phụ kiện thể thao chính hãng, bền bỉ và thời
          thượng. Chúng tôi tối ưu hiệu năng cho từng chuyển động, để bạn tự tin luyện tập,
          thi đấu và phá vỡ giới hạn mỗi ngày.
        </p>
      </section>
    </div>
  );
}
