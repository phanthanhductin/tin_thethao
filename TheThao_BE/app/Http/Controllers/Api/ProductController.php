<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
    public function index()
    {
        $products = Product::with('brand:id,name')
            ->select(['id','name','brand_id','price_sale as price','thumbnail'])
            ->latest('id')
            ->paginate(12);

        $products->getCollection()->transform(function ($p) {
            return $this->withThumbUrl($p);
        });

        return $products->makeHidden(['brand','brand_id']);
    }

    public function show($id)
    {
        $p = Product::with('brand:id,name')
            ->select([
                'id','name','brand_id','price_sale as price',
                'thumbnail','detail','description','category_id',
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
    public function adminShow($id)
    {
        $p = Product::with('brand:id,name')
            ->select([
                'id','name','slug','brand_id','category_id',
                'price_root','price_sale','qty',
                'detail','description','status','thumbnail'
            ])
            ->find($id);

        if (!$p) return response()->json(['message' => 'Not found'], 404);

        $p = $this->withThumbUrl($p);
        return $p;
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

        if ($product->thumbnail) {
            Storage::disk('public')->delete($product->thumbnail);
        }

        $product->delete();
        return response()->json(['message' => 'Đã xóa sản phẩm']);
    }
}
