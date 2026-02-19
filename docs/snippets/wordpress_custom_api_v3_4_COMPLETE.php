<?php
/**
 * Plugin Name: Custom API for Woo (V4 Con Fechas Oferta | 2x 1 limite de compra | COMPLETO)
 * Description: API REST personalizada V4 Soporte para date_on_sale_from/to + Tablas + Clientes + Órdenes.
 * Version:     4.0
 * Author:      iAnGo | Agencia de Desarrollo y Soluciones con IA | Gustavo Vargas
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
            return $p ? $p->get_sku() : null;
        }, (array) $product->get_upsell_ids()))),
        'crosssell_skus' => array_values(array_filter(array_map(function ($pid) {
            $p = wc_get_product($pid);
            return $p ? $p->get_sku() : null;
        }, (array) $product->get_cross_sell_ids()))),
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

            // Filtro 'on_sale'
            $on_sale = $request->get_param('on_sale');
            if ($on_sale !== null) {
                // true/1 => Solo ofertas
                $is_on_sale = in_array($on_sale, ['1', 1, true, 'true'], true);
                $sale_ids = wc_get_product_ids_on_sale();
                if ($is_on_sale) {
                    $args['post__in'] = !empty($args['post__in'])
                        ? array_intersect($args['post__in'], $sale_ids)
                        : $sale_ids;
                } else {
                    // false/0 => Solo NO ofertas (excluir los de oferta)
                    $args['post__not_in'] = !empty($args['post__not_in'])
                        ? array_merge($args['post__not_in'], $sale_ids)
                        : $sale_ids;
                }
            }

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

/* ============================================================================
 * 8) CRUD Tablas Personalizadas
 * ==========================================================================*/
add_action('rest_api_init', function () {

    $cmu_tables = [
        'cliente-descuento-item' => $GLOBALS['wpdb']->prefix . 'cliente_descuento_item',
        'convenio' => $GLOBALS['wpdb']->prefix . 'convenio',
        'costo-tipo' => $GLOBALS['wpdb']->prefix . 'costo_tipo',
        'descuento-call' => $GLOBALS['wpdb']->prefix . 'descuento_call',
        'laboratorio' => $GLOBALS['wpdb']->prefix . 'laboratorio',
        'precio-distrib' => $GLOBALS['wpdb']->prefix . 'precio_distrib',
    ];

    $get_primary = function ($table) {
        $map = [
            $GLOBALS['wpdb']->prefix . 'cliente_descuento_item' => 'CLIENTE_DESCUENTO_ITEM_ID',
            $GLOBALS['wpdb']->prefix . 'convenio' => 'CONVENIO_ID',
            $GLOBALS['wpdb']->prefix . 'costo_tipo' => 'COSTO_TIPO_ID',
            $GLOBALS['wpdb']->prefix . 'descuento_call' => 'DESCUENTO_ID',
            $GLOBALS['wpdb']->prefix . 'laboratorio' => 'LABORATORIO_ID',
            $GLOBALS['wpdb']->prefix . 'precio_distrib' => 'PRECIO_DISTRIB_ID',
        ];
        return $map[$table] ?? 'id';
    };

    $table_columns = function ($table) {
        global $wpdb;
        $cols = $wpdb->get_results("DESCRIBE `$table`", ARRAY_A);
        return $cols ? array_map(fn($r) => $r['Field'], $cols) : [];
    };

    $sanitize_row = function (array $row, array $allowed_cols) {
        $clean = [];
        foreach ($row as $k => $v) {
            if (in_array($k, $allowed_cols, true)) {
                if (is_string($v)) {
                    $clean[$k] = wp_unslash(wp_kses_post(trim($v)));
                } else {
                    $clean[$k] = $v;
                }
            }
        }
        return $clean;
    };

    foreach ($cmu_tables as $endpoint => $table_name) {

        // LISTAR
        register_rest_route('custom-api/v1', '/' . $endpoint, [
            'methods' => 'GET',
            'permission_callback' => 'cmu_permission',
            'callback' => function (WP_REST_Request $request) use ($table_name, $get_primary, $table_columns) {
                global $wpdb;
                $primary = $get_primary($table_name);
                $cols = $table_columns($table_name);
                if (!$cols)
                    return new WP_Error('table_error', 'No se pudieron leer columnas', ['status' => 500]);

                $page = max(1, (int) ($request->get_param('page') ?: 1));
                $per_page = min(500, max(1, (int) ($request->get_param('per_page') ?: 50)));
                $orderby = $request->get_param('orderby') ?: $primary;
                $order = strtoupper($request->get_param('order') ?: 'DESC');
                $search = $request->get_param('search');
                $filters = (array) ($request->get_param('filters') ?: []);

                if (!in_array($orderby, $cols, true))
                    $orderby = $primary;
                if (!in_array($order, ['ASC', 'DESC'], true))
                    $order = 'DESC';

                $where = "WHERE 1=1";
                $params = [];
                foreach ($filters as $col => $val) {
                    if (in_array($col, $cols, true)) {
                        $where .= " AND `$col` = %s";
                        $params[] = (string) $val;
                    }
                }
                if ($search) {
                    $search_like = '%' . $wpdb->esc_like($search) . '%';
                    $parts = [];
                    foreach ($cols as $c)
                        $parts[] = "`$c` LIKE %s";
                    $where .= " AND (" . implode(' OR ', $parts) . ")";
                    foreach ($cols as $_)
                        $params[] = $search_like;
                }

                $offset = ($page - 1) * $per_page;

                $sql_count = "SELECT COUNT(*) FROM `$table_name` $where";
                $total = $params ? (int) $wpdb->get_var($wpdb->prepare($sql_count, $params)) : (int) $wpdb->get_var($sql_count);

                $sql = "SELECT * FROM `$table_name` $where ORDER BY `$orderby` $order LIMIT %d OFFSET %d";
                $params_data = $params;
                $params_data[] = $per_page;
                $params_data[] = $offset;
                $rows = $params_data ? $wpdb->get_results($wpdb->prepare($sql, $params_data), ARRAY_A) : $wpdb->get_results($sql, ARRAY_A);

                return [
                    'success' => true,
                    'page' => $page,
                    'per_page' => $per_page,
                    'total' => $total,
                    'rows' => $rows,
                    'primary' => $primary,
                ];
            }
        ]);

        // OBTENER UNO
        register_rest_route('custom-api/v1', '/' . $endpoint . '/(?P<id>\d+)', [
            'methods' => 'GET',
            'permission_callback' => 'cmu_permission',
            'callback' => function (WP_REST_Request $request) use ($table_name, $get_primary) {
                global $wpdb;
                $id = (int) $request['id'];
                $primary = $get_primary($table_name);
                $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM `$table_name` WHERE `$primary` = %d", $id), ARRAY_A);
                if (!$row)
                    return new WP_Error('not_found', 'Registro no encontrado', ['status' => 404]);
                return ['success' => true, 'row' => $row];
            }
        ]);

        // CREAR
        register_rest_route('custom-api/v1', '/' . $endpoint, [
            'methods' => 'POST',
            'permission_callback' => 'cmu_permission',
            'callback' => function (WP_REST_Request $request) use ($table_name, $table_columns, $get_primary, $sanitize_row) {
                global $wpdb;
                $cols = $table_columns($table_name);
                if (!$cols)
                    return new WP_Error('table_error', 'No se pudieron leer columnas', ['status' => 500]);

                $primary = $get_primary($table_name);
                $data_in = $request->get_json_params() ?: [];
                $row = $sanitize_row($data_in, $cols);
                if (array_key_exists($primary, $row) && ($row[$primary] === '' || $row[$primary] === null)) {
                    unset($row[$primary]);
                }

                $ok = $wpdb->insert($table_name, $row);
                if ($ok === false)
                    return new WP_Error('insert_failed', 'No se pudo insertar', ['status' => 500]);

                return ['success' => true, 'insert_id' => $wpdb->insert_id];
            }
        ]);

        // ACTUALIZAR
        register_rest_route('custom-api/v1', '/' . $endpoint . '/(?P<id>\d+)', [
            'methods' => 'PUT',
            'permission_callback' => 'cmu_permission',
            'callback' => function (WP_REST_Request $request) use ($table_name, $table_columns, $get_primary, $sanitize_row) {
                global $wpdb;
                $id = (int) $request['id'];
                $cols = $table_columns($table_name);
                if (!$cols)
                    return new WP_Error('table_error', 'No se pudieron leer columnas', ['status' => 500]);

                $primary = $get_primary($table_name);
                $data_in = $request->get_json_params() ?: [];
                $row = $sanitize_row($data_in, $cols);
                unset($row[$primary]);

                if (!$row)
                    return new WP_Error('invalid', 'No hay campos válidos para actualizar', ['status' => 400]);

                $ok = $wpdb->update($table_name, $row, [$primary => $id]);
                if ($ok === false)
                    return new WP_Error('update_failed', 'No se pudo actualizar', ['status' => 500]);

                return ['success' => true, 'updated_id' => $id];
            }
        ]);

        // ELIMINAR
        register_rest_route('custom-api/v1', '/' . $endpoint . '/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'permission_callback' => 'cmu_permission',
            'callback' => function (WP_REST_Request $request) use ($table_name, $get_primary) {
                global $wpdb;
                $id = (int) $request['id'];
                $primary = $get_primary($table_name);
                $ok = $wpdb->delete($table_name, [$primary => $id]);
                if ($ok === false)
                    return new WP_Error('delete_failed', 'No se pudo eliminar', ['status' => 500]);
                return ['success' => true, 'deleted_id' => $id];
            }
        ]);

        // MASIVO: create|update|upsert
        register_rest_route('custom-api/v1', '/' . $endpoint . '/batch', [
            'methods' => 'POST',
            'permission_callback' => 'cmu_permission',
            'callback' => function (WP_REST_Request $request) use ($table_name, $table_columns, $get_primary, $sanitize_row) {
                global $wpdb;
                $payload = $request->get_json_params() ?: [];
                $rows = $payload['rows'] ?? [];
                $mode = strtolower($payload['mode'] ?? 'upsert'); // create|update|upsert
                $primary = $get_primary($table_name);
                $cols = $table_columns($table_name);
                if (!$cols)
                    return new WP_Error('table_error', 'No se pudieron leer columnas', ['status' => 500]);

                if (!is_array($rows) || empty($rows)) {
                    return new WP_Error('invalid_data', 'Envía rows como array', ['status' => 400]);
                }
                if (!in_array($mode, ['create', 'update', 'upsert'], true)) {
                    return new WP_Error('invalid_mode', 'mode debe ser create|update|upsert', ['status' => 400]);
                }

                $results = [];
                $wpdb->query('START TRANSACTION');

                try {
                    foreach ($rows as $i => $input) {
                        $clean = $sanitize_row((array) $input, $cols);

                        if ($mode === 'create') {
                            if (array_key_exists($primary, $clean) && ($clean[$primary] === '' || $clean[$primary] === null)) {
                                unset($clean[$primary]);
                            }
                            $ok = $wpdb->insert($table_name, $clean);
                            if ($ok === false)
                                throw new Exception("Fila $i: fallo insert");
                            $results[] = ['index' => $i, 'success' => true, 'mode' => 'created', 'id' => $wpdb->insert_id];

                        } elseif ($mode === 'update') {
                            if (empty($clean[$primary]))
                                throw new Exception("Fila $i: falta $primary");
                            $pk = $clean[$primary];
                            unset($clean[$primary]);
                            if (!$clean)
                                throw new Exception("Fila $i: sin campos a actualizar");
                            $ok = $wpdb->update($table_name, $clean, [$primary => $pk]);
                            if ($ok === false)
                                throw new Exception("Fila $i: fallo update");
                            $results[] = ['index' => $i, 'success' => true, 'mode' => 'updated', 'id' => $pk];

                        } else { // upsert
                            $has_pk = !empty($clean[$primary]);
                            if ($has_pk) {
                                $pk = $clean[$primary];
                                unset($clean[$primary]);
                                $exists = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `$table_name` WHERE `$primary`=%d", $pk));
                                if ($exists) {
                                    if (!$clean) {
                                        $results[] = ['index' => $i, 'success' => true, 'mode' => 'noop', 'id' => $pk];
                                    } else {
                                        $ok = $wpdb->update($table_name, $clean, [$primary => $pk]);
                                        if ($ok === false)
                                            throw new Exception("Fila $i: fallo update");
                                        $results[] = ['index' => $i, 'success' => true, 'mode' => 'updated', 'id' => $pk];
                                    }
                                } else {
                                    $clean[$primary] = $pk;
                                    $ok = $wpdb->insert($table_name, $clean);
                                    if ($ok === false)
                                        throw new Exception("Fila $i: fallo insert");
                                    $results[] = ['index' => $i, 'success' => true, 'mode' => 'created', 'id' => $wpdb->insert_id];
                                }
                            } else {
                                $ok = $wpdb->insert($table_name, $clean);
                                if ($ok === false)
                                    throw new Exception("Fila $i: fallo insert");
                                $results[] = ['index' => $i, 'success' => true, 'mode' => 'created', 'id' => $wpdb->insert_id];
                            }
                        }
                    }
                    $wpdb->query('COMMIT');
                } catch (Throwable $e) {
                    $wpdb->query('ROLLBACK');
                    return new WP_Error('batch_failed', $e->getMessage(), ['status' => 500, 'partial' => $results]);
                }

                return ['success' => true, 'count' => count($results), 'results' => $results];
            }
        ]);

        // MASIVO: delete por ids
        register_rest_route('custom-api/v1', '/' . $endpoint . '/batch/delete', [
            'methods' => 'POST',
            'permission_callback' => 'cmu_permission',
            'callback' => function (WP_REST_Request $request) use ($table_name, $get_primary) {
                global $wpdb;
                $primary = $get_primary($table_name);
                $p = $request->get_json_params() ?: [];
                $ids = array_map('intval', $p['ids'] ?? []);
                if (!$ids)
                    return new WP_Error('invalid', 'Envía ids (array)', ['status' => 400]);

                $results = [];
                $wpdb->query('START TRANSACTION');
                try {
                    foreach ($ids as $id) {
                        $ok = $wpdb->delete($table_name, [$primary => (int) $id]);
                        $results[] = ['id' => $id, 'deleted' => $ok !== false && $ok > 0];
                    }
                    $wpdb->query('COMMIT');
                } catch (Throwable $e) {
                    $wpdb->query('ROLLBACK');
                    return new WP_Error('batch_delete_failed', $e->getMessage(), ['status' => 500, 'partial' => $results]);
                }

                return ['success' => true, 'results' => $results];
            }
        ]);
    }
});

