<?php
/**
 * Plugin Name: PharmaPlus - Order Tracking Fields V2
 * Description: Agrega campos de Transportadora y Número de Guía a los pedidos de WooCommerce. Expone en API REST y emails.
 * Version: 2.0.0
 * Author: PharmaPlus
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * 1. Agregar campos personalizados en el admin de WooCommerce
 */
add_action('woocommerce_admin_order_data_after_shipping_address', 'pharma_v2_add_tracking_fields_to_admin', 10, 1);

function pharma_v2_add_tracking_fields_to_admin($order)
{
    $shipping_company = $order->get_meta('_shipping_company');
    $tracking_number = $order->get_meta('_shipping_tracking_number');

    ?>
    <div class="order_data_column" style="clear:both; margin-top: 20px;">
        <h3><?php _e('Información de Envío', 'woocommerce'); ?> 🚚</h3>

        <p class="form-field form-field-wide">
            <label for="_shipping_company"><?php _e('Transportadora:', 'woocommerce'); ?></label>
            <select id="_shipping_company" name="_shipping_company" class="wc-enhanced-select" style="width: 100%;">
                <option value="">— Seleccionar —</option>
                <option value="Coordinadora" <?php selected($shipping_company, 'Coordinadora'); ?>>Coordinadora</option>
                <option value="Servientrega" <?php selected($shipping_company, 'Servientrega'); ?>>Servientrega</option>
                <option value="Interrapidisimo" <?php selected($shipping_company, 'Interrapidisimo'); ?>>Interrapidísimo
                </option>
                <option value="Envia" <?php selected($shipping_company, 'Envia'); ?>>Envia</option>
                <option value="Liberty Express" <?php selected($shipping_company, 'Liberty Express'); ?>>Liberty Express
                </option>
                <option value="4-72" <?php selected($shipping_company, '4-72'); ?>>4-72</option>
                <option value="FedEx" <?php selected($shipping_company, 'FedEx'); ?>>FedEx</option>
                <option value="Mensajeros Urbanos" <?php selected($shipping_company, 'Mensajeros Urbanos'); ?>>Mensajeros
                    Urbanos</option>
                <option value="Deprisa" <?php selected($shipping_company, 'Deprisa'); ?>>Deprisa</option>
                <option value="TCC" <?php selected($shipping_company, 'TCC'); ?>>TCC</option>
            </select>
        </p>

        <p class="form-field form-field-wide">
            <label for="_shipping_tracking_number"><?php _e('Número de Guía:', 'woocommerce'); ?></label>
            <input type="text" id="_shipping_tracking_number" name="_shipping_tracking_number"
                value="<?php echo esc_attr($tracking_number); ?>" placeholder="Ej: 123456789" style="width: 100%;" />
        </p>
    </div>
    <?php
}

/**
 * 2. Guardar los campos cuando se actualiza el pedido desde el admin
 */
add_action('woocommerce_process_shop_order_meta', 'pharma_v2_save_tracking_fields', 10, 1);

function pharma_v2_save_tracking_fields($order_id)
{
    $order = wc_get_order($order_id);
    if (!$order)
        return;

    if (isset($_POST['_shipping_company'])) {
        $order->update_meta_data('_shipping_company', sanitize_text_field($_POST['_shipping_company']));
    }
    if (isset($_POST['_shipping_tracking_number'])) {
        $order->update_meta_data('_shipping_tracking_number', sanitize_text_field($_POST['_shipping_tracking_number']));
    }
    $order->save();
}

/**
 * 3. Exponer los campos en la API REST de WooCommerce
 */
add_filter('woocommerce_rest_prepare_shop_order_object', 'pharma_v2_add_tracking_to_api', 10, 3);

function pharma_v2_add_tracking_to_api($response, $order, $request)
{
    $shipping_company = $order->get_meta('_shipping_company');
    $tracking_number = $order->get_meta('_shipping_tracking_number');

    $response->data['shipping_company'] = $shipping_company ? $shipping_company : '';
    $response->data['shipping_tracking_number'] = $tracking_number ? $tracking_number : '';

    return $response;
}

/**
 * 4. Permitir actualizar los campos vía API REST (Standard)
 */
add_action('woocommerce_rest_insert_shop_order_object', 'pharma_v2_update_tracking_from_api', 10, 3);

