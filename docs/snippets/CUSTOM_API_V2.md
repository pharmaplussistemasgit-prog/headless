/* === Custom API Unificada (para pegar en Code Snippets o functions.php) === */
if (!defined('ABSPATH')) { exit; }

/** CONFIG **/
if (!defined('CUSTOM_API_KEY')) {
    define('CUSTOM_API_KEY', 'rwYK B0nN kHbq ujB3 XRbZ slCt');
}

/** AUTH **/
if (!function_exists('cmu_auth')) {
function cmu_auth(WP_REST_Request $request) {
    $key = $request->get_header('X-API-KEY');
    return $key && hash_equals(CUSTOM_API_KEY, $key);
}}
if (!function_exists('cmu_permission')) {
function cmu_permission(WP_REST_Request $request) {
    if (!cmu_auth($request)) return new WP_Error('unauthorized', 'Invalid API Key', ['status'=>403]);
    return true;
}}

/** HELPERS: imágenes con caché por URL **/
if (!function_exists('cmu_set_image_from_url_cached')) {
function cmu_set_image_from_url_cached($url) {
    if (!$url) return 0;

    // ¿Adjunto ya creado desde esta URL?
    $existing = get_posts([
        'post_type'   => 'attachment',
        'meta_key'    => '_source_url',
        'meta_value'  => $url,
        'numberposts' => 1,
        'fields'      => 'ids',
    ]);
    if (!empty($existing)) return (int)$existing[0];

    require_once ABSPATH.'wp-admin/includes/image.php';
    require_once ABSPATH.'wp-admin/includes/file.php';
    require_once ABSPATH.'wp-admin/includes/media.php';

    $tmp = download_url($url);
    if (is_wp_error($tmp)) return 0;

    $file = [
        'name'     => wp_basename(parse_url($url, PHP_URL_PATH)),
        'type'     => mime_content_type($tmp),
        'tmp_name' => $tmp,
        'error'    => 0,
        'size'     => filesize($tmp),
    ];

    $id = media_handle_sideload($file, 0);
    if (is_wp_error($id)) return 0;

    update_post_meta($id, '_source_url', esc_url_raw($url));
    return (int)$id;
}}

/** HELPERS: términos seguros (Woo/Jet) **/
if (!function_exists('cmu_valid_term_ids')) {
function cmu_valid_term_ids($names, $taxonomy) {
    if (!is_array($names)) return [];
    return array_filter(array_map(function($name) use ($taxonomy){
        $name = trim(wp_strip_all_tags($name));
        if ($name === '') return null;
        $slug = sanitize_title($name);
        $term = get_term_by('slug', $slug, $taxonomy);
        if ($term) return (int)$term->term_id;
        $created = wp_insert_term($name, $taxonomy);
        return is_wp_error($created) ? null : (int)$created['term_id'];
    }, $names));
}}

/** HELPERS: resolver IDs de productos desde SKUs o IDs */
if (!function_exists('cmu_resolve_product_ids')) {
function cmu_resolve_product_ids($list) {
    // Acepta: array de SKUs o IDs (o mixto). Devuelve array de IDs válidos.
    if (!is_array($list)) return [];
    $out = [];
    foreach ($list as $val) {
        if (is_numeric($val)) {
            $pid = (int)$val;
            if ($pid > 0 && wc_get_product($pid)) $out[] = $pid;
        } else {
            $sku = trim((string)$val);
            if ($sku !== '') {
                $pid = wc_get_product_id_by_sku($sku);
                if ($pid) $out[] = (int)$pid;
            }
        }
    }
    return array_values(array_unique($out));
}}

/** CORE: upsert de producto simple por SKU **/
if (!function_exists('cmu_upsert_simple_product')) {
function cmu_upsert_simple_product(array $data) {
    if (!class_exists('WC_Product_Simple')) return new WP_Error('woocommerce_missing','WooCommerce requerido', ['status'=>500]);

    $existing_id = 0;
    if (!empty($data['sku'])) {
        $existing_id = wc_get_product_id_by_sku($data['sku']);
    }

    $product = $existing_id ? wc_get_product($existing_id) : new WC_Product_Simple();
    if (!$product) $product = new WC_Product_Simple();

    if (!$existing_id && !empty($data['sku'])) $product->set_sku($data['sku']);
    if (!empty($data['title'])) $product->set_name($data['title']);
    if (array_key_exists('description', $data)) $product->set_description($data['description'] ?? '');
    if (array_key_exists('short_description', $data)) $product->set_short_description($data['short_description'] ?? '');
    // Precios: acepta regular_price o price + sale_price
	if (isset($data['regular_price']) || isset($data['price'])) {
		$product->set_regular_price((string)($data['regular_price'] ?? $data['price']));
	}
	if (isset($data['sale_price'])) {
		$product->set_sale_price((string)$data['sale_price']);
	}
    if (isset($data['stock_quantity'])) $product->set_stock_quantity((int)$data['stock_quantity']);
    if (!empty($data['stock_status'])) $product->set_stock_status($data['stock_status']);
    if (!empty($data['status'])) $product->set_status($data['status']);
    if (!$existing_id && empty($data['status'])) $product->set_status('publish');

    $product->save();
    $id = (int)$product->get_id();

    // Imagen destacada
    if (!empty($data['image'])) {
        $img_id = cmu_set_image_from_url_cached($data['image']);
        if ($img_id) set_post_thumbnail($id, $img_id);
    }

    // Galería
    if (!empty($data['gallery']) && is_array($data['gallery'])) {
        $gallery_ids = [];
        foreach ($data['gallery'] as $u) {
            $mid = cmu_set_image_from_url_cached($u);
            if ($mid) $gallery_ids[] = $mid;
        }
        if ($gallery_ids) {
            update_post_meta($id, '_product_image_gallery', implode(',', $gallery_ids));
        } else {
            delete_post_meta($id, '_product_image_gallery');
        }
    }

    // Taxonomías Woo
    if (!empty($data['categories'])) {
        $cat_ids = cmu_valid_term_ids((array)$data['categories'], 'product_cat');
        if ($cat_ids) wp_set_object_terms($id, $cat_ids, 'product_cat', false);
    }
    if (!empty($data['tags'])) {
        $tag_ids = cmu_valid_term_ids((array)$data['tags'], 'product_tag');
        if ($tag_ids) wp_set_object_terms($id, $tag_ids, 'product_tag', false);
    }

    // Taxonomías JetEngine/custom
    if (!empty($data['jet_taxonomies']) && is_array($data['jet_taxonomies'])) {
        foreach ($data['jet_taxonomies'] as $tax => $terms) {
            if (!taxonomy_exists($tax)) continue;
            $term_ids = cmu_valid_term_ids((array)$terms, $tax);
            if ($term_ids) wp_set_object_terms($id, $term_ids, $tax, false);
        }
    }
	
	// --- Up-sells / Cross-sells SOLO por SKUs (sobrescribe relaciones) ---
	$touch_rel = false;

	if (array_key_exists('upsell_skus', $data)) {
		$upsell_skus = is_array($data['upsell_skus']) ? $data['upsell_skus'] : [];
		$upsell_ids  = cmu_resolve_product_ids($upsell_skus);
		$product->set_upsell_ids($upsell_ids); // si mandas [], limpia upsells
		$touch_rel = true;
	}

	if (array_key_exists('crosssell_skus', $data)) {
		$cross_skus = is_array($data['crosssell_skus']) ? $data['crosssell_skus'] : [];
		$cross_ids  = cmu_resolve_product_ids($cross_skus);
		$product->set_cross_sell_ids($cross_ids); // si mandas [], limpia cross-sells
		$touch_rel = true;
	}

	if ($touch_rel) {
		$product->save();
	}

    return [
        'product_id' => $id,
        'sku'        => $product->get_sku(),
        'mode'       => $existing_id ? 'updated' : 'created'
    ];
}}