/* ============================================================================
 * 9) CRUD de Usuarios
 * ==========================================================================*/
add_action('rest_api_init', function () {

    // Helpers
    $cmu_find_user = function ($match_by, $value) {
        if (!$value)
            return false;
        switch ($match_by) {
            case 'id':
                return get_userdata((int) $value);
            case 'email':
                return get_user_by('email', sanitize_email($value));
            case 'username':
                return get_user_by('login', sanitize_user($value, true));
            default:
                return false;
        }
    };

    $cmu_apply_meta = function ($user_id, $meta) {
        if (!is_array($meta))
            return;
        foreach ($meta as $k => $v) {
            update_user_meta($user_id, sanitize_key($k), is_scalar($v) ? wp_unslash($v) : $v);
        }
    };

    // ========== LISTAR ==========
    register_rest_route('custom-api/v1', '/customers', [
        'methods' => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $role = sanitize_text_field($request->get_param('role') ?: '');
            $search = sanitize_text_field($request->get_param('search') ?: '');
            $page = max(1, (int) ($request->get_param('page') ?: 1));
            $per_page = min(200, max(1, (int) ($request->get_param('per_page') ?: 50)));
            $orderby = sanitize_text_field($request->get_param('orderby') ?: 'ID'); // ID|user_login|user_email|user_registered
            $order = strtoupper($request->get_param('order') ?: 'DESC');
            if (!in_array($orderby, ['ID', 'user_login', 'user_email', 'user_registered'], true))
                $orderby = 'ID';
            if (!in_array($order, ['ASC', 'DESC'], true))
                $order = 'DESC';

            $args = [
                'number' => $per_page,
                'paged' => $page,
                'orderby' => $orderby,
                'order' => $order,
                'fields' => 'all_with_meta',
            ];
            if ($role)
                $args['role'] = $role;
            if ($search)
                $args['search'] = '*' . esc_attr($search) . '*';

            $q = new WP_User_Query($args);
            $users = array_map(function ($u) {
                return [
                    'id' => (int) $u->ID,
                    'username' => $u->user_login,
                    'email' => $u->user_email,
                    'role' => $u->roles[0] ?? null,
                    'registered' => $u->user_registered,
                ];
            }, $q->get_results());

            return [
                'success' => true,
                'page' => $page,
                'per_page' => $per_page,
                'total' => (int) $q->get_total(),
                'rows' => $users
            ];
        }
    ]);

    // ========== OBTENER UNO ==========
    register_rest_route('custom-api/v1', '/customers/(?P<id>\d+)', [
        'methods' => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $user = get_userdata((int) $request['id']);
            if (!$user)
                return new WP_Error('not_found', 'Usuario no encontrado', ['status' => 404]);
            return [
                'success' => true,
                'id' => (int) $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'role' => $user->roles[0] ?? null,
                'registered' => $user->user_registered
            ];
        }
    ]);

    // ========== CREAR ==========
    register_rest_route('custom-api/v1', '/customers', [
        'methods' => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) use ($cmu_apply_meta) {
            $d = $request->get_json_params() ?: [];
            $email = sanitize_email($d['email'] ?? '');
            $username = sanitize_user($d['username'] ?? ($email ? current(explode('@', $email)) : ''), true);
            $password = $d['password'] ?? wp_generate_password(12);
            $role = sanitize_text_field($d['role'] ?? 'customer');

            if (!$email)
                return new WP_Error('missing', 'email es obligatorio', ['status' => 400]);
            if (email_exists($email))
                return new WP_Error('exists', 'email ya existe', ['status' => 409]);
            if ($username && username_exists($username))
                $username .= '_' . wp_generate_password(4, false, false);

            $uid = wp_create_user($username ?: 'user_' . wp_generate_password(6, false, false), $password, $email);
            if (is_wp_error($uid))
                return $uid;
            if ($role)
                wp_update_user(['ID' => $uid, 'role' => $role]);

            if (!empty($d['meta']))
                $cmu_apply_meta($uid, $d['meta']);

            return ['success' => true, 'user_id' => $uid, 'mode' => 'created'];
        }
    ]);

    // ========== ACTUALIZAR ==========
    register_rest_route('custom-api/v1', '/customers/(?P<id>\d+)', [
        'methods' => 'PUT',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) use ($cmu_apply_meta) {
            $id = (int) $request['id'];
            $user = get_userdata($id);
            if (!$user)
                return new WP_Error('not_found', 'Usuario no encontrado', ['status' => 404]);

            $d = $request->get_json_params() ?: [];
            $upd = ['ID' => $id];

            if (!empty($d['email'])) {
                $email = sanitize_email($d['email']);
                $other = get_user_by('email', $email);
                if ($other && (int) $other->ID !== $id)
                    return new WP_Error('exists', 'email ya en uso', ['status' => 409]);
                $upd['user_email'] = $email;
            }
            if (!empty($d['username'])) {
                $username = sanitize_user($d['username'], true);
                $other = get_user_by('login', $username);
                if ($other && (int) $other->ID !== $id)
                    return new WP_Error('exists', 'username ya en uso', ['status' => 409]);
                $upd['user_login'] = $username;
            }
            if (!empty($d['password']))
                $upd['user_pass'] = $d['password'];

            $res = wp_update_user($upd);
            if (is_wp_error($res))
                return $res;

            if (!empty($d['role'])) {
                $role = sanitize_text_field($d['role']);
                (new WP_User($id))->set_role($role);
            }
            if (!empty($d['meta']))
                $cmu_apply_meta($id, $d['meta']);

            return ['success' => true, 'user_id' => $id, 'mode' => 'updated'];
        }
    ]);

    // ========== ELIMINAR ==========
    register_rest_route('custom-api/v1', '/customers/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $id = (int) $request['id'];
            $ok = wp_delete_user($id);
            if (!$ok)
                return new WP_Error('delete_failed', 'No se pudo eliminar', ['status' => 500]);
            return ['success' => true, 'deleted_id' => $id];
        }
    ]);

    // ========== MASIVO: create|update|upsert ==========
    register_rest_route('custom-api/v1', '/customers/batch', [
        'methods' => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) use ($cmu_find_user, $cmu_apply_meta) {
            $p = $request->get_json_params() ?: [];
            $rows = $p['customers'] ?? $p['rows'] ?? [];
            $mode = strtolower($p['mode'] ?? 'upsert');        // create|update|upsert
            $match_by = strtolower($p['match_by'] ?? 'email');     // id|email|username
            if (!in_array($mode, ['create', 'update', 'upsert'], true))
                return new WP_Error('invalid_mode', 'mode inválido', ['status' => 400]);
            if (!in_array($match_by, ['id', 'email', 'username'], true))
                return new WP_Error('invalid_match', 'match_by inválido', ['status' => 400]);
            if (!is_array($rows) || !$rows)
                return new WP_Error('invalid', 'customers/rows vacío', ['status' => 400]);

            $out = [];
            foreach ($rows as $i => $d) {
                try {
                    $d = (array) $d;
                    $email = sanitize_email($d['email'] ?? '');
                    $username = sanitize_user($d['username'] ?? '', true);

                    // resolver usuario según match_by
                    $lookup_value = $match_by === 'id' ? ($d['id'] ?? null) : ($match_by === 'email' ? $email : $username);
                    $user = $cmu_find_user($match_by, $lookup_value);

                    if ($mode === 'create') {
                        if ($user)
                            throw new Exception("Fila $i: ya existe usuario con $match_by");
                        if (!$email)
                            throw new Exception("Fila $i: email requerido");
                        if (email_exists($email))
                            throw new Exception("Fila $i: email ya existe");
                        if ($username && username_exists($username))
                            $username .= '_' . wp_generate_password(4, false, false);

                        $password = $d['password'] ?? wp_generate_password(12);
                        $role = sanitize_text_field($d['role'] ?? 'customer');
                        $uid = wp_create_user($username ?: current(explode('@', $email)), $password, $email);
                        if (is_wp_error($uid))
                            throw new Exception($uid->get_error_message());
                        if ($role)
                            wp_update_user(['ID' => $uid, 'role' => $role]);
                        if (!empty($d['meta']))
                            $cmu_apply_meta($uid, $d['meta']);

                        $out[] = ['index' => $i, 'success' => true, 'mode' => 'created', 'user_id' => $uid];

                    } elseif ($mode === 'update') {
                        if (!$user)
                            throw new Exception("Fila $i: no existe usuario por $match_by");

                        $upd = ['ID' => $user->ID];
                        if (!empty($d['email'])) {
                            $new_email = sanitize_email($d['email']);
                            $other = get_user_by('email', $new_email);
                            if ($other && (int) $other->ID !== (int) $user->ID)
                                throw new Exception("Fila $i: email ya en uso");
                            $upd['user_email'] = $new_email;
                        }
                        if (!empty($d['username'])) {
                            $new_user = sanitize_user($d['username'], true);
                            $other = get_user_by('login', $new_user);
                            if ($other && (int) $other->ID !== (int) $user->ID)
                                throw new Exception("Fila $i: username ya en uso");
                            $upd['user_login'] = $new_user;
                        }
                        if (!empty($d['password']))
                            $upd['user_pass'] = $d['password'];
                        $res = wp_update_user($upd);
                        if (is_wp_error($res))
                            throw new Exception($res->get_error_message());

                        if (!empty($d['role']))
                            (new WP_User($user->ID))->set_role(sanitize_text_field($d['role']));
                        if (!empty($d['meta']))
                            $cmu_apply_meta($user->ID, $d['meta']);

                        $out[] = ['index' => $i, 'success' => true, 'mode' => 'updated', 'user_id' => $user->ID];

                    } else { // upsert
                        if ($user) {
                            // update branch
                            $upd = ['ID' => $user->ID];
                            if (!empty($d['email'])) {
                                $new_email = sanitize_email($d['email']);
                                $other = get_user_by('email', $new_email);
                                if ($other && (int) $other->ID !== (int) $user->ID)
                                    throw new Exception("Fila $i: email ya en uso");
                                $upd['user_email'] = $new_email;
                            }
                            if (!empty($d['username'])) {
                                $new_user = sanitize_user($d['username'], true);
                                $other = get_user_by('login', $new_user);
                                if ($other && (int) $other->ID !== (int) $user->ID)
                                    throw new Exception("Fila $i: username ya en uso");
                                $upd['user_login'] = $new_user;
                            }
                            if (!empty($d['password']))
                                $upd['user_pass'] = $d['password'];
                            $res = wp_update_user($upd);
                            if (is_wp_error($res))
                                throw new Exception($res->get_error_message());

                            if (!empty($d['role']))
                                (new WP_User($user->ID))->set_role(sanitize_text_field($d['role']));
                            if (!empty($d['meta']))
                                $cmu_apply_meta($user->ID, $d['meta']);

                            $out[] = ['index' => $i, 'success' => true, 'mode' => 'updated', 'user_id' => $user->ID];

                        } else {
                            // create branch
                            if (!$email && !$username)
                                throw new Exception("Fila $i: requiere email o username");
                            if ($email && email_exists($email))
                                throw new Exception("Fila $i: email ya existe");
                            if ($username && username_exists($username))
                                $username .= '_' . wp_generate_password(4, false, false);

                            $password = $d['password'] ?? wp_generate_password(12);
                            $role = sanitize_text_field($d['role'] ?? 'customer');

                            $base_user = $username ?: ($email ? current(explode('@', $email)) : 'user_' . wp_generate_password(6, false, false));
                            $uid = wp_create_user($base_user, $password, $email ?: '');
                            if (is_wp_error($uid))
                                throw new Exception($uid->get_error_message());
                            if ($role)
                                wp_update_user(['ID' => $uid, 'role' => $role]);
                            if (!empty($d['meta']))
                                $cmu_apply_meta($uid, $d['meta']);

                            $out[] = ['index' => $i, 'success' => true, 'mode' => 'created', 'user_id' => $uid];
                        }
                    }

                } catch (Throwable $e) {
                    $out[] = ['index' => $i, 'success' => false, 'error' => $e->getMessage()];
                }
            }

            return ['success' => true, 'count' => count($out), 'results' => $out];
        }
    ]);

    // ========== MASIVO: delete por ids | emails | usernames ==========
    register_rest_route('custom-api/v1', '/customers/batch/delete', [
        'methods' => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $p = $request->get_json_params() ?: [];
            $ids = array_map('intval', $p['ids'] ?? []);
            $emails = array_map('sanitize_email', $p['emails'] ?? []);
            $usernames = array_map(function ($u) {
                return sanitize_user($u, true);
            }, $p['usernames'] ?? []);

            if (!$ids && !$emails && !$usernames) {
                return new WP_Error('invalid', 'Envía ids o emails o usernames', ['status' => 400]);
            }

            $targets = $ids;

            foreach ($emails as $e) {
                $u = get_user_by('email', $e);
                if ($u)
                    $targets[] = (int) $u->ID;
            }
            foreach ($usernames as $un) {
                $u = get_user_by('login', $un);
                if ($u)
                    $targets[] = (int) $u->ID;
            }

            $targets = array_values(array_unique(array_filter($targets)));
            $results = [];
            foreach ($targets as $uid) {
                $ok = wp_delete_user($uid);
                $results[] = ['user_id' => $uid, 'deleted' => (bool) $ok];
            }
            return ['success' => true, 'results' => $results];
        }
    ]);
});

