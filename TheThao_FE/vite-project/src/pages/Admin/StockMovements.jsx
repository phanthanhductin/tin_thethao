import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";
const PLACEHOLDER = "https://placehold.co/60x40?text=No+Img";

export default function StockMovements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    const token = localStorage.getItem("admin_token");

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${API_BASE}/admin/stock-movements`, {
          signal: ac.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Lỗi tải dữ liệu");
        setItems(data.data || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const filtered = items.filter(
    (x) =>
      !q ||
      x.product_name?.toLowerCase().includes(q.toLowerCase()) ||
      x.type?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-4 font-[Montserrat]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-indigo-600">
          Quản lý nhập – xuất kho
        </h1>
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border rounded px-3 py-1 text-sm w-60"
        />
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : err ? (
        <p className="text-red-600">Lỗi: {err}</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Sản phẩm</th>
                <th className="p-2 border">Loại</th>
                <th className="p-2 border">Số lượng</th>
                <th className="p-2 border">Ngày</th>
                <th className="p-2 border">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-slate-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filtered.map((x, i) => (
                  <tr key={x.id} className="hover:bg-slate-50">
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2 flex items-center gap-2">
                      <img
                        src={x.thumbnail_url || PLACEHOLDER}
                        alt=""
                        className="w-12 h-8 object-cover rounded"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <span>{x.product_name}</span>
                    </td>
                    <td className="border p-2 text-center">
                      {x.type === "import" ? (
                        <span className="text-green-600 font-semibold">Nhập</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Xuất</span>
                      )}
                    </td>
                    <td className="border p-2 text-center">{x.qty}</td>
                    <td className="border p-2 text-center">
                      {new Date(x.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="border p-2">{x.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
