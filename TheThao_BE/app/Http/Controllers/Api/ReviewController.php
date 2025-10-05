<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    // Public: danh sách review của 1 sản phẩm
    public function index($productId) {
        $rows = DB::table('product_reviews as r')
            // 🔧 Sửa JOIN vào đúng bảng user của bạn: ptdt_user
            ->leftJoin('ptdt_user as u', 'u.id', '=', 'r.user_id')
            ->where('r.product_id', $productId)
            ->orderBy('r.id', 'desc')
            ->select('r.id','r.rating','r.content','r.created_at','u.id as user_id','u.name as user_name')
            ->get();

        $data = $rows->map(function ($r) {
            return [
                'id'         => $r->id,
                'rating'     => (int)$r->rating,
                'content'    => $r->content,
                'created_at' => $r->created_at,
                'user'       => ['id' => $r->user_id, 'name' => $r->user_name],
            ];
        });

        $metaRow = DB::table('product_reviews')
            ->where('product_id', $productId)
            ->selectRaw('COUNT(*) as total, COALESCE(AVG(rating),0) as avg_rating')
            ->first();

        $meta = [
            'total'      => (int)($metaRow->total ?? 0),
            'avg_rating' => round((float)($metaRow->avg_rating ?? 0), 1),
        ];

        return response()->json(['data' => $data, 'meta' => $meta]);
    }

    // Auth: tạo review
    public function store(Request $request, $productId) {
        $uid = $request->user()->id ?? null;
        if (!$uid) return response()->json(['message' => 'Unauthenticated'], 401);

        $data = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'content' => 'nullable|string|max:2000',
        ]);

        DB::table('product_reviews')->insert([
            'product_id' => $productId,
            'user_id'    => $uid,
            'rating'     => $data['rating'],
            'content'    => $data['content'] ?? '',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'ok']);
    }

    // 🔧 Bổ sung để khớp route PUT /reviews/{rid}
    public function update(Request $request, $rid) {
        $uid = $request->user()->id ?? null;
        if (!$uid) return response()->json(['message' => 'Unauthenticated'], 401);

        $data = $request->validate([
            'rating'  => 'sometimes|integer|min:1|max:5',
            'content' => 'nullable|string|max:2000',
        ]);

        $update = [
            'updated_at' => now(),
        ];
        if (array_key_exists('rating', $data))  $update['rating']  = $data['rating'];
        if (array_key_exists('content', $data)) $update['content'] = $data['content'];

        $aff = DB::table('product_reviews')->where('id', $rid)->where('user_id', $uid)->update($update);

        return response()->json(['message' => $aff ? 'updated' : 'no-change']);
    }

    // Auth: xóa review của chính mình
    public function destroy(Request $request, $id) {
        $uid = $request->user()->id ?? null;
        if (!$uid) return response()->json(['message' => 'Unauthenticated'], 401);

        DB::table('product_reviews')->where('id', $id)->where('user_id', $uid)->delete();
        return response()->json(['message' => 'deleted']);
    }
}
