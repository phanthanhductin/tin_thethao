// src/pages/Customers/Wishlist.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import HeartButton from "../../components/HeartButton";
import { getWishlistIds } from "../../utils/wishlist";

const API = "http://127.0.0.1:8000/api";
const PLACEHOLDER = "https://placehold.co/300x200?text=No+Image";

export default function WishlistPage({ addToCart }) {
    const [ids, setIds] = useState(getWishlistIds());
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // lắng nghe thay đổi wishlist từ nơi khác
    useEffect(() => {
        const onChange = () => setIds(getWishlistIds());
        window.addEventListener("wishlist-changed", onChange);
        window.addEventListener("storage", onChange);
        return () => {
            window.removeEventListener("wishlist-changed", onChange);
            window.removeEventListener("storage", onChange);
        };
    }, []);

    useEffect(() => {
        let abort = false;
        (async () => {
            setLoading(true);
            try {
                if (!ids.length) {
                    setItems([]);
                    return;
                }
                // tải từng sản phẩm (song song)
                const reqs = ids.map((id) =>
                    fetch(`${API}/products/${id}`).then((r) => (r.ok ? r.json() : null))
                );
                const res = await Promise.all(reqs);
                if (!abort) setItems(res.filter(Boolean));
            } finally {
                if (!abort) setLoading(false);
            }
        })();
        return () => {
            abort = true;
        };
    }, [ids]);

    return (
        <div style={{ padding: "100px 20px 40px", minHeight: "100vh", background: "#121212", color: "#f5f5f5" }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, textAlign: "center", marginBottom: 20, color: "#00e5ff" }}>
                ❤️ Danh sách yêu thích
            </h2>

            {!ids.length && (
                <p style={{ textAlign: "center", marginTop: 12 }}>
                    Chưa có sản phẩm nào.{" "}
                    <Link to="/products" style={{ color: "#00e676", fontWeight: 700 }}>
                        Xem sản phẩm →
                    </Link>
                </p>
            )}

            {loading ? (
                <p style={{ textAlign: "center", marginTop: 12, color: "#00e676" }}>Đang tải…</p>
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
                    {items.map((p) => (
                        <div key={p.id} style={{ position: "relative" }}>
                            {/* trái tim để bỏ yêu thích ngay trong trang này */}
                            <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
                                <HeartButton
                                    productId={p.id}
                                    onToggle={() => setIds(getWishlistIds())}
                                />
                            </div>

                            <ProductCard
                                p={{
                                    ...p,
                                    image: p.thumbnail_url || p.thumbnail || PLACEHOLDER,
                                }}
                            />
                            {typeof addToCart === "function" && (
                                <div style={{ textAlign: "center", marginTop: 8 }}>
                                    <button
                                        onClick={() => addToCart(p)}
                                        style={{
                                            background: "linear-gradient(90deg,#00c853,#ff6d00)",
                                            color: "#fff",
                                            border: 0,
                                            padding: "8px 14px",
                                            borderRadius: 16,
                                            cursor: "pointer",
                                        }}
                                    >
                                        + Giỏ
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