/** ENDPOINTS **/
add_action('rest_api_init', function () {

    // Crear/Actualizar (upsert) individual
    register_rest_route('custom-api/v1', '/product', [
        'methods'  => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $data = $request->get_json_params() ?: [];
            $r = cmu_upsert_simple_product($data);
            if (is_wp_error($r)) return $r;
            return ['success'=>true] + $r;
        }
    ]);

    // Obtener uno
    register_rest_route('custom-api/v1', '/product/(?P<id>\d+)', [
        'methods'  => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $id = (int)$request['id'];
            $product = wc_get_product($id);
            if (!$product) return new WP_Error('not_found','Product not found',['status'=>404]);

            $image = wp_get_attachment_url(get_post_thumbnail_id($id));
            $gallery_ids = explode(',', (string)get_post_meta($id, '_product_image_gallery', true));
            $gallery_urls = array_values(array_filter(array_map('wp_get_attachment_url', array_filter($gallery_ids))));

            $get_terms_names = function ($pid, $taxonomy) {
                $terms = wp_get_post_terms($pid, $taxonomy);
                return array_map(fn($t) => $t->name, $terms);
            };

            $jet = [];
            foreach (get_object_taxonomies('product') as $tax) {
                if (in_array($tax, ['product_cat','product_tag'])) continue;
                $names = $get_terms_names($id, $tax);
                if ($names) $jet[$tax] = $names;
            }

            return [
                'id' => $id,
                'title' => $product->get_name(),
                'description' => $product->get_description(),
                'short_description' => $product->get_short_description(),
                'price' => $product->get_price(),
                'sku' => $product->get_sku(),
                'stock_quantity' => $product->get_stock_quantity(),
                'stock_status' => $product->get_stock_status(),
                'image' => $image,
                'gallery' => $gallery_urls,
                'categories' => $get_terms_names($id, 'product_cat'),
                'tags' => $get_terms_names($id, 'product_tag'),
                'jet_taxonomies' => $jet
            ];
        }
    ]);

    // Eliminar uno
    register_rest_route('custom-api/v1', '/product/(?P<id>\d+)', [
        'methods'  => 'DELETE',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $id = (int)$request['id'];
            $ok = wp_delete_post($id, true);
            if (!$ok) return new WP_Error('delete_failed','No se pudo eliminar',['status'=>500]);
            return ['success'=>true,'deleted_id'=>$id];
        }
    ]);

    // === Batch masivo (create/update por SKU) ===
    register_rest_route('custom-api/v1', '/products/batch', [
        'methods'  => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $payload = $request->get_json_params();
            $items   = $payload['products'] ?? [];
            $mode    = $payload['mode'] ?? 'auto'; // auto | create_only | update_only

            if (!is_array($items) || !$items) {
                return new WP_Error('invalid_data','Envía products como array',['status'=>400]);
            }

            // Optimizar conteos/caché durante el lote
            if (function_exists('wc_deferred_product_sync_start')) wc_deferred_product_sync_start();
            wp_suspend_cache_invalidation(true);
            wp_defer_term_counting(true);

            $results = [];
            foreach ($items as $i=>$data) {
                try {
                    $sku = $data['sku'] ?? null;
                    $exists_id = $sku ? wc_get_product_id_by_sku($sku) : 0;

                    if ($mode === 'create_only' && $exists_id) {
                        $results[] = ['index'=>$i,'success'=>false,'error'=>'SKU ya existe'];
                        continue;
                    }
                    if ($mode === 'update_only' && (!$sku || !$exists_id)) {
                        $results[] = ['index'=>$i,'success'=>false,'error'=>'SKU no existe para actualizar'];
                        continue;
                    }

                    $r = cmu_upsert_simple_product($data);
                    if (is_wp_error($r)) {
                        $results[] = ['index'=>$i,'success'=>false,'error'=>$r->get_error_message()];
                    } else {
                        $results[] = ['index'=>$i,'success'=>true] + $r;
                    }

                } catch (Throwable $e) {
                    $results[] = ['index'=>$i,'success'=>false,'error'=>$e->getMessage()];
                }
            }

            if (function_exists('wc_deferred_product_sync_end')) wc_deferred_product_sync_end();
            wp_defer_term_counting(false);
            wp_suspend_cache_invalidation(false);

            return ['success'=>true,'count'=>count($results),'results'=>$results];
        }
    ]);

    // === Borrado masivo por IDs o SKUs ===
    register_rest_route('custom-api/v1', '/products/batch/delete', [
        'methods'  => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $p = $request->get_json_params();
            $ids  = array_map('intval', $p['ids']  ?? []);
            $skus = $p['skus'] ?? [];

            if (!$ids && !$skus) return new WP_Error('invalid','Envía ids o skus',['status'=>400]);

            $targets = $ids;
            foreach ($skus as $s) {
                $pid = wc_get_product_id_by_sku(sanitize_text_field($s));
                if ($pid) $targets[] = (int)$pid;
            }
            $targets = array_values(array_unique(array_filter($targets)));

            $out = [];
            foreach ($targets as $id) {
                $ok = wp_delete_post($id, true);
                $out[] = ['id'=>$id,'deleted'=>(bool)$ok];
            }
            return ['success'=>true,'results'=>$out];
        }
    ]);

});

/* === CRUD de Tablas Personalizadas + Masivos === */

