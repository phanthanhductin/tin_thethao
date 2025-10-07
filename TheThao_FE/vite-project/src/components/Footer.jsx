import React from "react";

export default function Footer() {
    return (
        <footer className="cp-footer">
            <style>{`
        /* ===== Footer gradient loang ===== */
        .cp-footer{
          /* Accent có thể chỉnh tuỳ ý */
          --accent1:#6366f1; /* tím indigo */
          --accent2:#06b6d4; /* cyan */

          position:relative; isolation:isolate;
          padding:40px 0 24px;
          font-family:"Montserrat", Arial, sans-serif;
          color:#eef2ff; /* chữ sáng trên nền gradient */
          border-top:0;
          overflow:hidden; /* để thấy bo góc tròn của lớp nền */
        }

        /* Lớp nền gradient “loang loang” */
        .cp-footer .cp-bg{
          position:absolute; inset:0;
          /* vài lớp radial để tạo vệt loang + 1 lớp linear chuyển màu */
          background:
            radial-gradient(120% 180% at -10% -20%, rgba(99,102,241,.35) 0%, rgba(99,102,241,0) 40%),
            radial-gradient(120% 180% at 110% -10%, rgba(6,182,212,.35) 0%, rgba(6,182,212,0) 42%),
            linear-gradient(90deg, var(--accent1) 0%, var(--accent2) 100%);
          border-radius:28px 28px 0 0; /* bo 2 góc trên giống ảnh */
          filter:saturate(1.05);
          z-index:-1;
        }

        .cp-container{width:min(1200px,92vw); margin:0 auto}

        .cp-footer-grid{
          display:grid; grid-template-columns:repeat(1,minmax(0,1fr)); gap:30px
        }
        @media (min-width:900px){
          .cp-footer-grid{grid-template-columns:repeat(4,1fr)}
        }

        .cp-footer h3{
          margin:0 0 12px;
          text-transform:uppercase; letter-spacing:.6px; font-weight:1000;
          position:relative;
          background: linear-gradient(180deg,#ffffff 0%,#e2e8f0 80%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          text-shadow:0 1px 0 rgba(0,0,0,.2);
        }
        .cp-footer h3::after{
          content:""; position:absolute; left:0; bottom:-6px; width:100%; height:3px; border-radius:6px;
          background: linear-gradient(90deg, rgba(255,255,255,.8), rgba(255,255,255,.2) 75%, rgba(255,255,255,0));
          box-shadow:0 1px 8px rgba(255,255,255,.35);
        }

        .cp-footer p{ margin:6px 0; color:#e5e7eb; font-weight:700 }
        .cp-footer ul{list-style:none; padding:0; margin:0}
        .cp-footer li{ margin:8px 0 }
        .cp-footer a{
          color:#ffffff; text-decoration:none; font-weight:800;
          border-bottom:1px dashed transparent;
          transition:color .15s ease, border-color .15s ease, background .15s ease;
        }
        .cp-footer a:hover{
          color:#f1f5ff; border-color:rgba(255,255,255,.55);
          background:rgba(255,255,255,.08);
        }

        .cp-social{display:flex; gap:12px; margin-top:12px}
        .cp-pill{
          display:inline-flex; width:40px; height:40px; align-items:center; justify-content:center; border-radius:12px;
          background: linear-gradient(135deg, rgba(255,255,255,.25), rgba(255,255,255,.05));
          box-shadow:0 6px 16px rgba(2,6,23,.25);
          backdrop-filter:saturate(1.1) blur(0.5px);
          transition: transform .15s ease, box-shadow .15s ease, filter .15s ease;
        }
        .cp-pill:hover{ transform:translateY(-1px); filter:saturate(1.05); box-shadow:0 8px 22px rgba(2,6,23,.32); }
        .cp-pill i{ color:#fff; }

        .cp-credit{
          border-top:1px solid rgba(255,255,255,.22); margin-top:18px; padding-top:14px;
          display:flex; justify-content:space-between; flex-wrap:wrap; color:#e2e8f0; font-weight:800;
        }
        .cp-credit strong{ color:#ffffff }
      `}</style>

            {/* lớp nền gradient */}
            <div className="cp-bg" aria-hidden="true" />

            <div className="cp-container">
                <div className="cp-footer-grid">
                    <div>
                        <img
                            src="http://127.0.0.1:8000/assets/images/logo.webp"
                            alt="Logo"
                            style={{ height: 56 }}
                            onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                        <p style={{ marginTop: 8, color: "#f0f9ff", fontWeight: 900 }}>
                            Cửa hàng phân phối đồ thể thao chính hãng
                        </p>
                        <div style={{ marginTop: 12 }}>
                            <p>
                                <i className="fa-solid fa-location-dot" style={{ color: "#fff", marginRight: 8 }} />
                                Tầng 6, Tòa Ladeco, 266 Đội Cấn, Quận Ba Đình, TP Hà Nội
                            </p>
                            <p>
                                <i className="fa-solid fa-clock" style={{ color: "#fff", marginRight: 8 }} />
                                Giờ làm việc: 8:00 - 22:00, Thứ 2 - Chủ nhật
                            </p>
                            <p>
                                <i className="fa-solid fa-phone" style={{ color: "#fff", marginRight: 8 }} />
                                Hotline: <b>1900 8386</b>
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3>Về chúng tôi</h3>
                        <ul>
                            <li><a href="/">Trang chủ</a></li>
                            <li><a href="/products">Sản phẩm</a></li>
                            <li><a href="/about">Giới thiệu</a></li>
                            <li><a href="/contact">Liên hệ</a></li>
                            <li><a href="/stores">Hệ thống cửa hàng</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3>Chính sách</h3>
                        <ul>
                            <li><a href="#">Chính sách đối tác</a></li>
                            <li><a href="#">Chính sách đổi trả</a></li>
                            <li><a href="#">Chính sách thanh toán</a></li>
                            <li><a href="#">Chính sách giao hàng</a></li>
                            <li>
                                <a href="#" style={{ fontWeight: 900 }}>
                                    Hình thức thanh toán
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3>Tư vấn khách hàng</h3>
                        <ul>
                            <li><a href="#">Mua hàng 1900.8386</a></li>
                            <li><a href="#">Bảo hành 1900.8386</a></li>
                            <li><a href="#">Khiếu nại 1900.8386</a></li>
                            <li><a href="#">Mua qua các sàn điện tử</a></li>
                        </ul>
                        <div className="cp-social">
                            <a className="cp-pill" href="#" aria-label="Shopify">
                                <i className="fa-brands fa-shopify" />
                            </a>
                            <a className="cp-pill" href="#" aria-label="Instagram">
                                <i className="fa-brands fa-instagram" />
                            </a>
                            <a className="cp-pill" href="#" aria-label="Facebook">
                                <i className="fa-brands fa-facebook-f" />
                            </a>
                            <a className="cp-pill" href="#" aria-label="Tiktok">
                                <i className="fa-brands fa-tiktok" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="cp-credit">
                    <span>© 2025 StoreVegetables</span>
                    <span>Made with ❤️ <strong>SPORT OH!</strong></span>
                </div>
            </div>
        </footer>
    );
}
