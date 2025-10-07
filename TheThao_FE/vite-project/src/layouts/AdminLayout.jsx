// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import AdminSidebar from "../components/AdminSidebar";
// import AdminHeader from "../components/AdminHeader";

// export default function AdminLayout() {
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <div className={`admin-shell ${collapsed ? "is-collapsed" : ""}`}>
//       <style>{`
//         /* ========= THEME (đồng bộ tím → cyan loang) ========= */
//         .admin-shell{
//           --header-h:64px;
//           --sidebar-w:260px; --sidebar-w-collapsed:84px;
//           --bg:#f8fafc; --card:#fff; --ink:#0b1220; --muted:#475569;
//           --line:rgba(2,6,23,.08); --shadow:0 10px 28px rgba(2,6,23,.10);
//           --accent1:#6366f1; --accent2:#06b6d4;

//           display:grid; grid-template-columns:var(--sidebar-w) 1fr;
//           grid-template-rows:var(--header-h) 1fr; height:100vh;
//           background:var(--bg); color:var(--ink);
//           font-family:"Montserrat", Arial, sans-serif;
//         }
//         .admin-shell.is-collapsed{ grid-template-columns:var(--sidebar-w-collapsed) 1fr; }

//         /* ===== Sidebar ===== */
//         .aside{
//           grid-row:1 / span 2; position:relative; isolation:isolate;
//           color:#e5e7eb; border-right:1px solid #0b1220; z-index:4; /* cao hơn header để không bị che mép */
//           overflow:hidden; box-shadow:2px 0 12px rgba(2,6,23,.25);
//         }
//         .aside::before{
//           content:""; position:absolute; inset:0; z-index:-1;
//           background:
//             radial-gradient(130% 160% at -10% -20%, rgba(99,102,241,.35) 0%, rgba(99,102,241,0) 45%),
//             radial-gradient(130% 160% at 110% -10%, rgba(6,182,212,.35) 0%, rgba(6,182,212,0) 48%),
//             linear-gradient(180deg, #0b1120 0%, #0a0f1a 100%);
//         }
//         .aside-head{
//           height:var(--header-h); display:flex; align-items:center; gap:10px;
//           padding:0 12px; border-bottom:1px solid rgba(255,255,255,.10);
//           font-weight:1000; letter-spacing:.5px; white-space:nowrap; overflow:hidden;
//         }
//         .brand-dot{width:12px;height:12px;border-radius:999px;background:linear-gradient(135deg,var(--accent1),var(--accent2));box-shadow:0 0 16px rgba(99,102,241,.6)}
//         .brand-text{color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.35)}
//         .collapse-btn{
//           margin-left:auto;width:36px;height:36px;border-radius:12px;border:1px solid rgba(255,255,255,.2);
//           background:rgba(255,255,255,.06); color:#fff; display:grid; place-items:center; cursor:pointer;
//         }
//         .collapse-btn:hover{ background:rgba(255,255,255,.12) }
//         .aside-body{ height:calc(100% - var(--header-h)); overflow:auto; padding:10px 8px 16px }
//         .admin-shell.is-collapsed .aside .hide-when-collapsed{ display:none }

//         .aside-body::-webkit-scrollbar{ width:10px }
//         .aside-body::-webkit-scrollbar-thumb{ background:rgba(255,255,255,.18); border-radius:999px }

//         /* ===== Header (không che nội dung, bo nhẹ) ===== */
//         .header{ grid-column:2; position:sticky; top:0; z-index:3; color:#fff; isolation:isolate; }
//         .header::before{
//           content:""; position:absolute; inset:0; z-index:-1;
//           background:
//             radial-gradient(130% 160% at -10% -30%, rgba(99,102,241,.35) 0%, rgba(99,102,241,0) 48%),
//             radial-gradient(130% 160% at 110% -20%, rgba(6,182,212,.35) 0%, rgba(6,182,212,0) 50%),
//             linear-gradient(90deg,var(--accent1) 0%, var(--accent2) 100%);
//           border-radius:0 0 16px 16px; box-shadow:0 6px 18px rgba(2,6,23,.20);
//         }
//         .header-inner{ height:var(--header-h); display:flex; align-items:center; justify-content:space-between; padding:0 16px }

//         /* ===== Main ===== */
//         .main{
//           grid-column:2; overflow:auto; padding:18px 18px 24px; /* thêm đệm để không "dính" header */
//           background:
//             radial-gradient(100% 120% at 10% -10%, rgba(99,102,241,.08) 0%, rgba(99,102,241,0) 35%),
//             radial-gradient(100% 120% at 90% -10%, rgba(6,182,212,.08) 0%, rgba(6,182,212,0) 35%),
//             linear-gradient(135deg,#f8fafc 0%,#eefcf7 100%);
//         }
//         .content{ width:min(1280px, 96vw); margin:0 auto; }
//         .panel{
//           background:var(--card); border:1px solid var(--line); border-radius:16px;
//           padding:18px; min-height:calc(100vh - var(--header-h) - 48px); box-shadow:var(--shadow);
//         }

