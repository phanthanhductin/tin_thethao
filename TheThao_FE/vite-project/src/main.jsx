// // src/main.jsx
// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom/client";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useParams,
//   useLocation,
//   useNavigate,
// } from "react-router-dom";
// import "./index.css";

// /* ===== Customer pages ===== */
// import Home from "./pages/Customers/Home";
// import Products from "./pages/Customers/Products";
// import Cart from "./pages/Customers/Cart";
// import ProductDetail from "./pages/Customers/ProductDetail";
// import CategoryProducts from "./pages/Customers/CategoryProducts";
// import Register from "./pages/Customers/Register";
// import Login from "./pages/Customers/Login";
// import Checkout from "./pages/Customers/Checkout";
// /* 👇 NEW: Trang liên hệ */
// import Contact from "./pages/Customers/Contact";

// /* ===== Admin pages/layout ===== */
// import AdminLayout from "./layouts/AdminLayout";
// import Dashboard from "./pages/Admin/Dashboard";
// import AdminProducts from "./pages/Admin/Product/Products";
// import AddProduct from "./pages/Admin/Product/add";
// import EditProduct from "./pages/Admin/Product/edit";
// import AdminCategories from "./pages/Admin/Category/Categories";
// import AddCategory from "./pages/Admin/Category/add";
// import EditCategory from "./pages/Admin/Category/edit";
// import AdminOrders from "./pages/Admin/Order/Orders";
// import OrderDetail from "./pages/Admin/Order/OrdersDetail";
// import AdminUsers from "./pages/Admin/User/Users";
// import AdminLogin from "./pages/Admin/AdminLogin.jsx";
// import AdminPosts from "./pages/Admin/Post/Posts";
// import AdminPostAdd from "./pages/Admin/Post/add.jsx";
// import AdminPostEdit from "./pages/Admin/Post/edit.jsx";
// import AdminContacts from "./pages/Admin/Contact/Contacts.jsx";


// // ...


// import About from "./pages/Customers/about";
// import ForgotPassword from "./pages/Customers/ForgotPassword";
// import OrderTracking from "./pages/Customers/OrderTracking";

// import Account from "./pages/Customers/Account";

// import ProductsPage from "./pages/Customers/Products";

// import News from "./pages/Customers/News";
// import NewsDetail from "./pages/Customers/NewsDetail";

// import WishlistPage from "./pages/Customers/Wishlist";

// // ...

// // ...

// /* ===== Customer layout (TopBarAuth + MainNav) ===== */
// import CustomerLayout from "./layouts/CustomerLayout";

// /* ========== Guard Admin ========== */
// function RequireAdmin({ children }) {
//   const ADMIN_TOKEN_KEY = "admin_token";
//   const ADMIN_USER_KEY = "admin_user";

//   const location = useLocation();
//   const token = localStorage.getItem(ADMIN_TOKEN_KEY);
//   const adminSession = localStorage.getItem("admin_session") === "1";

//   let user = null;
//   try {
//     user = JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || "null");
//   } catch { }

//   const role = String(user?.roles || user?.role || "").toLowerCase();

//   if (!token || !adminSession) {
//     return (
//       <Navigate
//         to="/admin/login"
//         replace
//         state={{ from: location.pathname + location.search, fromAdmin: true }}
//       />
//     );
//   }

//   if (role !== "admin") {
//     return (
//       <Navigate
//         to="/admin/login"
//         replace
//         state={{ denied: "Bạn không có quyền truy cập khu vực Quản trị." }}
//       />
//     );
//   }

//   return children;
// }

// /* Redirect /categories/:id -> /category/:id */
// function RedirectCategory() {
//   const { id } = useParams();
//   return <Navigate to={`/category/${id}`} replace />;
// }

// function App() {
//   const navigate = useNavigate();

//   const [cart, setCart] = useState(() => {
//     const saved = localStorage.getItem("cart");
//     return saved ? JSON.parse(saved) : [];
//   });

//   // Lưu giỏ + phát sự kiện cho header cập nhật badge
//   useEffect(() => {
//     localStorage.setItem("cart", JSON.stringify(cart));
//     try {
//       const total = Array.isArray(cart)
//         ? cart.reduce((s, i) => s + (Number(i?.qty) || 1), 0)
//         : 0;
//       window.dispatchEvent(new CustomEvent("cart-changed", { detail: total }));
//     } catch { }
//   }, [cart]);

