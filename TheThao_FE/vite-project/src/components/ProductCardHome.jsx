// src/components/ProductCardHome.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import HeartButton from "./HeartButton";

const VND = new Intl.NumberFormat("vi-VN");
const PLACEHOLDER = "https://placehold.co/400x300?text=No+Image";

export default function ProductCardHome({ p }) {
    // Chuẩn hoá giá
    const basePrice = Number(p.price_root ?? 0);
    const salePrice = Number(p.price_sale ?? p.price ?? 0);
    const hasSale = basePrice > 0 && salePrice > 0 && salePrice < basePrice;
    const showPrice = hasSale ? salePrice : basePrice;
    const discount = hasSale ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0;

    const imgSrc = p.thumbnail_url || p.image || p.thumbnail || PLACEHOLDER;

    // Force re-render Heart khi toggle (để đổi màu ngay)
    const [, force] = useState(0);

    return (
        <Link to={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <article
                style={{
                    background: "#1e1e1e",
                    borderRadius: 14,
                    boxShadow: "0 4px 18px rgba(0,0,0,.25)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    transition: "transform .18s ease, box-shadow .18s ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 26px rgba(0,0,0,.35)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,.25)";
                }}
            >
                {/* Ảnh */}
                <div
                    style={{
                        height: 180,
                        background: "#2a2a2a",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Badge giảm giá */}
                    {hasSale && (
                        <span
                            style={{
                                position: "absolute",
                                top: 10,
                                left: 10,
                                background: "linear-gradient(180deg,#ff7a18,#ff3d00)",
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: 13,
                                padding: "6px 10px",
                                borderRadius: 999,
                                boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                            }}
                        >
                            -{discount}%
                        </span>
                    )}

                    {/* Tym */}
                    <div
                        style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}
                        onClick={(e) => e.preventDefault()} // tránh click vào card bị điều hướng
                    >
                        <HeartButton productId={p.id} onToggle={() => force((x) => x + 1)} />
                    </div>

                    <img
                        src={imgSrc}
                        alt={p.name}
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </div>

                {/* Thông tin */}
                <div style={{ display: "flex", flexDirection: "column", padding: "12px 12px 14px", gap: 6, flex: 1 }}>
                    {/* Tên – luôn đều nhau (2 dòng) */}
                    <h3
                        style={{
                            fontSize: 16,
                            fontWeight: 800,
                            lineHeight: 1.35,
                            margin: 0,
                            color: "#fff",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            overflow: "hidden",
                            minHeight: 44, // ~2 dòng -> giữ CHUẨN chiều cao
                        }}
                        title={p.name}
                    >
                        {p.name}
                    </h3>

                    {/* Brand – 1 dòng cố định */}
                    <div
                        style={{
                            color: "#00e6a7",
                            fontSize: 13,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            minHeight: 18,
                        }}
                        title={p.brand_name || ""}
                    >
                        {p.brand_name || "—"}
                    </div>

                    {/* Giá – luôn dồn đáy */}
                    <div style={{ marginTop: "auto" }}>
                        <div style={{ color: "#ff4d4f", fontSize: 18, fontWeight: 800 }}>
                            {showPrice > 0 ? `${VND.format(showPrice)} đ` : "Liên hệ"}
                        </div>
                        {hasSale && (
                            <div style={{ color: "#a3a3a3", textDecoration: "line-through", marginTop: 2 }}>
                                {VND.format(basePrice)} đ
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}
