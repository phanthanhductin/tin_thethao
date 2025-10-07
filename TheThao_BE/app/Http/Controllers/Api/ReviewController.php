<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // ✅ Lấy danh sách review của sản phẩm
    public function index($productId)
    {
        try {
            $reviews = Review::where('product_id', $productId)
                ->with('user:id,name')
                ->latest()
                ->get();

            return response()->json([
                'data' => $reviews,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không tải được review',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ✅ Gửi review mới
    public function store(Request $request, $productId)
    {
        try {
            $data = $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'content' => 'nullable|string',
            ]);

            $review = Review::create([
                'product_id' => $productId,
                'user_id' => $request->user()->id,
                'rating' => $data['rating'],
                'content' => $data['content'] ?? '', // ✅ sửa ở đây
            ]);

            $review->load('user:id,name');

            return response()->json(['data' => $review], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'ERROR DEBUG',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ✅ Kiểm tra user có thể review không
    public function canReview(Request $request, $productId)
    {
        $user = $request->user();

        $hasPurchased = \DB::table('ptdt_orderdetail as od')
            ->join('ptdt_order as o', 'o.id', '=', 'od.order_id')
            ->where('o.user_id', $user->id)
            ->where('od.product_id', $productId)
            ->exists();

        $hasReviewed = Review::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'can_review' => $hasPurchased && !$hasReviewed,
        ]);
    }
}
