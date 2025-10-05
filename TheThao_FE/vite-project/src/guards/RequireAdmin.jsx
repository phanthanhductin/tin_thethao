// src/guards/RequireAdmin.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_USER_KEY = "admin_user";

function readAdminUser() {
    try { return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || "null"); }
    catch { return null; }
}

function isAdmin(user) {
    const role = String(user?.roles ?? user?.role ?? "").toLowerCase();
    return role === "admin";
}

export default function RequireAdmin() {
    const location = useLocation();
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const user = readAdminUser();

    if (!token || !user || !isAdmin(user)) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{
                    from: location,
                    denied: user && !isAdmin(user) ? "Bạn không có quyền truy cập khu vực Quản trị." : undefined,
                }}
            />
        );
    }

    return <Outlet />;
}
