// src/pages/Customers/ProductDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import HeartButton from "../../components/HeartButton";
import ProductReviews from "../../components/ProductReviews";

const API = "http://127.0.0.1:8000/api";
const PLACEHOLDER = "https://placehold.co/400x300?text=No+Image";
const VND = new Intl.NumberFormat("vi-VN");

// Map tên màu → mã màu (có cả tiếng Việt)
const COLOR_MAP = {
  black: "#111111",
  trắng: "#ffffff",
  white: "#ffffff",
  đen: "#111111",
  đỏ: "#e53935",
  "đỏ đô": "#8b0000",
  cam: "#fb8c00",
  orange: "#fb8c00",
  vàng: "#fdd835",
  yellow: "#fdd835",
  xanh: "#1e88e5",
  "xanh dương": "#1e88e5",
  "xanh lá": "#43a047",
  green: "#43a047",
  blue: "#1e88e5",
  hồng: "#ec407a",
  tím: "#8e24aa",
  xám: "#9e9e9e",
  grey: "#9e9e9e",
};

// Chuyển text -> mã màu, hoặc trả null để hiển thị chip chữ
function colorToHex(name = "") {
  const raw = String(name).trim().toLowerCase();
  if (!raw) return null;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;
  return COLOR_MAP[raw] || null;
}

// Helper giá cho related
function getRelatedPriceParts(p) {
  const root = Number(p.price_root ?? 0);
  const sale = Number(p.price_sale ?? p.price ?? 0);
  const current = sale > 0 ? sale : root;
  const strike = sale > 0 && root > 0 && sale < root ? root : null;
  const pct = strike ? Math.round(100 - (sale / strike) * 100) : 0;
  return { current, strike, pct };
}

