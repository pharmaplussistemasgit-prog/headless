<?php
/**
 * Plugin Name: Custom API for Woo (V3.4 Con Fechas Oferta)
 * Description: API REST personalizada V3.4. Soporte para date_on_sale_from/to.
 * Version:     3.4.0
 * Author:      ClickLab / Antigravity
 */

if (!defined('ABSPATH'))
    exit;

/* ============================================================================
 * 0) Utilidades de seguridad (CORS, Rate Limit, Auth+Permisos)
 * ==========================================================================*/

// CORS (sólo para rutas de este plugin)
add_action('rest_api_init', function () {
    add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {
        $route = $request->get_route();
        if (strpos($route, '/custom-api/v1/') === 0) {
            $origin = get_option('home');
            $allowed = defined('CUSTOM_API_CORS_ORIGIN') ? CUSTOM_API_CORS_ORIGIN : $origin;
            header('Access-Control-Allow-Origin: ' . esc_url_raw($allowed));
            header('Access-Control-Allow-Headers: Content-Type, X-API-KEY');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
        }
        return $served;
    }, 10, 4);
});

// Rate limit simple por key/IP
function cmu_rate_limited($bucket = 'default', $limit = 300, $window = 60)
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $key = isset($_SERVER['HTTP_X_API_KEY']) ? substr(hash('sha256', $_SERVER['HTTP_X_API_KEY']), 0, 12) : 'anon';
    $k = "cmu_rl_{$bucket}_{$key}_{$ip}";
    $c = (int) get_transient($k);
    if ($c >= $limit)
        return true;
    set_transient($k, $c + 1, $window);
    return false;
}

// Validación de URL de media
function cmu_validate_media_url($url)
{
    if (!is_string($url))
        return false;
    $url = trim($url);
    if ($url === '')
        return true;
    $ok = filter_var($url, FILTER_VALIDATE_URL);
    if (!$ok)
        return false;
    $scheme = wp_parse_url($url, PHP_URL_SCHEME);
    return in_array($scheme, ['https', 'http'], true);
}

// AUTH reforzada + capability opcional
function cmu_auth(WP_REST_Request $request)
{
    if (!defined('CUSTOM_API_KEY'))
        return false;
    $key = $request->get_header('X-API-KEY');
    if (!$key || !hash_equals(CUSTOM_API_KEY, $key))
        return false;
    $bucket = substr(md5($request->get_route()), 0, 8);
    if (cmu_rate_limited($bucket, 300, 60)) {
        return new WP_Error('rate_limited', 'Too Many Requests', ['status' => 429]);
    }
    return true;
}
function cmu_permission(WP_REST_Request $request)
{
    $auth = cmu_auth($request);
    if ($auth !== true)
        return $auth;
    // Defensa adicional si hay sesión (no requerido para API key)
    if (is_user_logged_in() && !current_user_can('manage_woocommerce')) {
        return new WP_Error('forbidden', 'Insufficient permissions', ['status' => 403]);
    }
    return true;
}

/* ============================================================================
 * 1) Helpers de imágenes con límites (HEAD, tamaño, mime) + cache por URL
 * ==========================================================================*/
function cmu_set_image_from_url_cached($url)
{
    if (!$url || !cmu_validate_media_url($url))
        return 0;

    // ¿Adjunto ya creado desde esta URL?
    $existing = get_posts([
        'post_type' => 'attachment',
        'meta_key' => '_source_url',
        'meta_value' => $url,
        'numberposts' => 1,
        'fields' => 'ids',
    ]);
    if (!empty($existing))
        return (int) $existing[0];

    // HEAD (10s) para validar tamaño y tipo si el server lo permite
    add_filter('http_request_timeout', fn() => 10);
    $head = wp_remote_head($url, ['timeout' => 10, 'redirection' => 2, 'sslverify' => true]);
    if (!is_wp_error($head)) {
        $len = (int) wp_remote_retrieve_header($head, 'content-length');
        $type = wp_remote_retrieve_header($head, 'content-type');
        if ($len && $len > 5 * 1024 * 1024)
            return 0; // >5MB
        if ($type && strpos($type, 'image/') !== 0)
            return 0;
    }

    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    $tmp = download_url($url, 10);
    if (is_wp_error($tmp))
        return 0;

    $mime = function_exists('mime_content_type') ? mime_content_type($tmp) : 'image/jpeg';
    if (strpos((string) $mime, 'image/') !== 0) {
        @unlink($tmp);
        return 0;
    }

    $file = [
        'name' => wp_basename(parse_url($url, PHP_URL_PATH)),
        'type' => $mime,
        'tmp_name' => $tmp,
        'error' => 0,
        'size' => filesize($tmp),
    ];

    $id = media_handle_sideload($file, 0);
    if (is_wp_error($id)) {
        @unlink($tmp);
        return 0;
    }

    update_post_meta($id, '_source_url', esc_url_raw($url));
    return (int) $id;
}

/* ============================================================================
 * 2) Helpers de términos (Woo/Jet) + resolver IDs desde SKUs
 * ==========================================================================*/
