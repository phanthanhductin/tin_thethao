import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "12px 16px",
  textDecoration: "none",
  color: isActive ? "#34eff6ff" : "#e0e0e0",   // ✅ chữ sáng khi không active
  background: isActive ? "rgba(0,230,118,0.15)" : "transparent",
  borderRadius: 8,
  marginBottom: 6,
  fontWeight: 600,
  transition: "all 0.2s",
});

export default function AdminSidebar() {
  return (
    <div style={{ padding: 16, background: "#121212", height: "100%" }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 16,
          color: "#110defff",
          textTransform: "uppercase",
          letterSpacing: 1,
          textShadow: "0 0 6px rgba(3, 46, 237, 0.6)",
        }}
      >
        Admin
      </div>

      <nav>
        <NavLink to="/admin" end style={linkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/products" style={linkStyle}>
          Quản Lý Sản Phẩm
        </NavLink>
        <NavLink to="/admin/categories" style={linkStyle}>
          Quản Lý Danh Mục
        </NavLink>
        <NavLink to="/admin/orders" style={linkStyle}>
          Quản Lý Đơn Hàng
        </NavLink>
        <NavLink to="/admin/posts" style={linkStyle}>
          Quản Lý Bài Viết
        </NavLink>
        <NavLink to="/admin/contacts" style={linkStyle}>
          Quản Lý Liên Hệ
        </NavLink>
        {/* <NavLink to="/admin/users" style={linkStyle}>
          Quản Lý Người Dùng
        </NavLink> */}
        <NavLink to="/admin/stock-movements" style={linkStyle}>
                  Quản Lý ton kho
                </NavLink>

      </nav>
    </div>
  );
}
