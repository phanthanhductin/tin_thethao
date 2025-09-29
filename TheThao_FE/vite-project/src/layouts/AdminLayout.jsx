import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const layoutStyle = {
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  gridTemplateRows: "64px 1fr",
  height: "100vh",
  background: "#f4f6f9",
  fontFamily: "Montserrat, Arial, sans-serif",
};

export default function AdminLayout() {
  return (
    <div style={layoutStyle}>
      {/* Sidebar */}
      <aside
        style={{
          gridRow: "1 / span 2",
          background: "#121212",
          borderRight: "1px solid #1e1e1e",
          color: "#fff",
          boxShadow: "2px 0 6px rgba(0,0,0,0.4)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "20px 16px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: 1,
            color: "#00e676",
            textShadow: "0 0 8px rgba(0,230,118,0.8)",
          }}
        >
          ⚽ Trang Quảng Trị Viên Sports
        </div>
        <AdminSidebar />
      </aside>

      {/* Header */}
      <header
        style={{
          gridColumn: 2,
          background: "#fff",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          zIndex: 5,
        }}
      >
        <AdminHeader />
      </header>

      {/* Main */}
      <main
        style={{
          padding: "24px",
          overflow: "auto",
          background: "linear-gradient(135deg,#f4f6f9 0%,#e8f5e9 100%)",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "24px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            minHeight: "calc(100vh - 120px)",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