function cmu_valid_term_ids($names, $taxonomy)
{
    if (!is_array($names))
        return [];
    return array_filter(array_map(function ($name) use ($taxonomy) {
        $name = trim(wp_strip_all_tags($name));
        if ($name === '')
            return null;
        $slug = sanitize_title($name);
        $term = get_term_by('slug', $slug, $taxonomy);
        if ($term)
            return (int) $term->term_id;
        $created = wp_insert_term($name, $taxonomy);
        return is_wp_error($created) ? null : (int) $created['term_id'];
    }, $names));
}

function cmu_resolve_product_ids($list, $prefer = 'sku')
{
    if (!is_array($list))
        return [];
    $out = [];
    foreach ($list as $val) {
        if (is_int($val)) {
            $pid = (int) $val;
            if ($pid > 0 && wc_get_product($pid)) {
                $out[] = $pid;
            }
            continue;
        }
        $s = trim((string) $val);
        if ($s === '')
            continue;

        $pid = 0;
        if ($prefer === 'sku') {
            $pid = wc_get_product_id_by_sku($s);
            if (!$pid && ctype_digit($s)) {
                $as_id = (int) $s;
                if ($as_id > 0 && wc_get_product($as_id))
                    $pid = $as_id;
            }
        } else {
            if (ctype_digit($s)) {
                $as_id = (int) $s;
                if ($as_id > 0 && wc_get_product($as_id))
                    $pid = $as_id;
                if (!$pid)
                    $pid = wc_get_product_id_by_sku($s);
            } else {
                $pid = wc_get_product_id_by_sku($s);
            }
        }
        if ($pid)
            $out[] = (int) $pid;
    }
    return array_values(array_unique($out));
}

/* ============================================================================
 * 3) JetEngine metacampos: whitelist + tipado
 * ==========================================================================*/
function cmu_jet_whitelist()
{
    return [
        'jet_rating' => 'number',
        'jet_is_new' => 'bool',
        'jet_supplier_code' => 'text',
        'jet_specs' => 'array',
    ];
}
function cmu_apply_meta_whitelist($post_id, $meta_arr)
{
    if (!is_array($meta_arr))
        return;
    $map = cmu_jet_whitelist();
    foreach ($meta_arr as $k => $v) {
        if (!isset($map[$k]))
            continue;
        switch ($map[$k]) {
            case 'number':
                $v = is_numeric($v) ? 0 + $v : null;
                break;
            case 'bool':
                $v = (bool) $v ? 1 : 0;
                break;
            case 'array':
                $v = wp_json_encode($v, JSON_UNESCAPED_UNICODE);
                break;
            default:
                $v = is_scalar($v) ? wp_unslash($v) : wp_json_encode($v);
        }
        if ($v === null) {
            delete_post_meta($post_id, $k);
        } else {
            update_post_meta($post_id, $k, $v);
        }
    }
}

/* ============================================================================
 * 4) CORE: Upsert de producto simple por SKU
 *    [UPDATED V3.4] Added support for date_on_sale_from / date_on_sale_to
 * ==========================================================================*/
