<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

// Tùy project: đổi namespace nếu khác
use App\Models\Product;

class AIController extends Controller
{
    public function chat(Request $request)
    {
        $data = $request->validate([
            'prompt'      => 'required|string|max:4000',
            'history'     => 'nullable|array',
            'temperature' => 'nullable|numeric|min:0|max:2',
            // phân trang cho các intent liệt kê
            'page'        => 'nullable|integer|min:1',
            'per_page'    => 'nullable|integer|min:1|max:100',
        ]);

        // ---- config ----
        $shop = Config::get('services.shop', [
            'name'    => env('SHOP_NAME', 'SportShop'),
            'front'   => rtrim(env('SHOP_FRONTEND_URL', 'http://localhost:5173'), '/'),
            'address' => env('SHOP_ADDRESS', ''),
            'phone'   => env('SHOP_PHONE', ''),
        ]);
        $ollamaBase  = rtrim(Config::get('services.ollama.base_url', 'http://127.0.0.1:11434'), '/');
        $ollamaModel = Config::get('services.ollama.model', 'qwen2.5:1.5b-instruct');

        $prompt   = trim($data['prompt']);
        $intent   = $this->detectIntent($prompt);
        $page     = (int)($data['page'] ?? 1);
        $perPage  = (int)($data['per_page'] ?? 20);

        $structured = null;  // dữ liệu “thật” để trả về UI
        $catalogContext = ''; // text bơm vào LLM

        try {
            switch ($intent) {
                case 'list_all_products':
                    // Liệt kê có phân trang
                    $structured = $this->listProducts($page, $perPage, $shop['front'], $prompt);
                    $catalogContext = $this->formatProductsAsContext($structured['items']);
                    break;

                case 'stock_summary':
                    $structured = $this->stockSummary();
                    // bơm tóm tắt cho LLM
                    $catalogContext = "STOCK SUMMARY:\n".
                        "- total_products: {$structured['total_products']}\n".
                        "- total_qty: {$structured['total_qty']}\n".
                        "- low_stock_count: {$structured['low_stock_count']}\n";
                    break;

                case 'stock_by_keyword':
                    $structured = $this->searchStockByKeyword($prompt, $page, $perPage, $shop['front']);
                    $catalogContext = $this->formatProductsAsContext($structured['items']);
                    break;

                case 'low_stock':
                    $structured = $this->lowStock($page, $perPage, $shop['front']);
                    $catalogContext = $this->formatProductsAsContext($structured['items']);
                    break;

                default:
                    // Hỏi chung => cố gắng tìm vài sp liên quan làm ngữ cảnh
                    $structured = $this->searchStockByKeyword($prompt, 1, 8, $shop['front']);
                    $catalogContext = $this->formatProductsAsContext($structured['items']);
                    break;
            }
        } catch (\Throwable $e) {
            // nếu Eloquent lỗi → fallback HTTP
            try {
                switch ($intent) {
                    case 'list_all_products':
                        $structured = $this->listProductsViaHttp($page, $perPage, $shop['front']);
                        $catalogContext = $this->formatProductsAsContext($structured['items']);
                        break;
                    case 'stock_by_keyword':
                    default:
                        $structured = $this->searchViaHttp($prompt, $page, $perPage, $shop['front']);
                        $catalogContext = $this->formatProductsAsContext($structured['items']);
                        break;
                }
            } catch (\Throwable $e2) {
                // bỏ qua: để LLM vẫn trả lời chung được
                $structured = null;
            }
        }

        // ---- system prompt (shop + catalog) ----
        $system = $this->buildSystemPrompt($shop, $catalogContext);

        // ---- messages ----
        $messages = [['role' => 'system', 'content' => $system]];
        if (!empty($data['history'])) {
            foreach ($data['history'] as $m) {
                if (isset($m['role'], $m['content'])) {
                    $messages[] = ['role' => $m['role'], 'content' => (string)$m['content']];
                }
            }
        }
        $messages[] = ['role' => 'user', 'content' => $prompt];

        // ---- call Ollama ----
        $payload = [
            'model'    => $ollamaModel,
            'messages' => $messages,
            'stream'   => false,
            'options'  => [
                'temperature' => isset($data['temperature']) ? (float)$data['temperature'] : 0.7,
                'num_ctx'     => 1024,
            ],
        ];

        try {
            $res = Http::timeout(120)->post($ollamaBase.'/api/chat', $payload);
            if ($res->failed()) {
                return response()->json([
                    'ok' => false,
                    'error' => 'Ollama request failed',
                    'detail' => $res->json(),
                    'intent' => $intent,
                    'data' => $structured,
                ], 500);
            }
            $json   = $res->json();
            $answer = $json['message']['content'] ?? null;

            return response()->json([
                'ok'     => true,
                'answer' => $answer,
                'intent' => $intent,
                'data'   => $structured, // mảng sản phẩm/summary cho UI
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => 'Exception when calling Ollama',
                'detail' => $e->getMessage(),
                'intent' => $intent,
                'data' => $structured,
            ], 500);
        }
    }

