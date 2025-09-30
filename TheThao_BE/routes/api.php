<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UserController;


// ===== Auth =====
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth:sanctum');

// ===== Products (public) =====
Route::get('/products',      [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// ===== Categories (public) =====
Route::get('/categories',              [CategoryController::class, 'index']);
Route::get('/categories/{id}',         [CategoryController::class, 'show']);
Route::get('/categories/{id}/products',[ProductController::class, 'byCategory']);

// ===== Orders (checkout) =====
Route::post('/checkout', [OrderController::class, 'checkout'])->middleware('auth:sanctum');

// ===== Admin (/api/admin/...) =====
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    // Categories
    Route::get   ('/categories',       [CategoryController::class, 'index']);
    Route::post  ('/categories',       [CategoryController::class, 'store']);
    Route::put   ('/categories/{id}',  [CategoryController::class, 'update']);
    Route::delete('/categories/{id}',  [CategoryController::class, 'destroy']);

    // Products
    Route::get('/products',      [ProductController::class, 'adminIndex']);
    Route::get('/products/{id}', [ProductController::class, 'adminShow']);
    Route::post('/products',     [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Orders
    Route::get('/orders',        [OrderController::class, 'adminIndex']);
    Route::get('/orders/{id}',   [OrderController::class, 'show']); // dùng {id}

    // ===== Users (Admin quản lý user) =====
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/lock', [UserController::class, 'lock']);
    Route::post('/users/{id}/unlock', [UserController::class, 'unlock']);
});
});
