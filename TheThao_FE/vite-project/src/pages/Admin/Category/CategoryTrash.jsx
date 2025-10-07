import { useEffect, useState } from "react";
const API_BASE = "http://127.0.0.1:8000/api";

export default function CategoryTrash() {
  const [rows, setRows] = useState([]);

  useEffect(()=>{
    (async()=>{
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_BASE}/admin/categories/trash`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRows(data.data || []);
    })();
  },[]);

  async function restore(id){
    const token = localStorage.getItem("admin_token");
    await fetch(`${API_BASE}/admin/categories/restore/${id}`,{
      method:"POST",
      headers:{Authorization:`Bearer ${token}`}
    });
    setRows(r=>r.filter(x=>x.id!==id));
  }

  async function forceDelete(id){
    if(!window.confirm("Xóa vĩnh viễn?")) return;
    const token = localStorage.getItem("admin_token");
    await fetch(`${API_BASE}/admin/categories/force/${id}`,{
      method:"DELETE",
      headers:{Authorization:`Bearer ${token}`}
    });
    setRows(r=>r.filter(x=>x.id!==id));
  }

  return (
    <section style={{padding:20}}>
      <h1>🗑️ Thùng rác danh mục</h1>
      <table width="100%" cellPadding={8} style={{background:"#fff",borderCollapse:"collapse"}}>
        <thead>
          <tr style={{background:"#fafafa"}}>
            <th>ID</th><th>Tên</th><th>Slug</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(c=>(
            <tr key={c.id}>
              <td>{c.id}</td><td>{c.name}</td><td>{c.slug}</td>
              <td>
                <button onClick={()=>restore(c.id)} style={{background:"#2e7d32",color:"#fff",marginRight:6,padding:"4px 10px",borderRadius:6}}>Khôi phục</button>
                <button onClick={()=>forceDelete(c.id)} style={{background:"#b71c1c",color:"#fff",padding:"4px 10px",borderRadius:6}}>Xóa vĩnh viễn</button>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={4} align="center" style={{padding:20,color:"#777"}}>Trống</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
