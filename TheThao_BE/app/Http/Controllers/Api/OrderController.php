<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;                 // cần để trừ/hoàn tồn kho
use App\Models\StockMovement;          // ✅ THÊM: log lịch sử kho
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // ================== ĐẶT HÀNG (TRỪ TỒN KHO) ==================
    public function checkout(Request $request)
    {
        $data = $request->validate([
            'customer_name'   => 'required|string|max:100',
            'phone'           => 'required|string|max:20',
            'address'         => 'required|string|max:255',
            'email'           => 'required|email|max:255',
            'items'           => 'required|array|min:1',
            'items.*.id'      => 'required|integer',           // product_id
            'items.*.name'    => 'required|string',
            'items.*.price'   => 'required|numeric',
            'items.*.qty'     => 'required|integer|min:1',
        ]);

        // Bọc trong transaction để an toàn khi nhiều đơn cùng lúc
        return DB::transaction(function () use ($data) {

            // 1) Tạo đơn ở trạng thái pending
            $order = Order::create([
                'name'     => $data['customer_name'],
                'phone'    => $data['phone'],
                'email'    => $data['email'],
                'address'  => $data['address'],
                'user_id'  => Auth::id() ?? null,
                'status'   => 0,  // pending
                'note'     => null,
            ]);

            $total = 0;

            // 2) Duyệt từng item: khóa bản ghi sản phẩm, kiểm kho, TRỪ KHO, ghi chi tiết
            foreach ($data['items'] as $item) {
                $buyQty = (int) $item['qty'];

                // Khóa pessimistic để chống oversell
                $product = Product::lockForUpdate()->find($item['id']);
                if (!$product) {
                    throw new \Exception("Sản phẩm ID {$item['id']} không tồn tại");
                }

                $stock = (int) ($product->qty ?? 0);
                if ($stock < $buyQty) {
                    throw new \Exception("Sản phẩm '{$product->name}' chỉ còn {$stock}");
                }

                // Giá chốt cho đơn (dùng giá FE gửi)
                $price = (float) $item['price'];

                // 2.1 TRỪ KHO
                $product->decrement('qty', $buyQty);   // an toàn vì đã check tồn

                // ✅ LOG: xuất kho bán hàng
                StockMovement::create([
                    'product_id' => $product->id,
                    'type'       => 'export',
                    'qty_change' => -$buyQty,
                    'ref_type'   => 'order',
                    'ref_id'     => $order->id,
                    'note'       => 'Trừ kho khi đặt hàng',
                    'created_by' => Auth::id() ?? null,
                ]);

                // 2.2 Ghi chi tiết
                OrderDetail::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'price_buy'  => $price,
                    'qty'        => $buyQty,
                    'amount'     => $price * $buyQty,
                ]);

                $total += $price * $buyQty;
            }

            // 3) Cập nhật tổng tiền + note
            $order->update([
                'note'  => "Tổng đơn: {$total} đ",
            ]);

            return response()->json([
                'message'  => 'Đặt hàng thành công',
                'order_id' => $order->id,
                'total'    => $total,
            ], 201);
        });
    }

    public function index(Request $request)
    {
        $search  = trim((string) $request->query('search', ''));
        $perPage = max(1, min(100, (int) $request->query('per_page', 20)));
        $status  = $request->has('status') ? $request->integer('status') : null;

        $q = Order::query()
            ->withCount('details')
            ->withSum('details as computed_total', 'amount');

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

    public function show($id)
    {
        $order = Order::with(['details.product:id,name,thumbnail'])
            ->withSum('details as computed_total', 'amount')
            ->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $items = $order->details->map(function ($d) {
            $p   = $d->product;
            $img = $p?->thumbnail_url ?? $p?->thumbnail ?? null;

            return [
                'id'            => $d->id,
                'product_id'    => $d->product_id,
                'name'          => $p?->name ?? $d->product_name ?? 'Sản phẩm',
                'price'         => (float) $d->price_buy,
                'qty'           => (int) $d->qty,
                'thumbnail_url' => $img,
                'subtotal'      => (float) ($d->amount ?? $d->price_buy * $d->qty),
            ];
        })->values();

        $total = $items->sum(fn($it) => $it['price'] * $it['qty']);

        return response()->json([
            'id'         => $order->id,
            'code'       => (string) ($order->code ?? $order->id),
            'name'       => $order->name,
            'email'      => $order->email,
            'phone'      => $order->phone,
            'address'    => $order->address,
            'note'       => $order->note,
            'status'     => (int) ($order->status ?? 0),
            'total'      => $total,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'items'      => $items,
        ]);
    }

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

        if ($phone !== '') $q->where('phone', $phone);

        if ($code !== '') {
            if (ctype_digit($code)) {
                $q->where('id', (int) $code);
            } else {
                $table = (new Order)->getTable();
                if (Schema::hasColumn($table, 'code')) {
                    $q->where('code', $code);
                }
            }
        }

        $order = $q->latest('id')->first();
        if (!$order) return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);

        return $this->show($order->id);
    }

    public function mine(Request $request)
    {
        $userId = $request->user()->id ?? null;
        if (!$userId) return response()->json(['message' => 'Unauthenticated'], 401);

        $orders = Order::query()
            ->withSum('details as computed_total', 'amount')
            ->where('user_id', $userId)
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

    public function byUser($id)
    {
        $orders = Order::query()
            ->withSum('details as computed_total', 'amount')
            ->where('user_id', $id)
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

    // ================== CẬP NHẬT TRẠNG THÁI ==================
    public function update(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);

        $data = $request->validate(['status' => 'required']);

        $map = [
            'pending'   => 0,
            'confirmed' => 1,
            'ready'     => 2,
            'shipping'  => 3,
            'delivered' => 4,
            'canceled'  => 5,
        ];

        $statusValue = $data['status'];
        if (is_string($statusValue) && isset($map[$statusValue])) {
            $statusValue = $map[$statusValue];
        }

        if (!in_array($statusValue, [0,1,2,3,4,5])) {
            return response()->json(['message' => 'Trạng thái không hợp lệ'], 422);
        }

        $old = $order->status;
        $order->status = $statusValue;
        $order->updated_by = $request->user()->id ?? null;
        $order->save();

        $reverse = array_flip($map);

        return response()->json([
            'message' => 'Cập nhật trạng thái đơn hàng thành công',
            'data' => [
                'id' => $order->id,
                'status' => $reverse[$order->status] ?? $order->status,
                'old_status' => $reverse[$old] ?? $old,
            ],
        ]);
    }

    // ================== HỦY ĐƠN (HOÀN TỒN KHO) ==================
    public function cancel($id)
    {
        return DB::transaction(function () use ($id) {
            $order = Order::with('details')->lockForUpdate()->find($id);
            if (!$order) {
                return response()->json(['message' => 'Không tìm thấy đơn hàng'], 404);
            }

            // Nếu đã giao hoặc đã hủy thì không cho hủy lại
            if (in_array($order->status, [4, 5]) || in_array($order->status, ['delivered', 'canceled', 'cancelled'])) {
                return response()->json(['message' => 'Đơn hàng này không thể hủy.'], 400);
            }

            // ✅ HOÀN KHO: cộng lại số lượng đã trừ + LOG return
            foreach ($order->details as $d) {
                Product::where('id', $d->product_id)->increment('qty', $d->qty);

                StockMovement::create([
                    'product_id' => $d->product_id,
                    'type'       => 'return',
                    'qty_change' => (int)$d->qty,
                    'ref_type'   => 'order_cancel',
                    'ref_id'     => $order->id,
                    'note'       => 'Hoàn kho khi hủy đơn',
                    'created_by' => Auth::id() ?? null,
                ]);
            }

            $order->status = 5; // canceled
            $order->save();

            return response()->json([
                'message' => 'Đơn hàng đã được hủy và hoàn tồn kho!',
                'data' => $order
            ]);
        });
    }
}