    // -------------------- INTENT --------------------

    protected function detectIntent(string $prompt): string
    {
        $p = Str::lower($prompt);

        // “toàn bộ sản phẩm”, “tất cả sản phẩm”, “list sản phẩm”
        if (Str::contains($p, ['toàn bộ sản phẩm','tất cả sản phẩm','list sản phẩm','danh sách sản phẩm'])) {
            return 'list_all_products';
        }

        // tồn kho tổng, tổng tồn, còn bao nhiêu hàng, kho còn bao nhiêu
        if (Str::contains($p, ['tồn kho tổng','tổng tồn','tổng số lượng tồn','kho còn bao nhiêu','stock summary'])) {
            return 'stock_summary';
        }

        // sản phẩm sắp hết hàng, dưới X cái, low stock
        if (Str::contains($p, ['sắp hết hàng','low stock','gần hết','dưới 5 cái','dưới 10 cái'])) {
            return 'low_stock';
        }

        // hỏi tồn kho theo từ khóa/brand/id
        if (Str::contains($p, ['còn hàng','tồn kho','bao nhiêu còn','còn bao nhiêu','stock']) ||
            Str::contains($p, ['giày','áo','quần','nike','adidas','puma','new balance','bóng','sandal','dép'])) {
            return 'stock_by_keyword';
        }

        return 'general';
    }

    // -------------------- SYSTEM PROMPT --------------------

    protected function buildSystemPrompt(array $shop, string $catalogContext): string
    {
        $shopName = $shop['name'] ?? 'Shop';
        $front    = rtrim($shop['front'] ?? '', '/');
        $addr     = $shop['address'] ?? '';
        $phone    = $shop['phone'] ?? '';

        $rules = <<<TXT
Bạn là trợ lý bán hàng của "{$shopName}".
- Khi người dùng hỏi về shop, tự xưng đúng tên shop và có thể kèm địa chỉ/điện thoại.
- Khi người dùng hỏi sản phẩm hoặc tồn kho, dựa trên CATALOG/ dữ liệu đi kèm. Nếu kết quả dài, hiển thị gọn theo trang (page/per_page).
- Luôn kèm link chi tiết sản phẩm dạng {$front}/products/{id} khi gợi ý.

Thông tin shop:
- Tên: {$shopName}
- Website: {$front}
- Địa chỉ: {$addr}
- Điện thoại: {$phone}

TXT;

        if ($catalogContext) {
            $rules .= "\nCATALOG:\n".$catalogContext."\n";
        }

        return $rules;
    }

    // -------------------- DATA HELPERS (Eloquent) --------------------

    protected function listProducts(int $page, int $perPage, string $frontUrl, string $hint = ''): array
    {
        $query = Product::query()
            ->select(['id','name','slug','qty','price','price_root','price_sale'])
            ->orderBy('id','asc');

        // nếu người dùng gõ “tất cả” nhưng có thêm từ khóa, lọc mềm
        if ($hint) {
            $q = trim($hint);
            $query->where(function($x) use ($q) {
                $x->where('name','like','%'.$q.'%')
                  ->orWhere('slug','like','%'.$q.'%');
            });
        }

        $total = (clone $query)->count();
        $items = $query->forPage($page, $perPage)->get();

        return [
            'page'     => $page,
            'per_page' => $perPage,
            'total'    => $total,
            'items'    => $this->mapProducts($items, $frontUrl),
        ];
    }

    protected function stockSummary(): array
    {
        $totalProducts = Product::query()->count();
        $totalQty      = (int) Product::query()->sum('qty');
        $lowStockCount = (int) Product::query()->where('qty','<',5)->count(); // ngưỡng 5, có thể đổi

        return [
            'total_products'  => $totalProducts,
            'total_qty'       => $totalQty,
            'low_stock_count' => $lowStockCount,
        ];
    }

    protected function searchStockByKeyword(string $prompt, int $page, int $perPage, string $frontUrl): array
    {
        $q = trim($prompt);
        $query = Product::query()->select(['id','name','slug','qty','price','price_root','price_sale']);

        // parse số lượng ngưỡng (ví dụ “dưới 5 cái”)
        $threshold = $this->extractThreshold($q);
        if ($threshold !== null) {
            $query->where('qty','<', $threshold);
        }

        // lọc theo tên/slug
        $query->where(function($x) use ($q) {
            $x->where('name','like','%'.$q.'%')
              ->orWhere('slug','like','%'.$q.'%');
        });

        $total = (clone $query)->count();
        $items = $query->orderByDesc('id')->forPage($page, $perPage)->get();

        return [
            'page'     => $page,
            'per_page' => $perPage,
            'total'    => $total,
            'items'    => $this->mapProducts($items, $frontUrl),
        ];
    }

