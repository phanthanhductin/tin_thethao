// src/components/HeartButton.jsx
import { useEffect, useState } from "react";
import { isLiked, toggleWishlist } from "../utils/wishlist";

export default function HeartButton({
    productId,
    onToggle,
    className = "",
    size = 22,
}) {
    // 👉 giữ state liked để re-render ngay lập tức
    const [liked, setLiked] = useState(() => isLiked(productId));

    // đổi sản phẩm -> đồng bộ lại
    useEffect(() => {
        setLiked(isLiked(productId));
    }, [productId]);

    // đồng bộ khi thay đổi wishlist từ nơi khác (tab khác / component khác)
    useEffect(() => {
        const sync = () => setLiked(isLiked(productId));
        window.addEventListener("wishlist-changed", sync);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener("wishlist-changed", sync);
            window.removeEventListener("storage", sync);
        };
    }, [productId]);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newLiked = toggleWishlist(productId); // cập nhật localStorage + bắn event
        setLiked(newLiked);                        // 👈 cập nhật UI ngay
        onToggle?.(newLiked);
    };
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const state = toggleWishlist(productId);
                onToggle?.(state);
            }}
            title={liked ? "Bỏ yêu thích" : "Thêm yêu thích"}
            aria-label="Yêu thích"
            className={className}
            style={{
                display: "grid",
                placeItems: "center",
                width: size + 10,
                height: size + 10,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.3)",
                background: "rgba(0,0,0,.4)",
                cursor: "pointer",
            }}
        >
            <svg
                viewBox="0 0 24 24"
                width={size}
                height={size}
                fill={liked ? "#ff4d6d" : "none"}
                stroke={liked ? "#ff4d6d" : "#fff"}
                strokeWidth="2"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        </button>
    );
}
