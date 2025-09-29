// vite-project/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const API_BASE = "http://127.0.0.1:8000";
  const REGISTER_URL = `${API_BASE}/api/register`;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      };

      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch { }

      if (res.ok) {
        navigate("/login");
        return;
      }

      if (res.status === 422 && data?.errors) {
        setErrors(data.errors);
      } else {
        setServerError(data?.message || `Có lỗi xảy ra (HTTP ${res.status}).`);
      }
    } catch (err) {
      console.error("Register failed:", err);
      setServerError("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const Err = ({ name }) =>
    errors[name] ? (
      <div style={{ color: "#d32f2f", fontSize: 13, marginTop: 4 }}>
        {Array.isArray(errors[name])
          ? errors[name].join(", ")
          : String(errors[name])}
      </div>
    ) : null;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      {/* Background image bằng thẻ img */}
      <img
        src="http://127.0.0.1:8000/assets/images/banner2.jpg"
        alt="Sports Banner"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(4px) brightness(0.6)",
          zIndex: 0,
        }}
      />

      {/* Overlay mờ đen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.3)",
          zIndex: 1,
        }}
      ></div>


      {/* Overlay để form nổi hơn */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.3)",
          zIndex: 1,
        }}
      ></div>

      {/* Form card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.92)",
          padding: "32px 28px",
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          zIndex: 2,
        }}
      >
        <h2
          style={{ marginBottom: 24, textAlign: "center", color: "#1316e08a" }}
        >
          Đăng ký tài khoản
        </h2>

        {serverError && (
          <div
            style={{
              color: "#d32f2f",
              marginBottom: 16,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#fdecea",
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={submit} noValidate>
          {[
            { label: "Họ tên", name: "name", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Số điện thoại", name: "phone", type: "text" },
            { label: "Mật khẩu (≥ 6 ký tự)", name: "password", type: "password" },
            {
              label: "Nhập lại mật khẩu",
              name: "password_confirmation",
              type: "password",
            },
          ].map((f) => (
            <div key={f.name} style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                {f.label}
              </label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name]}
                onChange={onChange}
                required
                style={{
                  display: "block",
                  width: "90%",        // ⬅️ cho ngắn lại
                  maxWidth: 360,       // ⬅️ không quá to
                  margin: "0 auto",    // ⬅️ canh giữa trong form
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #ccc",
                  outline: "none",
                  transition: "all 0.2s",
                  backgroundColor: "#fff",
                }}
                onFocus={(e) => (e.target.style.border = "1px solid #1e88e5")}
                onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
              />

              <Err name={f.name} />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: 0,
              cursor: "pointer",
              background: loading ? "#9ccc65" : "#023ea5c6",
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              transition: "background 0.2s",
            }}
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
}