    protected function lowStock(int $page, int $perPage, string $frontUrl): array
    {
        $query = Product::query()
            ->select(['id','name','slug','qty','price','price_root','price_sale'])
            ->where('qty','<',5)
            ->orderBy('qty','asc');

        $total = (clone $query)->count();
        $items = $query->forPage($page, $perPage)->get();

        return [
            'page'     => $page,
            'per_page' => $perPage,
            'total'    => $total,
            'items'    => $this->mapProducts($items, $frontUrl),
        ];
    }

    protected function mapProducts($collection, string $frontUrl): array
    {
        $out = [];
        foreach ($collection as $p) {
            $id    = (int)$p->id;
            $name  = (string)($p->name ?? 'Sản phẩm');
            $price = $this->pickPrice($p);
            $qty   = (int)($p->qty ?? 0);
            $link  = rtrim($frontUrl,'/').'/products/'.$id; // đổi nếu bạn dùng slug
            $out[] = [
                'id'    => $id,
                'name'  => $name,
                'price' => $price,
                'qty'   => $qty,
                'link'  => $link,
            ];
        }
        return $out;
    }

    // -------------------- HTTP Fallback (nếu Model lỗi) --------------------

    protected function listProductsViaHttp(int $page, int $perPage, string $frontUrl): array
    {
        $baseApi = rtrim(config('app.url') ?? url('/'), '/');
        $resp = Http::timeout(15)->get($baseApi.'/api/products', ['page'=>$page]);
        if ($resp->failed()) throw new \RuntimeException('HTTP /api/products failed');

        $json = $resp->json();
        $list = $json['data'] ?? $json['items'] ?? $json ?? [];
        $total= $json['total'] ?? count($list);

        $items = array_slice($list, 0, $perPage);
        $mapped = [];
        foreach ($items as $p) {
            $id    = $p['id'] ?? null;
            if (!$id) continue;
            $name  = $p['name'] ?? $p['title'] ?? ('SP #'.$id);
            $priceVal = $p['price'] ?? $p['price_sale'] ?? $p['price_root'] ?? 0;
            $price = number_format((float)$priceVal, 0, ',', '.').'đ';
            $qty   = (int)($p['qty'] ?? $p['stock'] ?? 0);
            $link  = rtrim($frontUrl,'/').'/products/'.$id;
            $mapped[] = compact('id','name','price','qty','link');
        }

        return ['page'=>$page,'per_page'=>$perPage,'total'=>$total,'items'=>$mapped];
    }

    protected function searchViaHttp(string $prompt, int $page, int $perPage, string $frontUrl): array
    {
        $baseApi = rtrim(config('app.url') ?? url('/'), '/');
        $resp = Http::timeout(15)->get($baseApi.'/api/products', ['page'=>1 /*,'q'=>$prompt*/]);
        if ($resp->failed()) throw new \RuntimeException('HTTP /api/products failed');

        $json = $resp->json();
        $list = $json['data'] ?? $json['items'] ?? $json ?? [];

        // lọc mềm phía client
        $q = Str::lower($prompt);
        $filtered = array_values(array_filter($list, function($p) use ($q) {
            $name = Str::lower(($p['name'] ?? $p['title'] ?? ''));
            $slug = Str::lower(($p['slug'] ?? ''));
            return Str::contains($name, $q) || Str::contains($slug, $q);
        }));

        $total = count($filtered);
        $paged = array_slice($filtered, ($page-1)*$perPage, $perPage);

        $mapped = [];
        foreach ($paged as $p) {
            $id    = $p['id'] ?? null;
            if (!$id) continue;
            $name  = $p['name'] ?? $p['title'] ?? ('SP #'.$id);
            $priceVal = $p['price'] ?? $p['price_sale'] ?? $p['price_root'] ?? 0;
            $price = number_format((float)$priceVal, 0, ',', '.').'đ';
            $qty   = (int)($p['qty'] ?? $p['stock'] ?? 0);
            $link  = rtrim($frontUrl,'/').'/products/'.$id;
            $mapped[] = compact('id','name','price','qty','link');
        }

        return ['page'=>$page,'per_page'=>$perPage,'total'=>$total,'items'=>$mapped];
    }

    // -------------------- Utils --------------------

    protected function pickPrice($p): string
    {
        $val = $p->price_sale ?? $p->price ?? $p->price_root ?? 0;
        return number_format((float)$val, 0, ',', '.').'đ';
    }

    protected function extractThreshold(string $text): ?int
    {
        // bắt “dưới 5”, “<5”, “<=10”
        $t = Str::lower($text);
        if (preg_match('/dưới\s*(\d+)/u', $t, $m)) return (int)$m[1];
        if (preg_match('/<=\s*(\d+)/', $t, $m)) return (int)$m[1];
        if (preg_match('/<\s*(\d+)/', $t, $m)) return (int)$m[1];
        return null;
    }

    protected function formatProductsAsContext(array $items): string
    {
        if (empty($items)) return '';
        $lines = array_map(function($p) {
            return "- id: {$p['id']}; name: {$p['name']}; price: {$p['price']}; qty: {$p['qty']}; link: {$p['link']}";
        }, $items);
        return implode("\n", $lines);
    }
}
