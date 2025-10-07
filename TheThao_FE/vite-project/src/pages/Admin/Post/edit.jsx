import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function PostEdit() {
    const { id } = useParams();
    const nav = useNavigate();
    const token = useMemo(() => localStorage.getItem("admin_token"), []);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [f, setF] = useState({
        title: "",
        slug: "",
        status: "draft",
        excerpt: "",
        content: "",
        image_url: "",
        published_at: "",
    });
    const [imgFile, setImgFile] = useState(null);
    const [preview, setPreview] = useState("");

    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                setErr("");
                const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
                    signal: ac.signal,
                    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const p = await res.json();
                setF({
                    title: p.title || "",
                    slug: p.slug || "",
                    status: (p.status === 1 || p.status === "published") ? "published" : "draft",
                    excerpt: p.excerpt || p.summary || "",
                    content: p.content || "",
                    image_url: p.image_url || "",
                    published_at: (p.published_at || "").slice(0, 19).replace("T", " "),
                });
                setPreview(p.image_url || "");
            } catch (e) {
                setErr("Không tải được bài viết.");
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, [id, token]);

    function autoSlug(s = "") {
        return s
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim().replace(/\s+/g, "-").replace(/-+/g, "-");
    }

    function onPick(file) {
        setImgFile(file || null);
        setPreview(file ? URL.createObjectURL(file) : "");
    }

    async function onSubmit(e) {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append("title", f.title);
            if (f.slug) fd.append("slug", f.slug);
            fd.append("status", f.status === "published" ? 1 : 0);
            if (f.excerpt) fd.append("summary", f.excerpt);
            if (f.content) fd.append("content", f.content);
            if (f.published_at) fd.append("published_at", f.published_at);
            if (imgFile) fd.append("image", imgFile);
            else if (f.image_url) fd.append("image_url", f.image_url);

            const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
                method: "POST", // server của bạn đang nhận POST update
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const txt = await res.text();
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${txt}`);

            alert("✅ Đã cập nhật bài viết");
            nav("/admin/posts");
        } catch (err) {
            alert(`❌ Lỗi lưu: ${err.message}`);
        }
    }

    if (loading) return <section style={{ padding: 20 }}>Đang tải…</section>;
    if (err) return <section style={{ padding: 20, color: "red" }}>{err}</section>;

    return (
        <section style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Sửa bài viết #{id}</h1>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => nav("/admin/posts")}
                        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
                    >
                        ← Quay lại
                    </button>
                    <button
                        form="post-form"
                        type="submit"
                        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #0f62fe", background: "#0f62fe", color: "#fff", cursor: "pointer" }}
                    >
                        Lưu
                    </button>
                </div>
            </div>

            <form id="post-form" onSubmit={onSubmit} style={{ marginTop: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {/* Left */}
                    <div style={{ display: "grid", gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 13 }}>Tiêu đề *</label>
                            <input
                                required
                                value={f.title}
                                onChange={(e) => setF({ ...f, title: e.target.value })}
                                onBlur={() => !f.slug && setF((s) => ({ ...s, slug: autoSlug(s.title) }))}
                                style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 10 }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: 13 }}>Slug</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    value={f.slug}
                                    onChange={(e) => setF({ ...f, slug: e.target.value })}
                                    placeholder="bai-viet-cua-toi"
                                    style={{ flex: 1, height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 10 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setF({ ...f, slug: autoSlug(f.title) })}
                                    style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
                                >
                                    Auto
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div>
                                <label style={{ fontSize: 13 }}>Trạng thái</label>
                                <select
                                    value={f.status}
                                    onChange={(e) => setF({ ...f, status: e.target.value })}
                                    style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 10 }}
                                >
                                    <option value="draft">draft</option>
                                    <option value="published">published</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13 }}>Ngày xuất bản</label>
                                <input
                                    value={f.published_at}
                                    onChange={(e) => setF({ ...f, published_at: e.target.value })}
                                    placeholder="YYYY-MM-DD HH:mm:ss"
                                    style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 10 }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 13 }}>Tóm tắt</label>
                            <textarea
                                value={f.excerpt}
                                onChange={(e) => setF({ ...f, excerpt: e.target.value })}
                                maxLength={500}
                                style={{ width: "100%", minHeight: 90, padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
                            />
                        </div>
                    </div>

                    {/* Right */}
                    <div style={{ display: "grid", gap: 12 }}>
                        <label style={{ fontSize: 13 }}>Ảnh đại diện</label>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 12 }}>
                            <div>
                                {preview ? (
                                    <img src={preview} alt="" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }} />
                                ) : f.image_url ? (
                                    <img src={f.image_url} alt="" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }} />
                                ) : (
                                    <div style={{ width: 120, height: 80, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12 }}>No image</div>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input type="file" accept="image/*" onChange={(e) => onPick(e.target.files?.[0] || null)} />
                                    <span style={{ fontSize: 12, color: "#64748b" }}>Tối đa 2MB</span>
                                </div>

                                <div style={{ marginTop: 10 }}>
                                    <label style={{ fontSize: 13 }}>Hoặc dán URL ảnh</label>
                                    <input
                                        value={f.image_url}
                                        onChange={(e) => { setF({ ...f, image_url: e.target.value }); setPreview(""); }}
                                        placeholder="https://…"
                                        style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #ddd", borderRadius: 10 }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 13 }}>Nội dung</label>
                            <textarea
                                value={f.content}
                                onChange={(e) => setF({ ...f, content: e.target.value })}
                                placeholder="Bạn có thể tích hợp WYSIWYG sau."
                                style={{ width: "100%", minHeight: 120, padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}
