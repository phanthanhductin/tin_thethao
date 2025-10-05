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
        .main-nav{ --black:#000; --hover:#2dd4bf; --topbar-h:64px; }
        .mn-wrap{width:min(1200px,92vw); margin:0 auto;}
        .mn{
          background:var(--black); color:#fff;
          border-bottom:1px solid #ffffff22; box-shadow:0 2px 10px rgba(0,0,0,.18);
          margin:0; /* tránh khoảng trắng do margin */
        }
        .mn-row{display:flex; align-items:center; gap:22px; padding:12px 0;}
        .mn-menu{display:flex; list-style:none; margin:0; padding:0; gap:42px; font-weight:900; font-size:18px;}
        .mn-menu a{color:#fff; text-decoration:none;}
        .mn-menu a.active{color:#2dd4bf;}
        .mn-menu a:hover{color:var(--hover);}
        .mn-hotline{margin-left:auto; font-weight:900; color:#e6e6e6; font-size:18px;}

        /* Bám ngay dưới topbar (64px). Nếu vẫn hở 1px do bóng, dùng -1px như dòng dưới */
        .main-nav.under-topbar{position:sticky; top:var(--topbar-h); z-index:40;}
        /* Nếu màn bạn vẫn còn thấy một vệt 1px, thay dòng trên bằng dòng dưới:
           .main-nav.under-topbar{position:sticky; top:calc(var(--topbar-h) - 1px); z-index:40;} */
      `}</style>

            <div className="mn">
                <div className="mn-wrap mn-row">
                    <ul className="mn-menu">
                        <li><NavLink to={routes.home} end>Trang chủ</NavLink></li>
                        <li><NavLink to={routes.products}>Sản phẩm</NavLink></li>
                        <li>
                            <NavLink to="/about" className={({ isActive }) => (isActive ? "nav-active" : undefined)}
                            >Giới Thiệu
                            </NavLink>
                        </li>
                        <li><NavLink to="/news" className="navlink">Tin tức</NavLink>
                        </li>
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
