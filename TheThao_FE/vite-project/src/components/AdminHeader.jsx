// export default function AdminHeader() {
//   return (
//     <div style={{
//       height: 60, display: "flex", alignItems: "center",
//       justifyContent: "space-between", padding: "0 16px"
//     }}>
//       <strong>Admin Panel</strong>
//       <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//         <input
//           placeholder="Search…"
//           style={{ height: 34, padding: "0 10px", border: "1px solid #ddd", borderRadius: 6, minWidth: 220 }}
//         />
//         <div style={{
//           width: 34, height: 34, borderRadius: "50%", background: "#0f62fe",
//           color: "#fff", display: "grid", placeItems: "center", fontWeight: 700
//         }}>A</div>
//       </div>
//     </div>
//   );
// }


// src/components/Admin/AdminHeader.jsx
import { useNavigate } from "react-router-dom";

export default function AdminHeader() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("admin_user") || "null");

  const handleLogout = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      if (token) {
        await fetch("http://127.0.0.1:8000/api/logout", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/admin/login";
    }
  };

  const displayName = user?.name || user?.email || "Admin";

  return (
    <header
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "linear-gradient(90deg, #1976d2, #42a5f5, #4fc3f7)",
        color: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        width: "100%",
      }}
    >
      {/* Logo + title */}
      <div style={{ fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
        🏋️‍♂️ <span>Quản Trị Viên Sports</span>
      </div>

      {/* Search + User info + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <input
          placeholder="Tìm kiếm..."
          style={{
            height: 36,
            padding: "0 10px",
            borderRadius: 8,
            border: "none",
            minWidth: 240,
            outline: "none",
            fontSize: 14,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#fff",
              color: "#1976d2",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: 18,
              boxShadow: "0 0 8px rgba(0,0,0,0.15)",
            }}
          >
            {displayName[0]?.toUpperCase() || "A"}
          </div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>
            Xin chào, {displayName} 👋
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "#e53935",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#c62828")}
          onMouseOut={(e) => (e.target.style.background = "#e53935")}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
