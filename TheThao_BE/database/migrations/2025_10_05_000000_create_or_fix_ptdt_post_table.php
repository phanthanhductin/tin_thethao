<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('ptdt_post')) {
            Schema::create('ptdt_post', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('title', 255);
                $table->string('slug', 255)->unique();
                $table->string('image_url', 512)->nullable();
                $table->string('summary', 512)->nullable();
                $table->longText('content')->nullable();
                $table->unsignedBigInteger('category_id')->nullable()->index();
                $table->tinyInteger('status')->default(1)->index(); // 1=public, 0=draft
                $table->timestamps();
            });
        } else {
            Schema::table('ptdt_post', function (Blueprint $table) {
                if (!Schema::hasColumn('ptdt_post','title'))       $table->string('title',255)->nullable();
                if (!Schema::hasColumn('ptdt_post','slug'))        $table->string('slug',255)->nullable()->unique();
                if (!Schema::hasColumn('ptdt_post','image_url'))   $table->string('image_url',512)->nullable();
                if (!Schema::hasColumn('ptdt_post','summary'))     $table->string('summary',512)->nullable();
                if (!Schema::hasColumn('ptdt_post','content'))     $table->longText('content')->nullable();
                if (!Schema::hasColumn('ptdt_post','category_id')) $table->unsignedBigInteger('category_id')->nullable()->index();
                if (!Schema::hasColumn('ptdt_post','status'))      $table->tinyInteger('status')->default(1)->index();
                if (!Schema::hasColumn('ptdt_post','created_at'))  $table->timestamp('created_at')->nullable()->index();
                if (!Schema::hasColumn('ptdt_post','updated_at'))  $table->timestamp('updated_at')->nullable()->index();
            });
        }
    }

    public function down(): void
    {
        // Không drop để tránh mất dữ liệu
        // Schema::dropIfExists('ptdt_post');
    }
};