//         /* ===== Admin KIT: toolbar, button, table, badge, pagination, skeleton ===== */
//         .ak-toolbar{display:flex; gap:10px; align-items:center; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap}
//         .ak-title{font-size:22px; font-weight:1000}
//         .ak-actions{display:flex; gap:8px; align-items:center; flex-wrap:wrap}

//         .ak-input, .ak-select{
//           height:38px; padding:0 12px; border-radius:10px; border:1px solid var(--line); background:#fff; min-width:220px; font-weight:800;
//           outline:none; box-shadow:0 1px 2px rgba(2,6,23,.05) inset;
//         }
//         .ak-input:focus, .ak-select:focus{ border-color:#93c5fd; box-shadow:0 0 0 4px rgba(99,102,241,.15) }

//         .ak-btn{height:38px; padding:0 14px; border-radius:10px; border:0; cursor:pointer; font-weight:900; display:inline-flex; align-items:center; gap:8px}
//         .ak-btn.primary{ background:linear-gradient(135deg,var(--accent1),var(--accent2)); color:#fff; box-shadow:0 8px 18px rgba(2,6,23,.18) }
//         .ak-btn.light{ background:#f1f5f9; color:#0b1220 }
//         .ak-btn.red{ background:#ef4444; color:#fff }
//         .ak-btn:hover{ filter:saturate(1.05) }

//         .ak-grid{display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:6px 0 14px}
//         @media (max-width: 1000px){ .ak-grid{ grid-template-columns:repeat(2,1fr) } }
//         @media (max-width: 560px){ .ak-grid{ grid-template-columns:1fr } }
//         .ak-kpi{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:12px 14px; box-shadow:0 6px 16px rgba(2,6,23,.06) }
//         .ak-kpi .lbl{ color:var(--muted); font-weight:800; font-size:12px }
//         .ak-kpi .val{ font-size:20px; font-weight:1000 }

//         .ak-table{ width:100%; border-collapse:separate; border-spacing:0; overflow:hidden; border-radius:12px; border:1px solid var(--line) }
//         .ak-table th, .ak-table td{ padding:12px 10px; }
//         .ak-table thead th{
//           position:sticky; top:0; background:#f8fafc; z-index:1; text-align:left; font-weight:1000; border-bottom:1px solid var(--line)
//         }
//         .ak-table tbody tr:nth-child(odd){ background:#fbfdff }
//         .ak-table tbody tr:hover{ background:#f0f9ff }
//         .ak-cell-img{ width:64px; height:44px; border-radius:8px; object-fit:cover; border:1px solid var(--line) }

//         .badge{ display:inline-flex; align-items:center; height:22px; padding:0 8px; border-radius:999px; font-size:12px; font-weight:900 }
//         .badge.gray{ background:#f1f5f9; color:#334155 }
//         .badge.green{ background:#dcfce7; color:#166534 }
//         .badge.red{ background:#fee2e2; color:#991b1b }

//         .pagination{ display:flex; gap:8px; align-items:center; justify-content:flex-end; margin-top:12px }
//         .page-btn{ min-width:34px; height:34px; border-radius:8px; border:1px solid var(--line); background:#fff; cursor:pointer; font-weight:900 }
//         .page-btn.active{ background:linear-gradient(135deg,var(--accent1),var(--accent2)); color:#fff; border-color:transparent }

//         .skeleton{ background:linear-gradient(90deg,#eef2f7 25%,#f8fafc 37%,#eef2f7 63%); background-size:400% 100%; animation:shine 1.2s infinite; border-radius:8px }
//         @keyframes shine{ 0%{background-position:100% 0} 100%{background-position:-100% 0} }

//         /* Scrollbar main */
//         .main::-webkit-scrollbar{ width:12px; height:12px }
//         .main::-webkit-scrollbar-thumb{ background:#cbd5e1; border-radius:999px }
//       `}</style>

//       {/* Sidebar */}
//       <aside className="aside">
//         <div className="aside-head">
//           <span className="brand-dot" />
//           <span className="brand-text hide-when-collapsed">Quản Trị Viên Sports</span>
//           <button className="collapse-btn" onClick={() => setCollapsed(v => !v)} title={collapsed ? "Mở rộng" : "Thu gọn"}>
//             {collapsed ? "»" : "«"}
//           </button>
//         </div>
//         <div className="aside-body">
//           {/* Gợi ý: trong AdminSidebar, cho text thêm class "hide-when-collapsed" nếu muốn ẩn khi thu gọn */}
//           <AdminSidebar />
//         </div>
//       </aside>

