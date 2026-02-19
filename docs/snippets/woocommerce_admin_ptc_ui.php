<?php
/**
 * PTC Admin UI Integration v2
 * 
 * Agrega una pestaña "Promociones PTC" en la edición de producto de WooCommerce.
 * Permite ver y editar las reglas almacenadas en la tabla personalizada 'wp_item_ptc'.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * GARANTIZAR LA TABLA (Versión Ligera v2)
 */
function cmu_garantizar_tabla_ptc_v2()
{
    global $wpdb;
    $tabla = $wpdb->prefix . 'item_ptc';

    // Check ultra-rápido de tabla existente
    if ($wpdb->get_var("SHOW TABLES LIKE '$tabla'") === $tabla) {
        return;
    }

    $charset_collate = $wpdb->get_charset_collate();

    // SQL Directo "IF NOT EXISTS"
    $sql = "CREATE TABLE IF NOT EXISTS $tabla (
        ITEM_PTC_ID bigint(20) NOT NULL AUTO_INCREMENT,
        ITEM_ID varchar(50) NOT NULL,
        POR_COMPRA_DE int(11) DEFAULT 0,
        RECIBE_PTC int(11) DEFAULT 0,
        ITEM_ID_RECAMBIO varchar(50) DEFAULT NULL,
        FECHA_INICIO date DEFAULT NULL,
        FECHA_FIN date DEFAULT NULL,
        TOPE_MAXIMO int(11) DEFAULT 0,
        LIMITE_POR_USUARIO int(11) DEFAULT 0,
        CANAL_ID varchar(20) DEFAULT '1',
        ACUMULA_SN int(1) DEFAULT 0,
        AREA_ID varchar(20) DEFAULT '0',
        PRIMARY KEY (ITEM_PTC_ID),
        UNIQUE KEY item_id (ITEM_ID)
    ) $charset_collate;";

    // Usamos query directo para evitar cargar upgrade.php si no es necesario
    $wpdb->query($sql);
}

// 1. Agregar la pestaña (Tab)
add_filter('woocommerce_product_data_tabs', 'agregar_tab_ptc_producto_v2');
function agregar_tab_ptc_producto_v2($tabs)
{
    $tabs['ptc_rules'] = array(
        'label' => __('Promociones PTC', 'woocommerce'),
        'target' => 'ptc_rules_options',
        'class' => array('show_if_simple', 'show_if_variable'),
        'priority' => 25,
    );
    return $tabs;
}

// 2. Contenido de la pestaña
add_action('woocommerce_product_data_panels', 'contenido_tab_ptc_producto_v2');
function contenido_tab_ptc_producto_v2()
{
    global $post, $wpdb;

    // Garantizar tabla al visualizar
    cmu_garantizar_tabla_ptc_v2();

    $product = wc_get_product($post->ID);
    $sku = $product ? $product->get_sku() : '';

    // Valores default
    $regla = [
        'FECHA_INICIO' => '',
        'FECHA_FIN' => '',
        'POR_COMPRA_DE' => '',
        'RECIBE_PTC' => '',
        'ITEM_ID_RECAMBIO' => '',
        'TOPE_MAXIMO' => '',
        'LIMITE_POR_USUARIO' => ''
    ];

    $table_name = $wpdb->prefix . 'item_ptc';

    // Query limpio y seguro
    if (!empty($sku)) {
        $resultado = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE ITEM_ID = %s", $sku), ARRAY_A);
        if ($resultado) {
            $regla = array_merge($regla, $resultado);
        }
    }

    echo '<div id="ptc_rules_options" class="panel woocommerce_options_panel">';

    if (empty($sku)) {
        echo '<p style="padding:20px; color:red;">Este producto no tiene SKU. Asigne un SKU y guarde para configurar reglas PTC.</p>';
        echo '</div>';
        return;
    }

    echo '<div class="options_group">';
    echo '<h3>Regla "Pague X Lleve Y"</h3>';
    echo '<p class="form-field"><strong>SKU Vinculado:</strong> ' . esc_html($sku) . '</p>';

    // Fechas
    woocommerce_wp_text_input([
        'id' => 'ptc_fecha_inicio',
        'label' => 'Fecha Inicio',
        'type' => 'date',
        'value' => $regla['FECHA_INICIO']
    ]);

    woocommerce_wp_text_input([
        'id' => 'ptc_fecha_fin',
        'label' => 'Fecha Fin',
        'type' => 'date',
        'value' => $regla['FECHA_FIN']
    ]);
    echo '</div><div class="options_group">';

    // Cantidades
    woocommerce_wp_text_input([
        'id' => 'ptc_por_compra_de',
        'label' => 'Compra (X)',
        'type' => 'number',
        'custom_attributes' => ['step' => '1', 'min' => '0'],
        'value' => $regla['POR_COMPRA_DE']
    ]);

    woocommerce_wp_text_input([
        'id' => 'ptc_recibe',
        'label' => 'Recibe (Y)',
        'type' => 'number',
        'custom_attributes' => ['step' => '1', 'min' => '0'],
        'value' => $regla['RECIBE_PTC']
    ]);

    woocommerce_wp_text_input([
        'id' => 'ptc_sku_regalo',
        'label' => 'SKU Regalo',
        'value' => $regla['ITEM_ID_RECAMBIO'] ?: $sku
    ]);

    echo '</div><div class="options_group">';

    // Límites
    woocommerce_wp_text_input([
        'id' => 'ptc_tope_maximo',
        'label' => 'Tope Máximo Global',
        'type' => 'number',
        'value' => $regla['TOPE_MAXIMO']
    ]);

    woocommerce_wp_text_input([
        'id' => 'ptc_limite_usuario',
        'label' => 'Límite x Usuario',
        'type' => 'number',
        'value' => $regla['LIMITE_POR_USUARIO']
    ]);

    echo '</div></div>';
}