// 1) Mapa de endpoints -> tablas
add_action('rest_api_init', function () {

    $cmu_tables = [
        'cliente-descuento-item' => $GLOBALS['wpdb']->prefix . 'cliente_descuento_item',
        'convenio'               => $GLOBALS['wpdb']->prefix . 'convenio',
        'costo-tipo'             => $GLOBALS['wpdb']->prefix . 'costo_tipo',
        'descuento-call'         => $GLOBALS['wpdb']->prefix . 'descuento_call',
        'laboratorio'            => $GLOBALS['wpdb']->prefix . 'laboratorio',
        'precio-distrib'         => $GLOBALS['wpdb']->prefix . 'precio_distrib',
    ];

    foreach ($cmu_tables as $endpoint => $table_name) {

        // === Helpers por tabla ===
        $get_primary = function($table) {
            $map = [
                $GLOBALS['wpdb']->prefix . 'cliente_descuento_item' => 'CLIENTE_DESCUENTO_ITEM_ID',
                $GLOBALS['wpdb']->prefix . 'convenio'               => 'CONVENIO_ID',
                $GLOBALS['wpdb']->prefix . 'costo_tipo'             => 'COSTO_TIPO_ID',
                $GLOBALS['wpdb']->prefix . 'descuento_call'         => 'DESCUENTO_ID',
                $GLOBALS['wpdb']->prefix . 'laboratorio'            => 'LABORATORIO_ID',
                $GLOBALS['wpdb']->prefix . 'precio_distrib'         => 'PRECIO_DISTRIB_ID',
            ];
            return $map[$table] ?? 'id';
        };

        $table_columns = function($table) {
            global $wpdb;
            $cols = $wpdb->get_results("DESCRIBE `$table`", ARRAY_A);
            return $cols ? array_map(fn($r) => $r['Field'], $cols) : [];
        };

        $sanitize_row = function(array $row, array $allowed_cols) {
            // Mantener solo columnas válidas
            $clean = [];
            foreach ($row as $k => $v) {
                if (in_array($k, $allowed_cols, true)) {
                    // limpieza básica
                    if (is_string($v)) {
                        $clean[$k] = wp_unslash(wp_kses_post(trim($v)));
                    } else {
                        $clean[$k] = $v;
                    }
                }
            }
            return $clean;
        };

        // === LISTAR (GET /{endpoint}) con paginación y filtros ===
        register_rest_route('custom-api/v1', '/' . $endpoint, [
            'methods'  => 'GET',
            'permission_callback' => 'cmu_permission',
            'callback' => function(WP_REST_Request $request) use ($table_name, $get_primary, $table_columns) {
                global $wpdb;
                $primary = $get_primary($table_name);
                $cols    = $table_columns($table_name);
                if (!$cols) return new WP_Error('table_error','No se pudieron leer columnas',['status'=>500]);

                // Query params
                $page     = max(1, (int)($request->get_param('page') ?: 1));
                $per_page = min(500, max(1, (int)($request->get_param('per_page') ?: 50)));
                $orderby  = $request->get_param('orderby') ?: $primary;
                $order    = strtoupper($request->get_param('order') ?: 'DESC');
                $search   = $request->get_param('search');
                $filters  = (array) ($request->get_param('filters') ?: []);

                if (!in_array($orderby, $cols, true)) $orderby = $primary;
                if (!in_array($order, ['ASC','DESC'], true)) $order = 'DESC';

                // WHERE (filtros exactos + search en todas las columnas texto)
                $where = "WHERE 1=1";
                $params = [];
                foreach ($filters as $col => $val) {
                    if (in_array($col, $cols, true)) {
                        $where .= " AND `$col` = %s";
                        $params[] = (string)$val;
                    }
                }
                if ($search) {
                    $search_like = '%' . $wpdb->esc_like($search) . '%';
                    $parts = [];
                    foreach ($cols as $c) $parts[] = "`$c` LIKE %s";
                    $where .= " AND (" . implode(' OR ', $parts) . ")";
                    foreach ($cols as $_) $params[] = $search_like;
                }

                $offset = ($page - 1) * $per_page;

                // Total
                $sql_count = "SELECT COUNT(*) FROM `$table_name` $where";
                $total = $params ? (int) $wpdb->get_var($wpdb->prepare($sql_count, $params)) : (int) $wpdb->get_var($sql_count);

                // Data
                $sql = "SELECT * FROM `$table_name` $where ORDER BY `$orderby` $order LIMIT %d OFFSET %d";
                $params_data = $params;
                $params_data[] = $per_page;
                $params_data[] = $offset;
                $rows = $params_data ? $wpdb->get_results($wpdb->prepare($sql, $params_data), ARRAY_A) : $wpdb->get_results($sql, ARRAY_A);

                return [
                    'success'   => true,
                    'page'      => $page,
                    'per_page'  => $per_page,
                    'total'     => $total,
                    'rows'      => $rows,
                    'primary'   => $primary,
                ];
            }
        ]);

        // === OBTENER UNO (GET /{endpoint}/{id}) ===
        register_rest_route('custom-api/v1', '/' . $endpoint . '/(?P<id>\d+)', [
            'methods'  => 'GET',
            'permission_callback' => 'cmu_permission',
            'callback' => function(WP_REST_Request $request) use ($table_name, $get_primary) {
                global $wpdb;
                $id = (int)$request['id'];
                $primary = $get_primary($table_name);
                $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM `$table_name` WHERE `$primary` = %d", $id), ARRAY_A);
                if (!$row) return new WP_Error('not_found','Registro no encontrado',['status'=>404]);
                return ['success'=>true,'row'=>$row];
            }
        ]);

        // === CREAR (POST /{endpoint}) ===
        register_rest_route('custom-api/v1', '/' . $endpoint, [
            'methods'  => 'POST',
            'permission_callback' => 'cmu_permission',
            'callback' => function(WP_REST_Request $request) use ($table_name, $table_columns, $get_primary, $sanitize_row) {
                global $wpdb;
                $cols = $table_columns($table_name);
                if (!$cols) return new WP_Error('table_error','No se pudieron leer columnas',['status'=>500]);

                $primary = $get_primary($table_name);
                $data_in = $request->get_json_params() ?: [];
                $row     = $sanitize_row($data_in, $cols);
                // si el primary es autoincrement, mejor quitarlo del insert si viene vacío
                if (array_key_exists($primary, $row) && ($row[$primary] === '' || $row[$primary] === null)) {
                    unset($row[$primary]);
                }

                $ok = $wpdb->insert($table_name, $row);
                if ($ok === false) return new WP_Error('insert_failed','No se pudo insertar',['status'=>500]);

                return ['success'=>true,'insert_id'=>$wpdb->insert_id];
            }
        ]);

        // === ACTUALIZAR (PUT /{endpoint}/{id}) ===
        register_rest_route('custom-api/v1', '/' . $endpoint . '/(?P<id>\d+)', [
            'methods'  => 'PUT',
            'permission_callback' => 'cmu_permission',
            'callback' => function(WP_REST_Request $request) use ($table_name, $table_columns, $get_primary, $sanitize_row) {
                global $wpdb;
                $id = (int)$request['id'];
                $cols = $table_columns($table_name);
                if (!$cols) return new WP_Error('table_error','No se pudieron leer columnas',['status'=>500]);

                $primary = $get_primary($table_name);
                $data_in = $request->get_json_params() ?: [];
                $row     = $sanitize_row($data_in, $cols);
                unset($row[$primary]); // evitar cambiar primary

                if (!$row) return new WP_Error('invalid','No hay campos válidos para actualizar',['status'=>400]);

                $ok = $wpdb->update($table_name, $row, [$primary => $id]);
                if ($ok === false) return new WP_Error('update_failed','No se pudo actualizar',['status'=>500]);

                return ['success'=>true,'updated_id'=>$id];
            }
        ]);

        // === ELIMINAR (DELETE /{endpoint}/{id}) ===
        register_rest_route('custom-api/v1', '/' . $endpoint . '/(?P<id>\d+)', [
            'methods'  => 'DELETE',
            'permission_callback' => 'cmu_permission',
            'callback' => function(WP_REST_Request $request) use ($table_name, $get_primary) {
                global $wpdb;
                $id = (int)$request['id'];
                $primary = $get_primary($table_name);
                $ok = $wpdb->delete($table_name, [$primary => $id]);
                if ($ok === false) return new WP_Error('delete_failed','No se pudo eliminar',['status'=>500]);
                return ['success'=>true,'deleted_id'=>$id];
            }
        ]);

        // === MASIVO: create|update|upsert (POST /{endpoint}/batch) ===
        register_rest_route('custom-api/v1', '/' . $endpoint . '/batch', [
            'methods'  => 'POST',
            'permission_callback' => 'cmu_permission',
            'callback' => function(WP_REST_Request $request) use ($table_name, $table_columns, $get_primary, $sanitize_row) {
                global $wpdb;
                $payload = $request->get_json_params() ?: [];
                $rows    = $payload['rows'] ?? [];
                $mode    = strtolower($payload['mode'] ?? 'upsert'); // create|update|upsert
                $primary = $get_primary($table_name);
                $cols    = $table_columns($table_name);
                if (!$cols) return new WP_Error('table_error','No se pudieron leer columnas',['status'=>500]);

                if (!is_array($rows) || empty($rows)) {
                    return new WP_Error('invalid_data','Envía rows como array con registros.',['status'=>400]);
                }
                if (!in_array($mode, ['create','update','upsert'], true)) {
                    return new WP_Error('invalid_mode','mode debe ser create|update|upsert',['status'=>400]);
                }

                $results = [];
                $wpdb->query('START TRANSACTION');

                try {
                    foreach ($rows as $i => $input) {
                        $clean = $sanitize_row((array)$input, $cols);

                        if ($mode === 'create') {
                            // quitar PK si viene vacío
                            if (array_key_exists($primary, $clean) && ($clean[$primary] === '' || $clean[$primary] === null)) {
                                unset($clean[$primary]);
                            }
                            $ok = $wpdb->insert($table_name, $clean);
                            if ($ok === false) {
                                throw new Exception("Fila $i: fallo insert");
                            }
                            $results[] = ['index'=>$i,'success'=>true,'mode'=>'created','id'=>$wpdb->insert_id];

                        } elseif ($mode === 'update') {
                            if (empty($clean[$primary])) {
                                throw new Exception("Fila $i: falta $primary para update");
                            }
                            $pk = $clean[$primary];
                            unset($clean[$primary]);
                            if (!$clean) {
                                throw new Exception("Fila $i: sin campos a actualizar");
                            }
                            $ok = $wpdb->update($table_name, $clean, [$primary => $pk]);
                            if ($ok === false) {
                                throw new Exception("Fila $i: fallo update");
                            }
                            $results[] = ['index'=>$i,'success'=>true,'mode'=>'updated','id'=>$pk];

                        } else { // upsert
                            $has_pk = !empty($clean[$primary]);
                            if ($has_pk) {
                                $pk = $clean[$primary];
                                unset($clean[$primary]);
                                // ¿existe?
                                $exists = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `$table_name` WHERE `$primary`=%d", $pk));
                                if ($exists) {
                                    if (!$clean) {
                                        $results[] = ['index'=>$i,'success'=>true,'mode'=>'noop','id'=>$pk];
                                    } else {
                                        $ok = $wpdb->update($table_name, $clean, [$primary => $pk]);
                                        if ($ok === false) throw new Exception("Fila $i: fallo update");
                                        $results[] = ['index'=>$i,'success'=>true,'mode'=>'updated','id'=>$pk];
                                    }
                                } else {
                                    // insertar con PK si viene
                                    $clean[$primary] = $pk;
                                    $ok = $wpdb->insert($table_name, $clean);
                                    if ($ok === false) throw new Exception("Fila $i: fallo insert");
                                    $results[] = ['index'=>$i,'success'=>true,'mode'=>'created','id'=>$wpdb->insert_id];
                                }
                            } else {
                                // create sin PK
                                $ok = $wpdb->insert($table_name, $clean);
                                if ($ok === false) throw new Exception("Fila $i: fallo insert");
                                $results[] = ['index'=>$i,'success'=>true,'mode'=>'created','id'=>$wpdb->insert_id];
                            }
                        }
                    }

                    $wpdb->query('COMMIT');
                } catch (Throwable $e) {
                    $wpdb->query('ROLLBACK');
                    return new WP_Error('batch_failed', $e->getMessage(), ['status'=>500, 'partial'=>$results]);
                }

                return ['success'=>true,'count'=>count($results),'results'=>$results];
            }
        ]);

        // === MASIVO: delete por ids (POST /{endpoint}/batch/delete) ===
        register_rest_route('custom-api/v1', '/' . $endpoint . '/batch/delete', [
            'methods'  => 'POST',
            'permission_callback' => 'cmu_permission',
            'callback' => function(WP_REST_Request $request) use ($table_name, $get_primary) {
                global $wpdb;
                $primary = $get_primary($table_name);
                $p   = $request->get_json_params() ?: [];
                $ids = array_map('intval', $p['ids'] ?? []);
                if (!$ids) return new WP_Error('invalid','Envía ids (array)',['status'=>400]);

                $results = [];
                $wpdb->query('START TRANSACTION');
                try {
                    foreach ($ids as $id) {
                        $ok = $wpdb->delete($table_name, [$primary => (int)$id]);
                        $results[] = ['id'=>$id,'deleted'=> $ok !== false && $ok > 0];
                    }
                    $wpdb->query('COMMIT');
                } catch (Throwable $e) {
                    $wpdb->query('ROLLBACK');
                    return new WP_Error('batch_delete_failed', $e->getMessage(), ['status'=>500, 'partial'=>$results]);
                }

                return ['success'=>true,'results'=>$results];
            }
        ]);
    }
});

