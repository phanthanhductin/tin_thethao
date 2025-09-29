<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class CategoryController extends Controller
{
    /**
     * Chuẩn hoá mọi giá trị từ cột `image` thành URL public dùng được.
     * Ưu tiên các vị trí:
     *   1) Đã là http/https -> trả nguyên
     *   2) images/... | assets/... | storage/... (nằm trong public) -> asset($path) nếu tồn tại
     *   3) Nếu là đường Windows (C:\... hoặc có backslash) -> lấy tên file (basename),
     *      rồi thử tìm trong:
     *         - public/images/category/<file>
     *         - public/assets/images/<file>
     *   4) Nếu chỉ là tên file -> thử như (3)
     *   5) Không thấy -> trả no-image (để FE không lỗi)
     */
    private function toPublicUrl(?string $raw): string
    {
        if (!$raw) {
            return asset('assets/images/no-image.png');
        }

        // Normalize slash & trim
        $p = str_replace('\\', '/', trim($raw));
        $p = ltrim($p, '/');

        // 1) URL tuyệt đối
        if (Str::startsWith($p, ['http://', 'https://'])) {
            return $p;
        }

        // 2) Đường trong public (images/, assets/, storage/)
        if (Str::startsWith($p, ['images/', 'assets/', 'storage/'])) {
            // Nếu file tồn tại trong public thì trả asset, không thì rơi xuống check tiếp
            if (File::exists(public_path($p))) {
                return asset($p);
            }
        }

        // 3) Nếu là đường hệ thống (C:/..., tmp/..., v.v.) -> lấy basename
        $file = basename($p);

        // Thử các vị trí phổ biến
        $candidates = [
            "images/category/{$file}",
            "assets/images/{$file}",
            $p, // thử chính nó lần nữa phòng trường hợp public đã có
        ];

        foreach ($candidates as $rel) {
            $full = public_path($rel);
            if (File::exists($full)) {
                return asset($rel);
            }
        }

        // 5) Fallback cuối
        return asset('assets/images/no-image.png');
    }

    // GET /api/categories
    public function index()
    {
        $cats = Category::select(['id','name','slug','image','sort_order'])
            ->orderBy('sort_order')
            ->get();

        $cats->transform(function ($c) {
            $c->image = $this->toPublicUrl($c->image); // FE chỉ đọc field `image`
            return $c;
        });

        return response()->json($cats);
    }

    // GET /api/categories/{id}
    public function show($id)
    {
        $c = Category::find($id);
        if (!$c) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $c->image = $this->toPublicUrl($c->image);
        return response()->json($c);
    }
}
