<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category; // ✅ dùng để dò danh mục theo keyword
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    // ===== helper (ADDED) =====
    private function withThumbUrl($p)
    {
        if (!$p) return $p;
        $p->thumbnail_url = $p->thumbnail ? asset('storage/' . $p->thumbnail) : null;
        return $p;
    }

    private function ensureUniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug);
        $try  = $base ?: Str::random(8);
        $i = 1;

        while (
            Product::when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->where('slug', $try)
                ->exists()
        ) {
            $i++;
            $try = $base . '-' . $i;
        }
        return $try;
    }

    // ===== Public APIs =====
    public function index(Request $request)
    {
        // ✅ Trả đủ trường cho FE/fallback
        $q = Product::with('brand:id,name')
            ->select([
                'id',
                'name',
                'brand_id',
                'category_id',
                'price_root',
                'price_sale',
                DB::raw('price_sale as price'),
                'thumbnail'
            ]);

        /* ====== Lọc ====== */

        // Keyword: keyword | q
        $kw = trim($request->query('keyword', $request->query('q', '')));
        if ($kw !== '') {
            $kwSlug = Str::slug($kw); // "bóng rổ" -> "bong-ro"

            // 🔍 Thử tìm danh mục có name/slug khớp keyword
            $catIds = Category::query()
                ->where(function ($w) use ($kw, $kwSlug) {
                    $w->where('name', 'like', "%{$kw}%")
                      ->orWhere('slug', 'like', "%{$kwSlug}%");
                })
                ->pluck('id');

            if ($catIds->count() > 0) {
                // ✅ Nếu keyword khớp danh mục -> CHỈ trả về sản phẩm thuộc các danh mục đó
                $q->whereIn('category_id', $catIds->all());
            } else {
                // Không khớp danh mục -> tìm theo tên/slug sản phẩm như thường lệ
                $q->where(function ($x) use ($kw, $kwSlug) {
                    $x->where('name', 'like', "%{$kw}%")
                      ->orWhere('slug', 'like', "%{$kwSlug}%");
                });
            }
        }

        // Danh mục (nếu người dùng chọn ở filter)
        if ($request->filled('category_id')) {
            $q->where('category_id', (int) $request->query('category_id'));
        }

        // Khoảng giá theo giá hiệu lực (sale nếu có, không thì root)
        $priceExpr = DB::raw('COALESCE(price_sale, price_root)');
        if ($request->filled('min_price')) {
            $q->where($priceExpr, '>=', (float) $request->query('min_price'));
        }
        if ($request->filled('max_price')) {
            $q->where($priceExpr, '<=', (float) $request->query('max_price'));
        }

        // Chỉ sản phẩm giảm giá
        if ($request->boolean('only_sale')) {
            $q->whereNotNull('price_root')
              ->whereNotNull('price_sale')
              ->whereColumn('price_sale', '<', 'price_root');
        }

        // Chỉ còn hàng
        if ($request->boolean('in_stock')) {
            $q->where(function ($x) {
                $x->where('qty', '>', 0)
                  ->orWhere('status', 'active')
                  ->orWhere('status', 1);
            });
        }

        /* ====== Sắp xếp ====== */
        // sort = created_at:desc | price:asc | price:desc | name:asc | name:desc
        [$field, $dir] = array_pad(explode(':', (string) $request->query('sort', 'created_at:desc'), 2), 2, 'asc');
        $dir = strtolower($dir) === 'desc' ? 'desc' : 'asc';

        if ($field === 'price') {
            $q->orderByRaw('COALESCE(price_sale, price_root) ' . $dir);
        } elseif ($field === 'name') {
            $q->orderBy('name', $dir);
        } elseif ($field === 'created_at') {
            $q->orderBy('created_at', $dir);
        } else {
            $q->orderBy('id', 'desc');
        }

        /* ====== Phân trang ====== */
        $perPage = (int) $request->query('per_page', 12);
        $perPage = max(1, min(100, $perPage));

        $products = $q->paginate($perPage);

        // thumbnail_url
        $products->getCollection()->transform(function ($p) {
            return $this->withThumbUrl($p);
        });

        return $products->makeHidden(['brand','brand_id']);
    }

    public function show($id)
    {
        $p = Product::with('brand:id,name')
            ->select([
                'id',
                'name',
                'brand_id',
                'category_id',
                'price_root',
                'price_sale',
                DB::raw('price_sale as price'),
                'thumbnail',
                'detail',
                'description',
                // ✅ bổ sung 2 trường tồn kho
                'qty',
                'status',
                
            ])
            ->find($id);

        if (!$p) return response()->json(['message' => 'Not found'], 404);

        $p = $this->withThumbUrl($p);
        return $p->makeHidden(['brand','brand_id']);
    }

    public function byCategory($id)
    {
        $items = Product::with('brand:id,name')
            ->where('category_id', $id)
            ->select(['id','name','brand_id','price_sale as price','thumbnail'])
            ->latest('id')
            ->paginate(12);

        $items->getCollection()->transform(function ($p) {
            return $this->withThumbUrl($p);
        });

        return $items->makeHidden(['brand','brand_id']);
    }

    // ===== Admin APIs =====
    public function adminIndex()
    {
        $products = Product::with('brand:id,name')
            ->select([
                'id','name','slug','brand_id',
                'price_root','price_sale','qty','thumbnail'
            ])
            ->latest('id')
            ->paginate(5);

        $products->getCollection()->transform(function ($p) {
            return $this->withThumbUrl($p);
        });

        return $products->makeHidden(['brand','brand_id']);
    }

    // ⭐ Admin - xem chi tiết sản phẩm