function pharma_v2_update_tracking_from_api($order, $request, $creating)
{
    $params = $request->get_params();

    // Actualizar desde meta_data
    if (isset($params['meta_data']) && is_array($params['meta_data'])) {
        foreach ($params['meta_data'] as $meta) {
            if (isset($meta['key']) && isset($meta['value'])) {
                if ($meta['key'] === '_shipping_company') {
                    $order->update_meta_data('_shipping_company', sanitize_text_field($meta['value']));
                }
                if ($meta['key'] === '_shipping_tracking_number') {
                    $order->update_meta_data('_shipping_tracking_number', sanitize_text_field($meta['value']));
                }
            }
        }
    }

    // Actualización directa
    if (isset($params['shipping_company'])) {
        $order->update_meta_data('_shipping_company', sanitize_text_field($params['shipping_company']));
    }
    if (isset($params['shipping_tracking_number'])) {
        $order->update_meta_data('_shipping_tracking_number', sanitize_text_field($params['shipping_tracking_number']));
    }
    $order->save();
}

/**
 * 5. ENDPOINT PERSONALIZADO PARA POSTMAN (Solución Definitiva con X-API-KEY)
 * URL: /wp-json/pharma/v1/tracking/{id}
 */
add_action('rest_api_init', function () {
    register_rest_route('pharma/v1', '/tracking/(?P<id>\d+)', [
        'methods' => ['POST', 'PUT'],
        'permission_callback' => '__return_true',
        'callback' => 'pharma_v2_handle_tracking_update'
    ]);
});

function pharma_v2_handle_tracking_update($request)
{
    $order_id = $request['id'];
    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('not_found', 'Pedido no encontrado', ['status' => 404]);
    }

    // Autenticación con X-API-KEY
    $auth_header = $request->get_header('X-API-KEY');
    $valid_key = defined('CUSTOM_API_KEY') ? CUSTOM_API_KEY : 'rwYK B0nN kHbq ujB3 XRbZ slCt';

    // Si no envía X-API-KEY, verificamos si es admin logueado
    if (trim((string) $auth_header) !== trim((string) $valid_key)) {
        if (!current_user_can('edit_shop_orders')) {
            return new WP_Error('forbidden', 'Clave API incorrecta o sin permisos', ['status' => 403]);
        }
    }

    $params = $request->get_json_params();
    $company = '';
    $tracking = '';

    // Opción A: meta_data
    if (!empty($params['meta_data'])) {
        foreach ($params['meta_data'] as $meta) {
            if ($meta['key'] === '_shipping_company')
                $company = $meta['value'];
            if ($meta['key'] === '_shipping_tracking_number')
                $tracking = $meta['value'];
        }
    }
    // Opción B: campos directos
    if (isset($params['company']))
        $company = $params['company'];
    if (isset($params['tracking_number']))
        $tracking = $params['tracking_number'];

    // Opción C: con guion bajo
    if (isset($params['_shipping_company']))
        $company = $params['_shipping_company'];
    if (isset($params['_shipping_tracking_number']))
        $tracking = $params['_shipping_tracking_number'];

    $updated = false;
    if ($company) {
        $order->update_meta_data('_shipping_company', sanitize_text_field($company));
        $updated = true;
    }
    if ($tracking) {
        $order->update_meta_data('_shipping_tracking_number', sanitize_text_field($tracking));
        $updated = true;
    }

    if ($updated) {
        $order->save();
        return [
            'success' => true,
            'message' => 'Tracking actualizado correctamente',
            'order_id' => $order_id,
            'data' => [
                'company' => $order->get_meta('_shipping_company'),
                'tracking' => $order->get_meta('_shipping_tracking_number')
            ]
        ];
    } else {
        return new WP_Error('no_data', 'No se enviaron datos validos (company, tracking_number)', ['status' => 400]);
    }
}

/**
 * 6. Mostrar en emails de WooCommerce
 */
add_action('woocommerce_email_order_meta', 'pharma_v2_add_tracking_to_emails', 10, 4);

