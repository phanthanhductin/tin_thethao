<?php

// namespace App\Http\Controllers\Api;

// use App\Http\Controllers\Controller;
// use App\Models\Product;
// use App\Models\Category; // ✅ dùng để dò danh mục theo keyword
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Storage;
// use Illuminate\Validation\Rule;
// use Illuminate\Support\Str;
// use Illuminate\Support\Facades\DB;

// class ProductController extends Controller
// {
//     // ===== helper (ADDED) =====
//     private function withThumbUrl($p)
//     {
//         if (!$p) return $p;
//         $p->thumbnail_url = $p->thumbnail ? asset('storage/' . $p->thumbnail) : null;
//         return $p;
//     }

//     private function ensureUniqueSlug(string $slug, ?int $ignoreId = null): string
//     {
//         $base = Str::slug($slug);
//         $try  = $base ?: Str::random(8);
//         $i = 1;

//         while (
//             Product::when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
//                 ->where('slug', $try)
//                 ->exists()
//         ) {
//             $i++;
//             $try = $base . '-' . $i;
//         }
//         return $try;
//     }

//     // ===== Public APIs =====
//     public function index(Request $request)
//     {
//         // ✅ Trả đủ trường cho FE/fallback
//         $q = Product::with('brand:id,name')
//             ->select([
//                 'id',
//                 'name',
//                 'brand_id',
//                 'category_id',
//                 'price_root',
//                 'price_sale',
//                 DB::raw('price_sale as price'),
//                 'thumbnail'
//             ]);

//         /* ====== Lọc ====== */

//         // Keyword: keyword | q
//         $kw = trim($request->query('keyword', $request->query('q', '')));
//         if ($kw !== '') {
//             $kwSlug = Str::slug($kw); // "bóng rổ" -> "bong-ro"

//             // 🔍 Thử tìm danh mục có name/slug khớp keyword
//             $catIds = Category::query()
//                 ->where(function ($w) use ($kw, $kwSlug) {
//                     $w->where('name', 'like', "%{$kw}%")
//                       ->orWhere('slug', 'like', "%{$kwSlug}%");
//                 })
//                 ->pluck('id');

//             if ($catIds->count() > 0) {
//                 // ✅ Nếu keyword khớp danh mục -> CHỈ trả về sản phẩm thuộc các danh mục đó
//                 $q->whereIn('category_id', $catIds->all());
//             } else {
//                 // Không khớp danh mục -> tìm theo tên/slug sản phẩm như thường lệ
//                 $q->where(function ($x) use ($kw, $kwSlug) {
//                     $x->where('name', 'like', "%{$kw}%")
//                       ->orWhere('slug', 'like', "%{$kwSlug}%");
//                 });
//             }
//         }

//         // Danh mục (nếu người dùng chọn ở filter)
//         if ($request->filled('category_id')) {
//             $q->where('category_id', (int) $request->query('category_id'));
//         }

//         // Khoảng giá theo giá hiệu lực (sale nếu có, không thì root)
//         $priceExpr = DB::raw('COALESCE(price_sale, price_root)');
//         if ($request->filled('min_price')) {
//             $q->where($priceExpr, '>=', (float) $request->query('min_price'));
//         }
//         if ($request->filled('max_price')) {
//             $q->where($priceExpr, '<=', (float) $request->query('max_price'));
//         }

//         // Chỉ sản phẩm giảm giá
//         if ($request->boolean('only_sale')) {
//             $q->whereNotNull('price_root')
//               ->whereNotNull('price_sale')
//               ->whereColumn('price_sale', '<', 'price_root');
//         }

//         // Chỉ còn hàng
//         if ($request->boolean('in_stock')) {
//             $q->where(function ($x) {
//                 $x->where('qty', '>', 0)
//                   ->orWhere('status', 'active')
//                   ->orWhere('status', 1);
//             });
//         }

//         /* ====== Sắp xếp ====== */
//         // sort = created_at:desc | price:asc | price:desc | name:asc | name:desc
//         [$field, $dir] = array_pad(explode(':', (string) $request->query('sort', 'created_at:desc'), 2), 2, 'asc');
//         $dir = strtolower($dir) === 'desc' ? 'desc' : 'asc';

