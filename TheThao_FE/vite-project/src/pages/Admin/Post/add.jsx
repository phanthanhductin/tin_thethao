import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000/api";

export default function PostAdd() {
    const nav = useNavigate();
    const token = useMemo(() => localStorage.getItem("admin_token"), []);
    const [f, setF] = useState({
        title: "",
        slug: "",
        status: "draft", // FE: draft/published → BE: 0/1
        excerpt: "",
        content: "",
        image_url: "",
        published_at: "",
    });
    const [imgFile, setImgFile] = useState(null);
    const [preview, setPreview] = useState("");

    function autoSlug(s = "") {
        return s
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
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

            // --- slug fallback chống trùng/blank ---
            const safeSlug =
                (f.slug && f.slug.trim()) ||
                autoSlug(f.title) ||
                `post-${Date.now()}`;
            fd.append("slug", safeSlug);

            fd.append("status", f.status === "published" ? 1 : 0);
            if (f.excerpt) fd.append("summary", f.excerpt);
            if (f.content) fd.append("content", f.content);
            if (f.published_at) fd.append("published_at", f.published_at);
            if (imgFile) fd.append("image", imgFile);
            else if (f.image_url) fd.append("image_url", f.image_url);

            const res = await fetch(`${API_BASE}/admin/posts`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json", // quan trọng để nhận JSON khi lỗi
                },
                body: fd,
            });

            // thử đọc JSON trước, nếu không phải JSON thì đọc text
            const contentType = res.headers.get("content-type") || "";
            const payload = contentType.includes("application/json")
                ? await res.json().catch(() => ({}))
                : await res.text();

            if (!res.ok) {
                const msg =
                    typeof payload === "string"
                        ? payload
                        : payload?.message ||
                        (payload?.errors &&
                            Object.values(payload.errors).flat().join("\n")) ||
                        `HTTP ${res.status}`;
                throw new Error(msg);
            }

            alert("✅ Đã tạo bài viết");
            nav("/admin/posts");
        } catch (err) {
            alert(`❌ Lỗi lưu: ${err.message}`);
        }
    }

    return (
        <section style={{ padding: 20 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Thêm bài viết</h1>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => nav("/admin/posts")}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #ddd",
                            background: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        ← Quay lại
                    </button>
                    <button
                        form="post-form"
                        type="submit"
                        style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #0f62fe",
                            background: "#0f62fe",
                            color: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        Lưu
                    </button>
                </div>
            </div>

            <form id="post-form" onSubmit={onSubmit} style={{ marginTop: 12 }}>
                <div
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
                >
                    {/* Left */}
                    <div style={{ display: "grid", gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 13 }}>Tiêu đề *</label>
                            <input
                                required
                                value={f.title}
                                onChange={(e) => setF({ ...f, title: e.target.value })}
                                onBlur={() =>
                                    !f.slug &&
                                    setF((s) => ({ ...s, slug: autoSlug(s.title || "") }))
                                }
                                style={{
                                    width: "100%",
                                    height: 36,
                                    padding: "0 10px",
                                    border: "1px solid #ddd",
                                    borderRadius: 10,
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: 13 }}>Slug</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    value={f.slug}
                                    onChange={(e) => setF({ ...f, slug: e.target.value })}
                                    placeholder="bai-viet-cua-toi"
                                    style={{
                                        flex: 1,
                                        height: 36,
                                        padding: "0 10px",
                                        border: "1px solid #ddd",
                                        borderRadius: 10,
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setF({ ...f, slug: autoSlug(f.title) })}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 8,
                                        border: "1px solid #ddd",
                                        background: "#fff",
                                        cursor: "pointer",
                                    }}
                                >
                                    Auto
                                </button>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 8,
                            }}
                        >
                            <div>
                                <label style={{ fontSize: 13 }}>Trạng thái</label>
                                <select
                                    value={f.status}
                                    onChange={(e) => setF({ ...f, status: e.target.value })}
                                    style={{
                                        width: "100%",
                                        height: 36,
                                        padding: "0 10px",
                                        border: "1px solid #ddd",
                                        borderRadius: 10,
                                    }}
                                >
                                    <option value="draft">draft</option>
                                    <option value="published">published</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 13 }}>Ngày xuất bản</label>
                                <input
                                    value={f.published_at}
                                    onChange={(e) =>
                                        setF({ ...f, published_at: e.target.value })
                                    }
                                    placeholder="YYYY-MM-DD HH:mm:ss"
                                    style={{
                                        width: "100%",
                                        height: 36,
                                        padding: "0 10px",
                                        border: "1px solid #ddd",
                                        borderRadius: 10,
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 13 }}>Tóm tắt</label>
                            <textarea
                                value={f.excerpt}
                                onChange={(e) => setF({ ...f, excerpt: e.target.value })}
                                maxLength={500}
                                style={{
                                    width: "100%",
                                    minHeight: 90,
                                    padding: 10,
                                    border: "1px solid #ddd",
                                    borderRadius: 10,
                                }}
                            />
                        </div>
                    </div>

                    {/* Right */}
                    <div style={{ display: "grid", gap: 12 }}>
                        <label style={{ fontSize: 13 }}>Ảnh đại diện</label>
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "flex-start",
                                background: "#f8fafc",
                                border: "1px dashed #cbd5e1",
                                borderRadius: 12,
                                padding: 12,
                            }}
                        >
                            <div>
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt=""
                                        style={{
                                            width: 120,
                                            height: 80,
                                            objectFit: "cover",
                                            borderRadius: 10,
                                            border: "1px solid #e5e7eb",
                                        }}
                                    />
                                ) : f.image_url ? (
                                    <img
                                        src={f.image_url}
                                        alt=""
                                        style={{
                                            width: 120,
                                            height: 80,
                                            objectFit: "cover",
                                            borderRadius: 10,
                                            border: "1px solid #e5e7eb",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: 120,
                                            height: 80,
                                            borderRadius: 10,
                                            background: "#f1f5f9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#94a3b8",
                                            fontSize: 12,
                                        }}
                                    >
                                        No image
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => onPick(e.target.files?.[0] || null)}
                                    />
                                    <span style={{ fontSize: 12, color: "#64748b" }}>
                                        Tối đa 2MB
                                    </span>
                                </div>

                                <div style={{ marginTop: 10 }}>
                                    <label style={{ fontSize: 13 }}>Hoặc dán URL ảnh</label>
                                    <input
                                        value={f.image_url}
                                        onChange={(e) => {
                                            setF({ ...f, image_url: e.target.value });
                                            setPreview("");
                                        }}
                                        placeholder="https://…"
                                        style={{
                                            width: "100%",
                                            height: 36,
                                            padding: "0 10px",
                                            border: "1px solid #ddd",
                                            borderRadius: 10,
                                        }}
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
                                style={{
                                    width: "100%",
                                    minHeight: 120,
                                    padding: 10,
                                    border: "1px solid #ddd",
                                    borderRadius: 10,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}
