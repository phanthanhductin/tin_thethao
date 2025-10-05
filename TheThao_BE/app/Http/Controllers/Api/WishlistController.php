<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WishlistController extends Controller
{
    // Trả về danh sách product_id user đã thích
    public function index(Request $request) {
        $uid = $request->user()->id ?? null;
        if (!$uid) return response()->json(['message' => 'Unauthenticated'], 401);

        $ids = DB::table('wishlists')
            ->where('user_id', $uid)
            ->pluck('product_id');

        return ['product_ids' => $ids];
    }

    // Toggle like/unlike
    public function toggle(Request $request, $productId) {
        $uid = $request->user()->id ?? null;
        if (!$uid) return response()->json(['message' => 'Unauthenticated'], 401);

        $exists = DB::table('wishlists')
            ->where('user_id', $uid)
            ->where('product_id', $productId)
            ->exists();

        if ($exists) {
            DB::table('wishlists')
                ->where('user_id', $uid)
                ->where('product_id', $productId)
                ->delete();
            return ['status' => 'removed'];
        } else {
            DB::table('wishlists')->insert([
                'user_id'    => $uid,
                'product_id' => $productId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return ['status' => 'added'];
        }
    }
}