function cmu_upsert_simple_product(array $data)
{
    if (!class_exists('WC_Product_Simple')) {
        return new WP_Error('woocommerce_missing', 'WooCommerce requerido', ['status' => 500]);
    }

    $existing_id = 0;
    if (!empty($data['sku']))
        $existing_id = wc_get_product_id_by_sku($data['sku']);

    $product = $existing_id ? wc_get_product($existing_id) : new WC_Product_Simple();
    if (!$product)
        $product = new WC_Product_Simple();

    // Básicos
    if (!$existing_id && !empty($data['sku']))
        $product->set_sku(sanitize_text_field($data['sku']));
    if (!empty($data['title']))
        $product->set_name($data['title']);
    if (array_key_exists('description', $data))
        $product->set_description($data['description'] ?? '');
    if (array_key_exists('short_description', $data))
        $product->set_short_description($data['short_description'] ?? '');

    // Precios
    if (isset($data['regular_price']) || isset($data['price'])) {
        $product->set_regular_price((string) ($data['regular_price'] ?? $data['price']));
    }
    if (array_key_exists('sale_price', $data)) {
        $sp = $data['sale_price'];
        $product->set_sale_price($sp === '' || $sp === null ? '' : (string) $sp);
    }

    // [NUEVO V3.4] Fechas de oferta (programación)
    if (array_key_exists('date_on_sale_from', $data)) {
        $from = $data['date_on_sale_from'];
        $product->set_date_on_sale_from($from === '' || $from === null ? '' : $from);
    }
    if (array_key_exists('date_on_sale_to', $data)) {
        $to = $data['date_on_sale_to'];
        $product->set_date_on_sale_to($to === '' || $to === null ? '' : $to);
    }

    // Estado de publicación
    if (!empty($data['status']))
        $product->set_status($data['status']);
    if (!$existing_id && empty($data['status']))
        $product->set_status('publish');

    // ============ INVENTARIO (DEFINIDO Y GUARDADO ANTES DEL SAVE) ============
    $has_qty = array_key_exists('stock_quantity', $data) && $data['stock_quantity'] !== '' && $data['stock_quantity'] !== null;
    $qty = $has_qty ? max(0, (int) $data['stock_quantity']) : null;
    $manage = array_key_exists('manage_stock', $data) ? (bool) $data['manage_stock'] : null;

    if ($manage === true) {
        $product->set_manage_stock(true);
        if ($has_qty) {
            $product->set_stock_quantity($qty);
            if (!array_key_exists('stock_status', $data)) {
                $product->set_stock_status($qty > 0 ? 'instock' : 'outofstock');
            }
        }
        if (!empty($data['stock_status'])) {
            $product->set_stock_status($data['stock_status']);
        }
        if (!empty($data['backorders'])) {
            $back = in_array($data['backorders'], ['yes', 'notify', 'no'], true) ? $data['backorders'] : 'no';
            $product->set_backorders($back);
        }

    } elseif ($manage === false) {
        $product->set_manage_stock(false);
        if (!empty($data['stock_status'])) {
            $product->set_stock_status($data['stock_status']);
        } elseif ($has_qty) {
            $product->set_stock_status('instock');
        }

    } else {
        // default behavior
        if ($has_qty) {
            $product->set_manage_stock(true);
            $product->set_stock_quantity($qty);
            if (!array_key_exists('stock_status', $data)) {
                $product->set_stock_status($qty > 0 ? 'instock' : 'outofstock');
            }
        } elseif (!empty($data['stock_status'])) {
            $product->set_manage_stock(false);
            $product->set_stock_status($data['stock_status']);
        }
    }

    // Guardar (para generar ID si es nuevo)
    $product->save();
    $id = (int) $product->get_id();

    // Imagen destacada
    if (!empty($data['image']) && cmu_validate_media_url($data['image'])) {
        $img_id = cmu_set_image_from_url_cached($data['image']);
        if ($img_id)
            set_post_thumbnail($id, $img_id);
    }

    // Galería
    if (isset($data['gallery']) && is_array($data['gallery'])) {
        $gallery_ids = [];
        foreach ($data['gallery'] as $u) {
            if (!cmu_validate_media_url($u))
                continue;
            $mid = cmu_set_image_from_url_cached($u);
            if ($mid)
                $gallery_ids[] = $mid;
        }
        if ($gallery_ids) {
            update_post_meta($id, '_product_image_gallery', implode(',', $gallery_ids));
        } else {
            delete_post_meta($id, '_product_image_gallery');
        }
    }

    // Destacado (featured)
    if (array_key_exists('featured', $data)) {
        $product->set_featured((bool) $data['featured']);
        $product->save();
    }

    // Meta libres
    if (!empty($data['meta']) && is_array($data['meta'])) {
        foreach ($data['meta'] as $k => $v) {
            update_post_meta($id, sanitize_key($k), is_scalar($v) ? wp_unslash($v) : $v);
        }
    }
    // Jet meta tipado (whitelist)
    if (!empty($data['jet_meta']) && is_array($data['jet_meta'])) {
        cmu_apply_meta_whitelist($id, $data['jet_meta']);
    }

    // Taxonomías Woo
    if (!empty($data['categories'])) {
        $cat_ids = cmu_valid_term_ids((array) $data['categories'], 'product_cat');
        if ($cat_ids)
            wp_set_object_terms($id, $cat_ids, 'product_cat', false);
    }
    if (!empty($data['tags'])) {
        $tag_ids = cmu_valid_term_ids((array) $data['tags'], 'product_tag');
        if ($tag_ids)
            wp_set_object_terms($id, $tag_ids, 'product_tag', false);
    }

    // Taxonomías Jet/custom
    if (!empty($data['jet_taxonomies']) && is_array($data['jet_taxonomies'])) {
        foreach ($data['jet_taxonomies'] as $tax => $terms) {
            if (!taxonomy_exists($tax))
                continue;
            $term_ids = cmu_valid_term_ids((array) $terms, $tax);
            if ($term_ids)
                wp_set_object_terms($id, $term_ids, $tax, false);
        }
    }

    // Up-sells / Cross-sells
    $touch_rel = false;
    if (array_key_exists('upsell_skus', $data)) {
        $product->set_upsell_ids(cmu_resolve_product_ids((array) $data['upsell_skus']));
        $touch_rel = true;
    }
    if (array_key_exists('crosssell_skus', $data)) {
        $product->set_cross_sell_ids(cmu_resolve_product_ids((array) $data['crosssell_skus']));
        $touch_rel = true;
    }
    if ($touch_rel)
        $product->save();

    // Relacionados manuales
    if (array_key_exists('related_skus', $data)) {
        $rel_ids = cmu_resolve_product_ids((array) $data['related_skus']);
        update_post_meta($id, '_manual_related_ids', array_map('intval', $rel_ids));
    }

    return [
        'product_id' => $id,
        'sku' => $product->get_sku(),
        'mode' => $existing_id ? 'updated' : 'created'
    ];
}

/* ============================================================================
 * 5) Payload y utilidades por SKU/ID
 *    [UPDATED V3.4] Include sale dates in payload
 * ==========================================================================*/
