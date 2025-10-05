import { useMemo, useState } from "react";

/**
 * Ưu tiên lấy API_BASE từ .env (Vite):
 *   VITE_API_BASE=http://127.0.0.1:8000/api
 * Nếu không có thì fallback về 127.0.0.1:8000/api.
 */
const API_BASE =
  import.meta?.env?.VITE_API_BASE?.replace(/\/+$/, "") ||
  "http://127.0.0.1:8000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const validEmail = useMemo(() => {
    // kiểm tra cơ bản
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!validEmail) {
      setErr("Email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      // cố gắng parse JSON; nếu BE trả rỗng, giữ object rỗng
      let data = {};
      try {
        data = await res.json();
      } catch {
        /* ignore parse error */
      }

      if (!res.ok) {
        // Phân loại lỗi để hiển thị rõ ràng
        if (res.status === 404) {
          setErr(data?.message || "Email không tồn tại trong hệ thống");
        } else if (res.status === 500) {
          // Nếu BE có trả 'error' -> show để debug SMTP/SendGrid
          const detail = data?.error ? ` (${String(data.error)})` : "";
          setErr(
            (data?.message || "Gửi email thất bại. Vui lòng thử lại sau.") +
              detail
          );
        } else if (res.status === 422) {
          setErr(
            data?.message ||
              "Thiếu dữ liệu hoặc dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
          );
        } else {
          setErr(
            data?.message ||
              `Có lỗi xảy ra (HTTP ${res.status}). Vui lòng thử lại.`
          );
        }
        return;
      }

      setMsg(data?.message || "Đã gửi mật khẩu mới về email!");
      setErr("");
    } catch (e) {
      setErr("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
    // Khi người dùng sửa email, ẩn thông báo cũ để tránh hiểu nhầm
    if (msg) setMsg("");
    if (err) setErr("");
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>Quên mật khẩu</h2>
      <p style={{ color: "#555" }}>
        Nhập email tài khoản để nhận mật khẩu mới.
      </p>

      <form onSubmit={submit} noValidate>
        <label style={{ display: "block", fontSize: 14, marginBottom: 8 }}>
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={onChangeEmail}
          placeholder="you@example.com"
          autoComplete="email"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            marginBottom: 12,
            outline: "none",
          }}
        />

        <button
          type="submit"
          disabled={loading || !validEmail}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            background: loading ? "#9ca3af" : "#0ea5e9",
            color: "#fff",
            fontWeight: 700,
            border: "none",
            cursor: loading || !validEmail ? "not-allowed" : "pointer",
            opacity: loading || !validEmail ? 0.9 : 1,
          }}
          aria-busy={loading ? "true" : "false"}
        >
          {loading ? "Đang gửi..." : "Gửi mật khẩu mới"}
        </button>
      </form>

      {msg && (
        <div
          style={{
            marginTop: 12,
            color: "#065f46",
            background: "#ecfdf5",
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          {msg}
        </div>
      )}

      {err && (
        <div
          style={{
            marginTop: 12,
            color: "#991b1b",
            background: "#fef2f2",
            padding: "8px 12px",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {err}
        </div>
      )}

      {/* Gợi ý cấu hình nhanh */}
      <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>
        <div>
          <strong>API_BASE:</strong> {API_BASE}
        </div>
      </div>
    </div>
  );
}
