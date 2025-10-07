// src/components/ProductCardHome.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import HeartButton from "./HeartButton";

const VND = new Intl.NumberFormat("vi-VN");
const PLACEHOLDER = "https://placehold.co/400x300?text=No+Image";

// Gradient dịu (pastel)
const SOFT_GRADIENT =
    "linear-gradient(135deg, #a5b4fc 0%, #93c5fd 45%, #67e8f9 100%)";

// Màu chữ
const INK = "#0b1220";
const MUTED = "#475569";
const SALE = "#e11d48";
const CONTACT = "#2563eb";

export default function ProductCardHome({ p }) {
    // Chuẩn hoá giá
    const basePrice = Number(p.price_root ?? 0);
    const salePrice = Number(p.price_sale ?? p.price ?? 0);
    const hasSale = basePrice > 0 && salePrice > 0 && salePrice < basePrice;
    const showPrice = hasSale ? salePrice : (salePrice || basePrice || 0);
    const discount = hasSale
        ? Math.round(((basePrice - salePrice) / basePrice) * 100)
        : 0;

    const imgSrc = p.thumbnail_url || p.image || p.thumbnail || PLACEHOLDER;

    // Force re-render Heart khi toggle (để đổi màu ngay)
    const [, force] = useState(0);

    return (
        <Link
            to={`/products/${p.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
        >
            <article
                style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1px solid rgba(2,6,23,.06)",
                    boxShadow: "0 8px 24px rgba(2,6,23,.08)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    transition: "transform .18s ease, box-shadow .18s ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(2,6,23,.14)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(2,6,23,.08)";
                }}
            >
                {/* Ảnh */}
                <div
                    style={{
                        height: 190,
                        background: "#f1f5f9",
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
                                fontWeight: 900,
                                fontSize: 13,
                                padding: "6px 10px",
                                borderRadius: 999,
                                boxShadow: "0 2px 6px rgba(0,0,0,.18)",
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
                        alt={p.name || `Sản phẩm #${p.id}`}
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                    />
                </div>

                {/* Thông tin (nền gradient + lớp trắng để chữ rõ) */}
                <div style={{ display: "flex", flexDirection: "column", padding: 0, flex: 1 }}>
                    <div
                        style={{
                            // tăng lớp trắng mờ để tương phản tốt
                            backgroundImage: `linear-gradient(180deg, rgba(255,255,255,.90), rgba(255,255,255,.86)), ${SOFT_GRADIENT}`,
                            color: INK,
                            padding: "12px 12px 14px",
                            gap: 6,
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            borderTop: "1px solid rgba(2,6,23,.06)",
                            borderRadius: "0 0 16px 16px",
                        }}
                    >
                        {/* Tên – cố định 2 dòng, chữ đậm màu mực */}
                        <h3
                            style={{
                                fontSize: 16,
                                fontWeight: 900,
                                lineHeight: 1.35,
                                margin: 0,
                                color: INK,
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 2,
                                overflow: "hidden",
                                minHeight: 44,
                            }}
                            title={p.name}
                        >
                            {p.name}
                        </h3>

                        {/* Brand – 1 dòng */}
                        <div
                            style={{
                                color: MUTED,
                                fontSize: 13,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                minHeight: 18,
                                fontWeight: 800,
                            }}
                            title={p.brand_name || ""}
                        >
                            {p.brand_name || "—"}
                        </div>

                        {/* Giá – dồn đáy */}
                        <div style={{ marginTop: "auto" }}>
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 1000,
                                    color: showPrice > 0 ? (hasSale ? SALE : INK) : CONTACT,
                                }}
                            >
                                {showPrice > 0 ? `${VND.format(showPrice)} đ` : "Liên hệ"}
                            </div>
                            {hasSale && (
                                <div
                                    style={{
                                        color: "#94a3b8",
                                        textDecoration: "line-through",
                                        marginTop: 2,
                                        fontWeight: 800,
                                    }}
                                >
                                    {VND.format(basePrice)} đ
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
