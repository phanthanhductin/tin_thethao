// export default function Dashboard() {
//   const cards = [
//     { label: "Doanh thu hôm nay", value: "₫12,500,000" },
//     { label: "Đơn hàng mới", value: "38" },
//     { label: "Sản phẩm tồn kho thấp", value: "7" },
//     { label: "Người dùng mới", value: "15" },
//   ];

//   return (
//     <section>
//       <h1 style={{ fontSize: 24, marginBottom: 12 }}>Dashboard</h1>

//       <div style={{
//         display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 12
//       }}>
//         {cards.map(c => (
//           <div key={c.label} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 16 }}>
//             <div style={{ color: "#666", marginBottom: 6 }}>{c.label}</div>
//             <div style={{ fontSize: 22, fontWeight: 700 }}>{c.value}</div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

export default function Dashboard() {
  const cards = [
    { label: "Doanh thu hôm nay", value: "₫12,500,000" },
    { label: "Đơn hàng mới", value: "38" },
    { label: "Sản phẩm tồn kho thấp", value: "7" },
    { label: "Người dùng mới", value: "15" },
  ];

  return (
    <section
      style={{
   
        background: "linear-gradient(135deg, #f0f9ff, #e0f7fa)",
        minHeight: "100vh",
        borderRadius: 16,
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          marginBottom: 20,
          textAlign: "center",
          color: "#0284c7",
        }}
      >
        🧭 Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: 15,
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