//         if ($field === 'price') {
//             $q->orderByRaw('COALESCE(price_sale, price_root) ' . $dir);
//         } elseif ($field === 'name') {
//             $q->orderBy('name', $dir);
//         } elseif ($field === 'created_at') {
//             $q->orderBy('created_at', $dir);
//         } else {
//             $q->orderBy('id', 'desc');
//         }

//         /* ====== Phân trang ====== */
//         $perPage = (int) $request->query('per_page', 12);
//         $perPage = max(1, min(100, $perPage));

//         $products = $q->paginate($perPage);

//         // thumbnail_url
//         $products->getCollection()->transform(function ($p) {
//             return $this->withThumbUrl($p);
//         });

//         return $products->makeHidden(['brand','brand_id']);
//     }

//     public function show($id)
//     {
//         $p = Product::with('brand:id,name')
//             ->select([
//                 'id',
//                 'name',
//                 'brand_id',
//                 'category_id',
//                 'price_root',
//                 'price_sale',
//                 DB::raw('price_sale as price'),
//                 'thumbnail',
//                 'detail',
//                 'description',
//                 // ✅ bổ sung 2 trường tồn kho
//                 'qty',
//                 'status',
                
//             ])
//             ->find($id);

//         if (!$p) return response()->json(['message' => 'Not found'], 404);

//         $p = $this->withThumbUrl($p);
//         return $p->makeHidden(['brand','brand_id']);
//     }

//     public function byCategory($id)
//     {
//         $items = Product::with('brand:id,name')
//             ->where('category_id', $id)
//             ->select(['id','name','brand_id','price_sale as price','thumbnail'])
//             ->latest('id')
//             ->paginate(12);

//         $items->getCollection()->transform(function ($p) {
//             return $this->withThumbUrl($p);
//         });

//         return $items->makeHidden(['brand','brand_id']);
//     }

//     // ===== Admin APIs =====
// public function adminIndex(\Illuminate\Http\Request $request)
// {
//     $perPage = max(1, min(100, (int) $request->query('per_page', 10)));
//     $page    = max(1, (int) $request->query('page', 1));
//     $scope   = $request->query('scope', 'active'); // active|with_trash|only_trash

//     $q = \App\Models\Product::with('brand:id,name')
//         ->select([
//             'id','name','slug','brand_id',
//             'price_root','price_sale',
//             \DB::raw('COALESCE(qty,0) as qty'),
//             'thumbnail'
//         ])
//         ->latest('id');

//     // phạm vi soft delete
//     if ($scope === 'with_trash') {
//         $q->withTrashed();
//     } elseif ($scope === 'only_trash') {
//         $q->onlyTrashed();
//     } // mặc định: active

//     // Phân trang CHUẨN, giữ query (page/per_page/scope)
//     $products = $q->paginate($perPage, ['*'], 'page', $page)
//                   ->appends($request->query());

//     // Chuẩn hóa dữ liệu
//     $products->getCollection()->transform(function ($p) {
//         $p->qty = (int) ($p->qty ?? 0);
//         return $this->withThumbUrl($p);
//     });

//     // Trả về object paginate chuẩn của Laravel
//     return $products->makeHidden(['brand','brand_id']);
// }


//     // ⭐ Admin - xem chi tiết sản phẩm
// // ⭐ Admin - xem chi tiết sản phẩm
// public function adminShow($id)
// {
//     $p = Product::with('brand:id,name')
//         ->select([
//             'id',
//             'name',
//             'slug',
//             'brand_id',
//             'category_id',
//             'price_root',
//             'price_sale',
//             'qty',
//             'status',
//             'thumbnail',
//             'detail',
//             'description',
//             'created_at',
//             'updated_at'
//         ])
//         ->find($id);

//     if (!$p) {
//         return response()->json(['message' => 'Product not found'], 404);
//     }

//     // ✅ Bổ sung thumbnail_url
//     $p = $this->withThumbUrl($p);