//   // Đồng bộ lần đầu tiên khi mở trang
//   useEffect(() => {
//     try {
//       const arr = JSON.parse(localStorage.getItem("cart") || "[]");
//       const total = Array.isArray(arr)
//         ? arr.reduce((s, i) => s + (Number(i?.qty) || 1), 0)
//         : 0;
//       window.dispatchEvent(new CustomEvent("cart-changed", { detail: total }));
//     } catch { }
//   }, []);

//   const addToCart = (product) => {
//     // bắt buộc đăng nhập mới cho thêm giỏ
//     const token = localStorage.getItem("token");
//     if (!token) {
//       alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
//       navigate("/login", {
//         state: { success: "Vui lòng đăng nhập để tiếp tục thêm vào giỏ hàng." },
//       });
//       return;
//     }

//     setCart((prev) => {
//       const exists = prev.find((i) => i.id === product.id);
//       return exists
//         ? prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
//         : [...prev, { ...product, qty: 1 }];
//     });
//     alert("🎉 Sản phẩm đã được thêm vào giỏ hàng!");
//   };

//   return (
//     <Routes>
//       {/* ===== CUSTOMER ===== */}
//       <Route element={<CustomerLayout />}>
//         <Route index element={<Home />} />
//         <Route path="/products" element={<Products addToCart={addToCart} />} />
//         <Route
//           path="/category/:id"
//           element={<CategoryProducts addToCart={addToCart} />}
//         />
//         <Route path="/categories/:id" element={<RedirectCategory />} />
//         <Route
//           path="/products/:id"
//           element={<ProductDetail addToCart={addToCart} />}
//         />
//         <Route
//           path="/checkout"
//           element={<Checkout cart={cart} setCart={setCart} />}
//         />
//         <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/account" element={<Account />} />
//         <Route path="/track" element={<OrderTracking />} />
//         <Route path="/wishlist" element={<WishlistPage />} />
//         <Route path="/news" element={<News />} />
//         <Route path="/news/:slugOrId" element={<NewsDetail />} />
//         {/* 👇 NEW: route trang Liên hệ */}
//         <Route path="/contact" element={<Contact />} />
//       </Route>

//       <Route element={<CustomerLayout />}>
//         {/* ...các route khác của khách hàng */}
//         <Route path="/products" element={<ProductsPage />} />
//       </Route>

//       {/* ===== ADMIN ===== */}
//       <Route path="/admin/login" element={<AdminLogin />} />
//       <Route
//         path="/admin"
//         element={
//           <RequireAdmin>
//             <AdminLayout />
//           </RequireAdmin>
//         }
//       >
//         <Route index element={<Dashboard />} />
//         <Route path="products" element={<AdminProducts />} />
//         <Route path="products/add" element={<AddProduct />} />
//         <Route path="products/edit/:id" element={<EditProduct />} />
//         <Route path="categories" element={<AdminCategories />} />
//         <Route path="categories/add" element={<AddCategory />} />
//         <Route path="categories/edit/:id" element={<EditCategory />} />
//         <Route path="orders" element={<AdminOrders />} />
//         <Route path="orders/:id" element={<OrderDetail />} />
//         <Route path="users" element={<AdminUsers />} />
//         <Route path="posts" element={<AdminPosts />} />
//         <Route path="posts/add" element={<AdminPostAdd />} />
//         <Route path="posts/edit/:id" element={<AdminPostEdit />} />
//         <Route path="contacts" element={<AdminContacts />} />

//       </Route>

//       {/* Khác */}
//       <Route path="/forgot-password" element={<ForgotPassword />} />

//       {/* 404 (dùng layout khách cho đồng bộ UI) */}
//       <Route element={<CustomerLayout />}>
//         <Route path="*" element={<div>Không tìm thấy trang</div>} />
//       </Route>
//     </Routes>
//   );
// }

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );

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
  NavLink,
  Outlet,
} from "react-router-dom";
import "./index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ===== Customer pages ===== */
import Home from "./pages/Customers/Home";
import Products from "./pages/Customers/Products";
import Cart from "./pages/Customers/Cart";
import ProductDetail from "./pages/Customers/ProductDetail";
import CategoryProducts from "./pages/Customers/CategoryProducts";
import Register from "./pages/Customers/Register";
import Login from "./pages/Customers/Login";
import Checkout from "./pages/Customers/Checkout";
import Contact from "./pages/Customers/Contact";
import About from "./pages/Customers/about";
import ForgotPassword from "./pages/Customers/ForgotPassword";
import OrderTracking from "./pages/Customers/OrderTracking";
import Account from "./pages/Customers/Account";
import ProductsPage from "./pages/Customers/Products";
import News from "./pages/Customers/News";
import NewsDetail from "./pages/Customers/NewsDetail";
import WishlistPage from "./pages/Customers/Wishlist";
import MomoReturn from "./pages/Customers/MomoReturn";
import CategoryTrash from "./pages/Admin/Category/CategoryTrash.jsx";

