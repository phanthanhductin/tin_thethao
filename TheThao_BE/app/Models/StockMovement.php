<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $table = 'stock_movements';
    protected $primaryKey = 'id';
    public $timestamps = false; // chỉ dùng created_at của DB

    protected $fillable = [
        'product_id',
        'type',
        'qty_change',
        'ref_type',
        'ref_id',
        'note',
        'created_by',
        'created_at',
    ];

    public function product()
    {
        return $this->belongsTo(\App\Models\Product::class, 'product_id');
    }
}