/* === CRUD de Usuarios (individual + masivo) === */
add_action('rest_api_init', function () {

    // Helpers
    $cmu_find_user = function($match_by, $value) {
        if (!$value) return false;
        switch ($match_by) {
            case 'id':       return get_userdata((int)$value);
            case 'email':    return get_user_by('email', sanitize_email($value));
            case 'username': return get_user_by('login', sanitize_user($value, true));
            default:         return false;
        }
    };
    $cmu_apply_meta = function($user_id, $meta){
        if (!is_array($meta)) return;
        foreach ($meta as $k=>$v) {
            update_user_meta($user_id, sanitize_key($k), is_scalar($v) ? wp_unslash($v) : $v);
        }
    };

    // ========== LISTAR ==========
    register_rest_route('custom-api/v1', '/customers', [
        'methods'  => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $role     = sanitize_text_field($request->get_param('role') ?: '');
            $search   = sanitize_text_field($request->get_param('search') ?: '');
            $page     = max(1, (int)($request->get_param('page') ?: 1));
            $per_page = min(200, max(1, (int)($request->get_param('per_page') ?: 50)));
            $orderby  = sanitize_text_field($request->get_param('orderby') ?: 'ID'); // ID|user_login|user_email|user_registered
            $order    = strtoupper($request->get_param('order') ?: 'DESC');
            if (!in_array($orderby, ['ID','user_login','user_email','user_registered'], true)) $orderby = 'ID';
            if (!in_array($order, ['ASC','DESC'], true)) $order = 'DESC';

            $args = [
                'number'   => $per_page,
                'paged'    => $page,
                'orderby'  => $orderby,
                'order'    => $order,
                'fields'   => 'all_with_meta',
            ];
            if ($role)   $args['role'] = $role;
            if ($search) $args['search'] = '*' . esc_attr($search) . '*';

            $q = new WP_User_Query($args);
            $users = array_map(function($u){
                return [
                    'id'       => $u->ID,
                    'username' => $u->user_login,
                    'email'    => $u->user_email,
                    'role'     => $u->roles[0] ?? null,
                    'registered' => $u->user_registered,
                ];
            }, $q->get_results());

            return [
                'success'  => true,
                'page'     => $page,
                'per_page' => $per_page,
                'total'    => (int) $q->get_total(),
                'rows'     => $users
            ];
        }
    ]);

    // ========== OBTENER UNO ==========
    register_rest_route('custom-api/v1', '/customers/(?P<id>\d+)', [
        'methods'  => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $user = get_userdata((int)$request['id']);
            if (!$user) return new WP_Error('not_found','Usuario no encontrado',['status'=>404]);
            return [
                'success'   => true,
                'id'        => $user->ID,
                'username'  => $user->user_login,
                'email'     => $user->user_email,
                'role'      => $user->roles[0] ?? null,
                'registered'=> $user->user_registered
            ];
        }
    ]);

    // ========== CREAR ==========
    register_rest_route('custom-api/v1', '/customers', [
        'methods'  => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request) use ($cmu_apply_meta){
            $d = $request->get_json_params() ?: [];
            $email = sanitize_email($d['email'] ?? '');
            $username = sanitize_user($d['username'] ?? ( $email ? current(explode('@',$email)) : '' ), true);
            $password = $d['password'] ?? wp_generate_password(12);
            $role = sanitize_text_field($d['role'] ?? 'customer');

            if (!$email) return new WP_Error('missing','email es obligatorio',['status'=>400]);
            if (email_exists($email)) return new WP_Error('exists','email ya existe',['status'=>409]);
            if ($username && username_exists($username)) $username .= '_' . wp_generate_password(4,false,false);

            $uid = wp_create_user($username ?: 'user_'.wp_generate_password(6,false,false), $password, $email);
            if (is_wp_error($uid)) return $uid;
            if ($role) wp_update_user(['ID'=>$uid,'role'=>$role]);

            if (!empty($d['meta'])) $cmu_apply_meta($uid, $d['meta']);

            return ['success'=>true,'user_id'=>$uid,'mode'=>'created'];
        }
    ]);

    // ========== ACTUALIZAR ==========
    register_rest_route('custom-api/v1', '/customers/(?P<id>\d+)', [
        'methods'  => 'PUT',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request) use ($cmu_apply_meta){
            $id = (int)$request['id'];
            $user = get_userdata($id);
            if (!$user) return new WP_Error('not_found','Usuario no encontrado',['status'=>404]);

            $d = $request->get_json_params() ?: [];
            $upd = ['ID'=>$id];

            if (!empty($d['email'])) {
                $email = sanitize_email($d['email']);
                $other = get_user_by('email', $email);
                if ($other && (int)$other->ID !== $id) return new WP_Error('exists','email ya en uso',['status'=>409]);
                $upd['user_email'] = $email;
            }
            if (!empty($d['username'])) {
                $username = sanitize_user($d['username'], true);
                $other = get_user_by('login', $username);
                if ($other && (int)$other->ID !== $id) return new WP_Error('exists','username ya en uso',['status'=>409]);
                $upd['user_login'] = $username;
            }
            if (!empty($d['password'])) $upd['user_pass'] = $d['password'];

            $res = wp_update_user($upd);
            if (is_wp_error($res)) return $res;

            if (!empty($d['role'])) {
                $role = sanitize_text_field($d['role']);
                (new WP_User($id))->set_role($role);
            }
            if (!empty($d['meta'])) $cmu_apply_meta($id, $d['meta']);

            return ['success'=>true,'user_id'=>$id,'mode'=>'updated'];
        }
    ]);

    // ========== ELIMINAR ==========
    register_rest_route('custom-api/v1', '/customers/(?P<id>\d+)', [
        'methods'  => 'DELETE',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $id = (int)$request['id'];
            $ok = wp_delete_user($id);
            if (!$ok) return new WP_Error('delete_failed','No se pudo eliminar',['status'=>500]);
            return ['success'=>true,'deleted_id'=>$id];
        }
    ]);

    // ========== MASIVO: create|update|upsert ==========
    register_rest_route('custom-api/v1', '/customers/batch', [
        'methods'  => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request) use ($cmu_find_user, $cmu_apply_meta){
            $p = $request->get_json_params() ?: [];
            $rows    = $p['customers'] ?? $p['rows'] ?? [];
            $mode    = strtolower($p['mode'] ?? 'upsert');        // create|update|upsert
            $match_by= strtolower($p['match_by'] ?? 'email');     // id|email|username
            if (!in_array($mode, ['create','update','upsert'], true)) return new WP_Error('invalid_mode','mode inválido',['status'=>400]);
            if (!in_array($match_by, ['id','email','username'], true)) return new WP_Error('invalid_match','match_by inválido',['status'=>400]);
            if (!is_array($rows) || !$rows) return new WP_Error('invalid','customers/rows vacío',['status'=>400]);

            $out = [];
            foreach ($rows as $i=>$d) {
                try {
                    $d = (array)$d;
                    $email = sanitize_email($d['email'] ?? '');
                    $username = sanitize_user($d['username'] ?? '', true);

                    // resolver usuario según match_by
                    $lookup_value = $match_by==='id' ? ($d['id'] ?? null) : ($match_by==='email' ? $email : $username);
                    $user = $cmu_find_user($match_by, $lookup_value);

                    if ($mode === 'create') {
                        if ($user) throw new Exception("Fila $i: ya existe usuario con $match_by");
                        if (!$email) throw new Exception("Fila $i: email requerido");
                        if (email_exists($email)) throw new Exception("Fila $i: email ya existe");
                        if ($username && username_exists($username)) $username .= '_' . wp_generate_password(4,false,false);
                        $password = $d['password'] ?? wp_generate_password(12);
                        $role = sanitize_text_field($d['role'] ?? 'customer');
                        $uid = wp_create_user($username ?: current(explode('@',$email)), $password, $email);
                        if (is_wp_error($uid)) throw new Exception($uid->get_error_message());
                        if ($role) wp_update_user(['ID'=>$uid,'role'=>$role]);
                        if (!empty($d['meta'])) $cmu_apply_meta($uid, $d['meta']);
                        $out[] = ['index'=>$i,'success'=>true,'mode'=>'created','user_id'=>$uid];

                    } elseif ($mode === 'update') {
                        if (!$user) throw new Exception("Fila $i: no existe usuario por $match_by");

                        $upd = ['ID'=>$user->ID];
                        if (!empty($d['email'])) {
                            $new_email = sanitize_email($d['email']);
                            $other = get_user_by('email',$new_email);
                            if ($other && (int)$other->ID !== (int)$user->ID) throw new Exception("Fila $i: email ya en uso");
                            $upd['user_email'] = $new_email;
                        }
                        if (!empty($d['username'])) {
                            $new_user = sanitize_user($d['username'], true);
                            $other = get_user_by('login',$new_user);
                            if ($other && (int)$other->ID !== (int)$user->ID) throw new Exception("Fila $i: username ya en uso");
                            $upd['user_login'] = $new_user;
                        }
                        if (!empty($d['password'])) $upd['user_pass'] = $d['password'];
                        $res = wp_update_user($upd);
                        if (is_wp_error($res)) throw new Exception($res->get_error_message());

                        if (!empty($d['role'])) (new WP_User($user->ID))->set_role(sanitize_text_field($d['role']));
                        if (!empty($d['meta'])) $cmu_apply_meta($user->ID, $d['meta']);

                        $out[] = ['index'=>$i,'success'=>true,'mode'=>'updated','user_id'=>$user->ID];

                    } else { // upsert
                        if ($user) {
                            // update branch
                            $upd = ['ID'=>$user->ID];
                            if (!empty($d['email'])) {
                                $new_email = sanitize_email($d['email']);
                                $other = get_user_by('email',$new_email);
                                if ($other && (int)$other->ID !== (int)$user->ID) throw new Exception("Fila $i: email ya en uso");
                                $upd['user_email'] = $new_email;
                            }
                            if (!empty($d['username'])) {
                                $new_user = sanitize_user($d['username'], true);
                                $other = get_user_by('login',$new_user);
                                if ($other && (int)$other->ID !== (int)$user->ID) throw new Exception("Fila $i: username ya en uso");
                                $upd['user_login'] = $new_user;
                            }
                            if (!empty($d['password'])) $upd['user_pass'] = $d['password'];
                            $res = wp_update_user($upd);
                            if (is_wp_error($res)) throw new Exception($res->get_error_message());

                            if (!empty($d['role'])) (new WP_User($user->ID))->set_role(sanitize_text_field($d['role']));
                            if (!empty($d['meta'])) $cmu_apply_meta($user->ID, $d['meta']);

                            $out[] = ['index'=>$i,'success'=>true,'mode'=>'updated','user_id'=>$user->ID];

                        } else {
                            // create branch
                            if (!$email && !$username) throw new Exception("Fila $i: requiere email o username");
                            if ($email && email_exists($email)) throw new Exception("Fila $i: email ya existe");
                            if ($username && username_exists($username)) $username .= '_' . wp_generate_password(4,false,false);
                            $password = $d['password'] ?? wp_generate_password(12);
                            $role = sanitize_text_field($d['role'] ?? 'customer');

                            $base_user = $username ?: ($email ? current(explode('@',$email)) : 'user_'.wp_generate_password(6,false,false));
                            $uid = wp_create_user($base_user, $password, $email ?: '');
                            if (is_wp_error($uid)) throw new Exception($uid->get_error_message());
                            if ($role) wp_update_user(['ID'=>$uid,'role'=>$role]);
                            if (!empty($d['meta'])) $cmu_apply_meta($uid, $d['meta']);

                            $out[] = ['index'=>$i,'success'=>true,'mode'=>'created','user_id'=>$uid];
                        }
                    }

                } catch (Throwable $e) {
                    $out[] = ['index'=>$i,'success'=>false,'error'=>$e->getMessage()];
                }
            }

            return ['success'=>true,'count'=>count($out),'results'=>$out];
        }
    ]);

    // ========== MASIVO: delete por ids | emails | usernames ==========
    register_rest_route('custom-api/v1', '/customers/batch/delete', [
        'methods'  => 'POST',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $p = $request->get_json_params() ?: [];
            $ids       = array_map('intval', $p['ids'] ?? []);
            $emails    = array_map('sanitize_email', $p['emails'] ?? []);
            $usernames = array_map(function($u){return sanitize_user($u, true);}, $p['usernames'] ?? []);

            if (!$ids && !$emails && !$usernames) {
                return new WP_Error('invalid','Envía ids o emails o usernames',['status'=>400]);
            }

            $targets = $ids;

            foreach ($emails as $e) {
                $u = get_user_by('email',$e);
                if ($u) $targets[] = (int)$u->ID;
            }
            foreach ($usernames as $un) {
                $u = get_user_by('login',$un);
                if ($u) $targets[] = (int)$u->ID;
            }

            $targets = array_values(array_unique(array_filter($targets)));
            $results = [];
            foreach ($targets as $uid) {
                $ok = wp_delete_user($uid);
                $results[] = ['user_id'=>$uid,'deleted'=>(bool)$ok];
            }
            return ['success'=>true,'results'=>$results];
        }
    ]);

});