export default function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Biến thể + số lượng
  const [selColor, setSelColor] = useState("");
  const [selSize, setSelSize] = useState("");
  const [qtyPick, setQtyPick] = useState(1);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) Chi tiết
        const res = await fetch(`${API}/products/${id}`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProduct(data);

        // 2) Liên quan
        if (data?.category_id) {
          const r = await fetch(`${API}/categories/${data.category_id}/products`, { signal: ac.signal });
          if (r.ok) {
            const all = await r.json();
            const list = (Array.isArray(all) ? all : all?.data ?? [])
              .filter((x) => x.id !== Number(id))
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

  const variants = product?.variants || [];

  // Tập màu/size có trong variants
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))),
    [variants]
  );
  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))),
    [variants]
  );

  // Filter in-stock
  const inStockVariant = (v) =>
    Number(v?.qty ?? 0) > 0 ||
    String(v?.status).toLowerCase() === "active" ||
    String(v?.status) === "1";

  // Các size còn hàng theo màu đã chọn (nếu đã chọn màu)
  const sizeOptionsForColor = useMemo(() => {
    if (!selColor) return new Set(sizes.filter((s) => variants.some((v) => v.size === s && inStockVariant(v))));
    return new Set(
      variants
        .filter((v) => v.color === selColor && inStockVariant(v))
        .map((v) => v.size)
        .filter(Boolean)
    );
  }, [selColor, sizes, variants]);

  // Các màu còn hàng theo size đã chọn (nếu đã chọn size)
  const colorOptionsForSize = useMemo(() => {
    if (!selSize) return new Set(colors.filter((c) => variants.some((v) => v.color === c && inStockVariant(v))));
    return new Set(
      variants
        .filter((v) => v.size === selSize && inStockVariant(v))
        .map((v) => v.color)
        .filter(Boolean)
    );
  }, [selSize, colors, variants]);

  // Biến thể đang khớp chọn
  const activeVariant = useMemo(() => {
    if (!variants.length) return null;
    return (
      variants.find(
        (v) =>
          (selColor ? v.color === selColor : true) &&
          (selSize ? v.size === selSize : true)
      ) || null
    );
  }, [variants, selColor, selSize]);

  // Nếu đổi màu làm size hiện tại không hợp lệ -> reset size
  useEffect(() => {
    if (selColor && selSize && !sizeOptionsForColor.has(selSize)) {
      setSelSize("");
    }
  }, [selColor, selSize, sizeOptionsForColor]);

  // Nếu đổi size làm màu hiện tại không hợp lệ -> reset màu
  useEffect(() => {
    if (selSize && selColor && !colorOptionsForSize.has(selColor)) {
      setSelColor("");
    }
  }, [selSize, selColor, colorOptionsForSize]);

  if (loading) return <p style={{ padding: 20, color: "#00e676" }}>Đang tải...</p>;
  if (err) return <p style={{ padding: 20, color: "#ff5252" }}>{err}</p>;
  if (!product) return <p style={{ padding: 20 }}>Sản phẩm không tồn tại.</p>;

  // ====== GIÁ & GIẢM ======
  const basePrice = Number(product.price_root ?? 0);
  const salePrice = Number(product.price_sale ?? 0);
  const effectiveBase = salePrice > 0 ? salePrice : basePrice;

  const showPrice = activeVariant
    ? (Number(activeVariant.price_sale) > 0
      ? Number(activeVariant.price_sale)
      : (Number(activeVariant.price_root) || effectiveBase))
    : effectiveBase;

  let strikePrice = null;
  let discountPct = 0;
  if (
    activeVariant &&
    Number(activeVariant.price_sale) > 0 &&
    Number(activeVariant.price_root) > 0 &&
    Number(activeVariant.price_sale) < Number(activeVariant.price_root)
  ) {
    strikePrice = Number(activeVariant.price_root);
    discountPct = Math.round(100 - (Number(activeVariant.price_sale) / strikePrice) * 100);
  } else if (!activeVariant && salePrice > 0 && basePrice > 0 && salePrice < basePrice) {
    strikePrice = basePrice;
    discountPct = Math.round(100 - (salePrice / basePrice) * 100);
  }

  // ====== KHO ======
  const productInStock =
    Number(product.qty) > 0 ||
    String(product.status).toLowerCase() === "active" ||
    String(product.status) === "1";

  const inStock = activeVariant ? inStockVariant(activeVariant) : productInStock;
  const stockLeft = activeVariant ? Number(activeVariant.qty ?? 0) : Number(product.qty ?? 0);
  const maxQtyPick = Math.max(1, stockLeft || 1);

  const imgSrc = product.thumbnail_url || product.thumbnail || PLACEHOLDER;

  const handleAddToCart = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Bạn cần đăng nhập trước khi thêm sản phẩm!");
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    if (variants.length && !activeVariant) {
      alert("Vui lòng chọn màu/size trước khi thêm giỏ!");
      return;
    }
    if (typeof addToCart === "function") {
      for (let i = 0; i < qtyPick; i++) {
        addToCart({
          ...product,
          price: showPrice,
          variant: activeVariant
            ? { id: activeVariant.id, color: activeVariant.color, size: activeVariant.size }
            : null,
        });
      }
      alert(`🎉 Đã thêm ${qtyPick} vào giỏ hàng!`);
    }
  };

  return (
    <div
      style={{
        padding: "100px 20px 40px",
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
          position: "relative",
        }}
      >
        {/* Badge % giảm giá */}
        {discountPct > 0 && (
          <div
            style={{
              position: "absolute",
              left: 14,
              top: 14,
              zIndex: 3,
              background: "linear-gradient(135deg,#ff1744,#ff9100)",
              color: "#fff",
              fontWeight: 900,
              padding: "6px 10px",
              borderRadius: 12,
              boxShadow: "0 2px 10px rgba(0,0,0,.35)",
            }}
          >
            -{discountPct}%
          </div>
        )}

        {/* ♥ */}
        <div style={{ position: "absolute", right: 16, top: 16, zIndex: 2 }}>
          <HeartButton productId={Number(id)} />
        </div>

        {/* Ảnh */}
        <div style={{ flex: "1 1 340px" }}>
          <img
            src={imgSrc}
            alt={product.name}
            style={{
              width: 460,
              maxWidth: "100%",
              borderRadius: 12,
              objectFit: "cover",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
          />
        </div>

        {/* Thông tin */}
        <div style={{ flex: "2 1 460px" }}>
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
            {product.brand_name ?? "Thương hiệu: đang cập nhật"}
          </p>

          {/* Giá + gạch + tiết kiệm */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#ff5252" }}>
                {showPrice > 0 ? `${VND.format(showPrice)} đ` : "Liên hệ"}
              </div>
              {strikePrice && (
                <div style={{ color: "#aaa", textDecoration: "line-through" }}>
                  {VND.format(strikePrice)} đ
                </div>
              )}
            </div>
            {strikePrice && showPrice > 0 && strikePrice > showPrice && (
              <div style={{ marginTop: 4, color: "#9adfff", fontWeight: 700 }}>
                Tiết kiệm {VND.format(strikePrice - showPrice)} đ
              </div>
            )}
          </div>

          {/* Trạng thái kho + còn N cái */}
          <div style={{ marginBottom: 14 }}>
            Trạng thái:{" "}
            <strong style={{ color: inStock ? "#00e676" : "#ff7043" }}>
              {inStock ? "Còn hàng" : "Hết hàng"}
            </strong>
            {inStock && stockLeft > 0 && (
              <span style={{ marginLeft: 10, color: "#ffd166" }}>
                {stockLeft <= 5 ? `• Chỉ còn ${stockLeft} sản phẩm` : `• Còn ${stockLeft} sản phẩm`}
              </span>
            )}
          </div>

          {/* Biến thể */}
          {!!variants.length && (
            <div style={{ display: "grid", gap: 14, margin: "10px 0 18px" }}>
              {/* Màu */}
              {!!colors.length && (
                <div>
                  <div style={{ marginBottom: 8, color: "#9adfff", fontWeight: 700, letterSpacing: .3 }}>
                    Màu sắc {selColor ? `• ${selColor}` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {colors.map((c) => {
                      const hex = colorToHex(c);
                      const enabled = colorOptionsForSize.has(c);
                      const selected = selColor === c;
                      return (
                        <button
                          key={c}
                          onClick={() => enabled && setSelColor(selected ? "" : c)}
                          title={c}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 999,
                            display: "grid",
                            placeItems: "center",
                            border: selected ? "3px solid #00e5ff" : "2px solid #444",
                            background: hex || "#0f172a",
                            color: "#fff",
                            cursor: enabled ? "pointer" : "not-allowed",
                            opacity: enabled ? 1 : 0.35,
                          }}
                        >
                          {!hex && <span style={{ fontSize: 11, padding: "0 6px" }}>{c}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size */}
              {!!sizes.length && (
                <div>
                  <div style={{ marginBottom: 8, color: "#9adfff", fontWeight: 700, letterSpacing: .3 }}>
                    Kích cỡ {selSize ? `• ${selSize}` : ""}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {sizes.map((s) => {
                      const enabled = sizeOptionsForColor.has(s);
                      const selected = selSize === s;
                      return (
                        <button
                          key={s}
                          onClick={() => enabled && setSelSize(selected ? "" : s)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 10,
                            border: selected ? "2px solid #00e5ff" : "1px solid #444",
                            background: "#101010",
                            color: enabled ? "#fff" : "#94a3b8",
                            cursor: enabled ? "pointer" : "not-allowed",
                            opacity: enabled ? 1 : 0.5,
                            fontWeight: 700,
                            minWidth: 48,
                            textAlign: "center",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(selColor || selSize) && (
                <button
                  onClick={() => { setSelColor(""); setSelSize(""); }}
                  style={{
                    alignSelf: "start",
                    marginTop: 4,
                    background: "transparent",
                    color: "#9adfff",
                    border: "1px dashed #334155",
                    padding: "6px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  Xoá lựa chọn
                </button>
              )}
            </div>
          )}

          {/* Số lượng */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 18px" }}>
            <span style={{ color: "#9adfff", fontWeight: 700 }}>Số lượng</span>
            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #334155", borderRadius: 10, overflow: "hidden" }}>
              <button
                onClick={() => setQtyPick((n) => Math.max(1, n - 1))}
                style={{ width: 36, height: 34, background: "#0b1220", color: "#fff", border: "none", cursor: "pointer" }}
              >−</button>
              <input
                value={qtyPick}
                onChange={(e) => {
                  const n = Math.max(1, Math.min(maxQtyPick, Number(e.target.value) || 1));
                  setQtyPick(n);
                }}
                style={{ width: 48, height: 34, textAlign: "center", background: "#0b1220", color: "#fff", border: "none" }}
              />
              <button
                onClick={() => setQtyPick((n) => Math.min(maxQtyPick, n + 1))}
                style={{ width: 36, height: 34, background: "#0b1220", color: "#fff", border: "none", cursor: "pointer" }}
              >+</button>
            </div>
            {inStock && stockLeft > 0 && (
              <span style={{ color: "#94a3b8" }}>(Tối đa {maxQtyPick})</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            style={{
              background: inStock ? "linear-gradient(90deg,#00c853,#ff6d00)" : "#394249",
              color: "#fff",
              border: 0,
              padding: "12px 22px",
              borderRadius: 30,
              cursor: inStock ? "pointer" : "not-allowed",
              fontSize: 16,
              fontWeight: 700,
              boxShadow: "0 0 12px rgba(255,109,0,0.6)",
              transition: "transform .2s ease, box-shadow .2s ease",
            }}
            onMouseEnter={(e) => {
              if (!inStock) return;
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 0 18px rgba(0,255,170,0.6)";
            }}
            onMouseLeave={(e) => {
              if (!inStock) return;
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 0 12px rgba(255,109,0,0.6)";
            }}
          >
            🛒 Thêm vào giỏ
          </button>

          {/* Quick info cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginTop: 18 }}>
            {[
              ["🚚", "Giao nhanh 24-48h"],
              ["🔁", "Đổi size trong 7 ngày"],
              ["🛡️", "Hàng chính hãng"],
            ].map(([ico, text]) => (
              <div key={text} style={{ background: "#151a22", border: "1px solid #223041", borderRadius: 10, padding: 10, display: "flex", gap: 8, alignItems: "center", color: "#cbd5e1" }}>
                <span style={{ fontSize: 18 }}>{ico}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mô tả chi tiết */}
      <div
        style={{
          marginTop: 30,
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
          {product.detail || product.description || "Chưa có mô tả."}
        </p>
      </div>

      {/* Reviews */}
      <ProductReviews productId={Number(id)} />

      {/* Sản phẩm liên quan */}
      {!!related.length && (
        <div style={{ marginTop: 40 }}>
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
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 20,
            }}
          >
            {related.map((p) => {
              const img = p.thumbnail_url || p.thumbnail || PLACEHOLDER;
              const brand = p.brand_name || "—";
              const { current, strike, pct } = getRelatedPriceParts(p);

              return (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      position: "relative",
                      background: "#1e1e1e",
                      borderRadius: 14,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                      padding: 14,
                      transition: "transform .2s ease, box-shadow .2s ease",
                      height: "100%",
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
                    {/* Badge giảm giá */}
                    {pct > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          left: 10,
                          top: 10,
                          background:
                            "linear-gradient(135deg,#ff1744,#ff9100)",
                          color: "#fff",
                          fontWeight: 900,
                          padding: "6px 10px",
                          borderRadius: 12,
                          fontSize: 14,
                          boxShadow: "0 2px 10px rgba(0,0,0,.35)",
                          zIndex: 2,
                        }}
                      >
                        -{pct}%
                      </div>
                    )}

                    {/* ♥ */}
                    <div style={{ position: "absolute", right: 10, top: 10, zIndex: 2 }}>
                      <HeartButton productId={p.id} />
                    </div>

                    {/* Ảnh */}
                    <div
                      style={{
                        height: 170,
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "#2a2a2a",
                        marginBottom: 10,
                      }}
                    >
                      <img
                        src={img}
                        alt={p.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                        loading="lazy"
                      />
                    </div>

                    {/* Tên */}
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        lineHeight: 1.35,
                        minHeight: 44, // clamp 2 dòng
                        color: "#fff",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        marginBottom: 6,
                      }}
                    >
                      {p.name}
                    </div>

                    {/* Brand */}
                    <div style={{ color: "#64ffda", fontSize: 13, marginBottom: 6 }}>
                      {brand}
                    </div>

                    {/* Giá */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <div style={{ color: "#ff5252", fontWeight: 900 }}>
                        {current > 0 ? `${VND.format(current)} đ` : "Liên hệ"}
                      </div>
                      {strike && (
                        <div style={{ color: "#aaa", textDecoration: "line-through", fontSize: 14 }}>
                          {VND.format(strike)} đ
                        </div>
                      )}
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
