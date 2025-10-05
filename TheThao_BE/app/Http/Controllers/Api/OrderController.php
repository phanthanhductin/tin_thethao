<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


class OrderController extends Controller
{
    
    public function checkout(Request $request)
    {
        $data = $request->validate([
            'customer_name'   => 'required|string|max:100',
            'phone'           => 'required|string|max:20',
            'address'         => 'required|string|max:255',
            'email'           => 'required|email|max:255',
            'items'           => 'required|array|min:1',
            'items.*.id'      => 'required|integer',
            'items.*.name'    => 'required|string',
            'items.*.price'   => 'required|numeric',
            'items.*.qty'     => 'required|integer|min:1',
        ]);

        $total = collect($data['items'])->sum(fn($i) => $i['price'] * $i['qty']);

        $order = Order::create([
            'name'     => $data['customer_name'],
            'phone'    => $data['phone'],
            'email'    => $data['email'],
            'address'  => $data['address'],
            'user_id'  => Auth::id() ?? null,
            'status'   => 0,  // pending
            'note'     => "Tổng đơn: {$total} đ",
        ]);

        foreach ($data['items'] as $item) {
            OrderDetail::create([
                'order_id'   => $order->id,
                'product_id' => $item['id'],
                'price_buy'  => $item['price'],
                'qty'        => $item['qty'],
                'amount'     => $item['price'] * $item['qty'],
            ]);
        }

        return response()->json([
            'message'  => 'Đặt hàng thành công',
            'order_id' => $order->id,
            'total'    => $total,
        ]);
    }

    public function index(Request $request)
    {
        $search  = trim((string) $request->query('search', ''));
        $perPage = max(1, min(100, (int) $request->query('per_page', 20)));
        $status  = $request->has('status') ? $request->integer('status') : null;

        $q = Order::query()
            ->withCount('details')
            ->withSum('details as computed_total', 'amount'); // tránh đụng cột total

        if (!is_null($status)) {
            $q->where('status', $status);
        }

        if ($search !== '') {
            $q->where(function ($qq) use ($search) {
                $qq->where('name', 'like', "%{$search}%")
                   ->orWhere('phone', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%")
                   ->orWhere('id', $search);
            });
        }

        $orders = $q->latest('id')->paginate($perPage);

        // Chuẩn hoá field total cho FE (giữ tên 'total')
        $orders->getCollection()->transform(function ($o) {
            $o->total = (float) ($o->total ?? $o->computed_total ?? 0);
            return $o;
        });

        return response()->json($orders);
    }

    // /api/admin/orders
    public function adminIndex(Request $request)
    {
        return $this->index($request);
    }

    // ✅ Dùng id thô, không model binding
    public function show($id)
    {
        $order = Order::with(['details.product:id,thumbnail,name'])
            ->withSum('details as computed_total', 'amount')
            ->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json([
            'id'         => $order->id,
            'name'       => $order->name,
            'email'      => $order->email,
            'phone'      => $order->phone,
            'address'    => $order->address,
            'note'       => $order->note,
            'status'     => (int)($order->status ?? 0),
            'total'      => (float)($order->total ?? $order->computed_total ?? 0),
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'items'      => $order->details->map(function ($d) {
                $p   = $d->product; // có thể null nếu SP bị xóa
                $img = $p?->thumbnail_url ?? $p?->thumbnail;
                return [
                    'id'            => $d->id,
                    'product_id'    => $d->product_id,
                    'product_name'  => $p?->name ?? 'Sản phẩm',
                    'product_image' => $img,
                    'price'         => (float)$d->price_buy,
                    'qty'           => (int)$d->qty,
                    'subtotal'      => (float)($d->amount ?? $d->price_buy * $d->qty),
                ];
            })->values(),
        ]);
    }

    // 🌟 PUBLIC: /api/orders/track?code=...&phone=...
    public function track(Request $request)
    {
        $code  = trim((string) $request->query('code', ''));
        $phone = trim((string) $request->query('phone', ''));

        if ($code === '' && $phone === '') {
            return response()->json(['message' => 'Thiếu code hoặc phone'], 422);
        }

        $q = Order::query()
            ->with(['details.product:id,thumbnail,name'])
            ->withSum('details as computed_total', 'amount');

        if ($phone !== '') {
            $q->where('phone', $phone);
        }

        if ($code !== '') {
            if (ctype_digit($code)) {
                // code là số → hiểu là id
                $q->where('id', (int) $code);
            } else {
                // nếu có cột 'code' thì tìm theo 'code'
                $table = (new Order)->getTable();
                if (Schema::hasColumn($table, 'code')) {
                    $q->where('code', $code);
                }
            }
        }

        $order = $q->latest('id')->first();
        if (!$order) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
        }

        // Trả về cùng format với show()
        return $this->show($order->id);
    }

    /* =========================
     * ✅ THÊM MỚI CHO FE: đơn của user đang đăng nhập
     * ========================= */

    // GET /api/orders/mine  (auth:sanctum)
    public function mine(Request $request)
    {
        $userId = $request->user()->id ?? null;
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $orders = Order::query()
            ->withSum('details as computed_total', 'amount')
            ->where('user_id', $userId)               // đổi thành customer_id nếu DB của bạn dùng cột đó
            ->latest('id')
            ->get();

        $data = $orders->map(function ($o) {
            return [
                'id'             => $o->id,
                'code'           => (string)($o->code ?? $o->id),
                'name'           => $o->name,
                'email'          => $o->email,
                'phone'          => $o->phone,
                'address'        => $o->address,
                'status'         => (int)($o->status ?? 0),
                'payment_status' => $o->payment_status ?? null,
                'payment_method' => $o->payment_method ?? null,
                'total'          => (float)($o->total ?? $o->computed_total ?? 0),
                'created_at'     => $o->created_at,
                'updated_at'     => $o->updated_at,
                'user_id'        => $o->user_id,
            ];
        })->values();

        return response()->json(['data' => $data]);
    }

    // (tuỳ chọn cho admin) GET /api/admin/orders/user/{id}
    public function byUser($id)
    {
        $orders = Order::query()
            ->withSum('details as computed_total', 'amount')
            ->where('user_id', $id)                    // đổi thành customer_id nếu cần
            ->latest('id')
            ->get();

        $data = $orders->map(function ($o) {
            return [
                'id'             => $o->id,
                'code'           => (string)($o->code ?? $o->id),
                'name'           => $o->name,
                'email'          => $o->email,
                'phone'          => $o->phone,
                'address'        => $o->address,
                'status'         => (int)($o->status ?? 0),
                'payment_status' => $o->payment_status ?? null,
                'payment_method' => $o->payment_method ?? null,
                'total'          => (float)($o->total ?? $o->computed_total ?? 0),
                'created_at'     => $o->created_at,
                'updated_at'     => $o->updated_at,
                'user_id'        => $o->user_id,
            ];
        })->values();

        return response()->json(['data' => $data]);
    }
}
