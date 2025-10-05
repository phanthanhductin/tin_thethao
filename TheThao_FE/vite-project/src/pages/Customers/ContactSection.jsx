import React from "react";

export default function ContactPage() {
    return (
        <div className="contact-page">
            {/* === CSS nội bộ (đÃ bỏ header/nav) === */}
            <style>{`
        .contact-page{
          --emerald:#065f46; --emeraldDark:#064e3b; --emeraldSoft:#34d399;
          --text:#111827; --muted:#6b7280; --black:#0a0a0a;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';
          background:#fff; color:var(--text); min-height:100vh; display:flex; flex-direction:column;
        }
        .cp-container{width:min(1200px,92vw); margin:0 auto;}

        /* Main (không còn fixed header/nav nên padding-top nhỏ) */
        .cp-main{padding-top:24px; flex:1;}

        /* Contact section */
        .cp-contact{padding:40px 0}
        .cp-grid{display:grid; grid-template-columns:1fr; gap:28px}
        @media (min-width:900px){ .cp-grid{grid-template-columns:1.1fr .9fr} }
        .cp-title{font-size:22px; font-weight:800; color:var(--emerald); margin:0 0 12px}
        .cp-info p{margin:0 0 10px}
        .cp-info i{color:var(--emerald); margin-right:8px}
        .cp-sub{font-weight:800; color:var(--emerald); margin:14px 0}
        .cp-form{display:grid; gap:12px}
        .cp-input,.cp-textarea{width:100%; border:1px solid var(--emerald); border-radius:10px; padding:12px 14px; outline:none}
        .cp-input:focus,.cp-textarea:focus{box-shadow:0 0 0 3px rgba(16,185,129,.25)}
        .cp-textarea{min-height:140px; resize:vertical}
        .cp-btn{background:var(--emerald); color:#fff; border:0; border-radius:10px; padding:12px 20px; font-weight:700; cursor:pointer}
        .cp-btn:hover{background:var(--emeraldDark)}
        .cp-map iframe{width:100%; height:360px; border-radius:12px; border:1px solid #e5e7eb}

        /* Footer */
        .cp-footer{background:#0a0a0a; color:#e5e7eb; margin-top:28px}
        .cp-footer-grid{display:grid; grid-template-columns:repeat(1,minmax(0,1fr)); gap:30px}
        @media (min-width:900px){ .cp-footer-grid{grid-template-columns:repeat(4,1fr)} }
        .cp-footer h3{color:var(--emeraldSoft); text-transform:uppercase; letter-spacing:.6px; margin:0 0 12px}
        .cp-footer ul{list-style:none; padding:0; margin:0}
        .cp-footer a{color:#e5e7eb; text-decoration:none}
        .cp-footer a:hover{color:var(--emeraldSoft)}
        .cp-social{display:flex; gap:12px; margin-top:12px}
        .cp-pill{display:inline-flex; width:40px; height:40px; align-items:center; justify-content:center; border-radius:10px}
        .cp-pill.shopify{background:#f97316}
        .cp-pill.ig{background:#ec4899}
        .cp-pill.fb{background:#3b82f6}
        .cp-pill.tk{background:#000}
        .cp-credit{border-top:1px solid #ffffff1a; margin-top:18px; padding-top:14px; display:flex; justify-content:space-between; flex-wrap:wrap; color:#9ca3af}
      `}</style>

            {/* Main chỉ còn nội dung Liên hệ + Footer */}
            <main className="cp-main">
                <section className="cp-container cp-contact">
                    <div className="cp-grid">
                        {/* Thông tin liên hệ + Form */}
                        <div>
                            <h2 className="cp-title">
                                Cửa hàng phân phối đồ thể thao chính hãng SPORT OH!
                            </h2>
                            <div className="cp-info">
                                <p>
                                    <i className="fa-solid fa-location-dot" />
                                    20 Tăng Nhơn Phú, Phước Long B, Thủ Đức, Hồ Chí Minh 715939, Việt Nam
                                </p>
                                <p>
                                    <i className="fa-solid fa-envelope" />
                                    Email: sportoh@sapo.vn
                                </p>
                                <p>
                                    <i className="fa-solid fa-phone" />
                                    Hotline: 1900 8386
                                </p>
                            </div>

                            <h3 className="cp-sub">LIÊN HỆ VỚI CHÚNG TÔI</h3>
                            <form
                                className="cp-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    alert("Đã nhận thông tin! (gắn API sau)");
                                }}
                            >
                                <input type="text" className="cp-input" placeholder="Họ và tên" />
                                <input type="email" className="cp-input" placeholder="Email" />
                                <input type="tel" className="cp-input" placeholder="Điện thoại*" />
                                <textarea className="cp-textarea" placeholder="Nội dung" />
                                <button type="submit" className="cp-btn">Gửi thông tin</button>
                            </form>
                        </div>

                        {/* Bản đồ */}
                        <div className="cp-map">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.7463927050517!2d106.77247247481885!3d10.830709789321388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752701a34a5d5f%3A0x30056b2fdf668565!2zQ2FvIMSQ4bqzbmcgQ8O0bmcgVGjGsMahbmcgVFAuSENN!5e0!3m2!1svi!2s!4v1741014740620!5m2!1svi!2s"
                                width="600"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Map SPORT OH!"
                            />
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="cp-footer">
                    <div className="cp-container">
                        <div className="cp-footer-grid">
                            <div>
                                <img
                                    src="http://127.0.0.1:8000/assets/images/logo.webp"
                                    alt="Logo"
                                    style={{ height: 56 }}
                                />
                                <p style={{ marginTop: 8, color: "#34d399" }}>
                                    Cửa hàng phân phối đồ thể thao chính hãng
                                </p>
                                <div style={{ marginTop: 12 }}>
                                    <p>
                                        <i className="fa-solid fa-location-dot" style={{ color: "#34d399", marginRight: 8 }} />
                                        Tầng 6, Tòa Ladeco, 266 Đội Cấn, Quận Ba Đình, TP Hà Nội
                                    </p>
                                    <p>
                                        <i className="fa-solid fa-clock" style={{ color: "#34d399", marginRight: 8 }} />
                                        Giờ làm việc: 8:00 - 22:00, Thứ 2 - Chủ nhật
                                    </p>
                                    <p>
                                        <i className="fa-solid fa-phone" style={{ color: "#34d399", marginRight: 8 }} />
                                        Hotline: <b style={{ color: "#6ee7b7" }}>1900 8386</b>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3>Về chúng tôi</h3>
                                <ul>
                                    <li><a href="#">Trang chủ</a></li>
                                    <li><a href="#">Sản phẩm</a></li>
                                    <li><a href="#">Giới thiệu</a></li>
                                    <li><a href="#">Liên hệ</a></li>
                                    <li><a href="#">Hệ thống cửa hàng</a></li>
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
                                        <a href="#" style={{ color: "#6ee7b7", fontWeight: 600 }}>
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
                                    <li><a href="#" style={{ color: "#6ee7b7" }}>Mua qua các sàn điện tử</a></li>
                                </ul>
                                <div className="cp-social">
                                    <a className="cp-pill shopify" href="#" aria-label="Shopify">
                                        <i className="fa-brands fa-shopify" style={{ color: "#fff" }} />
                                    </a>
                                    <a className="cp-pill ig" href="#" aria-label="Instagram">
                                        <i className="fa-brands fa-instagram" style={{ color: "#fff" }} />
                                    </a>
                                    <a className="cp-pill fb" href="#" aria-label="Facebook">
                                        <i className="fa-brands fa-facebook-f" style={{ color: "#fff" }} />
                                    </a>
                                    <a className="cp-pill tk" href="#" aria-label="Tiktok">
                                        <i className="fa-brands fa-tiktok" style={{ color: "#fff" }} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="cp-credit">
                            <span>© 2025 StoreVegetables</span>
                            <span>Made with ❤️ SPORT OH!</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
