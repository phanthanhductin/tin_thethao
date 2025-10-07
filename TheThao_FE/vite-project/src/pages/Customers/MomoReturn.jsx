import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

export default function MomoReturn() {
    const nav = useNavigate();
    const [msg, setMsg] = useState("Đang xác nhận thanh toán với MoMo...");

    useEffect(() => {
        const moOrderCode = localStorage.getItem("momo_last_order_code");
        const localOrderId = localStorage.getItem("momo_last_order_id");

        if (!moOrderCode) {
            setMsg("Không tìm thấy mã đơn MoMo để kiểm tra.");
            return;
        }

        let stopped = false;
        const poll = async (tries = 0) => {
            try {
                const res = await fetch(`${API_BASE}/api/payments/momo/check?order_code=${encodeURIComponent(moOrderCode)}`);
                const data = await res.json();

                // ✅ Thành công (IPN đã về)
                if (data?.payment_status === "paid" || data?.order_status === "paid" || data?.result_code === 0) {
                    localStorage.setItem("cart", "[]");        // xóa giỏ
                    localStorage.removeItem("cart_backup");    // xóa backup
                    localStorage.removeItem("momo_last_order_code");
                    const oid = data?.order_id || localOrderId || "";
                    setMsg("Thanh toán thành công! Đang chuyển tới trang theo dõi đơn...");
                    setTimeout(() => nav(`/track?code=${encodeURIComponent(oid)}`, { replace: true }), 800);
                    return;
                }

                // ❌ Thất bại
                if (data?.payment_status === "failed") {
                    setMsg("Thanh toán thất bại. Giỏ hàng đã được khôi phục.");
                    const backup = localStorage.getItem("cart_backup");
                    if (backup) localStorage.setItem("cart", backup);
                    localStorage.removeItem("cart_backup");
                    localStorage.removeItem("momo_last_order_code");
                    return;
                }

                // ⏳ Pending → poll lại tối đa ~40s
                if (tries < 20 && !stopped) setTimeout(() => poll(tries + 1), 2000);
                else setMsg("Đơn đang chờ MoMo xác nhận. Vui lòng kiểm tra lại sau ít phút.");
            } catch (e) {
                if (tries < 10 && !stopped) setTimeout(() => poll(tries + 1), 2000);
                else setMsg("Không kiểm tra được trạng thái thanh toán.");
            }
        };

        poll();
        return () => { stopped = true; };
    }, [nav]);

    return (
        <div style={{ maxWidth: 640, margin: "40px auto", padding: 20 }}>
            <h2>MoMo Return</h2>
            <p>{msg}</p>
        </div>
    );
}