//     return response()->json([
//         'message' => 'OK',
//         'data' => $p
//     ]);
// }




//   public function store(Request $request)
// {
//     // Lấy tên bảng để validate exists đúng (tránh sai tiền tố ptdt_)
//     $productTable = (new \App\Models\Product)->getTable();
//     $brandTable   = (new \App\Models\Brand)->getTable();
//     $catTable     = (new \App\Models\Category)->getTable();

//     $validated = $request->validate([
//         'name'        => 'required|string|max:255',
//         'slug'        => 'nullable|string|max:255', // cho phép để trống -> sẽ tự sinh
//         'brand_id'    => ['nullable','integer',"exists:{$brandTable},id"],
//         'category_id' => ['nullable','integer',"exists:{$catTable},id"],
//         'price_root'  => 'required|numeric|min:0',
//         'price_sale'  => 'nullable|numeric|min:0',
//         'qty'         => 'required|integer|min:0',
//         'detail'      => 'nullable|string',
//         'description' => 'nullable|string',
//         'thumbnail'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
//     ]);

//     // Nếu slug rỗng -> sinh từ name, và đảm bảo unique
//     $slug = $validated['slug'] ?? '';
//     if ($slug === '' || $slug === null) {
//         $slug = $this->ensureUniqueSlug($validated['name']);
//     } else {
//         $slug = $this->ensureUniqueSlug($slug);
//     }

//     $data = [
//         'name'        => $validated['name'],
//         'slug'        => $slug,
//         'brand_id'    => $validated['brand_id']    ?? null,
//         'category_id' => $validated['category_id'] ?? null,
//         'price_root'  => $validated['price_root'],
//         'price_sale'  => $validated['price_sale']  ?? null,
//         'qty'         => $validated['qty'],
//         'detail'      => $validated['detail']      ?? null,
//         'description' => $validated['description'] ?? null,
//     ];

//     if ($request->hasFile('thumbnail')) {
//         $data['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
//     }

//     $product = \App\Models\Product::create($data)->load('brand:id,name');

//     // Thêm thumbnail_url cho FE
//     $product = $this->withThumbUrl($product);

//     return response()->json([
//         'message' => 'Tạo sản phẩm thành công',
//         'data'    => $product->makeHidden(['brand','brand_id']), // nếu bạn muốn ẩn id brand
//     ], 201);
// }


//     public function update(Request $request, $id)
//     {
//         $product = Product::find($id);
//         if (!$product) return response()->json(['message' => 'Not found'], 404);

//         $data = $request->validate([
//             'name'        => 'sometimes|string|max:255',
//             'slug'        => 'nullable|string|max:255',
//             'brand_id'    => 'nullable|integer',
//             'category_id' => 'nullable|integer',
//             'price_root'  => 'nullable|numeric',
//             'price_sale'  => 'nullable|numeric',
//             'qty'         => 'nullable|integer',
//             'detail'      => 'nullable|string',
//             'description' => 'nullable|string',
//             'thumbnail'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
//         ]);

//         if (array_key_exists('slug', $data)) {
//             $data['slug'] = $this->ensureUniqueSlug(
//                 $data['slug'] !== '' ? $data['slug'] : ($data['name'] ?? $product->name),
//                 $product->id
//             );
//         }

//         if ($request->hasFile('thumbnail')) {
//             if ($product->thumbnail) {
//                 Storage::disk('public')->delete($product->thumbnail);
//             }
//             $data['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
//         }

//         $product->update($data);
//         $product = $this->withThumbUrl($product);

//         return response()->json([
//             'message' => 'Cập nhật thành công',
//             'data'    => $product
//         ]);
//     }

// //     public function destroy($id)
// // {
// //     $product = Product::find($id);
// //     if (!$product) return response()->json(['message' => 'Not found'], 404);

// //     $product->delete(); // ✅ chỉ soft delete
// //     return response()->json(['message' => 'Đã chuyển sản phẩm vào thùng rác']);
// // }


