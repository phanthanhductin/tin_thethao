import React from "react";
import { NavLink } from "react-router-dom";

export default function MainNav({
  stickBelowTop = true,
  routes = {
    home: "/",
    products: "/products",
    news: "/news",
    contact: "/contact",
  },
}) {
  return (
    <nav className={`main-nav ${stickBelowTop ? "under-topbar" : ""}`}>
      <style>{`
        /* ---- GIỮ ĐỒNG BỘ VỚI TopBarAuth: --topbar-h:64px ---- */
        .main-nav{
          --topbar-h:64px;
          --accent1:#6366f1; /* tím */
          --accent2:#06b6d4; /* cyan */
          --link:#ffffff;
          --linkHover:rgba(255,255,255,.12);
          --shadow:0 8px 24px rgba(2,6,23,.22);
        }
        .mn-wrap{width:min(1200px,92vw); margin:0 auto;}
        .mn{
          position:relative; isolation:isolate;
          color:#fff; margin:0;
          box-shadow: var(--shadow);
        }
        /* Lớp nền gradient loang + bo góc dưới */
        .mn::before{
          content:""; position:absolute; inset:0; z-index:-1;
          background:
            radial-gradient(130% 160% at -10% -30%, rgba(99,102,241,.35) 0%, rgba(99,102,241,0) 48%),
            radial-gradient(130% 160% at 110% -20%, rgba(6,182,212,.35) 0%, rgba(6,182,212,0) 50%),
            linear-gradient(90deg, var(--accent1) 0%, var(--accent2) 100%);
          border-radius:0 0 18px 18px;
        }

        .mn-row{display:flex; align-items:center; gap:22px; padding:12px 0;}
        .mn-menu{display:flex; list-style:none; margin:0; padding:0; gap:42px; font-weight:900; font-size:18px;}
        .mn-menu a{
          color:var(--link); text-decoration:none; padding:6px 10px; border-radius:10px;
          transition: background .15s ease, transform .15s ease, opacity .15s ease;
        }
        .mn-menu a:hover{ background:var(--linkHover); }
        .mn-menu a.active{
          background:rgba(255,255,255,.22);
          box-shadow:0 6px 16px rgba(2,6,23,.18);
        }

        .mn-hotline{margin-left:auto; font-weight:900; color:#f0f9ff; font-size:18px;}

        /* Dính ngay dưới topbar */
        .main-nav.under-topbar{position:sticky; top:var(--topbar-h); z-index:40;}
      `}</style>

      <div className="mn">
        <div className="mn-wrap mn-row">
          <ul className="mn-menu">
            <li><NavLink to={routes.home} end>Trang chủ</NavLink></li>
            <li><NavLink to={routes.products}>Sản phẩm</NavLink></li>
            <li>
              <NavLink to="/about">Giới Thiệu</NavLink>
            </li>
            <li><NavLink to="/news">Tin tức</NavLink></li>
            <li><NavLink to={routes.contact}>Liên hệ</NavLink></li>
            
          </ul>
          <div className="mn-hotline">
            Hotline:&nbsp;<span style={{ color: "#bde9e3" }}>1900 8386</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