/* === Productos por SKU (GET / PUT / DELETE) === */

/** Helper: payload de producto (reusa en GET por id/sku) */
if (!function_exists('cmu_product_payload')) {
function cmu_product_payload($id) {
    $product = wc_get_product($id);
    if (!$product) return new WP_Error('not_found','Product not found',['status'=>404]);

    $image = wp_get_attachment_url(get_post_thumbnail_id($id));
    $gallery_ids  = explode(',', (string)get_post_meta($id,'_product_image_gallery',true));
    $gallery_urls = array_values(array_filter(array_map('wp_get_attachment_url', array_filter($gallery_ids))));

    $get_terms_names = function ($pid, $taxonomy) {
        $terms = wp_get_post_terms($pid, $taxonomy);
        return array_map(fn($t)=>$t->name, $terms);
    };

    $jet = [];
    foreach (get_object_taxonomies('product') as $tax) {
        if (in_array($tax, ['product_cat','product_tag'])) continue;
        $names = $get_terms_names($id, $tax);
        if ($names) $jet[$tax] = $names;
    }

    return [
        'id'                 => (int)$id,
        'title'              => $product->get_name(),
        'description'        => $product->get_description(),
        'short_description'  => $product->get_short_description(),
        'price'              => $product->get_price(),
        'sku'                => $product->get_sku(),
        'stock_quantity'     => $product->get_stock_quantity(),
        'stock_status'       => $product->get_stock_status(),
        'image'              => $image,
        'gallery'            => $gallery_urls,
        'categories'         => $get_terms_names($id, 'product_cat'),
        'tags'               => $get_terms_names($id, 'product_tag'),
        'jet_taxonomies'     => $jet,
		'upsell_ids'        => array_map('intval', (array) $product->get_upsell_ids()),
        'crosssell_ids'     => array_map('intval', (array) $product->get_cross_sell_ids()),
        'upsell_skus'       => array_values(array_filter(array_map(function($pid){
                                    $p = wc_get_product($pid); return $p ? $p->get_sku() : null;
                                }, (array)$product->get_upsell_ids()))),
        'crosssell_skus'    => array_values(array_filter(array_map(function($pid){
                                    $p = wc_get_product($pid); return $p ? $p->get_sku() : null;
                                }, (array)$product->get_cross_sell_ids())))

    ];
}}

