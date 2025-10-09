<?php

use Illuminate\Support\Facades\Route;

/* ==== Controllers ==== */
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\AIController;

/* =======================
   ===== PUBLIC API =====
   ======================= */

// ===== STOCK (public xem) =====
Route::get('/stock-movements', [StockController::class, 'index']);

// ===== AUTH =====
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);

// ===== PRODUCTS & CATEGORIES =====
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/categories/{id}/products', [ProductController::class, 'byCategory']);

// ===== REVIEWS (public xem) =====
Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);

// ===== ORDERS (tracking + cancel + chi tiết) =====
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/track', [OrderController::class, 'track']);
Route::get('/orders/{id}', [OrderController::class, 'show'])->whereNumber('id');
Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

// ===== CONTACT / BRAND / POSTS =====
Route::post('/contacts', [ContactController::class, 'store']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{idOrSlug}', [PostController::class, 'show']);

// ===== PAYMENTS =====
Route::post('/payments/momo/create', [PaymentController::class, 'createMoMo']);
Route::post('/payments/momo/ipn', [PaymentController::class, 'ipn']);
Route::get('/payments/momo/return', [PaymentController::class, 'return']);
Route::get('/payments/momo/check', [PaymentController::class, 'check']);

// ===== AI (PUBLIC) =====
Route::post('/ai/chat', [AIController::class, 'chat']);

/* ===========================
   ===== AUTH CUSTOMER =====
   =========================== */
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Orders
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders/mine', [OrderController::class, 'mine']);
    Route::get('/my-orders', [OrderController::class, 'mine']); // alias

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle/{productId}', [WishlistController::class, 'toggle']);

    // Reviews (private)
    Route::get('/products/{id}/can-review', [ReviewController::class, 'canReview']);
    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{rid}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{rid}', [ReviewController::class, 'destroy']);
});

/* ===========================
   ===== ADMIN PANEL =====
   =========================== */
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    // ===== Categories =====
    Route::apiResource('categories', CategoryController::class)->except(['show']);
    Route::get('categories/trash', [CategoryController::class, 'trash']);
    Route::post('categories/restore/{id}', [CategoryController::class, 'restore']);
    Route::delete('categories/force/{id}', [CategoryController::class, 'forceDelete']);

    // ===== Products =====
    Route::get('products', [ProductController::class, 'adminIndex']);
    Route::apiResource('products', ProductController::class)->except(['show', 'index']); // tránh trùng /admin/products GET
    Route::get('products/trash', [ProductController::class, 'trash']);
    Route::post('products/{id}/restore', [ProductController::class, 'restore']);
    Route::delete('products/{id}/force', [ProductController::class, 'forceDelete']);

    // ===== Orders =====
    Route::get('orders', [OrderController::class, 'adminIndex']);
    Route::get('orders/{id}', [OrderController::class, 'show']);
    Route::put('orders/{id}', [OrderController::class, 'update']);
    Route::get('orders/user/{id}', [OrderController::class, 'byUser']);

    // ===== Users =====
    Route::apiResource('users', UserController::class);
    Route::post('users/{id}/lock', [UserController::class, 'lock']);
    Route::post('users/{id}/unlock', [UserController::class, 'unlock']);

    // ===== Posts =====
    Route::apiResource('posts', PostController::class);

    // ===== Contacts =====
    Route::apiResource('contacts', ContactController::class)->except(['create', 'edit']);
    Route::any('contacts/{id}', [ContactController::class, 'adminUpdate']);

    // ===== Brands =====
    Route::post('brands', [BrandController::class, 'store']);

    // ===== Reviews (Admin) =====
    Route::get('products/{id}/reviews', [ReviewController::class, 'index']);
    Route::post('products/{id}/reviews', [ReviewController::class, 'store']);

    // ===== Stock Movements (Admin) =====
    Route::get('stock-movements', [StockController::class, 'adminIndex']);
    Route::post('stock-movements', [StockController::class, 'store']);
    Route::get('stock/summary', [StockController::class, 'summary']);

    // ❌ BỎ AI TRONG ADMIN (đã chuyển ra PUBLIC)
    // Route::post('/ai/chat', [AIController::class, 'chat']);
});