/* ============================================================================
 * 10) CRUD de Órdenes (WooCommerce)
 * ==========================================================================*/
add_action('rest_api_init', function () {

    if (!function_exists('wc_get_order'))
        return; // Woo requerido

    // -------- Helpers --------

    // Normaliza un array asociativo (recorta strings y desescapa)
    $cmu_clean_assoc = function ($arr) {
        $out = [];
        foreach ((array) $arr as $k => $v) {
            if (is_string($v))
                $out[$k] = wp_unslash(trim($v));
            else
                $out[$k] = $v;
        }
        return $out;
    };

    // Construye líneas de items a partir de ['sku'| 'product_id', 'quantity', 'price'?, 'subtotal'?, 'total'?]
    $cmu_order_set_items = function (WC_Order $order, array $items) {
        // Elimina items existentes si vamos a reescribir
        foreach ($order->get_items() as $item_id => $item) {
            $order->remove_item($item_id);
        }

        foreach ($items as $i => $row) {
            $row = (array) $row;
            $qty = max(1, (int) ($row['quantity'] ?? 1));

            $pid = 0;
            if (!empty($row['product_id'])) {
                $pid = (int) $row['product_id'];
            } elseif (!empty($row['sku'])) {
                $pid = wc_get_product_id_by_sku(sanitize_text_field($row['sku']));
            }
            if (!$pid)
                throw new Exception("Item $i: falta product_id o sku válido");

            $product = wc_get_product($pid);
            if (!$product)
                throw new Exception("Item $i: producto inválido ($pid)");

            $item = new WC_Order_Item_Product();
            $item->set_product($product);
            $item->set_quantity($qty);

            // Permitir override de precios si se envía
            if (isset($row['subtotal']))
                $item->set_subtotal((float) $row['subtotal']);
            if (isset($row['total']))
                $item->set_total((float) $row['total']);
            // Compat: price directo
            if (isset($row['price']) && !isset($row['subtotal']) && !isset($row['total'])) {
                $price = (float) $row['price'];
                $item->set_subtotal($price * $qty);
                $item->set_total($price * $qty);
            }

            // Meta por item (opcional)
            if (!empty($row['meta']) && is_array($row['meta'])) {
                foreach ($row['meta'] as $mk => $mv) {
                    $item->add_meta_data(sanitize_key($mk), is_scalar($mv) ? wp_unslash($mv) : wp_json_encode($mv));
                }
            }

            $order->add_item($item);
        }
    };

    // Añade/reescribe líneas de envío: [{method_id?, method_title?, total, meta?}]
    $cmu_order_set_shipping = function (WC_Order $order, array $ship_lines) {
        foreach ($order->get_items('shipping') as $sid => $sitem) {
            $order->remove_item($sid);
        }
        foreach ($ship_lines as $i => $row) {
            $row = (array) $row;
            $ship = new WC_Order_Item_Shipping();
            $ship->set_method_id(sanitize_text_field($row['method_id'] ?? 'custom'));
            $ship->set_method_title(sanitize_text_field($row['method_title'] ?? 'Shipping'));
            $ship->set_total((float) ($row['total'] ?? 0));
            if (!empty($row['meta']) && is_array($row['meta'])) {
                foreach ($row['meta'] as $mk => $mv) {
                    $ship->add_meta_data(sanitize_key($mk), is_scalar($mv) ? wp_unslash($mv) : wp_json_encode($mv));
                }
            }
            $order->add_item($ship);
        }
    };

    // Añade/reescribe cupones: [{code, discount?, discount_tax?}]
    $cmu_order_set_coupons = function (WC_Order $order, array $coupons) {
        foreach ($order->get_items('coupon') as $cid => $citem) {
            $order->remove_item($cid);
        }
        foreach ($coupons as $i => $row) {
            $row = (array) $row;
            if (empty($row['code']))
                continue;
            $c = new WC_Order_Item_Coupon();
            $c->set_code(sanitize_text_field($row['code']));
            if (isset($row['discount']))
                $c->set_discount((float) $row['discount']);
            if (isset($row['discount_tax']))
                $c->set_discount_tax((float) $row['discount_tax']);
            $order->add_item($c);
        }
    };

    // Añade/reescribe fees: [{name, total, tax_class?, tax_status?}]
    $cmu_order_set_fees = function (WC_Order $order, array $fees) {
        foreach ($order->get_items('fee') as $fid => $fitem) {
            $order->remove_item($fid);
        }
        foreach ($fees as $i => $row) {
            $row = (array) $row;
            if (empty($row['name']))
                $row['name'] = 'Fee';
            $fee = new WC_Order_Item_Fee();
            $fee->set_name(sanitize_text_field($row['name']));
            $fee->set_total((float) ($row['total'] ?? 0));
            if (!empty($row['tax_class']))
                $fee->set_tax_class(sanitize_text_field($row['tax_class']));
            if (!empty($row['tax_status']))
                $fee->set_tax_status(sanitize_text_field($row['tax_status'])); // taxable|none
            $order->add_item($fee);
        }
    };

    if (!function_exists('cmu_safe_order_meta')) {
        function cmu_safe_order_meta($post_id)
        {
            $all = get_post_meta($post_id); // key => array(values)
            // Lista de exclusión por coincidencia exacta
            $deny_exact = apply_filters('cmu_order_meta_deny_exact', [
                '_shipping_packages',
                '_shipping_methods',
                '_thwcfe_ship_to_billing',
                '_thwcfe_disabled_fields',
            ], $post_id);

            // Lista de exclusión por prefijo
            $deny_prefix = apply_filters('cmu_order_meta_deny_prefix', [
                '_thwcfe_',
            ], $post_id);

            $out = [];
            foreach ($all as $k => $vals) {
                $skip = in_array($k, $deny_exact, true);
                if (!$skip && $deny_prefix) {
                    foreach ($deny_prefix as $px) {
                        if ($px !== '' && strpos($k, $px) === 0) { // empieza por prefijo
                            $skip = true;
                            break;
                        }
                    }
                }
                if ($skip)
                    continue;
                $out[$k] = $vals; // mantiene el mismo shape que get_post_meta
            }
            return $out;
        }
    }


    // Construye payload JSON de orden
    function cmu_order_payload($order_id)
    {
        $order = wc_get_order($order_id);
        if (!$order)
            return new WP_Error('not_found', 'Order not found', ['status' => 404]);

        $get_items = function ($order) {
            $out = [];
            foreach ($order->get_items() as $it) {
                $p = $it->get_product();
                $pid = $it->get_product_id();
                $sku = $p ? $p->get_sku() : null;
                $out[] = [
                    'item_id' => (int) $it->get_id(),
                    'product_id' => (int) $pid,
                    'sku' => $sku,
                    'name' => $it->get_name(),
                    'quantity' => (float) $it->get_quantity(),
                    'subtotal' => (float) $it->get_subtotal(),
                    'total' => (float) $it->get_total(),
                    'meta' => $it->get_meta_data(),
                ];
            }
            return $out;
        };
        $get_shipping = function ($order) {
            $out = [];
            foreach ($order->get_items('shipping') as $s) {
                $out[] = [
                    'item_id' => (int) $s->get_id(),
                    'method_id' => $s->get_method_id(),
                    'method_title' => $s->get_method_title(),
                    'total' => (float) $s->get_total(),
                    'meta' => $s->get_meta_data(),
                ];
            }
            return $out;
        };
        $get_coupons = function ($order) {
            $out = [];
            foreach ($order->get_items('coupon') as $c) {
                $out[] = [
                    'item_id' => (int) $c->get_id(),
                    'code' => $c->get_code(),
                    'discount' => (float) $c->get_discount(),
                    'discount_tax' => (float) $c->get_discount_tax(),
                ];
            }
            return $out;
        };
        $get_fees = function ($order) {
            $out = [];
            foreach ($order->get_items('fee') as $f) {
                $out[] = [
                    'item_id' => (int) $f->get_id(),
                    'name' => $f->get_name(),
                    'total' => (float) $f->get_total(),
                    'tax_class' => $f->get_tax_class(),
                    'tax_status' => $f->get_tax_status(),
                ];
            }
            return $out;
        };

        $descuentos = cmu_get_order_discounts($order);

        return [
            'id' => (int) $order->get_id(),
            'status' => $order->get_status(),
            'currency' => $order->get_currency(),
            'total' => (float) $order->get_total(),
            'subtotal' => (float) $order->get_subtotal(),
            'discount_total' => (float) $order->get_discount_total(),
            'shipping_total' => (float) $order->get_shipping_total(),
            'total_tax' => (float) $order->get_total_tax(),
            'payment_method' => $order->get_payment_method(),
            'payment_title' => $order->get_payment_method_title(),
            'transaction_id' => $order->get_transaction_id(),
            'date_created' => $order->get_date_created() ? $order->get_date_created()->date('c') : null,
            'date_paid' => $order->get_date_paid() ? $order->get_date_paid()->date('c') : null,
            'customer_id' => (int) $order->get_customer_id(),
            'customer_email' => $order->get_billing_email(),
            'billing' => [
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'company' => $order->get_billing_company(),
                'address_1' => $order->get_billing_address_1(),
                'address_2' => $order->get_billing_address_2(),
                'city' => $order->get_billing_city(),
                'state' => $order->get_billing_state(),
                'postcode' => $order->get_billing_postcode(),
                'country' => $order->get_billing_country(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone(),
            ],
            'shipping' => [
                'first_name' => $order->get_shipping_first_name(),
                'last_name' => $order->get_shipping_last_name(),
                'company' => $order->get_shipping_company(),
                'address_1' => $order->get_shipping_address_1(),
                'address_2' => $order->get_shipping_address_2(),
                'city' => $order->get_shipping_city(),
                'state' => $order->get_shipping_state(),
                'postcode' => $order->get_shipping_postcode(),
                'country' => $order->get_shipping_country(),
                'phone' => $order->get_meta('_shipping_phone'),
            ],
            'items' => $get_items($order),
            'shipping_lines' => $get_shipping($order),
            'coupon_lines' => $get_coupons($order),
            'fee_lines' => $get_fees($order),
            'meta' => cmu_safe_order_meta($order->get_id()),// crudo (todas las metas)
            'Descuentos' => $descuentos,
        ];
    }

    if (!function_exists('cmu_get_order_discounts')) {
        /**
         * Descuentos por orden:
         * - Items: lista solo si tienen descuento (catálogo y/o línea)
         *   - DescuentoCatalogo: (regular_price - sale_price)
         *   - DescuentoLinea: (line_subtotal - line_total)  [excluye impuestos]
         *   - DescuentoTotalProducto: suma de ambos
         * - Cupones: códigos y montos aplicados a la orden
         */
        function cmu_get_order_discounts(WC_Order $order)
        {
            $items_desc = [];

            foreach ($order->get_items('line_item') as $item_id => $item) {
                $product = $item->get_product();
                if (!$product)
                    continue;

                $name = $item->get_name();
                $sku = $product->get_sku() ?: '';
                $qty = max(1, (int) $item->get_quantity()); // evitar /0

                // ---------- Descuento de Catálogo (regular vs sale) ----------
                $regular_raw = $product->get_regular_price();
                $sale_raw = $product->get_sale_price();

                $desc_cat_unit = 0.0;
                $desc_cat_total = 0.0;
                if ($regular_raw !== '' && $sale_raw !== '') {
                    $regular = (float) $regular_raw;
                    $sale = (float) $sale_raw;
                    if ($regular > $sale) {
                        $desc_cat_unit = $regular - $sale;
                        $desc_cat_total = $desc_cat_unit * $qty;
                    }
                }

                // ---------- Descuento de Línea (cupones/reglas sobre el ítem) ----------
                // Nota: subtotal y total EXCLUYEN impuestos. Si lo quieres con impuestos, suma get_*_tax().
                $line_subtotal = (float) $item->get_subtotal();
                $line_total = (float) $item->get_total();

                $desc_line_total = max(0, $line_subtotal - $line_total);
                $desc_line_unit = $qty ? ($desc_line_total / $qty) : 0.0;

                // ---------- Solo incluir si hay algún descuento ----------
                if ($desc_cat_total > 0 || $desc_line_total > 0) {
                    $items_desc[] = [
                        'Item' => trim($name . ($sku ? " ($sku)" : '')),
                        'Nombre' => $name,
                        'Sku' => $sku,
                        'Cantidad' => $qty,

                        // Catálogo
                        'RegularPrice' => isset($regular) ? round($regular, 2) : null,
                        'SalePrice' => isset($sale) ? round($sale, 2) : null,
                        'DescuentoCatalogoUnitario' => round($desc_cat_unit, 2),
                        'DescuentoCatalogoTotal' => round($desc_cat_total, 2),

                        // Línea (por cupones/reglas sobre el ítem)
                        'PrecioLineaSubtotal' => round($line_subtotal, 2), // total del ítem antes de descuentos de línea
                        'PrecioLineaTotal' => round($line_total, 2),    // total pagado por el ítem (sin impuestos)
                        'DescuentoLineaUnitario' => round($desc_line_unit, 2),
                        'DescuentoLineaTotal' => round($desc_line_total, 2),

                        // Total por producto
                        'DescuentoTotalProducto' => round($desc_cat_total + $desc_line_total, 2),

                        'Moneda' => $order->get_currency(),
                    ];
                }
            }

            // ---------- Cupones de la orden (al final) ----------
            $cupones = [];
            foreach ($order->get_items('coupon') as $c_item) {
                $code = $c_item->get_code();
                $monto = (float) $c_item->get_discount() + (float) $c_item->get_discount_tax();
                $cupones[] = [
                    'Codigo' => $code,
                    'Monto' => round($monto, 2),
                    'Moneda' => $order->get_currency(),
                ];
            }

            return [
                'Items' => array_values($items_desc),
                'Cupones' => array_values($cupones),
            ];
        }
    }

    // --------- CREAR ---------
    register_rest_route('custom-api/v1', '/order', [
        'methods' => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) use ($cmu_clean_assoc, $cmu_order_set_items, $cmu_order_set_shipping, $cmu_order_set_coupons, $cmu_order_set_fees) {
            $d = $request->get_json_params() ?: [];

            // Cliente: por id o email
            $customer_id = 0;
            if (!empty($d['customer_id'])) {
                $customer_id = (int) $d['customer_id'];
            } elseif (!empty($d['customer_email'])) {
                $u = get_user_by('email', sanitize_email($d['customer_email']));
                if ($u)
                    $customer_id = (int) $u->ID;
            }

            $order = wc_create_order(['customer_id' => $customer_id]);

            // Billing / Shipping
            if (!empty($d['billing']))
                $order->set_address($cmu_clean_assoc($d['billing']), 'billing');
            if (!empty($d['shipping']))
                $order->set_address($cmu_clean_assoc($d['shipping']), 'shipping');
            if (!empty($d['shipping']['phone']))
                $order->update_meta_data('_shipping_phone', wp_unslash(trim($d['shipping']['phone'])));

            // Items (requeridos)
            $items = $d['items'] ?? [];
            if (!is_array($items) || !$items)
                return new WP_Error('invalid', 'Envía items (array)', ['status' => 400]);
            $cmu_order_set_items($order, $items);

            // Fees / Shipping lines / Coupons (opcionales)
            if (!empty($d['fee_lines']) && is_array($d['fee_lines']))
                $cmu_order_set_fees($order, $d['fee_lines']);
            if (!empty($d['shipping_lines']) && is_array($d['shipping_lines']))
                $cmu_order_set_shipping($order, $d['shipping_lines']);
            if (!empty($d['coupon_lines']) && is_array($d['coupon_lines']))
                $cmu_order_set_coupons($order, $d['coupon_lines']);

            // Método de pago / status
            if (!empty($d['payment_method'])) {
                $order->set_payment_method(sanitize_text_field($d['payment_method']));
                if (!empty($d['payment_method_title'])) {
                    $order->set_payment_method_title(sanitize_text_field($d['payment_method_title']));
                }
            }
            if (!empty($d['status'])) {
                $order->set_status(sanitize_text_field($d['status'])); // e.g. pending|processing|completed
            }

            // Meta libre en la orden (opcional)
            if (!empty($d['meta']) && is_array($d['meta'])) {
                foreach ($d['meta'] as $k => $v) {
                    $order->update_meta_data(sanitize_key($k), is_scalar($v) ? wp_unslash($v) : wp_json_encode($v));
                }
            }

            $order->calculate_totals();

            // Marcar como pagada (opcional)
            if (!empty($d['set_paid'])) {
                $order->payment_complete(!empty($d['transaction_id']) ? sanitize_text_field($d['transaction_id']) : '');
            } elseif (!empty($d['transaction_id'])) {
                $order->set_transaction_id(sanitize_text_field($d['transaction_id']));
            }

            $order->save();

            return ['success' => true, 'order_id' => (int) $order->get_id(), 'status' => $order->get_status()];
        }
    ]);

    // --------- LEER (uno) ---------
    register_rest_route('custom-api/v1', '/order/(?P<id>\\d+)', [
        'methods' => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $id = (int) $request['id'];
            return cmu_order_payload($id);
        }
    ]);

    // --------- LISTAR (paginado + filtros avanzados, conteo real) ---------
    register_rest_route('custom-api/v1', '/orders', [
        'methods' => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {

            // ---------- Helpers locales ----------
    
            // A: parsea lista (coma|array) a array de enteros
            $parse_id_list = function ($v) {
                if (is_array($v)) {
                    return array_values(array_filter(array_map('intval', $v)));
                }
                if (is_string($v)) {
                    $arr = array_map('trim', explode(',', $v));
                    return array_values(array_filter(array_map('intval', $arr)));
                }
                return [];
            };

            // B: normaliza status (sin prefijo wc-), soporta coma o array
            $parse_status = function ($v) {
                $to_arr = is_array($v) ? $v : (is_string($v) && $v !== '' ? preg_split('/\s*,\s*/', $v) : []);
                $out = [];
                foreach ($to_arr as $s) {
                    $s = sanitize_text_field($s);
                    if ($s === '' || strtolower($s) === 'any')
                        continue;
                    if (stripos($s, 'wc-') === 0)
                        $s = substr($s, 3);
                    $out[] = $s;
                }
                // evita duplicados
                return array_values(array_unique($out));
            };

            // C: valida y normaliza fechas (Y-m-d o ISO8601) para WC_Order_Query (after/before)
            $parse_date = function ($v) {
                if (!$v)
                    return null;
                $v = trim((string) $v);
                // strtotime soporta ISO8601/Y-m-d; si falla, null
                $ts = strtotime($v);
                if ($ts === false)
                    return null;
                // Woo acepta string 'Y-m-d H:i:s' o fecha 'Y-m-d'
                return gmdate('Y-m-d H:i:s', $ts);
            };

            // D: detección básica de email / dígitos / texto
            $looks_email = function ($s) {
                return (bool) filter_var($s, FILTER_VALIDATE_EMAIL);
            };
            $is_digits = function ($s) {
                return (bool) preg_match('/^\d+$/', $s);
            };

            // E: sanitiza operador de meta_compare
            $sanitize_meta_compare = function ($cmp) {
                $allowed = ['=', '!=', '>', '>=', '<', '<=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN', 'EXISTS', 'NOT EXISTS', 'REGEXP', 'NOT REGEXP', 'RLIKE'];
                $cmp = strtoupper(trim((string) $cmp));
                return in_array($cmp, $allowed, true) ? $cmp : null;
            };

            // ---------- Parámetros básicos ----------
            $page = max(1, (int) ($request->get_param('page') ?: 1));
            $per_page = max(1, min(200, (int) ($request->get_param('per_page') ?: 50)));

            $orderby = sanitize_text_field($request->get_param('orderby') ?: 'date'); // date|modified|id|total
            $order = strtoupper($request->get_param('order') ?: 'DESC');
            $order = in_array($order, ['ASC', 'DESC'], true) ? $order : 'DESC';

            // ---------- Construcción de args base ----------
            $args = [
                'type' => 'shop_order',
                'paginate' => true,        // <- clave: devuelve objeto con orders, total, max_num_pages
                'limit' => $per_page,
                'page' => $page,
                'return' => 'objects',   // obtendremos objetos WC_Order y luego sacamos payload
            ];

            // ---------- status (uno o varios) ----------
            $status_param = $request->get_param('status');
            $statuses = $parse_status($status_param);
            if (!empty($statuses)) {
                $args['status'] = $statuses; // array de slugs sin 'wc-'
            }
            // Si llega 'any' o vacío, NO pasar 'status' para que incluya todos
    
            // ---------- include / exclude ----------
            $include = $parse_id_list($request->get_param('include'));
            if ($include)
                $args['include'] = $include;

            $exclude = $parse_id_list($request->get_param('exclude'));
            if ($exclude)
                $args['exclude'] = $exclude;

            // ---------- customer_id / customer_email ----------
            if ($request->get_param('customer_id') !== null) {
                $args['customer'] = max(0, (int) $request->get_param('customer_id'));
            }
            $customer_email = sanitize_email($request->get_param('customer_email'));
            if ($customer_email) {
                // Filtro exacto por email de facturación si parece email válido
                $args['billing_email'] = $customer_email;
            }

            // ---------- transaction_id ----------
            $transaction_id = sanitize_text_field($request->get_param('transaction_id') ?: '');
            if ($transaction_id !== '') {
                $args['transaction_id'] = $transaction_id;
            }

            // ---------- Rangos de fecha: created ----------
            $dc_from = $parse_date($request->get_param('date_created_from'));
            $dc_to = $parse_date($request->get_param('date_created_to'));
            if ($dc_from || $dc_to) {
                $args['date_created'] = array_filter([
                    'after' => $dc_from,
                    'before' => $dc_to,
                    'inclusive' => true,
                ]);
            }

            // ---------- Rangos de fecha: modified ----------
            $dm_from = $parse_date($request->get_param('date_modified_from'));
            $dm_to = $parse_date($request->get_param('date_modified_to'));
            if ($dm_from || $dm_to) {
                $args['date_modified'] = array_filter([
                    'after' => $dm_from,
                    'before' => $dm_to,
                    'inclusive' => true,
                ]);
            }

            // ---------- Rango de totales ----------
            $min_total = $request->get_param('min_total');
            $max_total = $request->get_param('max_total');
            $meta_query = [];

            if ($min_total !== null || $max_total !== null) {
                $minv = is_numeric($min_total) ? (float) $min_total : null;
                $maxv = is_numeric($max_total) ? (float) $max_total : null;

                if ($minv !== null && $maxv !== null && $minv > $maxv) {
                    return new WP_Error('bad_request', 'min_total no puede ser mayor que max_total', ['status' => 400]);
                }

                if ($minv !== null && $maxv !== null) {
                    $meta_query[] = [
                        'key' => '_order_total',
                        'value' => [$minv, $maxv],
                        'compare' => 'BETWEEN',
                        'type' => 'NUMERIC',
                    ];
                } elseif ($minv !== null) {
                    $meta_query[] = [
                        'key' => '_order_total',
                        'value' => $minv,
                        'compare' => '>=',
                        'type' => 'NUMERIC',
                    ];
                } elseif ($maxv !== null) {
                    $meta_query[] = [
                        'key' => '_order_total',
                        'value' => $maxv,
                        'compare' => '<=',
                        'type' => 'NUMERIC',
                    ];
                }
            }

            // ---------- meta_key/meta_value/meta_compare (simple) ----------
            $meta_key = sanitize_text_field($request->get_param('meta_key') ?: '');
            $meta_value = $request->get_param('meta_value'); // puede ser string o array
            $meta_compare = $request->get_param('meta_compare');

            if ($meta_key !== '') {
                $cmp = $meta_compare !== null ? $meta_compare : '=';
                $cmp = $sanitize_meta_compare($cmp);
                if ($cmp === null) {
                    return new WP_Error('bad_request', 'meta_compare inválido', ['status' => 400]);
                }
                $mq = [
                    'key' => $meta_key,
                    'compare' => $cmp,
                ];
                if ($meta_value !== null) {
                    // Permite array para IN/NOT IN/BETWEEN
                    if (is_array($meta_value)) {
                        $san = [];
                        foreach ($meta_value as $v) {
                            $san[] = is_scalar($v) ? wp_unslash((string) $v) : wp_json_encode($v);
                        }
                        $mq['value'] = $san;
                    } else {
                        $mq['value'] = is_scalar($meta_value) ? wp_unslash((string) $meta_value) : wp_json_encode($meta_value);
                    }
                }
                // Si el valor parece numérico y el operador lo amerita, forzamos NUMERIC para ordenar/filtrar mejor
                if (isset($mq['value']) && (is_numeric($mq['value']) || (is_array($mq['value']) && count(array_filter($mq['value'], 'is_numeric')) === count($mq['value'])))) {
                    $mq['type'] = 'NUMERIC';
                }
                $meta_query[] = $mq;
            }

            // ---------- meta_query JSON avanzada (opcional) ----------
            $meta_query_json = $request->get_param('meta_query');
            if ($meta_query_json) {
                $decoded = is_array($meta_query_json) ? $meta_query_json : json_decode((string) $meta_query_json, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    // Validación muy básica de estructura
                    // Permitimos recibir directamente un array de cláusulas o un array con 'relation'/'clauses'
                    $mq_norm = $decoded;
                    // Sanitizado mínimo
                    $sanitize_clause = function ($clause) use ($sanitize_meta_compare) {
                        if (!is_array($clause))
                            return null;
                        $out = [];
                        foreach ($clause as $k => $v) {
                            switch ($k) {
                                case 'key':
                                    $out['key'] = sanitize_text_field((string) $v);
                                    break;
                                case 'value':
                                    $out['value'] = $v;
                                    break; // se deja libre (puede ser array)
                                case 'compare':
                                    $cmp = $sanitize_meta_compare($v);
                                    if ($cmp === null)
                                        return null;
                                    $out['compare'] = $cmp;
                                    break;
                                case 'type':
                                    // NUMERIC/CHAR/BINARY/DATE/DATETIME/DECIMAL etc. (dejamos pasar tras sanitize_text_field)
                                    $out['type'] = sanitize_text_field((string) $v);
                                    break;
                                case 'relation':
                                    $rel = strtoupper((string) $v);
                                    $out['relation'] = in_array($rel, ['AND', 'OR'], true) ? $rel : 'AND';
                                    break;
                                default:
                                    // ignora claves desconocidas
                                    break;
                            }
                        }
                        return $out;
                    };

                    if (isset($mq_norm['relation']) || array_keys($mq_norm) !== range(0, count($mq_norm) - 1)) {
                        // Forma asociativa (posible 'relation' + cláusulas con índices)
                        $relation = isset($mq_norm['relation']) ? strtoupper((string) $mq_norm['relation']) : 'AND';
                        $relation = in_array($relation, ['AND', 'OR'], true) ? $relation : 'AND';
                        $composed = ['relation' => $relation];

                        foreach ($mq_norm as $k => $v) {
                            if ($k === 'relation')
                                continue;
                            $cl = $sanitize_clause($v);
                            if ($cl)
                                $composed[] = $cl;
                        }
                        if (count($composed) > 1) {
                            $meta_query[] = $composed;
                        }
                    } else {
                        // Lista de cláusulas simples
                        $block = [];
                        foreach ($mq_norm as $clause) {
                            $cl = $sanitize_clause($clause);
                            if ($cl)
                                $block[] = $cl;
                        }
                        if ($block)
                            $meta_query = array_merge($meta_query, $block);
                    }
                } else {
                    return new WP_Error('bad_request', 'meta_query JSON inválido', ['status' => 400]);
                }
            }

            if ($meta_query) {
                // Si ya hay varias, añadimos relation AND por defecto
                if (!isset($meta_query['relation'])) {
                    $args['meta_query'] = array_merge(['relation' => 'AND'], $meta_query);
                } else {
                    $args['meta_query'] = $meta_query;
                }
            }

            // ---------- search flexible ----------
            $search = (string) ($request->get_param('search') ?? '');
            $search = trim(wp_unslash($search));
            if ($search !== '') {
                if ($is_digits($search)) {
                    // ID exacto
                    $args['include'] = [(int) $search];
                } elseif ($looks_email($search)) {
                    $args['billing_email'] = sanitize_email($search);
                } else {
                    // 1) Intentar número de pedido estilo "#1234" o secuencial sin '#'
                    $maybe_num = ltrim($search, "# \t\n\r\0\x0B");
                    if ($is_digits($maybe_num)) {
                        // Muchos sitios usan _order_number (Sequential Order Numbers)
                        $args['meta_query'][] = [
                            'key' => '_order_number',
                            'value' => $maybe_num,
                            'compare' => '=',
                        ];
                    } else {
                        // 2) Búsqueda por nombre/apellido y, opcional, teléfono
                        // Nota: Woo no tiene args nativos para LIKE en first/last phone, vamos por meta_query
                        $like = '%' . $GLOBALS['wpdb']->esc_like($search) . '%';
                        $name_block = [
                            'relation' => 'OR',
                            [
                                'key' => '_billing_first_name',
                                'value' => $like,
                                'compare' => 'LIKE',
                            ],
                            [
                                'key' => '_billing_last_name',
                                'value' => $like,
                                'compare' => 'LIKE',
                            ],
                        ];
                        // Si además el texto parece teléfono (contiene dígitos suficientes), incluimos phone
                        if (preg_match('/\d{3,}/', $search)) {
                            $name_block[] = [
                                'key' => '_billing_phone',
                                'value' => $like,
                                'compare' => 'LIKE',
                            ];
                        }

                        // Empujar bloque OR junto a otros meta_query
                        if (!isset($args['meta_query'])) {
                            $args['meta_query'] = ['relation' => 'AND', $name_block];
                        } else {
                            // Si ya existe meta_query, enganchar el bloque
                            if (!isset($args['meta_query']['relation'])) {
                                $args['meta_query'] = array_merge(['relation' => 'AND'], $args['meta_query']);
                            }
                            $args['meta_query'][] = $name_block;
                        }
                    }
                }
            }

            // ---------- orderby mapping ----------
            // Woo soporta: 'date', 'modified', 'id', 'include' y meta_value(_num)
            switch ($orderby) {
                case 'id':
                    $args['orderby'] = 'ID';
                    $args['order'] = $order;
                    break;
                case 'modified':
                    $args['orderby'] = 'modified';
                    $args['order'] = $order;
                    break;
                case 'total':
                    // Ordenar por total requiere meta_key=_order_total + meta_value_num
                    $args['meta_key'] = '_order_total';
                    $args['orderby'] = 'meta_value_num';
                    $args['order'] = $order;
                    break;
                case 'date':
                default:
                    $args['orderby'] = 'date';
                    $args['order'] = $order;
                    break;
            }

            // ---------- Ejecutar query paginada ----------
            $q = wc_get_orders($args); // objeto: ->orders (array), ->total (int), ->max_num_pages (int)
    
            // ---------- Armar respuesta ----------
            $rows = [];
            foreach ((array) $q->orders as $order) {
                // $order es WC_Order
                $rows[] = cmu_order_payload($order->get_id());
            }

            return [
                'success' => true,
                'page' => (int) $page,
                'per_page' => (int) $per_page,
                'total' => (int) $q->total,           // conteo real de la misma consulta
                'max_pages' => (int) $q->max_num_pages,   // páginas calculadas por WC
                'rows' => $rows,
            ];
        }
    ]);

    // --------- ACTUALIZAR (replace items si se envían) ---------
    register_rest_route('custom-api/v1', '/order/(?P<id>\\d+)', [
        'methods' => 'PUT',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) use ($cmu_clean_assoc, $cmu_order_set_items, $cmu_order_set_shipping, $cmu_order_set_coupons, $cmu_order_set_fees) {
            $id = (int) $request['id'];
            $order = wc_get_order($id);
            if (!$order)
                return new WP_Error('not_found', 'Order not found', ['status' => 404]);

            $d = $request->get_json_params() ?: [];

            // Direcciones
            if (array_key_exists('billing', $d))
                $order->set_address($cmu_clean_assoc($d['billing'] ?: []), 'billing');
            if (array_key_exists('shipping', $d))
                $order->set_address($cmu_clean_assoc($d['shipping'] ?: []), 'shipping');
            if (!empty($d['shipping']['phone']) || array_key_exists('shipping', $d)) {
                $phone = $d['shipping']['phone'] ?? '';
                if ($phone === '')
                    $order->delete_meta_data('_shipping_phone');
                else
                    $order->update_meta_data('_shipping_phone', wp_unslash(trim($phone)));
            }

            // Items: si se envía "items", reemplaza todos
            if (array_key_exists('items', $d)) {
                $items = (array) $d['items'];
                if ($items)
                    $cmu_order_set_items($order, $items);
                else {
                    // si viene vacío, significa limpiar
                    foreach ($order->get_items() as $iid => $it)
                        $order->remove_item($iid);
                }
            }

            // Fees, Shipping lines, Coupons
            if (array_key_exists('fee_lines', $d)) {
                $fees = (array) $d['fee_lines'];
                if ($fees)
                    $cmu_order_set_fees($order, $fees);
                else
                    foreach ($order->get_items('fee') as $fid => $f)
                        $order->remove_item($fid);
            }
            if (array_key_exists('shipping_lines', $d)) {
                $ship = (array) $d['shipping_lines'];
                if ($ship)
                    $cmu_order_set_shipping($order, $ship);
                else
                    foreach ($order->get_items('shipping') as $sid => $s)
                        $order->remove_item($sid);
            }
            if (array_key_exists('coupon_lines', $d)) {
                $cps = (array) $d['coupon_lines'];
                if ($cps)
                    $cmu_order_set_coupons($order, $cps);
                else
                    foreach ($order->get_items('coupon') as $cid => $c)
                        $order->remove_item($cid);
            }

            // Cliente / pago / status
            if (array_key_exists('customer_id', $d))
                $order->set_customer_id((int) $d['customer_id']);
            if (!empty($d['payment_method']))
                $order->set_payment_method(sanitize_text_field($d['payment_method']));
            if (!empty($d['payment_method_title']))
                $order->set_payment_method_title(sanitize_text_field($d['payment_method_title']));
            if (!empty($d['status']))
                $order->set_status(sanitize_text_field($d['status']));

            // Meta libre
            if (!empty($d['meta']) && is_array($d['meta'])) {
                foreach ($d['meta'] as $k => $v) {
                    $order->update_meta_data(sanitize_key($k), is_scalar($v) ? wp_unslash($v) : wp_json_encode($v));
                }
            }

            // Totales
            $order->calculate_totals();

            // Pago/Transacción
            if (!empty($d['set_paid'])) {
                $order->payment_complete(!empty($d['transaction_id']) ? sanitize_text_field($d['transaction_id']) : '');
            } elseif (!empty($d['transaction_id'])) {
                $order->set_transaction_id(sanitize_text_field($d['transaction_id']));
            }

            $order->save();

            return ['success' => true, 'order_id' => $order->get_id(), 'status' => $order->get_status(), 'mode' => 'updated'];
        }
    ]);

    // --------- BORRAR ---------
    register_rest_route('custom-api/v1', '/order/(?P<id>\\d+)', [
        'methods' => 'DELETE',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) {
            $id = (int) $request['id'];
            $order = wc_get_order($id);
            if (!$order)
                return new WP_Error('not_found', 'Order not found', ['status' => 404]);
            $ok = wp_delete_post($id, true);
            if (!$ok)
                return new WP_Error('delete_failed', 'No se pudo eliminar', ['status' => 500]);
            return ['success' => true, 'deleted_id' => $id];
        }
    ]);

    /* ---------- POST /orders/batch (create_only) ---------- */
    register_rest_route('custom-api/v1', '/orders/batch', [
        'methods' => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) use ($cmu_clean_assoc, $cmu_order_set_items, $cmu_order_set_shipping, $cmu_order_set_coupons, $cmu_order_set_fees) {
            $p = $request->get_json_params() ?: [];
            $rows = $p['orders'] ?? $p['rows'] ?? [];
            if (!is_array($rows) || !$rows) {
                return new WP_Error('invalid_data', 'Envía "orders" (array de objetos).', ['status' => 400]);
            }

            $results = [];
            foreach ($rows as $i => $d) {
                try {
                    $d = (array) $d;

                    // Validación mínima
                    $items = $d['items'] ?? [];
                    if (!is_array($items) || !$items)
                        throw new Exception("Fila $i: falta items (array)");

                    // Cliente por id o email
                    $customer_id = 0;
                    if (!empty($d['customer_id'])) {
                        $customer_id = (int) $d['customer_id'];
                    } elseif (!empty($d['customer_email'])) {
                        $u = get_user_by('email', sanitize_email($d['customer_email']));
                        if ($u)
                            $customer_id = (int) $u->ID;
                    }

                    $order = wc_create_order(['customer_id' => $customer_id]);

                    // Billing / Shipping
                    if (!empty($d['billing']))
                        $order->set_address($cmu_clean_assoc($d['billing']), 'billing');
                    if (!empty($d['shipping']))
                        $order->set_address($cmu_clean_assoc($d['shipping']), 'shipping');
                    if (!empty($d['shipping']['phone']))
                        $order->update_meta_data('_shipping_phone', wp_unslash(trim($d['shipping']['phone'])));

                    // Items obligatorios
                    $cmu_order_set_items($order, $items);

                    // Fees / Shipping / Coupons (opcionales)
                    if (!empty($d['fee_lines']) && is_array($d['fee_lines']))
                        $cmu_order_set_fees($order, $d['fee_lines']);
                    if (!empty($d['shipping_lines']) && is_array($d['shipping_lines']))
                        $cmu_order_set_shipping($order, $d['shipping_lines']);
                    if (!empty($d['coupon_lines']) && is_array($d['coupon_lines']))
                        $cmu_order_set_coupons($order, $d['coupon_lines']);

                    // Pago / status
                    if (!empty($d['payment_method'])) {
                        $order->set_payment_method(sanitize_text_field($d['payment_method']));
                        if (!empty($d['payment_method_title'])) {
                            $order->set_payment_method_title(sanitize_text_field($d['payment_method_title']));
                        }
                    }
                    if (!empty($d['status'])) {
                        $order->set_status(sanitize_text_field($d['status']));
                    }

                    // Meta libre
                    if (!empty($d['meta']) && is_array($d['meta'])) {
                        foreach ($d['meta'] as $k => $v) {
                            $order->update_meta_data(sanitize_key($k), is_scalar($v) ? wp_unslash($v) : wp_json_encode($v));
                        }
                    }

                    $order->calculate_totals();

                    // Pago/Transacción
                    if (!empty($d['set_paid'])) {
                        $order->payment_complete(!empty($d['transaction_id']) ? sanitize_text_field($d['transaction_id']) : '');
                    } elseif (!empty($d['transaction_id'])) {
                        $order->set_transaction_id(sanitize_text_field($d['transaction_id']));
                    }

                    $order->save();

                    $results[] = ['index' => $i, 'success' => true, 'mode' => 'created', 'order_id' => (int) $order->get_id(), 'status' => $order->get_status()];

                } catch (Throwable $e) {
                    $results[] = ['index' => $i, 'success' => false, 'error' => $e->getMessage()];
                }
            }

            return ['success' => true, 'count' => count($results), 'results' => $results];
        }
    ]);

    /* ---------- PUT /orders/batch (update_only) ---------- */
    register_rest_route('custom-api/v1', '/orders/batch', [
        'methods' => 'PUT',
        'permission_callback' => 'cmu_permission',
        'callback' => function (WP_REST_Request $request) use ($cmu_clean_assoc, $cmu_order_set_items, $cmu_order_set_shipping, $cmu_order_set_coupons, $cmu_order_set_fees) {
            $p = $request->get_json_params() ?: [];
            $rows = $p['orders'] ?? $p['updates'] ?? $p['rows'] ?? [];
            if (!is_array($rows) || !$rows) {
                return new WP_Error('invalid_data', 'Envía "orders" (array con "id").', ['status' => 400]);
            }

            $results = [];
            foreach ($rows as $i => $d) {
                try {
                    $d = (array) $d;
                    $id = isset($d['id']) ? (int) $d['id'] : 0;
                    if (!$id)
                        throw new Exception("Fila $i: falta id");

                    $order = wc_get_order($id);
                    if (!$order) {
                        $results[] = ['index' => $i, 'success' => false, 'id' => $id, 'error' => 'Orden no encontrada'];
                        continue;
                    }

                    // Direcciones (replace si se envían)
                    if (array_key_exists('billing', $d))
                        $order->set_address($cmu_clean_assoc($d['billing'] ?: []), 'billing');
                    if (array_key_exists('shipping', $d))
                        $order->set_address($cmu_clean_assoc($d['shipping'] ?: []), 'shipping');
                    if (!empty($d['shipping']['phone']) || array_key_exists('shipping', $d)) {
                        $phone = $d['shipping']['phone'] ?? '';
                        if ($phone === '')
                            $order->delete_meta_data('_shipping_phone');
                        else
                            $order->update_meta_data('_shipping_phone', wp_unslash(trim($phone)));
                    }

                    // Items (si viene, reemplaza todo; si [], limpia)
                    if (array_key_exists('items', $d)) {
                        $items = (array) $d['items'];
                        if ($items)
                            $cmu_order_set_items($order, $items);
                        else
                            foreach ($order->get_items() as $iid => $it)
                                $order->remove_item($iid);
                    }

                    // Fees / Shipping / Coupons (replace si se envían)
                    if (array_key_exists('fee_lines', $d)) {
                        $fees = (array) $d['fee_lines'];
                        if ($fees)
                            $cmu_order_set_fees($order, $fees);
                        else
                            foreach ($order->get_items('fee') as $fid => $f)
                                $order->remove_item($fid);
                    }
                    if (array_key_exists('shipping_lines', $d)) {
                        $ship = (array) $d['shipping_lines'];
                        if ($ship)
                            $cmu_order_set_shipping($order, $ship);
                        else
                            foreach ($order->get_items('shipping') as $sid => $s)
                                $order->remove_item($sid);
                    }
                    if (array_key_exists('coupon_lines', $d)) {
                        $cps = (array) $d['coupon_lines'];
                        if ($cps)
                            $cmu_order_set_coupons($order, $cps);
                        else
                            foreach ($order->get_items('coupon') as $cid => $c)
                                $order->remove_item($cid);
                    }

                    // Cliente / pago / status
                    if (array_key_exists('customer_id', $d))
                        $order->set_customer_id((int) $d['customer_id']);
                    if (!empty($d['payment_method']))
                        $order->set_payment_method(sanitize_text_field($d['payment_method']));
                    if (!empty($d['payment_method_title']))
                        $order->set_payment_method_title(sanitize_text_field($d['payment_method_title']));
                    if (!empty($d['status']))
                        $order->set_status(sanitize_text_field($d['status']));

                    // Meta libre
                    if (!empty($d['meta']) && is_array($d['meta'])) {
                        foreach ($d['meta'] as $k => $v) {
                            $order->update_meta_data(sanitize_key($k), is_scalar($v) ? wp_unslash($v) : wp_json_encode($v));
                        }
                    }

                    // Totales
                    $order->calculate_totals();

                    // Pago/Transacción
                    if (!empty($d['set_paid'])) {
                        $order->payment_complete(!empty($d['transaction_id']) ? sanitize_text_field($d['transaction_id']) : '');
                    } elseif (!empty($d['transaction_id'])) {
                        $order->set_transaction_id(sanitize_text_field($d['transaction_id']));
                    }

                    $order->save();

                    $results[] = ['index' => $i, 'success' => true, 'mode' => 'updated', 'order_id' => $order->get_id(), 'status' => $order->get_status()];

                } catch (Throwable $e) {
                    $results[] = ['index' => $i, 'success' => false, 'error' => $e->getMessage()];
                }
            }

            return ['success' => true, 'count' => count($results), 'results' => $results];
        }
    ]);

    /* ---------- GET & POST /item-ptc (Gestión de reglas PTC) ---------- */
    register_rest_route('custom-api/v1', '/item-ptc', [
        [
            'methods' => 'GET',
            'permission_callback' => 'cmu_permission',
            'callback' => function (WP_REST_Request $request) {
                global $wpdb;
                $table = $wpdb->prefix . 'item_ptc';
                if ($wpdb->get_var("SHOW TABLES LIKE '$table'") != $table) {
                    return new WP_Error('no_table', "La tabla $table no existe", ['status' => 404]);
                }

                // Filtros opcionales
                $where = [];
                $params = [];
                if (isset($request['fecha_valida'])) {
                    $date = sanitize_text_field($request['fecha_valida']);
                    $where[] = "FECHA_INICIO <= %s AND FECHA_FIN >= %s";
                    $params[] = $date;
                    $params[] = $date;
                }

                $sql = "SELECT * FROM $table";
                if (!empty($where))
                    $sql .= " WHERE " . implode(" AND ", $where);

                return empty($params) ? $wpdb->get_results($sql) : $wpdb->get_results($wpdb->prepare($sql, $params));
            }
        ],
        [
            'methods' => 'POST',
            'permission_callback' => 'cmu_permission', // Requiere API Key válida
            'callback' => function (WP_REST_Request $request) {
                global $wpdb;
                $table = $wpdb->prefix . 'item_ptc';

                $data = $request->get_json_params();
                if (!$data)
                    $data = $request->get_body_params();

                // Validacion basica
                if (empty($data['item_id']) || empty($data['item_id_recambio'])) {
                    return new WP_Error('missing_fields', 'Faltan campos obligatorios: item_id, item_id_recambio', ['status' => 400]);
                }

                $item_id = sanitize_text_field($data['item_id']);
                $item_id_recambio = sanitize_text_field($data['item_id_recambio']);
                $por_compra_de = intval($data['por_compra_de'] ?? 1);
                $recibe_ptc = intval($data['recibe_ptc'] ?? 1);
                $tope_maximo = intval($data['tope_maximo'] ?? 0);
                $limite_usuario = intval($data['limite_por_usuario'] ?? 0);
                $fecha_inicio = sanitize_text_field($data['fecha_inicio'] ?? date('Y-m-d'));
                $fecha_fin = sanitize_text_field($data['fecha_fin'] ?? date('Y-12-31'));

                // Campos opcionales / legacy
                $acumula_sn = isset($data['acumula_sn']) ? intval($data['acumula_sn']) : 0;
                $canal_id = isset($data['canal_id']) ? sanitize_text_field($data['canal_id']) : '1';
                $area_id = isset($data['area_id']) ? sanitize_text_field($data['area_id']) : '';

                // Verificar si ya existe regla para este item para actualizar o insertar
                // Asumimos 1 regla activa por ITEM_ID para simplificar
                $exists = $wpdb->get_var($wpdb->prepare("SELECT ITEM_PTC_ID FROM $table WHERE ITEM_ID = %s", $item_id));

                if ($exists) {
                    $updated = $wpdb->update(
                        $table,
                        [
                            'ITEM_ID_RECAMBIO' => $item_id_recambio,
                            'POR_COMPRA_DE' => $por_compra_de,
                            'RECIBE_PTC' => $recibe_ptc,
                            'FECHA_INICIO' => $fecha_inicio,
                            'FECHA_FIN' => $fecha_fin,
                            'TOPE_MAXIMO' => $tope_maximo,
                            'LIMITE_POR_USUARIO' => $limite_usuario,
                            'ACUMULA_SN' => $acumula_sn,
                            'CANAL_ID' => $canal_id,
                            'AREA_ID' => $area_id
                        ],
                        ['ITEM_ID' => $item_id],
                        ['%s', '%d', '%d', '%s', '%s', '%d', '%d', '%d', '%s', '%s'],
                        ['%s']
                    );
                    return ['success' => true, 'action' => 'updated', 'id' => $exists, 'msg' => 'Regla actualizada correctamente'];
                } else {
                    $inserted = $wpdb->insert(
                        $table,
                        [
                            'ITEM_ID' => $item_id,
                            'ITEM_ID_RECAMBIO' => $item_id_recambio,
                            'POR_COMPRA_DE' => $por_compra_de,
                            'RECIBE_PTC' => $recibe_ptc,
                            'FECHA_INICIO' => $fecha_inicio,
                            'FECHA_FIN' => $fecha_fin,
                            'TOPE_MAXIMO' => $tope_maximo,
                            'LIMITE_POR_USUARIO' => $limite_usuario,
                            'ACUMULA_SN' => $acumula_sn,
                            'CANAL_ID' => $canal_id,
                            'AREA_ID' => $area_id
                        ],
                        ['%s', '%s', '%d', '%d', '%s', '%s', '%d', '%d', '%d', '%s', '%s']
                    );
                    return ['success' => true, 'action' => 'created', 'id' => $wpdb->insert_id, 'msg' => 'Regla creada correctamente'];
                }
            }
        ]
    ]);

    /* ---------- GET /test-ptc-logic (ENDPOINT DE PRUEBA) ---------- */
    // Permite validar la lógica de cálculo sin alterar el carrito real
    // Ejemplo: /wp-json/custom-api/v1/test-ptc-logic?sku=4488&qty=3
    register_rest_route('custom-api/v1', '/test-ptc-logic', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function (WP_REST_Request $request) {
            global $wpdb;
            $table = $wpdb->prefix . 'item_ptc';
            $sku = $request->get_param('sku');
            $qty = intval($request->get_param('qty'));
            if (!$sku || !$qty)
                return new WP_Error('missing_params', 'Faltan parámetros', ['status' => 400]);

            $hoy = date('Y-m-d');
            $query = $wpdb->prepare("SELECT * FROM $table WHERE ITEM_ID = %s AND FECHA_INICIO <= %s AND FECHA_FIN >= %s LIMIT 1", $sku, $hoy, $hoy);
            $regla = $wpdb->get_row($query);

            if (!$regla)
                return ['msg' => 'No hay regla activa', 'sku' => $sku];

            if (!$regla)
                return ['msg' => 'No hay regla activa', 'sku' => $sku];

            $por_compra = intval($regla->POR_COMPRA_DE);
            $recibe = intval($regla->RECIBE_PTC);
            $tope_maximo = isset($regla->TOPE_MAXIMO) ? intval($regla->TOPE_MAXIMO) : 0;
            $limite_user = isset($regla->LIMITE_POR_USUARIO) ? intval($regla->LIMITE_POR_USUARIO) : 0;

            if ($por_compra <= 0)
                return ['error' => 'Config < 0'];

            $veces_aplica = floor($qty / $por_compra);
            $veces_aplica_real = $veces_aplica;

            if ($limite_user > 0 && $veces_aplica > $limite_user) {
                $veces_aplica_real = $limite_user;
            }

            $total_regalo = $veces_aplica_real * $recibe;

            if ($tope_maximo > 0 && $total_regalo > $tope_maximo) {
                $total_regalo = $tope_maximo;
            }

            return [
                'sku' => $sku,
                'qty_in' => $qty,
                'regla' => $regla,
                'veces_aplica_teorico' => $veces_aplica,
                'veces_aplica_real' => $veces_aplica_real,
                'total_regalo' => $total_regalo,
                'limites' => [
                    'tope_maximo_unidades' => $tope_maximo,
                    'limite_combos_usuario' => $limite_user
                ]
            ];
        }
    ]);
});