/** Helper: obtener ID por SKU o 404 */
if (!function_exists('cmu_get_id_by_sku_or_404')) {
function cmu_get_id_by_sku_or_404($sku) {
    $sku = is_string($sku) ? trim($sku) : '';
    if ($sku === '') return new WP_Error('invalid','SKU vacío',['status'=>400]);
    $pid = wc_get_product_id_by_sku($sku);
    if (!$pid) return new WP_Error('not_found','Product with that SKU not found',['status'=>404]);
    return (int)$pid;
}}

/** Rutas por SKU */
add_action('rest_api_init', function () {

    // GET por SKU
    register_rest_route('custom-api/v1', '/product/sku/(?P<sku>[^/]+)', [
        'methods'  => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $pid = cmu_get_id_by_sku_or_404($request['sku']);
            if (is_wp_error($pid)) return $pid;
            return cmu_product_payload($pid);
        }
    ]);

    // PUT por SKU (upsert de tus campos existentes)
    register_rest_route('custom-api/v1', '/product/sku/(?P<sku>[^/]+)', [
        'methods'  => 'PUT',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $pid = cmu_get_id_by_sku_or_404($request['sku']);
            if (is_wp_error($pid)) return $pid;

            $product = wc_get_product($pid);
            if (!$product) return new WP_Error('not_found','Product not found',['status'=>404]);

            $data = $request->get_json_params() ?: [];

            if (!empty($data['title']))             $product->set_name($data['title']);
            if (array_key_exists('description',$data))        $product->set_description($data['description'] ?? '');
            if (array_key_exists('short_description',$data))  $product->set_short_description($data['short_description'] ?? '');
            // Precios: acepta regular_price o price + sale_price
			if (isset($data['regular_price']) || isset($data['price'])) {
				$product->set_regular_price((string)($data['regular_price'] ?? $data['price']));
			}
			if (isset($data['sale_price'])) {
				$product->set_sale_price((string)$data['sale_price']);
			}

            if (isset($data['stock_quantity']))     $product->set_stock_quantity((int)$data['stock_quantity']);
            if (!empty($data['stock_status']))      $product->set_stock_status($data['stock_status']);
            if (!empty($data['status']))            $product->set_status($data['status']);
            $product->save();

            // Imagen destacada
            if (!empty($data['image'])) {
                $img_id = cmu_set_image_from_url_cached($data['image']);
                if ($img_id) set_post_thumbnail($pid, $img_id);
            }

            // Galería
            if (isset($data['gallery']) && is_array($data['gallery'])) {
                $gallery_ids = [];
                foreach ($data['gallery'] as $u) {
                    $mid = cmu_set_image_from_url_cached($u);
                    if ($mid) $gallery_ids[] = $mid;
                }
                if ($gallery_ids) {
                    update_post_meta($pid, '_product_image_gallery', implode(',', $gallery_ids));
                } else {
                    delete_post_meta($pid, '_product_image_gallery');
                }
            }

            // Taxonomías Woo
            if (!empty($data['categories'])) {
                $cat_ids = cmu_valid_term_ids((array)$data['categories'], 'product_cat');
                if ($cat_ids) wp_set_object_terms($pid, $cat_ids, 'product_cat', false);
            }
            if (!empty($data['tags'])) {
                $tag_ids = cmu_valid_term_ids((array)$data['tags'], 'product_tag');
                if ($tag_ids) wp_set_object_terms($pid, $tag_ids, 'product_tag', false);
            }

            // Taxonomías Jet/custom
            if (!empty($data['jet_taxonomies']) && is_array($data['jet_taxonomies'])) {
                foreach ($data['jet_taxonomies'] as $tax => $terms) {
                    if (!taxonomy_exists($tax)) continue;
                    $term_ids = cmu_valid_term_ids((array)$terms, $tax);
                    if ($term_ids) wp_set_object_terms($pid, $term_ids, $tax, false);
                }
            }
			
			// Up-sells / Cross-sells por SKUs (sobrescribe)
			$touch_rel = false;

			if ($request->has_param('upsell_skus') || array_key_exists('upsell_skus', $data)) {
				$upsell_skus = is_array($data['upsell_skus'] ?? []) ? $data['upsell_skus'] : [];
				$product->set_upsell_ids(cmu_resolve_product_ids($upsell_skus));
				$touch_rel = true;
			}
			if ($request->has_param('crosssell_skus') || array_key_exists('crosssell_skus', $data)) {
				$cross_skus = is_array($data['crosssell_skus'] ?? []) ? $data['crosssell_skus'] : [];
				$product->set_cross_sell_ids(cmu_resolve_product_ids($cross_skus));
				$touch_rel = true;
			}

			if ($touch_rel) $product->save();

            return ['success'=>true,'user_update'=>'ok','product_id'=>$pid,'sku'=>$request['sku'],'mode'=>'updated'];
        }
    ]);

    // DELETE por SKU
    register_rest_route('custom-api/v1', '/product/sku/(?P<sku>[^/]+)', [
        'methods'  => 'DELETE',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $pid = cmu_get_id_by_sku_or_404($request['sku']);
            if (is_wp_error($pid)) return $pid;
            $ok = wp_delete_post($pid, true);
            if (!$ok) return new WP_Error('delete_failed','No se pudo eliminar',['status'=>500]);
            return ['success'=>true,'deleted_sku'=>$request['sku'],'deleted_id'=>$pid];
        }
    ]);

});