import ReviewSection from "./pages/Customers/ReviewSection";
import CanceledOrders from "./pages/Customers/CanceledOrders.jsx";
import MyOrders from "./pages/Customers/MyOrders";

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
import AdminPosts from "./pages/Admin/Post/Posts";
import AdminPostAdd from "./pages/Admin/Post/add.jsx";
import AdminPostEdit from "./pages/Admin/Post/edit.jsx";
import AdminContacts from "./pages/Admin/Contact/Contacts.jsx";
import TrashProducts from "./pages/Admin/Product/TrashProducts.jsx";
import StockMovements from "./pages/Admin/StockMovements";
// import Assistant from "./pages/Customers/Assistant";
import FloatingAIWidget from "./components/FloatingAIWidget";

/* =============================
   🧩 CUSTOMER LAYOUT GẮN TRỰC TIẾP TẠI ĐÂY
   ============================= */
const PLACEHOLDER = "https://placehold.co/160x120?text=No+Img";
const VND = new Intl.NumberFormat("vi-VN");

/* --- MiniCart --- */
function MiniCart() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });
  const [count, setCount] = useState(() =>
    items.reduce((s, i) => s + Number(i.qty || 0), 0)
  );

  useEffect(() => {
    const sync = () => {
      try {
        const arr = JSON.parse(localStorage.getItem("cart") || "[]");
        setItems(arr);
        setCount(arr.reduce((s, i) => s + Number(i.qty || 0), 0));
      } catch {
        setItems([]);
        setCount(0);
      }
    };
    const onCustom = (e) => {
      if (typeof e?.detail === "number") setCount(e.detail);
      sync();
    };
    const onStorage = (e) => {
      if (e.key === "cart") sync();
    };
    window.addEventListener("cart-changed", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("cart-changed", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const thumb = (p) => p.thumbnail_url || p.thumbnail || PLACEHOLDER;

  return (
    <div
      className="mini-cart-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="mini-cart" onClick={() => navigate("/cart")}>
        🛒
        {count > 0 && <span className="mini-cart-badge">{count}</span>}
      </button>
      {open && (
        <div className="mini-cart-pop">
          <div className="pop-head">Sản phẩm mới thêm</div>
          <ul className="pop-list">
            {items.length === 0 && (
              <li className="pop-empty">Giỏ hàng đang trống</li>
            )}
            {items.slice(0, 6).map((it) => (
              <li key={it.id} className="pop-item">
                <img src={thumb(it)} alt={it.name} />
                <div className="pop-meta">
                  <div className="pop-name">{it.name}</div>
                  <div className="pop-sub">
                    <span>x{it.qty}</span>
                    <b>{VND.format(it.price)}đ</b>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="pop-actions">
            <button className="btn-view" onClick={() => navigate("/cart")}>
              Xem giỏ hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- UserMenu --- */
function UserMenu() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user" || e.key === "token") {
        try {
          setUser(JSON.parse(localStorage.getItem("user") || "null"));
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!user) return null;
  const name = user.name || user.email || "Khách hàng";
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <NavLink to="/account" className="userlink">
      <div className="avatar">{initials}</div>
      <span className="username">{name}</span>
    </NavLink>
  );
}

/* --- Layout chính --- */
function CustomerLayout() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-orange-50/50">
      {/* Header */}
      <header className="header">
        <div className="brand">
          🏋️‍♂️ <span className="tracking-tight">SportShop</span>
        </div>

        <nav className="mainnav">
          <NavLink to="/" end className="navlink">
            Trang chủ
          </NavLink>
          <NavLink to="/products" className="navlink">
            Sản phẩm
          </NavLink>
          <NavLink to="/news" className="navlink">
            Tin tức
          </NavLink>
          <NavLink to="/contact" className="navlink">
            Liên hệ
          </NavLink>
          {/* <NavLink to="/assistant" className="navlink">AI</NavLink> */}
        </nav>

        <div className="right">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <NavLink to="/register" className="navlink">
                Đăng ký
              </NavLink>
              <NavLink to="/login" className="navlink">
                Đăng nhập
              </NavLink>
            </>
          )}
          <MiniCart />
        </div>
      </header>

      {/* Nội dung */}
      <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 border-t text-sm text-gray-600 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span>© {new Date().getFullYear()} SportShop</span>
          <span className="text-gray-500">Năng động mỗi ngày 🏃</span>
        </div>
      </footer>

      <ToastContainer position="top-right" autoClose={2000} />

      {/* Style nội tuyến */}
      <style>{`
        :root { --e: cubic-bezier(.2,.8,.2,1); }
        .header{padding:12px 16px;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.85);backdrop-filter:saturate(180%) blur(8px);box-shadow:0 1px 4px rgba(0,0,0,.05);}
        .brand{font-weight:800;display:flex;align-items:center;gap:.5rem;font-size:1.25rem;color:#ea580c;}
        .mainnav{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:14px;}
        .navlink{padding:.5rem .75rem;border-radius:.75rem;font-weight:700;color:#f97316;transition:all .2s var(--e);}
        .navlink:hover{color:#ea580c;background:rgba(251,146,60,.08);}
        .navlink[aria-current="page"]{color:#ea580c;}
        .right{display:flex;align-items:center;gap:12px;}
        .avatar{width:32px;height:32px;border-radius:50%;background:#fed7aa;color:#7c2d12;display:flex;align-items:center;justify-content:center;font-weight:700;}
        .userlink{display:flex;align-items:center;gap:.5rem;}
        .mini-cart{width:42px;height:42px;border-radius:12px;border:1px solid #fcd34d;background:white;color:#f59e0b;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,.08);}
        .mini-cart-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:white;border-radius:9999px;font-size:10px;padding:2px 5px;font-weight:800;}
        .mini-cart-pop{position:absolute;top:52px;right:0;width:340px;background:white;border:1px solid #f3f4f6;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,.1);padding:10px;}
        .pop-item{display:flex;gap:8px;padding:6px 0;border-bottom:1px solid #f9fafb;}
        .pop-item img{width:48px;height:48px;object-fit:cover;border-radius:8px;}
        .btn-view{background:linear-gradient(135deg,#fb923c,#f59e0b);color:white;border:0;border-radius:8px;padding:8px 12px;font-weight:700;cursor:pointer;}
      `}</style>
    </div>
  );
}

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

/* ---------- App chính ---------- */
function App() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    try {
      const total = Array.isArray(cart)
        ? cart.reduce((s, i) => s + (Number(i?.qty) || 1), 0)
        : 0;
      window.dispatchEvent(new CustomEvent("cart-changed", { detail: total }));
    } catch { }
  }, [cart]);

  const addToCart = (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để thêm sản phẩm!");
      navigate("/login");
      return;
    }
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      return exists
        ? prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...product, qty: 1 }];
    });
    toast.success("Đã thêm vào giỏ hàng 🏀");
  };

  return (
    <Routes>
      {/* CUSTOMER */}
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
        <Route path="/checkout" element={<Checkout setCart={setCart} />}
        />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
        <Route path="/track" element={<OrderTracking />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slugOrId" element={<NewsDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/momo-return" element={<MomoReturn />} />
        <Route path="/admin/categories/trash" element={<CategoryTrash />} />
        {/* các route khác */}
        {/* <Route path="/assistant" element={<Assistant />} /> */}


        <Route path="/products/:id/reviews" element={<ReviewSection />} />
        <Route path="/canceled-orders" element={<CanceledOrders />} />
        <Route path="/my-orders" element={<MyOrders />} />

      </Route>






      {/* ADMIN */}
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
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/add" element={<AdminPostAdd />} />
        <Route path="posts/edit/:id" element={<AdminPostEdit />} />
        <Route path="contacts" element={<AdminContacts />} />
      </Route>
      <Route path="/admin/products/trash" element={<TrashProducts />} />
      <Route path="/admin/stock-movements" element={<StockMovements />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<CustomerLayout />}>
        <Route path="*" element={<div>Không tìm thấy trang</div>} />
      </Route>
    </Routes>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    {/* 👇 Nút tròn AI nổi toàn site */}
    <FloatingAIWidget />
  </BrowserRouter>
);