function cmu_product_payload($id)
{
    $product = wc_get_product($id);
    if (!$product)
        return new WP_Error('not_found', 'Product not found', ['status' => 404]);

    $image = wp_get_attachment_url(get_post_thumbnail_id($id));
    $gallery_ids = explode(',', (string) get_post_meta($id, '_product_image_gallery', true));
    $gallery_urls = array_values(array_filter(array_map('wp_get_attachment_url', array_filter($gallery_ids))));

    $get_terms_names = function ($pid, $taxonomy) {
        $terms = wp_get_post_terms($pid, $taxonomy);
        return array_map(fn($t) => $t->name, $terms);
    };

    $jet = [];
    foreach (get_object_taxonomies('product') as $tax) {
        if (in_array($tax, ['product_cat', 'product_tag']))
            continue;
        $names = $get_terms_names($id, $tax);
        if ($names)
            $jet[$tax] = $names;
    }

    $manual_related = get_post_meta($id, '_manual_related_ids', true);
    $manual_related = is_array($manual_related) ? array_map('intval', $manual_related) : [];

    // Fechas (Woo retorna objetos WC_DateTime o null)
    $date_from = $product->get_date_on_sale_from();
    $date_to = $product->get_date_on_sale_to();

    return [
        'id' => (int) $id,
        'title' => $product->get_name(),
        'description' => $product->get_description(),
        'short_description' => $product->get_short_description(),
        'price' => $product->get_price(),
        'regular_price' => $product->get_regular_price(),
        'sale_price' => $product->get_sale_price(),
        // V3.4: Return dates (ISO 8601 or Y-m-d)
        'date_on_sale_from' => $date_from ? $date_from->date('Y-m-d') : null,
        'date_on_sale_to' => $date_to ? $date_to->date('Y-m-d') : null,
        'sku' => $product->get_sku(),
        'stock_quantity' => $product->get_stock_quantity(),
        'stock_status' => $product->get_stock_status(),
        'status' => get_post_status($id),
        'featured' => (bool) $product->get_featured(),
        'image' => $image,
        'gallery' => $gallery_urls,
        'categories' => $get_terms_names($id, 'product_cat'),
        'tags' => $get_terms_names($id, 'product_tag'),
        'jet_taxonomies' => $jet,
        'upsell_ids' => array_map('intval', (array) $product->get_upsell_ids()),
        'crosssell_ids' => array_map('intval', (array) $product->get_cross_sell_ids()),
        'upsell_skus' => array_values(array_filter(array_map(function ($pid) {
            $p = wc_get_product($pid);
            return $p ? $p->get_sku() : null; }, (array) $product->get_upsell_ids()))),
        'crosssell_skus' => array_values(array_filter(array_map(function ($pid) {
            $p = wc_get_product($pid);
            return $p ? $p->get_sku() : null; }, (array) $product->get_cross_sell_ids()))),
        'related_ids_manual' => $manual_related
    ];
}

function cmu_get_id_by_sku_or_404($sku)
{
    $sku = is_string($sku) ? trim($sku) : '';
    if ($sku === '')
        return new WP_Error('invalid', 'SKU vacío', ['status' => 400]);
    $pid = wc_get_product_id_by_sku($sku);
    if (!$pid)
        return new WP_Error('not_found', 'Product with that SKU not found', ['status' => 404]);
    return (int) $pid;
}

/* ============================================================================
 * 6) Hook: mostrar relacionados manuales en frontend (sin romper nativo)
 * ==========================================================================*/
add_filter('woocommerce_related_products', function ($related, $product_id) {
    $manual = get_post_meta($product_id, '_manual_related_ids', true);
    if (is_array($manual) && !empty($manual)) {
        $manual = array_values(array_filter(array_map('intval', $manual)));
        $wanted = (int) apply_filters('woocommerce_related_products_total', 4);
        if (count($manual) >= $wanted)
            return array_slice($manual, 0, $wanted);
        $merge = array_values(array_unique(array_merge($manual, $related)));
        return array_slice($merge, 0, $wanted);
    }
    return $related;
}, 10, 2);

/* ============================================================================
 * 7) ENDPOINTS
 * ==========================================================================*/
