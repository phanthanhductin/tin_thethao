<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StockController extends Controller
{
    /**
     * GET /api/admin/stock-movements  (và /api/stock-movements nếu mở public)
     * Hỗ trợ lọc:
     *  - q: keyword theo tên SP hoặc ID
     *  - product_id
     *  - type: import|export|return|adjust
     *  - from, to: YYYY-MM-DD
     *  - per_page: default 20
     */
    public function index(Request $request)
    {
        $kw        = trim((string) $request->query('q', ''));
        $productId = $request->query('product_id');
        $type      = $request->query('type');
        $from      = $request->query('from');
        $to        = $request->query('to');
        $perPage   = max(1, min(200, (int) $request->query('per_page', 20)));

        $q = StockMovement::query()
            ->with(['product:id,name,qty'])
            ->orderByDesc('id');

        if ($productId) $q->where('product_id', (int)$productId);
        if ($type && in_array($type, ['import','export','return','adjust'], true)) {
            $q->where('type', $type);
        }
        if ($kw !== '') {
            $q->where(function ($w) use ($kw) {
                if (ctype_digit($kw)) $w->orWhere('product_id', (int)$kw);
                $w->orWhereHas('product', fn($p) => $p->where('name','like',"%{$kw}%"));
            });
        }
        if ($from) $q->whereDate('created_at', '>=', $from);
        if ($to)   $q->whereDate('created_at', '<=', $to);

        return response()->json($q->paginate($perPage));
    }

    /** Map adminIndex -> index */
    public function adminIndex(Request $request)
    {
        return $this->index($request);
    }

    /**
     * POST /api/admin/stock-movements
     * Body:
     *  - product_id (required)
     *  - type: import|export|return|adjust (required)
     *  - qty: number > 0 (dùng cho import/export/return)
     *  - qty_change: number != 0 (dùng cho adjust, có thể âm/dương)
     *  - note: optional
     */
    public function store(Request $request)
    {
        $productTable = (new Product)->getTable();

        $base = $request->validate([
            'product_id' => ['required','integer', Rule::exists($productTable, 'id')],
            'type'       => ['required', Rule::in(['import','export','return','adjust'])],
            'note'       => ['nullable','string','max:255'],
        ]);

        $type = $base['type'];
        if ($type === 'adjust') {
            $more = $request->validate([
                'qty_change' => ['required','integer','not_in:0'],
            ]);
            $qtyChange = (int)$more['qty_change']; // có thể âm/dương
        } else {
            $more = $request->validate([
                'qty' => ['required','integer','min:1'],
            ]);
            $qtyChange = (int)$more['qty'];
            if ($type === 'export') $qtyChange = -$qtyChange; // xuất là số âm
        }

        $note = $request->input('note');

        $movement = DB::transaction(function () use ($base, $qtyChange, $note, $type) {
            $product = Product::lockForUpdate()->find($base['product_id']);
            if (!$product) abort(404, 'Sản phẩm không tồn tại');

            $current = (int)($product->qty ?? 0);
            $after   = $current + $qtyChange;
            if ($after < 0) abort(422, "Không đủ tồn kho. Hiện còn {$current}.");

            // cập nhật tồn
            if ($qtyChange >= 0) $product->increment('qty',  $qtyChange);
            else                 $product->decrement('qty', -$qtyChange);

            return StockMovement::create([
                'product_id' => $product->id,
                'type'       => $type,
                'qty_change' => $qtyChange,
                'ref_type'   => 'manual',
                'ref_id'     => null,
                'note'       => $note,
                'created_by' => Auth::id() ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Thao tác kho thành công',
            'data'    => $movement->load('product:id,name,qty'),
        ], 201);
    }

    /**
     * GET /api/admin/stock/summary?product_ids=1,2,3
     * Trả về { data: { "1": 30, "2": 11, ... } }
     * -> FE dùng để hiển thị cột "Tồn kho (DB)"
     */
    public function summary(Request $request)
    {
        $ids = collect(explode(',', (string) $request->query('product_ids', '')))
            ->filter(fn($x) => is_numeric($x))
            ->map(fn($x) => (int) $x)
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return response()->json(['data' => []]);
        }

        // Lấy số tồn hiện tại trực tiếp từ bảng sản phẩm
        $pairs = Product::whereIn('id', $ids)->pluck('qty', 'id');

        $out = [];
        foreach ($ids as $id) {
            $out[$id] = (int) ($pairs[$id] ?? 0);
        }

        return response()->json(['data' => $out]);
    }
}
