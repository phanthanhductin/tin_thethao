<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Public: list
    public function index()
    {
        $cats = Category::orderBy('sort_order')->orderByDesc('id')->get();
        // ❌ Không cần tự gán image_url — đã có accessor trong Model
        return response()->json($cats);
    }

    // Public: detail
    public function show($id)
    {
        $cat = Category::find($id);
        if (!$cat) {
            return response()->json(['message' => 'Category not found'], 404);
        }
        // ❌ Không cần thủ công image_url
        return response()->json($cat);
    }

    // Admin: create
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:1000',
            'slug'        => 'required|string|max:1000|unique:ptdt_category,slug',
            'image'       => 'nullable|string|max:1000',
            'parent_id'   => 'nullable|integer',
            'sort_order'  => 'nullable|integer',
            'description' => 'nullable|string',
            'status'      => 'nullable|integer|in:0,1',
        ]);

        // Ép kiểu + mặc định
        $data['parent_id']  = array_key_exists('parent_id', $data) ? (int) $data['parent_id'] : null;
        $data['sort_order'] = array_key_exists('sort_order', $data) ? (int) $data['sort_order'] : 0;
        $data['status']     = array_key_exists('status', $data) ? (int) $data['status'] : 1;

        // Nếu DB NOT NULL, set created_by/updated_by
        $data['created_by'] = auth()->id() ?? 0;
        $data['updated_by'] = auth()->id() ?? 0;

        $cat = Category::create($data);

        return response()->json([
            'message'  => 'Thêm danh mục thành công',
            'category' => $cat, // đã có image_url trong JSON
        ], 201);
    }

    // Admin: update
    public function update(Request $request, $id)
    {
        $cat = Category::find($id);
        if (!$cat) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $data = $request->validate([
            'name'        => 'required|string|max:1000',
            'slug'        => 'required|string|max:1000|unique:ptdt_category,slug,' . $id,
            'image'       => 'nullable|string|max:1000',
            'parent_id'   => 'nullable|integer',
            'sort_order'  => 'nullable|integer',
            'description' => 'nullable|string',
            'status'      => 'nullable|integer|in:0,1',
        ]);

        // Ép kiểu nếu có gửi lên
        if (array_key_exists('parent_id', $data))  $data['parent_id']  = $data['parent_id'] === null ? null : (int) $data['parent_id'];
        if (array_key_exists('sort_order', $data)) $data['sort_order'] = (int) $data['sort_order'];
        if (array_key_exists('status', $data))     $data['status']     = (int) $data['status'];

        $data['updated_by'] = auth()->id() ?? 0;

        $cat->update($data);

        return response()->json([
            'message'  => 'Cập nhật danh mục thành công',
            'category' => $cat, // đã có image_url trong JSON
        ]);
    }

    // Admin: delete
    public function destroy($id)
    {
        $cat = Category::find($id);
        if (!$cat) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $cat->delete();
        return response()->json(['message' => 'Xóa danh mục thành công']);
    }
}