add_action('rest_api_init', function () {

    /* ---------- POST /product (upsert) ---------- */
    register_rest_route('custom-api/v1', '/product', [
        'methods' => 'POST',
        'permission_callback' => 'cmu_permission',
        'args' => [
            'title' => ['type' => 'string', 'sanitize_callback' => 'sanitize_text_field'],
            'sku' => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'regular_price' => ['type' => 'string', 'validate_callback' => fn($v) => is_numeric($v)],
            'sale_price' => ['type' => 'string'],
            'date_on_sale_from' => ['type' => 'string', 'description' => 'YYYY-MM-DD or ISO8601'],
            'date_on_sale_to' => ['type' => 'string', 'description' => 'YYYY-MM-DD or ISO8601'],
            'price' => ['type' => 'string'],
            'description' => ['type' => 'string'],
            'short_description' => ['type' => 'string'],
            'categories' => ['type' => 'array'],
            'tags' => ['type' => 'array'],
            'image' => ['type' => 'string', 'validate_callback' => 'cmu_validate_media_url'],
            'gallery' => ['type' => 'array'],
            'upsell_skus' => ['type' => 'array'],
            'crosssell_skus' => ['type' => 'array'],
            'related_skus' => ['type' => 'array'],
            'featured' => ['type' => 'boolean'],
            'meta' => ['type' => 'object'],
            'jet_meta' => ['type' => 'object'],
            'stock_quantity' => ['type' => 'integer'],
            'stock_status' => ['type' => 'string'],
            'status' => ['type' => 'string'],
            'jet_taxonomies' => ['type' => 'object'],
        ],
        'callback' => function (WP_REST_Request $request) {
            $data = $request->get_json_params() ?: [];
            $r = cmu_upsert_simple_product($data);
            if (is_wp_error($r))
                return $r;
            return ['success' => true] + $r;
        }
    ]);

    /* ---------- GET /product/{id} ---------- */
    register_rest_route('custom-api/v1', '/product/(?P<id>\d+)', [
        'methods' => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $id = (int) $request['id'];
            return cmu_product_payload($id);
        }
    ]);

    /* ---------- DELETE /product/{id} ---------- */
    register_rest_route('custom-api/v1', '/product/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $id = (int) $request['id'];
            $ok = wp_delete_post($id, true);
            if (!$ok)
                return new WP_Error('delete_failed', 'No se pudo eliminar', ['status' => 500]);
            return ['success' => true, 'deleted_id' => $id];
        }
    ]);

    /* ---------- POST /products/batch (create|update auto) ---------- */
    register_rest_route('custom-api/v1', '/products/batch', [
        'methods' => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $payload = $request->get_json_params();
            $items = $payload['products'] ?? [];
            $mode = $payload['mode'] ?? 'auto'; // auto|create_only|update_only
    
            if (!is_array($items) || !$items) {
                return new WP_Error('invalid_data', 'Envía products como array', ['status' => 400]);
            }

            if (function_exists('wc_deferred_product_sync_start'))
                wc_deferred_product_sync_start();
            wp_suspend_cache_invalidation(true);
            wp_defer_term_counting(true);

            $results = [];
            foreach ($items as $i => $data) {
                try {
                    $sku = $data['sku'] ?? null;
                    $exists_id = $sku ? wc_get_product_id_by_sku($sku) : 0;

                    if ($mode === 'create_only' && $exists_id) {
                        $results[] = ['index' => $i, 'success' => false, 'error' => 'SKU ya existe'];
                        continue;
                    }
                    if ($mode === 'update_only' && (!$sku || !$exists_id)) {
                        $results[] = ['index' => $i, 'success' => false, 'error' => 'SKU no existe para actualizar'];
                        continue;
                    }

                    $r = cmu_upsert_simple_product((array) $data);
                    if (is_wp_error($r)) {
                        $results[] = ['index' => $i, 'success' => false, 'error' => $r->get_error_message()];
                    } else {
                        $results[] = ['index' => $i, 'success' => true] + $r;
                    }

                } catch (Throwable $e) {
                    $results[] = ['index' => $i, 'success' => false, 'error' => $e->getMessage()];
                }
            }

            if (function_exists('wc_deferred_product_sync_end'))
                wc_deferred_product_sync_end();
            wp_defer_term_counting(false);
            wp_suspend_cache_invalidation(false);

            return ['success' => true, 'count' => count($results), 'results' => $results];
        }
    ]);

    /* ---------- POST /products/batch/delete ---------- */
    register_rest_route('custom-api/v1', '/products/batch/delete', [
        'methods' => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $p = $request->get_json_params();
            $ids = array_map('intval', $p['ids'] ?? []);
            $skus = $p['skus'] ?? [];

            if (!$ids && !$skus)
                return new WP_Error('invalid', 'Envía ids o skus', ['status' => 400]);

            $targets = $ids;
            foreach ($skus as $s) {
                $pid = wc_get_product_id_by_sku(sanitize_text_field($s));
                if ($pid)
                    $targets[] = (int) $pid;
            }
            $targets = array_values(array_unique(array_filter($targets)));

            $out = [];
            foreach ($targets as $id) {
                $ok = wp_delete_post($id, true);
                $out[] = ['id' => $id, 'deleted' => (bool) $ok];
            }
            return ['success' => true, 'results' => $out];
        }
    ]);

    /* ---------- PUT /products/sku/batch (update-only) ---------- */
    register_rest_route('custom-api/v1', '/products/sku/batch', [
        'methods' => 'PUT',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $payload = $request->get_json_params() ?: [];
            $updates = $payload['updates'] ?? $payload['products'] ?? [];
            if (!is_array($updates) || !$updates) {
                return new WP_Error('invalid_data', 'Envía "updates" (array de objetos con "sku").', ['status' => 400]);
            }

            if (function_exists('wc_deferred_product_sync_start'))
                wc_deferred_product_sync_start();
            wp_suspend_cache_invalidation(true);
            wp_defer_term_counting(true);

            $results = [];
            foreach ($updates as $i => $data) {
                try {
                    $data = (array) $data;
                    $sku = isset($data['sku']) ? trim((string) $data['sku']) : '';
                    if ($sku === '')
                        throw new Exception("Fila $i: falta sku");

                    $pid = wc_get_product_id_by_sku($sku);
                    if (!$pid) {
                        $results[] = ['index' => $i, 'success' => false, 'sku' => $sku, 'error' => 'SKU no encontrado (solo update)'];
                        continue;
                    }

                    $data['sku'] = $sku; // fuerza update branch
                    $r = cmu_upsert_simple_product($data);
                    if (is_wp_error($r)) {
                        $results[] = ['index' => $i, 'success' => false, 'sku' => $sku, 'error' => $r->get_error_message()];
                    } else {
                        $r['mode'] = 'updated';
                        $results[] = ['index' => $i, 'success' => true, 'sku' => $sku] + $r;
                    }

                } catch (Throwable $e) {
                    $results[] = ['index' => $i, 'success' => false, 'error' => $e->getMessage()];
                }
            }

            if (function_exists('wc_deferred_product_sync_end'))
                wc_deferred_product_sync_end();
            wp_defer_term_counting(false);
            wp_suspend_cache_invalidation(false);

            return ['success' => true, 'count' => count($results), 'results' => $results];
        }
    ]);

    /* ---------- GET /products (filtros/paginación, featured opcional) ---------- */
    register_rest_route('custom-api/v1', '/products', [
        'methods' => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $page = max(1, (int) ($request->get_param('page') ?: 1));
            $per_page = min(200, max(1, (int) ($request->get_param('per_page') ?: 50)));
            $orderby = sanitize_text_field($request->get_param('orderby') ?: 'date'); // date|title|ID
            $order = strtoupper($request->get_param('order') ?: 'DESC');           // ASC|DESC
            $search = sanitize_text_field($request->get_param('search') ?: '');
            $status = sanitize_text_field($request->get_param('status') ?: 'any');  // any|publish|draft|private
            $category = sanitize_title($request->get_param('category') ?: '');
            $tag = sanitize_title($request->get_param('tag') ?: '');
            $skus_qs = trim((string) ($request->get_param('skus') ?: ''));
            $fields = strtolower($request->get_param('fields') ?: 'basic');         // basic|full
            $featured = $request->get_param('featured'); // 1/0 o true/false
    
            $args = [
                'post_type' => 'product',
                'post_status' => ($status === 'any') ? ['publish', 'draft', 'private'] : $status,
                'orderby' => in_array($orderby, ['date', 'title', 'ID'], true) ? $orderby : 'date',
                'order' => in_array($order, ['ASC', 'DESC'], true) ? $order : 'DESC',
                'posts_per_page' => $per_page,
                'paged' => $page,
                's' => $search ?: '',
            ];

            $tax_query = [];
            if ($category) {
                $tax_query[] = ['taxonomy' => 'product_cat', 'field' => 'slug', 'terms' => [$category]];
            }
            if ($tag) {
                $tax_query[] = ['taxonomy' => 'product_tag', 'field' => 'slug', 'terms' => [$tag]];
            }
            if ($tax_query)
                $args['tax_query'] = $tax_query;

            $meta_query = [];
            $sku_list = [];
            if ($skus_qs !== '') {
                $sku_list = array_values(array_filter(array_map('trim', explode(',', $skus_qs))));
                if ($sku_list) {
                    $meta_query[] = ['key' => '_sku', 'value' => $sku_list, 'compare' => 'IN'];
                }
            }
            if ($featured !== null) {
                $want = in_array($featured, ['1', 1, true, 'true'], true) ? 'yes' : 'no';
                $meta_query[] = ['key' => '_featured', 'value' => $want, 'compare' => '='];
            }
            if ($meta_query)
                $args['meta_query'] = $meta_query;

            $q = new WP_Query($args);
            $posts = $q->posts ?: [];

            $rows = [];
            foreach ($posts as $p) {
                $prod = wc_get_product($p->ID);
                if (!$prod)
                    continue;

                if ($fields === 'full') {
                    $rows[] = cmu_product_payload($p->ID);
                } else {
                    $rows[] = [
                        'id' => (int) $p->ID,
                        'sku' => $prod->get_sku(),
                        'title' => $prod->get_name(),
                        'price' => $prod->get_price(),
                        'stock_quantity' => $prod->get_stock_quantity(),
                        'stock_status' => $prod->get_stock_status(),
                        'status' => get_post_status($p->ID),
                        'featured' => (bool) $prod->get_featured(),
                        'date' => get_post_time('c', true, $p->ID),
                    ];
                }
            }

            return [
                'success' => true,
                'page' => $page,
                'per_page' => $per_page,
                'total' => (int) $q->found_posts,
                'pages' => (int) $q->max_num_pages,
                'rows' => array_values($rows)
            ];
        }
    ]);

    /* ---------- GET /product/sku/{sku} ---------- */
    register_rest_route('custom-api/v1', '/product/sku/(?P<sku>[^/]+)', [
        'methods' => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $pid = cmu_get_id_by_sku_or_404($request['sku']);
            if (is_wp_error($pid))
                return $pid;
            return cmu_product_payload($pid);
        }
    ]);

    /* ---------- PUT /product/sku/{sku} (update) ---------- */
    register_rest_route('custom-api/v1', '/product/sku/(?P<sku>[^/]+)', [
        'methods' => 'PUT',
        'permission_callback' => 'cmu_permission',
        'args' => [
            'title' => ['type' => 'string', 'sanitize_callback' => 'sanitize_text_field'],
            'regular_price' => ['type' => 'string'],
            'sale_price' => ['type' => 'string'],
            'date_on_sale_from' => ['type' => 'string'],
            'date_on_sale_to' => ['type' => 'string'],
            'price' => ['type' => 'string'],
            'description' => ['type' => 'string'],
            'short_description' => ['type' => 'string'],
            'categories' => ['type' => 'array'],
            'tags' => ['type' => 'array'],
            'image' => ['type' => 'string', 'validate_callback' => 'cmu_validate_media_url'],
            'gallery' => ['type' => 'array'],
            'upsell_skus' => ['type' => 'array'],
            'crosssell_skus' => ['type' => 'array'],
            'related_skus' => ['type' => 'array'],
            'featured' => ['type' => 'boolean'],
            'meta' => ['type' => 'object'],
            'jet_meta' => ['type' => 'object'],
            'stock_quantity' => ['type' => 'integer'],
            'stock_status' => ['type' => 'string'],
            'status' => ['type' => 'string'],
            'jet_taxonomies' => ['type' => 'object'],
            'sku' => ['type' => 'string'], // opcional para renombrar
        ],
        'callback' => function (WP_REST_Request $request) {
            $pid = cmu_get_id_by_sku_or_404($request['sku']);
            if (is_wp_error($pid))
                return $pid;
            $product = wc_get_product($pid);
            if (!$product)
                return new WP_Error('not_found', 'Product not found', ['status' => 404]);

            $data = $request->get_json_params() ?: [];

            if (!empty($data['title']))
                $product->set_name($data['title']);
            if (array_key_exists('description', $data))
                $product->set_description($data['description'] ?? '');
            if (array_key_exists('short_description', $data))
                $product->set_short_description($data['short_description'] ?? '');

            if (isset($data['regular_price']) || isset($data['price'])) {
                $product->set_regular_price((string) ($data['regular_price'] ?? $data['price']));
            }
            if (array_key_exists('sale_price', $data)) {
                $sp = $data['sale_price'];
                $product->set_sale_price($sp === '' || $sp === null ? '' : (string) $sp);
            }
            if (array_key_exists('date_on_sale_from', $data)) {
                $from = $data['date_on_sale_from'];
                $product->set_date_on_sale_from($from === '' || $from === null ? '' : $from);
            }
            if (array_key_exists('date_on_sale_to', $data)) {
                $to = $data['date_on_sale_to'];
                $product->set_date_on_sale_to($to === '' || $to === null ? '' : $to);
            }


            if (isset($data['stock_quantity']))
                $product->set_stock_quantity((int) $data['stock_quantity']);
            if (!empty($data['stock_status']))
                $product->set_stock_status($data['stock_status']);
            if (!empty($data['status']))
                $product->set_status($data['status']);

            if (!empty($data['sku']))
                $product->set_sku(sanitize_text_field($data['sku'])); // permitir cambio
    
            $product->save();

            if (array_key_exists('featured', $data)) {
                $product->set_featured((bool) $data['featured']);
                $product->save();
            }

            if (!empty($data['meta']) && is_array($data['meta'])) {
                foreach ($data['meta'] as $k => $v) {
                    update_post_meta($product->get_id(), sanitize_key($k), is_scalar($v) ? wp_unslash($v) : $v);
                }
            }
            if (!empty($data['jet_meta']) && is_array($data['jet_meta'])) {
                cmu_apply_meta_whitelist($product->get_id(), $data['jet_meta']);
            }

            if (!empty($data['image']) && cmu_validate_media_url($data['image'])) {
                $img_id = cmu_set_image_from_url_cached($data['image']);
                if ($img_id)
                    set_post_thumbnail($pid, $img_id);
            }

            if (isset($data['gallery']) && is_array($data['gallery'])) {
                $gallery_ids = [];
                foreach ($data['gallery'] as $u) {
                    if (!cmu_validate_media_url($u))
                        continue;
                    $mid = cmu_set_image_from_url_cached($u);
                    if ($mid)
                        $gallery_ids[] = $mid;
                }
                if ($gallery_ids)
                    update_post_meta($pid, '_product_image_gallery', implode(',', $gallery_ids));
                else
                    delete_post_meta($pid, '_product_image_gallery');
            }

            if (!empty($data['categories'])) {
                $cat_ids = cmu_valid_term_ids((array) $data['categories'], 'product_cat');
                if ($cat_ids)
                    wp_set_object_terms($pid, $cat_ids, 'product_cat', false);
            }
            if (!empty($data['tags'])) {
                $tag_ids = cmu_valid_term_ids((array) $data['tags'], 'product_tag');
                if ($tag_ids)
                    wp_set_object_terms($pid, $tag_ids, 'product_tag', false);
            }

            if (!empty($data['jet_taxonomies']) && is_array($data['jet_taxonomies'])) {
                foreach ($data['jet_taxonomies'] as $tax => $terms) {
                    if (!taxonomy_exists($tax))
                        continue;
                    $term_ids = cmu_valid_term_ids((array) $terms, $tax);
                    if ($term_ids)
                        wp_set_object_terms($pid, $term_ids, $tax, false);
                }
            }

            $touch_rel = false;
            if ($request->has_param('upsell_skus') || array_key_exists('upsell_skus', $data)) {
                $product->set_upsell_ids(cmu_resolve_product_ids((array) ($data['upsell_skus'] ?? [])));
                $touch_rel = true;
            }
            if ($request->has_param('crosssell_skus') || array_key_exists('crosssell_skus', $data)) {
                $product->set_cross_sell_ids(cmu_resolve_product_ids((array) ($data['crosssell_skus'] ?? [])));
                $touch_rel = true;
            }
            if ($touch_rel)
                $product->save();

            if (array_key_exists('related_skus', $data)) {
                $rel_ids = cmu_resolve_product_ids((array) $data['related_skus']);
                update_post_meta($pid, '_manual_related_ids', array_map('intval', $rel_ids));
            }

            return ['success' => true, 'product_id' => $product->get_id(), 'mode' => 'updated'];
        }
    ]);

    /* ---------- DELETE /product/sku/{sku} ---------- */
    register_rest_route('custom-api/v1', '/product/sku/(?P<sku>[^/]+)', [
        'methods' => 'DELETE',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $pid = cmu_get_id_by_sku_or_404($request['sku']);
            if (is_wp_error($pid))
                return $pid;
            $ok = wp_delete_post($pid, true);
            if (!$ok)
                return new WP_Error('delete_failed', 'No se pudo eliminar', ['status' => 500]);
            return ['success' => true, 'deleted_sku' => $request['sku'], 'deleted_id' => $pid];
        }
    ]);

    /* ---------- PATCH /product/sku/{sku}/featured ---------- */
    register_rest_route('custom-api/v1', '/product/sku/(?P<sku>[^/]+)/featured', [
        'methods' => 'PATCH',
        'permission_callback' => 'cmu_permission',
        'args' => [
            'featured' => ['type' => 'boolean', 'required' => true],
        ],
        'callback' => function (WP_REST_Request $request) {
            $pid = cmu_get_id_by_sku_or_404($request['sku']);
            if (is_wp_error($pid))
                return $pid;
            $p = wc_get_product($pid);
            $p->set_featured((bool) $request->get_param('featured'));
            $p->save();
            return ['success' => true, 'product_id' => $pid, 'featured' => $p->get_featured()];
        }
    ]);

    /* ---------- POST /product/create-or-update (BATCH Upsert por SKU) ---------- */
    register_rest_route('custom-api/v1', '/product/create-or-update', [
        'methods' => 'POST',
        'permission_callback' => 'cmu_permission',
        'args' => [
            'products' => [
                'type' => 'array',
                'required' => true,
                'description' => 'Lista de productos para crear o actualizar.',
                'items' => ['type' => 'object'],
                'manage_stock' => ['type' => 'boolean'],
                'backorders' => ['type' => 'string'],
            ],
        ],
        'callback' => function (WP_REST_Request $request) {
            $payload = $request->get_json_params() ?: [];
            $items = $payload['products'] ?? [];

            if (empty($items) || !is_array($items)) {
                return new WP_Error('no_products', 'Debe enviar un array "products" con al menos un producto.', ['status' => 400]);
            }

            $results = [];
            foreach ($items as $index => $data) {
                if (empty($data['sku'])) {
                    $results[] = ['index' => $index, 'success' => false, 'error' => 'SKU requerido'];
                    continue;
                }
                $r = cmu_upsert_simple_product($data);
                if (is_wp_error($r)) {
                    $results[] = ['index' => $index, 'success' => false, 'sku' => $data['sku'], 'error' => $r->get_error_message()];
                } else {
                    $results[] = [
                        'index' => $index,
                        'success' => true,
                        'sku' => $r['sku'] ?? $data['sku'],
                        'product_id' => $r['product_id'] ?? null,
                        'mode' => $r['mode'] ?? 'unknown'
                    ];
                }
            }

            return ['success' => true, 'count' => count($results), 'results' => $results];
        },
    ]);
});

// Nota: Se han omitido las secciones de Tablas Personalizadas, Clientes y Órdenes 
// para mantener este archivo enfocado en el FIX de PRODUCTOS (que era lo prioritario).
// Si necesitas también esas secciones, simplemente cópialas del CUSTOM_API_V3.3.md
// o pídemelo y te genero un archivo "completo" gigante.
// Por ahora, este archivo sirve para reemplazar la lógica de productos.
