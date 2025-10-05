// src/main.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./index.css";

/* ===== Customer pages ===== */
import Home from "./pages/Customers/Home";
import Products from "./pages/Customers/Products";
import Cart from "./pages/Customers/Cart";
import ProductDetail from "./pages/Customers/ProductDetail";
import CategoryProducts from "./pages/Customers/CategoryProducts";
import Register from "./pages/Customers/Register";
import Login from "./pages/Customers/Login";
import Checkout from "./pages/Customers/Checkout";

/* ===== Admin pages/layout ===== */
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import AdminProducts from "./pages/Admin/Product/Products";
import AddProduct from "./pages/Admin/Product/add";
import EditProduct from "./pages/Admin/Product/edit";
import AdminCategories from "./pages/Admin/Category/Categories";
import AddCategory from "./pages/Admin/Category/add";
import EditCategory from "./pages/Admin/Category/edit";
import AdminOrders from "./pages/Admin/Order/Orders";
import OrderDetail from "./pages/Admin/Order/OrdersDetail";
import AdminUsers from "./pages/Admin/User/Users";
import AdminLogin from "./pages/Admin/AdminLogin.jsx";

import About from "./pages/Customers/about";
import ForgotPassword from "./pages/Customers/ForgotPassword";
import OrderTracking from "./pages/Customers/OrderTracking";


import Account from "./pages/Customers/Account";

import ProductsPage from "./pages/Customers/Products";

import News from "./pages/Customers/News";
import NewsDetail from "./pages/Customers/NewsDetail";




import WishlistPage from "./pages/Customers/Wishlist";

// ...




// ...




/* ===== Customer layout (TopBarAuth + MainNav) ===== */
import CustomerLayout from "./layouts/CustomerLayout";

/* ========== Guard Admin ========== */
function RequireAdmin({ children }) {
  const ADMIN_TOKEN_KEY = "admin_token";
  const ADMIN_USER_KEY = "admin_user";

  const location = useLocation();
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const adminSession = localStorage.getItem("admin_session") === "1";

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || "null");
  } catch { }

  const role = String(user?.roles || user?.role || "").toLowerCase();

  if (!token || !adminSession) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname + location.search, fromAdmin: true }}
      />
    );
  }

  if (role !== "admin") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ denied: "Bạn không có quyền truy cập khu vực Quản trị." }}
      />
    );
  }

  return children;
}

/* Redirect /categories/:id -> /category/:id */
function RedirectCategory() {
  const { id } = useParams();
  return <Navigate to={`/category/${id}`} replace />;
}

function App() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Lưu giỏ + phát sự kiện cho header cập nhật badge
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    try {
      const total = Array.isArray(cart)
        ? cart.reduce((s, i) => s + (Number(i?.qty) || 1), 0)
        : 0;
      window.dispatchEvent(new CustomEvent("cart-changed", { detail: total }));
    } catch { }
  }, [cart]);

  // Đồng bộ lần đầu tiên khi mở trang
  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = Array.isArray(arr)
        ? arr.reduce((s, i) => s + (Number(i?.qty) || 1), 0)
        : 0;
      window.dispatchEvent(new CustomEvent("cart-changed", { detail: total }));
    } catch { }
  }, []);

  const addToCart = (product) => {
    // bắt buộc đăng nhập mới cho thêm giỏ
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login", {
        state: { success: "Vui lòng đăng nhập để tiếp tục thêm vào giỏ hàng." },
      });
      return;
    }

    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      return exists
        ? prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        )
        : [...prev, { ...product, qty: 1 }];
    });
    alert("🎉 Sản phẩm đã được thêm vào giỏ hàng!");
  };

  return (
    <Routes>
      {/* ===== CUSTOMER ===== */}
      <Route element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="/products" element={<Products addToCart={addToCart} />} />
        <Route
          path="/category/:id"
          element={<CategoryProducts addToCart={addToCart} />}
        />
        <Route path="/categories/:id" element={<RedirectCategory />} />
        <Route
          path="/products/:id"
          element={<ProductDetail addToCart={addToCart} />}
        />
        <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
        <Route path="/track" element={<OrderTracking />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slugOrId" element={<NewsDetail />} />
      </Route>

      <Route element={<CustomerLayout />}>
        {/* ...các route khác của khách hàng */}
        <Route path="/products" element={<ProductsPage />} />
      </Route>
      {/* ===== ADMIN ===== */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="categories/add" element={<AddCategory />} />
        <Route path="categories/edit/:id" element={<EditCategory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="users" element={<AdminUsers />} />

      </Route>

      {/* Khác */}
      <Route path="/forgot-password" element={<ForgotPassword />} />


      {/* 404 (dùng layout khách cho đồng bộ UI) */}
      <Route element={<CustomerLayout />}>
        <Route path="*" element={<div>Không tìm thấy trang</div>} />
      </Route>
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