// 3. Guardar Datos (Con Checks de Seguridad Extra)
add_action('woocommerce_process_product_meta', 'guardar_datos_tab_ptc_producto_v2');
function guardar_datos_tab_ptc_producto_v2($post_id)
{
    global $wpdb;

    // Checks de seguridad estándar de WP
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
        return;
    if (defined('DOING_AJAX') && DOING_AJAX && !isset($_POST['ptc_por_compra_de']))
        return;
    if (!current_user_can('edit_product', $post_id))
        return; // Opcional, pero recomendado

    // Validación básica de envío
    if (!isset($_POST['ptc_por_compra_de']))
        return;

    $product = wc_get_product($post_id);
    if (!$product)
        return;

    $sku = $product->get_sku();
    if (empty($sku))
        return;

    // Sanitización
    $compra_x = intval($_POST['ptc_por_compra_de']);
    $recibe_y = intval($_POST['ptc_recibe']);

    // Si no hay promo, no hacemos nada (o podríamos borrar, pero mantenemos simple)
    // if ($compra_x <= 0) return; 

    $fecha_ini = !empty($_POST['ptc_fecha_inicio']) ? sanitize_text_field($_POST['ptc_fecha_inicio']) : null;
    $fecha_fin = !empty($_POST['ptc_fecha_fin']) ? sanitize_text_field($_POST['ptc_fecha_fin']) : null;
    $sku_gift = !empty($_POST['ptc_sku_regalo']) ? sanitize_text_field($_POST['ptc_sku_regalo']) : $sku;
    $tope = !empty($_POST['ptc_tope_maximo']) ? intval($_POST['ptc_tope_maximo']) : 0;
    $limit_u = !empty($_POST['ptc_limite_usuario']) ? intval($_POST['ptc_limite_usuario']) : 0;

    $tabla = $wpdb->prefix . 'item_ptc';

    // Verificación final de tabla
    if ($wpdb->get_var("SHOW TABLES LIKE '$tabla'") !== $tabla) {
        return; // Fail safe
    }

    // Upsert
    $exists = $wpdb->get_var($wpdb->prepare("SELECT ITEM_PTC_ID FROM $tabla WHERE ITEM_ID = %s", $sku));

    $data = [
        'ITEM_ID' => $sku,
        'POR_COMPRA_DE' => $compra_x,
        'RECIBE_PTC' => $recibe_y,
        'ITEM_ID_RECAMBIO' => $sku_gift,
        'FECHA_INICIO' => $fecha_ini,
        'FECHA_FIN' => $fecha_fin,
        'TOPE_MAXIMO' => $tope,
        'LIMITE_POR_USUARIO' => $limit_u,
        'CANAL_ID' => '1',
        'ACUMULA_SN' => 0
    ];
    $format = ['%s', '%d', '%d', '%s', '%s', '%s', '%d', '%d', '%s', '%d'];

    if ($exists) {
        $wpdb->update($tabla, $data, ['ITEM_ID' => $sku], $format, ['%s']);
    } else {
        if ($compra_x > 0) {
            $wpdb->insert($tabla, $data, $format);
        }
    }
}