/* ============================================================================
 * 23) Inject PTC Rules into Standard WooCommerce API Response
 * ==========================================================================*/
add_filter('woocommerce_rest_prepare_product_object', 'agregar_campo_ptc_api_standard', 10, 3);

function agregar_campo_ptc_api_standard($response, $object, $request)
{
    global $wpdb;

    // Solo si el objeto data existe
    if (empty($response->data))
        return $response;

    $sku = $object->get_sku();
    if (empty($sku)) {
        $response->data['ptc_rule'] = null;
        return $response;
    }

    $tabla = $wpdb->prefix . 'item_ptc';
    $hoy = date('Y-m-d');

    // Verificar si la tabla existe (cacheado si es posible, pero aquí hacemos query directo seguro)
    // Para optimizar, podríamos asumir que existe si el plugin está activo.

    // Consulta optimizada buscando regla activa por fecha
    $query = $wpdb->prepare(
        "SELECT * FROM $tabla 
         WHERE ITEM_ID = %s 
         AND FECHA_INICIO <= %s 
         AND FECHA_FIN >= %s 
         LIMIT 1",
        $sku,
        $hoy,
        $hoy
    );

    $regla = $wpdb->get_row($query, ARRAY_A);

    if ($regla) {
        $buy_x = (int) $regla['POR_COMPRA_DE'];
        $get_y = (int) $regla['RECIBE_PTC'];

        // Evitar división por cero o reglas mal formadas
        if ($buy_x > 0) {
            $response->data['ptc_rule'] = [
                'is_active' => true,
                'buy_x' => $buy_x,
                'get_y' => $get_y,
                'gift_sku' => $regla['ITEM_ID_RECAMBIO'],
                'max_global' => (int) $regla['TOPE_MAXIMO'],
                'max_user' => (int) $regla['LIMITE_POR_USUARIO'],
                // Label amigable: "Pague 2 Lleve 4" (si compra 2 y regalan 2)
                'display_label' => "Pague $buy_x Lleve " . ($buy_x + $get_y)
            ];
        }
    } else {
        $response->data['ptc_rule'] = null;
    }

    return $response;
}
