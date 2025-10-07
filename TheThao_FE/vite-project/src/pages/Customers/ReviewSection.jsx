import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE = "http://127.0.0.1:8000/api";

export default function ReviewSection({ productId }) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pid = productId ?? params.id;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, content: "" });
  const [error, setError] = useState("");
  const [canReview, setCanReview] = useState(false);

  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  // ⭐ Tính điểm trung bình
  const avgRating = useMemo(() => {
    if (!reviews?.length) return null;
    const sum = reviews.reduce((s, r) => s + Number(r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  // ✅ Lấy thông tin sản phẩm
  useEffect(() => {
    if (!pid) return;
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/products/${pid}`, {
          signal: ac.signal,
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setProduct(data.data || data.product || data);
        }
      } catch {}
    })();
    return () => ac.abort();
  }, [pid]);

  // ✅ Load danh sách review
  useEffect(() => {
    if (!pid) return;
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/products/${pid}/reviews`, {
          signal: ac.signal,
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        if (!res.ok) {
          setError("Không tải được đánh giá.");
          setReviews([]);
          return;
        }
        setReviews(Array.isArray(data.data) ? data.data : []);
        setError("");
      } catch {
        setError("Không tải được đánh giá.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [pid]);

  // ✅ Kiểm tra quyền đánh giá
  useEffect(() => {
    if (!pid || !token) return;
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/products/${pid}/can-review`, {
          signal: ac.signal,
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setCanReview(false);
          return;
        }
        const data = await res.json();
        setCanReview(!!data?.canReview);
      } catch {
        setCanReview(false);
      }
    })();
    return () => ac.abort();
  }, [pid, token]);

  // ✅ Gửi đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login", { state: { redirectTo: location.pathname } });
      toast.info("Vui lòng đăng nhập để đánh giá sản phẩm!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products/${pid}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: pid,
          rating: newReview.rating,
          content: newReview.content.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message || "Không thêm được đánh giá");
        return;
      }

      const reviewData = data.data || data;
      setReviews((cur) => [reviewData, ...cur]);
      setNewReview({ rating: 5, content: "" });
      toast.success("Đã gửi đánh giá, cảm ơn bạn!");
    } catch {
      toast.error("Không kết nối được server");
    }
  };

  // ✅ Xóa đánh giá
  const handleDelete = async (id) => {
    if (!token) {
      navigate("/login", { state: { redirectTo: location.pathname } });
      toast.info("Cần đăng nhập");
      return;
    }
    if (!confirm("Xóa review này?")) return;
    try {
      const res = await fetch(`${API_BASE}/reviews/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReviews((rs) => rs.filter((r) => r.id !== id));
        toast.success("Đã xóa đánh giá");
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d?.message || "Xóa thất bại");
      }
    } catch {
      toast.error("Không kết nối được server");
    }
  };

  const formatVND = (n) =>
    typeof n === "number"
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
      : n ?? "-";

  const productPrice = useMemo(() => {
    if (!product) return null;
    const p =
      product.price_sale ?? product.sale_price ?? product.price_root ?? product.price ?? null;
    return typeof p === "number" ? p : Number(p ?? 0) || null;
  }, [product]);

  const productThumb =
    product?.thumbnail_url || product?.image_url || product?.thumbnail || "";

  // 🩵 Giao diện hiển thị
  return (
    <div style={{ marginTop: 40 }}>
      {/* === Thông tin sản phẩm === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr auto",
          gap: 12,
          padding: 12,
          border: "1px solid #e8f0ec",
          borderRadius: 12,
          background: "#ffffff",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <img
          src={productThumb || "https://placehold.co/80x80?text=No+Img"}
          width={80}
          height={80}
          alt={product?.name || "product"}
          style={{ borderRadius: 10, objectFit: "cover" }}
        />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: "#14532d" }}>
            {product?.name || `Sản phẩm #${pid}`}
          </div>
          <div style={{ color: "#d97706", fontWeight: 700 }}>
            {avgRating != null ? `⭐ ${avgRating} / 5` : "Chưa có điểm"} ({reviews.length} đánh giá)
          </div>
        </div>
        <div style={{ textAlign: "right", fontWeight: 900, color: "#065f46" }}>
          {productPrice != null ? formatVND(productPrice) : ""}
        </div>
      </div>

      {/* === Form đánh giá === */}
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#388e3c" }}>
        ⭐ Đánh giá sản phẩm
      </h3>

      {loading && <p>Đang tải review...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {user && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8 }}>
            <label>Chấm điểm: </label>
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview((s) => ({ ...s, rating: Number(e.target.value) }))}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} ⭐
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={newReview.content}
            onChange={(e) => setNewReview((s) => ({ ...s, content: e.target.value }))}
            placeholder="Viết đánh giá của bạn..."
            rows={3}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: 8,
              background: "#388e3c",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 6,
              border: 0,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Gửi đánh giá
          </button>
        </form>
      )}

      {/* === Danh sách review === */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reviews.length === 0 && <p>Chưa có đánh giá nào.</p>}

        {reviews.map((r) => (
          <div
            key={r.id}
            style={{
              background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)",
              border: "1px solid #d1fae5",
              borderRadius: 10,
              padding: 12,
              boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <b style={{ color: "#065f46" }}>{r.user?.name || "Ẩn danh"}</b>
              <span style={{ color: "#facc15", fontSize: 16 }}>
                {"⭐".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
              </span>
            </div>

            {/* ✅ Hiển thị nội dung bình luận */}
            <p style={{ marginTop: 6, color: "#374151" }}>
              {r.content || <i>(Không có nội dung)</i>}
            </p>

            {/* ✅ Hiển thị thời gian tạo */}
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              {r.created_at
                ? new Date(r.created_at).toLocaleString("vi-VN")
                : "Chưa rõ thời gian"}
            </div>

            {/* ✅ Nút xóa nếu là người viết */}
            {user && user.id === r.user_id && (
              <button
                onClick={() => handleDelete(r.id)}
                style={{
                  marginTop: 6,
                  background: "transparent",
                  color: "red",
                  border: "none",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ❌ Xóa
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
