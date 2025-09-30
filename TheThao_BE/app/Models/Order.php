<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'ptdt_order';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'email',
        'address',
        'note',
        'status',
        'updated_by',
        'total',
        'payment_method',
        'created_by',
    ];

    public function details()
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }

    // Alias để FE dùng 'items'
    public function items()
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }

    // ⚠️ Bạn đang có method show() trong Model — không dùng tới.
    // Để hạn chế đụng chạm, mình để nguyên. (An toàn vì không được gọi qua route.)
}
