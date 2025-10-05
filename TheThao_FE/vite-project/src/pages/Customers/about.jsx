// src/pages/Customers/layout.jsx
import React from "react";
import { FiBox, FiBriefcase, FiUsers, FiTwitter, FiLinkedin } from "react-icons/fi";

export default function Layout() {
  return (
    <div className="about-page">
      {/* ===== CSS riêng cho trang ===== */}
      <style>{`
        .about-page {
          --bg1: #064e3b;         /* emerald-900 */
          --bg2: #4f46e5;         /* indigo-600 */
          --ink: #0f172a;         /* slate-900 */
          --ink-2: #334155;       /* slate-600 */
          --surface: #ffffff;
          --muted: #f1f5f9;       /* slate-100 */
          --brand: #1d4ed8;       /* blue-600 */
          --brand-2: #60a5fa;     /* blue-300 */
          --accent: #fde047;      /* yellow-300 */
          --ring: rgba(255,255,255,.2);
        }

        .container {
          width: min(1200px, 92vw);
          margin: 0 auto;
          padding: 32px 0 64px;
        }

        /* ===== Section 1: Hero / Story ===== */
        .hero {
          background: linear-gradient(135deg, var(--bg1), var(--bg2));
          color: #fff;
          border-radius: 20px;
          padding: clamp(28px, 6vw, 80px);
          box-shadow: 0 24px 60px rgba(0,0,0,.25);
          position: relative;
          overflow: hidden;
        }
        .hero::after {
          content: "";
          position: absolute;
          inset: -40%;
          background: radial-gradient(closest-side, rgba(255,255,255,.12), transparent 60%);
          transform: translate(35%, -10%) rotate(15deg);
          pointer-events: none;
        }
        .hero h2 {
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 800;
          letter-spacing: .5px;
          text-align: center;
          margin: 0 0 16px;
          text-shadow: 0 6px 24px rgba(0,0,0,.25);
        }
        .hero .sub {
          text-align: center;
          color: #e5e7eb;
          max-width: 880px;
          margin: 0 auto 36px;
          line-height: 1.7;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: clamp(20px, 4vw, 48px);
          align-items: center;
        }
        .hero h3 {
          font-size: clamp(28px, 4.6vw, 52px);
          line-height: 1.1;
          margin: 0 0 12px;
        }
        .hero p {
          color: #e6f3ff;
          line-height: 1.85;
          margin: 0 0 16px;
        }
        .hero p .hl {
          color: var(--accent);
          font-weight: 700;
        }
        .hero ul {
          margin: 10px 0 0 0;
          padding-left: 18px;
          color: #e8f1ff;
          line-height: 1.8;
        }
        .hero .image {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 18px 46px rgba(0,0,0,.35);
          border: 1px solid var(--ring);
          background: rgba(255,255,255,.07);
          backdrop-filter: blur(4px);
        }
        .hero .image img {
          display: block;
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        /* ===== Section 2: Stats ===== */
        .stats {
          margin-top: 48px;
          background: var(--muted);
          border-radius: 20px;
          padding: clamp(28px, 5vw, 80px);
          box-shadow: 0 12px 28px rgba(2,6,23,.08);
        }
        .section-head {
          text-align: center;
          margin: 0 0 28px;
        }
        .section-title {
          font-size: clamp(28px, 4.5vw, 48px);
          font-weight: 800;
          color: var(--ink);
          margin: 0 0 10px;
        }
        .divider {
          width: 84px;
          height: 4px;
          border-radius: 999px;
          margin: 0 auto;
          background: linear-gradient(90deg, var(--brand-2), var(--brand));
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
          margin-top: 28px;
        }
        .stat-card {
          background: var(--surface);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 20px rgba(2,6,23,.06);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(2,6,23,.12);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: var(--brand);
          background: #e8f0ff;
          font-size: 22px;
        }
        .stat-icon svg { width: 22px; height: 22px; }
        .stat-number {
          font-size: 30px;
          font-weight: 800;
          color: var(--brand);
          margin: 2px 0 4px;
        }
        .stat-label {
          color: var(--ink-2);
        }

        /* ===== Section 3: Team ===== */
        .team {
          margin-top: 48px;
          background: #fff;
          border-radius: 20px;
          padding: clamp(28px, 5vw, 80px);
          box-shadow: 0 12px 28px rgba(2,6,23,.08);
        }
        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .member {
          background: var(--surface);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 24px rgba(2,6,23,.08);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .member:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(2,6,23,.14);
        }
        .member .photo {
          width: 100%;
          height: 260px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .member .photo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .member .body {
          padding: 20px;
          text-align: center;
        }
        .member .name {
          color: var(--brand);
          font-weight: 700;
          font-size: 18px;
          margin: 0 0 6px;
        }
        .member .role {
          color: var(--ink-2);
          font-size: 14px;
        }
        .member .links {
          margin-top: 12px;
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .member .social {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: var(--surface);
          background: var(--brand);
          text-decoration: none;
          transition: transform .15s ease, filter .15s ease;
        }
        .member .social:hover { transform: translateY(-2px); filter: brightness(1.1); }

        /* ===== Responsive ===== */
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr; }
          .team-grid, .stats-grid { grid-template-columns: 1fr; }
        }
        @media (min-width: 961px) and (max-width: 1200px) {
          .team-grid, .stats-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <main className="container">
        {/* SECTION 1: HƠN CẢ MỘT CỬA HÀNG */}
        <section className="hero">
          <div className="head">
            <h2>HƠN CẢ MỘT CỬA HÀNG</h2>
            <p className="sub">
              Chúng tôi là những người yêu bóng đá, xây dựng nên không gian này để chia sẻ
              <em> страсть</em> và mang đến những sản phẩm tốt nhất cho cộng đồng.
            </p>
          </div>

          <div className="hero-grid">
            <div className="hero-copy">
              <h3>Từ Đam Mê Đến Hành Động</h3>
              <p>
                Câu chuyện của chúng tôi bắt đầu từ những buổi tập luyện dưới mưa, những trận cầu nảy lửa
                trên sân cỏ và khát khao sở hữu những trang thiết bị chất lượng nhất. Chính niềm đam mê
                cháy bỏng ấy đã thôi thúc chúng tôi tạo ra <span className="hl">Thế Giới Bóng Đá</span> –
                nơi mọi <em>футболист</em> đều có thể tìm thấy "người bạn đồng hành" hoàn hảo.
              </p>
              <ul>
                <li>Chúng tôi tin vào sức mạnh của tinh thần đồng đội và sự Fair Play.</li>
                <li>Chất lượng sản phẩm luôn là ưu tiên hàng đầu.</li>
                <li>Không ngừng đổi mới để đáp ứng nhu cầu ngày càng cao của khách hàng.</li>
              </ul>
            </div>

            <div className="image">
              <img
                src="http://127.0.0.1:8000/assets/images/logo.webp"
                alt="Câu chuyện của chúng tôi"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: NHỮNG CON SỐ BIẾT NÓI */}
        <section className="stats">
          <div className="section-head">
            <h2 className="section-title">NHỮNG CON SỐ BIẾT NÓI</h2>
            <div className="divider" />
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><FiBox /></div>
              <div className="stat-number">100+</div>
              <div className="stat-label">Sản Phẩm Đa Dạng</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><FiBriefcase /></div>
              <div className="stat-number">5+</div>
              <div className="stat-label">Năm Kinh Nghiệm</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><FiUsers /></div>
              <div className="stat-number">10K+</div>
              <div className="stat-label">Khách Hàng Tin Tưởng</div>
            </div>
          </div>
        </section>

        {/* SECTION 3: ĐỘI NGŨ CỦA CHÚNG TÔI */}
        <section className="team">
          <div className="section-head">
            <h2 className="section-title">ĐỘI NGŨ CỦA CHÚNG TÔI</h2>
            <div className="divider" />
            <p style={{ color: "var(--ink-2)", marginTop: 12 }}>
              Những con người đứng sau <strong style={{ color: "var(--brand)" }}>Thế Giới Bóng Đá</strong>,
              cùng chung <em>страсть</em> và nỗ lực mang đến trải nghiệm tốt nhất cho bạn.
            </p>
          </div>

          <div className="team-grid">
            {/* Thành viên 1 */}
            <article className="member">
              <div className="photo">
                <img
                  src="http://127.0.0.1:8000/assets/images/tin.jpg"
                  alt="Phan Thanh Đức Tín"
                  loading="lazy"
                />
              </div>
              <div className="body">
                <h3 className="name">Phan Thanh Đức Tín</h3>
                <p className="role">Nhà Sáng Lập &amp; CEO</p>
                <div className="links">
                  <a className="social" href="#" aria-label="Twitter"><FiTwitter /></a>
                  <a className="social" href="#" aria-label="LinkedIn"><FiLinkedin /></a>
                </div>
              </div>
            </article>

            {/* Thành viên 2 */}
            <article className="member">
              <div className="photo">
                <img
                  src="http://127.0.0.1:8000/assets/images/truong.jpg"
                  alt="Nguyễn Trúc Trường"
                  loading="lazy"
                />
              </div>
              <div className="body">
                <h3 className="name">Nguyễn Trúc Trường</h3>
                <p className="role">Quản Lý Sản Phẩm</p>
                <div className="links">
                  <a className="social" href="#" aria-label="Twitter"><FiTwitter /></a>
                  <a className="social" href="#" aria-label="LinkedIn"><FiLinkedin /></a>
                </div>
              </div>
            </article>

            {/* Thành viên 3 */}
            <article className="member">
              <div className="photo">
                <img
                  src="http://127.0.0.1:8000/assets/images/tai.jpg"
                  alt="Nguyễn Tuấn Tài"
                  loading="lazy"
                />
              </div>
              <div className="body">
                <h3 className="name">Nguyễn Tuấn Tài</h3>
                <p className="role">Chuyên Viên Hỗ Trợ</p>
                <div className="links">
                  <a className="social" href="#" aria-label="Twitter"><FiTwitter /></a>
                  <a className="social" href="#" aria-label="LinkedIn"><FiLinkedin /></a>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
