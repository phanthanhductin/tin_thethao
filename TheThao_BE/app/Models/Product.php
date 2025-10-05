<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'ptdt_product';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'category_id','brand_id','name','slug','price_root','price_sale',
        'thumbnail','qty','detail','description','status',
    ];

    protected $casts = [
        'price_root' => 'float',
        'price_sale' => 'float',
    ];
    public function variants(){
    return $this->hasMany(\App\Models\ProductVariant::class, 'product_id');
}

public function category() {
    return $this->belongsTo(Category::class, 'category_id');
}
    // ✅ Thuộc tính ảo để FE dùng trực tiếp
    protected $appends = ['thumbnail_url','brand_name'];

    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function getBrandNameAttribute()
    {
        return optional($this->brand)->name; // "Nike", "Levis", ...
    }

    public function getThumbnailUrlAttribute()
    {
        if (!$this->thumbnail) return asset('assets/images/no-image.png');

        $path = ltrim($this->thumbnail, '/');
        if (str_starts_with($path, 'http'))     return $path;
        if (str_starts_with($path, 'assets/'))  return asset($path);
        return asset('assets/images/' . $path);
    }
}
