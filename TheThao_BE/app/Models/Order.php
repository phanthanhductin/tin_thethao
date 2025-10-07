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
        // thông tin chung
        'user_id',
        'name',
        'phone',
        'email',
        'address',
        'note',
        'status',
        'created_by',
        'updated_by',

        // nếu DB có cột này thì giữ; nếu không có thì xóa 'total' khỏi đây
        'total',

        // thanh toán
        'payment_method',   // 'momo','cod','vnpay',...
        'payment_status',   // 'pending','paid','failed','canceled'
        'payment_ref',      // transId từ MoMo
        'payment_amount',   // số tiền thanh toán
        'payment_at',       // thời điểm thanh toán thành công
    ];

    protected $casts = [
        'user_id'        => 'integer',
        'status'         => 'integer',
        'total'          => 'integer',
        'payment_amount' => 'integer',
        'payment_at'     => 'datetime',
    ];

    public function details()
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }

    // alias để FE dùng 'items'
    public function items()
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }
    public function payments() { return $this->hasMany(\App\Models\Payment::class, 'order_id'); }
public function payment()  { return $this->hasOne(\App\Models\Payment::class, 'order_id')->latestOfMany(); }

}