/* === 1) PUT MASIVO POR SKU (update-only) === */
add_action('rest_api_init', function () {
    register_rest_route('custom-api/v1', '/products/sku/batch', [
        'methods'  => 'PUT',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $payload = $request->get_json_params() ?: [];
            $updates = $payload['updates'] ?? $payload['products'] ?? [];
            if (!is_array($updates) || !$updates) {
                return new WP_Error('invalid_data','Envía "updates" (array de objetos con "sku").',['status'=>400]);
            }

            // rendimiento
            if (function_exists('wc_deferred_product_sync_start')) wc_deferred_product_sync_start();
            wp_suspend_cache_invalidation(true);
            wp_defer_term_counting(true);

            $results = [];
            foreach ($updates as $i => $data) {
                try {
                    $data = (array)$data;
                    $sku  = isset($data['sku']) ? trim((string)$data['sku']) : '';
                    if ($sku === '') throw new Exception("Fila $i: falta sku");

                    $pid = wc_get_product_id_by_sku($sku);
                    if (!$pid) {
                        $results[] = ['index'=>$i,'success'=>false,'sku'=>$sku,'error'=>'SKU no encontrado (solo update)'];
                        continue;
                    }

                    // Reutiliza el updater existente (acepta mismos campos que /product)
                    // Forzamos 'update' pasando el SKU existente
                    $data['sku'] = $sku;
                    $r = cmu_upsert_simple_product($data);
                    if (is_wp_error($r)) {
                        $results[] = ['index'=>$i,'success'=>false,'sku'=>$sku,'error'=>$r->get_error_message()];
                    } else {
                        // Si por alguna razón reporta created, lo normalizamos a updated
                        $r['mode'] = 'updated';
                        $results[] = ['index'=>$i,'success'=>true,'sku'=>$sku] + $r;
                    }

                } catch (Throwable $e) {
                    $results[] = ['index'=>$i,'success'=>false,'error'=>$e->getMessage()];
                }
            }

            if (function_exists('wc_deferred_product_sync_end')) wc_deferred_product_sync_end();
            wp_defer_term_counting(false);
            wp_suspend_cache_invalidation(false);

            return ['success'=>true,'count'=>count($results),'results'=>$results];
        }
    ]);
});


/* === 2) GET /products (listar todos con filtros/paginación) === */
if (!function_exists('cmu_product_payload')) {
    // usa el helper que ya te pasé antes; si no lo tienes, dímelo y lo incluyo aquí
}

