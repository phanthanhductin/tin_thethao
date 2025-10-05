import React from "react";
import { Outlet } from "react-router-dom";
import TopBarAuth from "../components/header/TopBarAuth";
import MainNav from "../components/header/MainNav";

export default function CustomerLayout() {
    return (
        <>
            <TopBarAuth fixed cartCount={0} />
            <MainNav stickBelowTop routes={{ home: "/", products: "/products", news: "/news", contact: "/contact" }} />
            <main>
                <Outlet />
            </main>
        </>
    );
}
