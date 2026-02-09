<?php
/**
 * 21 - Woocommerce Beneficios B2C
 * 
 * Agrega productos de beneficio (regalo) al carrito automáticamente si se cumplen condiciones
 * basadas en el historial de compras o reglas definidas en la tabla 'item_ptc'.
 */

add_action('woocommerce_before_calculate_totals', 'agregar_beneficio_por_plan_de_tratamiento', 15, 1);

function agregar_beneficio_por_plan_de_tratamiento($cart)
{
    if (is_admin() && !defined('DOING_AJAX'))
        return;

    if (!is_user_logged_in())
        return;

    $user = wp_get_current_user();
    if (!in_array('customer', (array) $user->roles))
        return;

    global $wpdb;
    $hoy = date('Y-m-d');
    $tabla = $wpdb->prefix . 'item_ptc';

    $productos_beneficio_ids = [];

    foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
        // Ignorar los productos que ya son beneficio  
        if (!empty($cart_item['is_gift']))
            continue;

        $producto = wc_get_product($cart_item['product_id']);
        if (!$producto)
            continue;

        $sku = $producto->get_sku();
        $cantidad = $cart_item['quantity'];

        // Buscar si hay un beneficio para este producto (por SKU)  
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

        $beneficio = $wpdb->get_row($query);

        if ($beneficio) {
            $producto_beneficio_id = wc_get_product_id_by_sku($beneficio->ITEM_ID_RECAMBIO);
            if (!$producto_beneficio_id)
                continue;

            $productos_beneficio_ids[] = $producto_beneficio_id;

            $ya_en_carrito = false;
            $key_beneficio = null;

            foreach ($cart->get_cart() as $key => $item) {
                if ($item['product_id'] == $producto_beneficio_id && !empty($item['is_gift'])) {
                    $ya_en_carrito = true;
                    $key_beneficio = $key;
                    break;
                }
            }

            // Agregar si cumple la cantidad y no está  
            if ($cantidad >= $beneficio->POR_COMPRA_DE && !$ya_en_carrito) {
                $cart->add_to_cart($producto_beneficio_id, $beneficio->RECIBE_PTC, 0, [], ['is_gift' => true]);
            }

            // Remover si ya no cumple y sí está  
            if ($cantidad < $beneficio->POR_COMPRA_DE && $ya_en_carrito && $key_beneficio) {
                $cart->remove_cart_item($key_beneficio);
            }
        }
    }

    // Limpieza adicional: remover productos de beneficio si el producto base ya no está  
    foreach ($cart->get_cart() as $key => $item) {
        if (!empty($item['is_gift']) && !in_array($item['product_id'], $productos_beneficio_ids)) {
            $cart->remove_cart_item($key);
        }
    }
}

add_filter('woocommerce_get_item_data', function ($item_data, $cart_item) {
    if (!empty($cart_item['is_gift'])) {
        $item_data[] = [
            'name' => 'Beneficio',
            'value' => 'Producto gratuito por plan de tratamiento',
        ];
    }
    return $item_data;
}, 10, 2);

add_action('woocommerce_before_calculate_totals', function ($cart) {
    if (is_admin() && !defined('DOING_AJAX'))
        return;

    foreach ($cart->get_cart() as $cart_item) {
        if (!empty($cart_item['is_gift']) && $cart_item['is_gift'] === true) {
            $cart_item['data']->set_price(0);
        }
    }
}, 30, 1);