add_action('rest_api_init', function () {
    register_rest_route('custom-api/v1', '/products', [
        'methods'  => 'GET',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){

            $page     = max(1, (int)($request->get_param('page') ?: 1));
            $per_page = min(200, max(1, (int)($request->get_param('per_page') ?: 50)));
            $orderby  = sanitize_text_field($request->get_param('orderby') ?: 'date'); // date|title|ID
            $order    = strtoupper($request->get_param('order') ?: 'DESC');           // ASC|DESC
            $search   = sanitize_text_field($request->get_param('search') ?: '');
            $status   = sanitize_text_field($request->get_param('status') ?: 'any');  // any|publish|draft|private
            $category = sanitize_title($request->get_param('category') ?: '');        // slug
            $tag      = sanitize_title($request->get_param('tag') ?: '');             // slug
            $skus_qs  = trim((string)($request->get_param('skus') ?: ''));            // "SKU1,SKU2"
            $fields   = strtolower($request->get_param('fields') ?: 'basic');         // basic|full

            $args = [
                'post_type'      => 'product',
                'post_status'    => ($status === 'any') ? ['publish','draft','private'] : $status,
                'orderby'        => in_array($orderby, ['date','title','ID'], true) ? $orderby : 'date',
                'order'          => in_array($order, ['ASC','DESC'], true) ? $order : 'DESC',
                'posts_per_page' => $per_page,
                'paged'          => $page,
                's'              => $search ?: '',
            ];

            // tax_query para categoría/tag por slug
            $tax_query = [];
            if ($category) {
                $tax_query[] = [
                    'taxonomy' => 'product_cat',
                    'field'    => 'slug',
                    'terms'    => [$category]
                ];
            }
            if ($tag) {
                $tax_query[] = [
                    'taxonomy' => 'product_tag',
                    'field'    => 'slug',
                    'terms'    => [$tag]
                ];
            }
            if ($tax_query) $args['tax_query'] = $tax_query;

            // filtrar por SKUs
            $sku_list = [];
            if ($skus_qs !== '') {
                $sku_list = array_values(array_filter(array_map('trim', explode(',', $skus_qs))));
            }

            // Si hay SKUs, armamos meta_query IN
            if ($sku_list) {
                $args['meta_query'] = [
                    [
                        'key'     => '_sku',
                        'value'   => $sku_list,
                        'compare' => 'IN'
                    ]
                ];
                // Con meta_query no funciona la búsqueda 's' sobre meta; mantenemos 's' sobre título
            }

            $q = new WP_Query($args);
            $posts = $q->posts ?: [];

            $rows = [];
            foreach ($posts as $p) {
                $prod = wc_get_product($p->ID);
                if (!$prod) continue;

                if ($fields === 'full' && function_exists('cmu_product_payload')) {
                    $rows[] = cmu_product_payload($p->ID);
                } else {
                    // básico y rápido
                    $rows[] = [
                        'id'             => (int)$p->ID,
                        'sku'            => $prod->get_sku(),
                        'title'          => $prod->get_name(),
                        'price'          => $prod->get_price(),
                        'stock_quantity' => $prod->get_stock_quantity(),
                        'stock_status'   => $prod->get_stock_status(),
                        'status'         => get_post_status($p->ID),
                        'date'           => get_post_time('c', true, $p->ID),
                    ];
                }
            }

            return [
                'success'   => true,
                'page'      => $page,
                'per_page'  => $per_page,
                'total'     => (int)$q->found_posts,
                'pages'     => (int)$q->max_num_pages,
                'rows'      => array_values($rows)
            ];
        }
    ]);
});

/* === PUT por ID: /custom-api/v1/product/id/{id} === */
add_action('rest_api_init', function () {
    register_rest_route('custom-api/v1', '/product/id/(?P<id>\d+)', [
        'methods'  => 'PUT',
        'permission_callback' => 'cmu_permission',
        'callback' => function(WP_REST_Request $request){
            $id = (int) $request['id'];
            $product = wc_get_product($id);
            if (!$product) return new WP_Error('not_found','Product not found',['status'=>404]);

            $data = $request->get_json_params() ?: [];

            // Campos básicos
            if (!empty($data['title']) || !empty($data['name'])) {
                $product->set_name($data['title'] ?? $data['name']);
            }
            if (array_key_exists('description', $data))        $product->set_description($data['description'] ?? '');
            if (array_key_exists('short_description', $data))  $product->set_short_description($data['short_description'] ?? '');
            if (!empty($data['price']) || !empty($data['regular_price'])) {
                $product->set_regular_price((string)($data['regular_price'] ?? $data['price']));
            }
            if (!empty($data['sale_price']))        $product->set_sale_price((string)$data['sale_price']);
            if (isset($data['stock_quantity']))     $product->set_stock_quantity((int)$data['stock_quantity']);
            if (isset($data['manage_stock']))       $product->set_manage_stock((bool)$data['manage_stock']);
            if (!empty($data['stock_status']))      $product->set_stock_status($data['stock_status']); // instock|outofstock|onbackorder
            if (!empty($data['status']))            $product->set_status($data['status']);             // publish|draft|private

            // Permitir actualizar SKU si lo mandan (opcional)
            if (!empty($data['sku']))               $product->set_sku(sanitize_text_field($data['sku']));

            $product->save();

            // Imagen destacada
            if (!empty($data['image'])) {
                $img_id = cmu_set_image_from_url_cached($data['image']);
                if ($img_id) set_post_thumbnail($id, $img_id);
            }

            // Galería
            if (isset($data['gallery']) && is_array($data['gallery'])) {
                $gallery_ids = [];
                foreach ($data['gallery'] as $u) {
                    $mid = cmu_set_image_from_url_cached($u);
                    if ($mid) $gallery_ids[] = $mid;
                }
                if ($gallery_ids) {
                    update_post_meta($id, '_product_image_gallery', implode(',', $gallery_ids));
                } else {
                    delete_post_meta($id, '_product_image_gallery');
                }
            }

            // Taxonomías Woo
            if (!empty($data['categories'])) {
                $cat_ids = cmu_valid_term_ids((array)$data['categories'], 'product_cat');
                if ($cat_ids) wp_set_object_terms($id, $cat_ids, 'product_cat', false);
            }
            if (!empty($data['tags'])) {
                $tag_ids = cmu_valid_term_ids((array)$data['tags'], 'product_tag');
                if ($tag_ids) wp_set_object_terms($id, $tag_ids, 'product_tag', false);
            }

            // Taxonomías JetEngine / custom
            if (!empty($data['jet_taxonomies']) && is_array($data['jet_taxonomies'])) {
                foreach ($data['jet_taxonomies'] as $tax => $terms) {
                    if (!taxonomy_exists($tax)) continue;
                    $term_ids = cmu_valid_term_ids((array)$terms, $tax);
                    if ($term_ids) wp_set_object_terms($id, $term_ids, $tax, false);
                }
            }
			
			// Up-sells / Cross-sells por SKUs (sobrescribe)
			$touch_rel = false;

			if ($request->has_param('upsell_skus') || array_key_exists('upsell_skus', $data)) {
				$upsell_skus = is_array($data['upsell_skus'] ?? []) ? $data['upsell_skus'] : [];
				$product->set_upsell_ids(cmu_resolve_product_ids($upsell_skus));
				$touch_rel = true;
			}
			if ($request->has_param('crosssell_skus') || array_key_exists('crosssell_skus', $data)) {
				$cross_skus = is_array($data['crosssell_skus'] ?? []) ? $data['crosssell_skus'] : [];
				$product->set_cross_sell_ids(cmu_resolve_product_ids($cross_skus));
				$touch_rel = true;
			}

			if ($touch_rel) $product->save();

            // Respuesta
            if (function_exists('cmu_product_payload')) {
                $payload = cmu_product_payload($id);
                if (!is_wp_error($payload)) return ['success'=>true,'mode'=>'updated','product'=>$payload];
            }
            return ['success'=>true,'mode'=>'updated','product_id'=>$id];
        }
    ]);
});