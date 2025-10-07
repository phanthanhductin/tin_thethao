// src/layouts/CustomerLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import TopBarAuth from "../components/header/TopBarAuth";
import MainNav from "../components/header/MainNav";
import Footer from "../components/Footer";

export default function CustomerLayout() {
    return (
        <div className="site-wrap">
            {/* CSS chuẩn cho toàn bộ site */}
            <style>{`
  .site-wrap{
    min-height:100dvh;
    display:flex;
    flex-direction:column;
    background:#fffffff;
    color:#f5f5f5;
  }

  /* ↓ GIẢM khoảng bù cho header ở đây */
  :root{
    --header-offset: 72px; /* trước là 110px */
  }
  /* Có thể tinh chỉnh theo màn hình */
  @media (min-width: 1024px){
    :root{ --header-offset: 0px; } /* desktop cao hơn chút */
  }

  .site-main{
    flex:1;
    padding-top: var(--header-offset);
    padding-bottom: 24px;
  }
`}</style>

            <TopBarAuth fixed cartCount={0} />
            <MainNav
                stickBelowTop
                routes={{ home: "/", products: "/products", news: "/news", contact: "/contact" }}
            />

            <main className="site-main">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}
