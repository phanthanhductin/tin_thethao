<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedTinyInteger('rating'); // 1..5
            $table->text('content')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('product_reviews');
    }
};