// public function destroy($id)
// {
//     $product = Product::find($id);
//     if (!$product) {
//         return response()->json(['message' => 'Not found'], 404);
//     }

//     // ✅ Kiểm tra xem sản phẩm có trong đơn hàng không
//     $used = DB::table('ptdt_orderdetail')
//         ->where('product_id', $id)
//         ->exists();

//     if ($used) {
//         return response()->json([
//             'message' => '❌ Không thể xóa sản phẩm này vì đang có trong đơn hàng!'
//         ], 400);
//     }

//     // ✅ Nếu không nằm trong đơn hàng -> cho phép xoá mềm
//     $product->delete();

//     return response()->json(['message' => 'Đã chuyển sản phẩm vào thùng rác']);
// }


// // ✅ Lấy danh sách trong thùng rác
// public function trash()
// {
//     $trash = Product::onlyTrashed()->orderByDesc('deleted_at')->get();
//     $trash->transform(fn($p) => $this->withThumbUrl($p));
//     return response()->json(['data' => $trash]);
// }

// // ✅ Khôi phục sản phẩm
// public function restore($id)
// {
//     $p = Product::onlyTrashed()->find($id);
//     if (!$p) return response()->json(['message' => 'Không tìm thấy sản phẩm trong thùng rác'], 404);
//     $p->restore();
//     return response()->json(['message' => 'Đã khôi phục sản phẩm!']);
// }

// // ✅ Xóa vĩnh viễn
// public function forceDelete($id)
// {
//     $p = Product::onlyTrashed()->find($id);
//     if (!$p) return response()->json(['message' => 'Không tìm thấy sản phẩm trong thùng rác'], 404);
//     if ($p->thumbnail) Storage::disk('public')->delete($p->thumbnail);
//     $p->forceDelete();
//     return response()->json(['message' => 'Đã xoá vĩnh viễn sản phẩm!']);
// }

// }





namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /* ===== Helper ===== */
    private function withThumbUrl($p)
    {
        if (!$p) return $p;
        $p->thumbnail_url = $p->thumbnail ? asset('storage/' . $p->thumbnail) : null;
        return $p;
    }

    private function ensureUniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug);
        $try = $base ?: Str::random(8);
        $i = 1;
        while (
            Product::when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->where('slug', $try)
                ->exists()
        ) {
            $try = $base . '-' . $i++;
        }
        return $try;
    }

    /* ===== PUBLIC API ===== */
    public function index(Request $request)
    {
        $q = Product::with('brand:id,name')
            ->select([
                'id', 'name', 'slug', 'brand_id', 'category_id',
                'price_root', 'price_sale', 'qty', 'thumbnail', 'status'
            ]);

        $kw = trim($request->query('keyword', $request->query('q', '')));
        if ($kw !== '') {
            $kwSlug = Str::slug($kw);
            $catIds = Category::where('name', 'like', "%$kw%")
                ->orWhere('slug', 'like', "%$kwSlug%")
                ->pluck('id');
            if ($catIds->count() > 0) {
                $q->whereIn('category_id', $catIds);
            } else {
                $q->where('name', 'like', "%$kw%")
                  ->orWhere('slug', 'like', "%$kwSlug%");
            }
        }

        $priceExpr = DB::raw('COALESCE(price_sale, price_root)');
        if ($request->filled('min_price'))
            $q->where($priceExpr, '>=', (float)$request->min_price);
        if ($request->filled('max_price'))
            $q->where($priceExpr, '<=', (float)$request->max_price);

        $perPage = max(1, min(100, (int)$request->query('per_page', 12)));
        $products = $q->paginate($perPage);
        $products->getCollection()->transform(fn($p) => $this->withThumbUrl($p));

        return $products;
    }

    public function show($id)
    {
        $p = Product::with('brand:id,name')
            ->select([
                'id','name','slug','brand_id','category_id',
                'price_root','price_sale','qty','thumbnail',
                'detail','description','status'
            ])
            ->find($id);

        if (!$p) return response()->json(['message' => 'Not found'], 404);

        return $this->withThumbUrl($p);
    }

    /* ===== ADMIN: LIST ===== */
    public function adminIndex(Request $request)
    {
        $perPage = max(1, min(100, (int)$request->query('per_page', 10)));
        $scope = $request->query('scope', 'active');

        $q = Product::with('brand:id,name')
            ->select([
                'id','name','slug','brand_id','price_root','price_sale',
                DB::raw('COALESCE(qty,0) as qty'),'status','thumbnail'
            ])
            ->latest('id');

        if ($scope === 'with_trash') $q->withTrashed();
        elseif ($scope === 'only_trash') $q->onlyTrashed();

        $pg = $q->paginate($perPage)->appends($request->query());
        $pg->getCollection()->transform(fn($p) => $this->withThumbUrl($p));
        return $pg;
    }

    /* ===== ADMIN: CREATE ===== */
    public function store(Request $request)
    {
        $brandTable = (new \App\Models\Brand)->getTable();
        $catTable = (new \App\Models\Category)->getTable();

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255',
            'brand_id'    => ['nullable','integer',"exists:{$brandTable},id"],
            'category_id' => ['nullable','integer',"exists:{$catTable},id"],
            'price_root'  => 'required|numeric|min:0',
            'price_sale'  => 'nullable|numeric|min:0',
            'qty'         => 'required|integer|min:0',
            'detail'      => 'nullable|string',
            'description' => 'nullable|string',
            'thumbnail'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $slug = $this->ensureUniqueSlug($validated['slug'] ?? $validated['name']);
        $data = array_merge($validated, ['slug' => $slug]);

        if ($request->hasFile('thumbnail'))
            $data['thumbnail'] = $request->file('thumbnail')->store('products', 'public');

        $product = Product::create($data);
        return response()->json([
            'message' => 'Tạo sản phẩm thành công',
            'data'    => $this->withThumbUrl($product)
        ], 201);
    }

    /* ===== ADMIN: UPDATE ===== */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'slug'        => 'nullable|string|max:255',
            'brand_id'    => 'nullable|integer',
            'category_id' => 'nullable|integer',
            'price_root'  => 'nullable|numeric|min:0',
            'price_sale'  => 'nullable|numeric|min:0',
            'qty'         => 'nullable|integer|min:0',
            'detail'      => 'nullable|string',
            'description' => 'nullable|string',
            'thumbnail'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if (array_key_exists('slug', $data)) {
            $data['slug'] = $this->ensureUniqueSlug(
                $data['slug'] !== '' ? $data['slug'] : ($data['name'] ?? $product->name),
                $product->id
            );
        }

        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail)
                Storage::disk('public')->delete($product->thumbnail);
            $data['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
        }

        $product->update($data);
        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'data'    => $this->withThumbUrl($product)
        ]);
    }

    /* ===== ADMIN: DELETE / TRASH ===== */
    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);

        $used = DB::table('ptdt_orderdetail')->where('product_id', $id)->exists();
        if ($used)
            return response()->json(['message' => 'Không thể xoá, sản phẩm có trong đơn hàng!'], 400);

        $product->delete();
        return response()->json(['message' => 'Đã chuyển sản phẩm vào thùng rác']);
    }

    public function trash()
    {
        $items = Product::onlyTrashed()->orderByDesc('deleted_at')->get();
        $items->transform(fn($p) => $this->withThumbUrl($p));
        return response()->json(['data' => $items]);
    }

    public function restore($id)
    {
        $p = Product::onlyTrashed()->find($id);
        if (!$p) return response()->json(['message' => 'Không tìm thấy'], 404);
        $p->restore();
        return response()->json(['message' => 'Đã khôi phục sản phẩm']);
    }

    public function forceDelete($id)
    {
        $p = Product::onlyTrashed()->find($id);
        if (!$p) return response()->json(['message' => 'Không tìm thấy'], 404);
        if ($p->thumbnail) Storage::disk('public')->delete($p->thumbnail);
        $p->forceDelete();
        return response()->json(['message' => 'Đã xoá vĩnh viễn sản phẩm!']);
    }
}