//       {/* Header */}
//       <header className="header">
//         <div className="header-inner">
//           <AdminHeader />
//         </div>
//       </header>

//       {/* Main */}
//       <main className="main">
//         <div className="content">
//           <div className="panel">
//             {/* Tip: bọc page trong .admin-kit để dùng bộ style chung phía trên */}
//             <Outlet />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-shell ${collapsed ? "is-collapsed" : ""}`}>
      <style>{`
        /* ======= THEME BASE ======= */
        .admin-shell {
          --header-h: 64px;
          --sidebar-w: 260px;
          --sidebar-w-collapsed: 84px;
          --bg: #f8fafc;
          --ink: #0b1220;
          --muted: #475569;
          --card: #ffffff;
          --line: rgba(2,6,23,.08);
          --accent1: #6366f1;
          --accent2: #06b6d4;
          --shadow: 0 8px 28px rgba(2,6,23,.08);
          display: grid;
          grid-template-columns: var(--sidebar-w) 1fr;
          grid-template-rows: var(--header-h) 1fr;
          height: 100vh;
          background: var(--bg);
          font-family: "Montserrat", Arial, sans-serif;
          color: var(--ink);
          transition: all 0.3s ease;
        }
        .admin-shell.is-collapsed {
          grid-template-columns: var(--sidebar-w-collapsed) 1fr;
        }

        /* ======= SIDEBAR ======= */
        .aside {
          grid-row: 1 / span 2;
          background: linear-gradient(180deg, #0b1120 0%, #10172a 100%);
          border-right: 1px solid rgba(255,255,255,.08);
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          box-shadow: 3px 0 10px rgba(0,0,0,.2);
        }
        .aside-head {
          height: var(--header-h);
          display: flex;
          align-items: center;
          padding: 0 14px;
          border-bottom: 1px solid rgba(255,255,255,.1);
          font-weight: 900;
          letter-spacing: .3px;
          text-shadow: 0 1px 2px rgba(0,0,0,.3);
        }
        .brand-dot {
          width: 14px;
          height: 14px;
          border-radius: 999px;
          margin-right: 8px;
          background: linear-gradient(135deg, var(--accent1), var(--accent2));
          box-shadow: 0 0 10px rgba(99,102,241,.6);
        }
        .brand-text {
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .collapse-btn {
          margin-left: auto;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.05);
          color: #fff;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .collapse-btn:hover {
          background: rgba(255,255,255,.15);
          transform: scale(1.05);
        }
        .aside-body {
          flex: 1;
          overflow-y: auto;
          padding: 10px 8px 20px;
        }
        .aside-body::-webkit-scrollbar {
          width: 8px;
        }
        .aside-body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.15);
          border-radius: 10px;
        }
        .admin-shell.is-collapsed .hide-when-collapsed {
          display: none;
        }

        /* ======= HEADER ======= */
        .header {
          grid-column: 2;
          position: sticky;
          top: 0;
          z-index: 5;
          background: linear-gradient(90deg, var(--accent1), var(--accent2));
          color: #fff;
          box-shadow: 0 2px 12px rgba(99,102,241,.3);
        }
        .header-inner {
          height: var(--header-h);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
        }

        /* ======= MAIN ======= */
        .main {
          grid-column: 2;
          overflow: auto;
          background:
            radial-gradient(100% 120% at 10% -10%, rgba(99,102,241,.06) 0%, rgba(99,102,241,0) 40%),
            radial-gradient(100% 120% at 90% -10%, rgba(6,182,212,.06) 0%, rgba(6,182,212,0) 40%),
            linear-gradient(135deg, #f8fafc 0%, #edf9f7 100%);
        }
        .main::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .main::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        /* ======= PANEL ======= */
        .panel {
          max-width: 1280px;
          margin: 30px auto;
          padding: 36px 40px;
          border-radius: 20px;
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(2,6,23,.08);
          box-shadow: 0 8px 28px rgba(2,6,23,.08);
          backdrop-filter: blur(6px);
          transition: all 0.3s ease;
        }
        .panel:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(2,6,23,.12);
        }
      `}</style>

      {/* Sidebar */}
      <aside className="aside">
        <div className="aside-head">
          <span className="brand-dot" />
          <span className="brand-text hide-when-collapsed">Quản Trị Viên Sports</span>
          <button
            className="collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>
        <div className="aside-body">
          <AdminSidebar />
        </div>
      </aside>

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <AdminHeader />
        </div>
      </header>

      {/* Main */}
      <main className="main">
        <div className="panel">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