// ⭐ Admin - xem chi tiết sản phẩm
public function adminShow($id)
{
    $p = Product::with('brand:id,name')
        ->select([
            'id',
            'name',
            'slug',
            'brand_id',
            'category_id',
            'price_root',
            'price_sale',
            'qty',
            'status',
            'thumbnail',
            'detail',
            'description',
            'created_at',
            'updated_at'
        ])
        ->find($id);

    if (!$p) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    // ✅ Bổ sung thumbnail_url
    $p = $this->withThumbUrl($p);

    return response()->json([
        'message' => 'OK',
        'data' => $p
    ]);
}




    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255',
            'brand_id'    => 'nullable|integer',
            'category_id' => 'nullable|integer',
            'price_root'  => 'nullable|numeric',
            'price_sale'  => 'nullable|numeric',
            'qty'         => 'nullable|integer',
            'detail'      => 'nullable|string',
            'description' => 'nullable|string',
            'thumbnail'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $nameForSlug = $data['name'] ?? '';
        $givenSlug   = $data['slug'] ?? '';
        $data['slug'] = $this->ensureUniqueSlug($givenSlug !== '' ? $givenSlug : $nameForSlug);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('products', 'public');
            $data['thumbnail'] = $path;
        }

        $product = Product::create($data);
        $product = $this->withThumbUrl($product);

        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data'    => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'slug'        => 'nullable|string|max:255',
            'brand_id'    => 'nullable|integer',
            'category_id' => 'nullable|integer',
            'price_root'  => 'nullable|numeric',
            'price_sale'  => 'nullable|numeric',
            'qty'         => 'nullable|integer',
            'detail'      => 'nullable|string',
            'description' => 'nullable|string',
            'thumbnail'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if (array_key_exists('slug', $data)) {
            $data['slug'] = $this->ensureUniqueSlug(
                $data['slug'] !== '' ? $data['slug'] : ($data['name'] ?? $product->name),
                $product->id
            );
        }

        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail) {
                Storage::disk('public')->delete($product->thumbnail);
            }
            $data['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
        }

        $product->update($data);
        $product = $this->withThumbUrl($product);

        return response()->json([
            'message' => 'Cập nhật thành công',
            'data'    => $product
        ]);
    }

    public function destroy($id)
{
    $product = Product::find($id);
    if (!$product) return response()->json(['message' => 'Not found'], 404);

    $product->delete(); // ✅ chỉ soft delete
    return response()->json(['message' => 'Đã chuyển sản phẩm vào thùng rác']);
}
// ✅ Lấy danh sách trong thùng rác
public function trash()
{
    $trash = Product::onlyTrashed()->orderByDesc('deleted_at')->get();
    $trash->transform(fn($p) => $this->withThumbUrl($p));
    return response()->json(['data' => $trash]);
}

// ✅ Khôi phục sản phẩm
public function restore($id)
{
    $p = Product::onlyTrashed()->find($id);
    if (!$p) return response()->json(['message' => 'Không tìm thấy sản phẩm trong thùng rác'], 404);
    $p->restore();
    return response()->json(['message' => 'Đã khôi phục sản phẩm!']);
}

// ✅ Xóa vĩnh viễn
public function forceDelete($id)
{
    $p = Product::onlyTrashed()->find($id);
    if (!$p) return response()->json(['message' => 'Không tìm thấy sản phẩm trong thùng rác'], 404);
    if ($p->thumbnail) Storage::disk('public')->delete($p->thumbnail);
    $p->forceDelete();
    return response()->json(['message' => 'Đã xoá vĩnh viễn sản phẩm!']);
}

}
