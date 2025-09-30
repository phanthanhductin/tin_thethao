<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'ptdt_category';

    // Cho phép gán hàng loạt
    protected $fillable = [
        'name',
        'slug',
        'image',
        'parent_id',
        'sort_order',
        'description',
        'status',
        'created_by',
        'updated_by',
    ];

    // Cast kiểu
    protected $casts = [
        'parent_id'  => 'integer',
        'sort_order' => 'integer',
        'status'     => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    // Giá trị mặc định
    protected $attributes = [
        'sort_order' => 0,
        'status'     => 1,
    ];

    // ✅ Tự sinh thuộc tính image_url khi toArray()/toJson()
    protected $appends = ['image_url'];

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }

    // ✅ Accessor chuẩn hóa URL ảnh cho mọi kiểu lưu trữ
    public function getImageUrlAttribute()
    {
        $img = $this->image;

        // Không có ảnh → dùng placeholder
        if (!$img) {
            return asset('assets/images/no-image.png');
        }

        // URL tuyệt đối
        if (str_starts_with($img, 'http://') || str_starts_with($img, 'https://')) {
            return $img;
        }

        // Bỏ '/' đầu nếu có
        $img = ltrim($img, '/');

        // Nếu đã là đường dẫn public hợp lệ
        if (
            str_starts_with($img, 'assets/') ||
            str_starts_with($img, 'storage/') ||
            str_starts_with($img, 'uploads/')
        ) {
            return asset($img);
        }

        // Mặc định: coi như tên file trong assets/images
        return asset('assets/images/' . $img);
    }
}
