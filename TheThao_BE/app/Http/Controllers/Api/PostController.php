<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class PostController extends Controller
{
    /**
     * Chuẩn hoá đường dẫn ảnh -> URL tuyệt đối dựa trên APP_URL.
     * Hỗ trợ: http(s), //, public/assets/images/..., assets/images/..., images/..., img/...,
     * uploads/..., storage/..., và trường hợp chỉ là tên file (7.jpg).
     */
    private static function toAbsolute(?string $path): ?string
    {
        if (!$path) return null;

        $s = trim($path);

        // 1) Data URL / Absolute / Protocol-relative
        if (preg_match('#^data:image/[^;]+;base64,#i', $s)) return $s;
        if (preg_match('#^https?://#i', $s)) return $s;
        if (str_starts_with($s, '//')) {
            $scheme = parse_url(config('app.url'), PHP_URL_SCHEME) ?: 'http';
            return $scheme . ':' . $s;
        }

        // 2) Chuẩn hoá slashes, bỏ leading slash
        $s = ltrim(str_replace('\\', '/', $s), '/');

        // 3) Nếu có prefix public/ -> bỏ để thành đường public web root
        if (Str::startsWith($s, 'public/')) {
            $s = substr($s, 7);
        }

        // 4) Nếu đã là storage/... -> public/storage/...
        if (Str::startsWith($s, 'storage/')) {
            return url($s);
        }

        // 5) Nếu là assets/... hoặc images/... hoặc img/... hoặc uploads/... nằm dưới public/
        if (preg_match('#^(assets|images|img|uploads|media|files)(/|$)#i', $s)) {
            // thử chính xác đường này trước
            if (File::exists(public_path($s))) {
                return url($s);
            }
            // nếu người dùng lưu thiếu "images/" sau "assets/"
            if (Str::startsWith($s, 'assets/')) {
                $maybe = 'assets/images/' . ltrim(substr($s, strlen('assets/')), '/');
                if (File::exists(public_path($maybe))) return url($maybe);
            }
            // nếu file nằm trong storage/app/public
            if (File::exists(storage_path('app/public/'.$s))) {
                return url('storage/'.$s);
            }
            // best-effort: trả về như public
            return url($s);
        }

        // 6) Trường hợp chỉ là tên file (vd: 7.jpg) -> thử theo nhiều thư mục phổ biến
        $candidates = [
            $s,                             // gốc public
            'assets/images/'.$s,            // đúng thư mục bạn đang dùng
            'assets/img/'.$s,
            'assets/'.$s,
            'images/'.$s,
            'img/'.$s,
            'uploads/'.$s,
            'media/'.$s,
            'files/'.$s,
        ];
        foreach ($candidates as $rel) {
            if (File::exists(public_path($rel))) {
                return url($rel);
            }
        }
        // thử trong storage/app/public
        if (File::exists(storage_path('app/public/'.$s))) {
            return url('storage/'.$s);
        }

        // 7) Fallback: coi như nằm dưới /assets/images
        return url('assets/images/'.$s);
    }

    /**
     * GET /api/posts?q=&category_id=&status=&page=&per_page=
     */
    public function index(Request $r)
    {
        $q = Post::query();

        if ($r->filled('status'))      $q->where('status', (int)$r->get('status'));
        if ($r->filled('category_id')) $q->where('category_id', (int)$r->get('category_id'));
        if ($kw = trim((string)$r->get('q', ''))) {
            $q->where(function ($qq) use ($kw) {
                $qq->where('title', 'like', "%{$kw}%")
                   ->orWhere('summary', 'like', "%{$kw}%")
                   ->orWhere('content', 'like', "%{$kw}%")
                   ->orWhere('detail', 'like', "%{$kw}%")
                   ->orWhere('description', 'like', "%{$kw}%");
            });
        }

        $q->orderByDesc('id');

        $perPage   = min(max((int)$r->get('per_page', 12), 1), 100);
        $paginator = $q->paginate($perPage);

        $paginator->getCollection()->transform(function (Post $p) {
            // Ưu tiên các cột ảnh thường gặp trong DB của bạn
            $candidate = $p->image_url
                ?? $p->thumbnail       // thấy trong phpMyAdmin
                ?? $p->image
                ?? $p->thumb
                ?? $p->banner
                ?? $p->cover
                ?? null;

            $img  = self::toAbsolute($candidate);
            $slug = $p->slug ?: Str::slug(($p->title ?? 'post').'-'.$p->id);
            $sum  = $p->summary ?? $p->description ?? null;

            return [
                'id'         => $p->id,
                'title'      => (string)($p->title ?? ''),
                'slug'       => $slug,
                'image_url'  => $img,  // luôn tuyệt đối
                'summary'    => $sum,
                'created_at' => optional($p->created_at)->toDateTimeString(),
            ];
        });

        return response()->json($paginator);
    }

    /**
     * GET /api/posts/{idOrSlug}
     */
    public function show($idOrSlug)
    {
        $post = ctype_digit((string)$idOrSlug)
            ? Post::find((int)$idOrSlug)
            : Post::where('slug', $idOrSlug)->first();

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $candidate = $post->image_url
            ?? $post->thumbnail
            ?? $post->image
            ?? $post->thumb
            ?? $post->banner
            ?? $post->cover
            ?? null;

        $img  = self::toAbsolute($candidate);
        $slug = $post->slug ?: Str::slug(($post->title ?? 'post').'-'.$post->id);
        $body = $post->content ?? $post->detail ?? null;

        return response()->json([
            'id'         => $post->id,
            'title'      => (string)($post->title ?? ''),
            'slug'       => $slug,
            'image_url'  => $img,
            'summary'    => $post->summary ?? $post->description ?? null,
            'content'    => $body,
            'created_at' => optional($post->created_at)->toDateTimeString(),
            'updated_at' => optional($post->updated_at)->toDateTimeString(),
        ]);
    }
}