function pharma_v2_add_tracking_to_emails($order, $sent_to_admin, $plain_text, $email)
{
    $shipping_company = $order->get_meta('_shipping_company');
    $tracking_number = $order->get_meta('_shipping_tracking_number');

    if (!$shipping_company && !$tracking_number)
        return;

    if ($plain_text) {
        echo "\n" . strtoupper(__('Información de Envío', 'woocommerce')) . "\n";
        if ($shipping_company)
            echo __('Transportadora:', 'woocommerce') . ' ' . $shipping_company . "\n";
        if ($tracking_number)
            echo __('Número de Guía:', 'woocommerce') . ' ' . $tracking_number . "\n";
    } else {
        ?>
        <div style="margin: 20px 0; padding: 15px; background-color: #f7f7f7; border: 1px solid #e5e5e5; border-radius: 4px;">
            <h2 style="margin-top: 0; color: #1C4595;">🚚 <?php _e('Información de Envío', 'woocommerce'); ?></h2>
            <?php if ($shipping_company): ?>
                <p style="margin: 5px 0;">
                    <strong><?php _e('Transportadora:', 'woocommerce'); ?></strong>
                    <?php echo esc_html($shipping_company); ?>
                </p>
            <?php endif; ?>
            <?php if ($tracking_number): ?>
                <p style="margin: 5px 0;">
                    <strong><?php _e('Número de Guía:', 'woocommerce'); ?></strong>
                    <code style="background: #fff; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 14px;">
                                    <?php echo esc_html($tracking_number); ?>
                                </code>
                </p>
            <?php endif; ?>
        </div>
        <?php
    }
}

/**
 * 7. Mostrar en la página "Gracias por tu compra"
 */
add_action('woocommerce_thankyou', 'pharma_v2_add_tracking_to_thankyou', 10, 1);

function pharma_v2_add_tracking_to_thankyou($order_id)
{
    if (!$order_id)
        return;

    $order = wc_get_order($order_id);
    if (!$order)
        return;

    $shipping_company = $order->get_meta('_shipping_company');
    $tracking_number = $order->get_meta('_shipping_tracking_number');

    if (!$shipping_company && !$tracking_number)
        return;

    ?>
    <section class="woocommerce-order-tracking"
        style="margin-top: 20px; padding: 20px; background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 4px;">
        <h2 class="woocommerce-order-tracking__title">🚚 <?php _e('Información de Envío', 'woocommerce'); ?></h2>
        <?php if ($shipping_company): ?>
            <p><strong><?php _e('Transportadora:', 'woocommerce'); ?></strong> <?php echo esc_html($shipping_company); ?></p>
        <?php endif; ?>
        <?php if ($tracking_number): ?>
            <p><strong><?php _e('Número de Guía:', 'woocommerce'); ?></strong> <code
                    style="background: #fff; padding: 4px 8px; border-radius: 3px; font-family: monospace;"><?php echo esc_html($tracking_number); ?></code>
            </p>
        <?php endif; ?>
    </section>
    <?php
}

/**
 * 8. Agregar columna en lista de pedidos
 */
add_filter('manage_edit-shop_order_columns', 'pharma_v2_add_tracking_column', 20);

function pharma_v2_add_tracking_column($columns)
{
    $new_columns = array();
    foreach ($columns as $column_name => $column_info) {
        $new_columns[$column_name] = $column_info;
        if ('order_status' === $column_name) {
            $new_columns['tracking_info'] = __('Tracking', 'woocommerce');
        }
    }
    return $new_columns;
}

add_action('manage_shop_order_posts_custom_column', 'pharma_v2_show_tracking_column_content', 10, 2);

function pharma_v2_show_tracking_column_content($column, $order_id)
{
    if ('tracking_info' === $column) {
        $order = wc_get_order($order_id);
        $shipping_company = $order->get_meta('_shipping_company');
        $tracking_number = $order->get_meta('_shipping_tracking_number');

        if ($shipping_company || $tracking_number) {
            echo '<div style="font-size: 11px;">';
            if ($shipping_company)
                echo '<strong>' . esc_html($shipping_company) . '</strong><br>';
            if ($tracking_number)
                echo '<code style="font-size: 10px;">' . esc_html($tracking_number) . '</code>';
            echo '</div>';
        } else {
            echo '<span style="color: #999;">—</span>';
        }
    }
}

/**
 * 9. Hacer buscable
 */
add_filter('woocommerce_shop_order_search_fields', 'pharma_v2_make_tracking_searchable');

function pharma_v2_make_tracking_searchable($search_fields)
{
    $search_fields[] = '_shipping_tracking_number';
    return $search_fields;
}
