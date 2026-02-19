<?php
/**
 * 21 - Woocommerce Beneficios B2C - V2 (Con Soporte para TOPE MÁXIMO y Multiplicador)
 * 
 * MEJORAS:
 * 1. Soporta lógica de multiplicador (ej: Si compra 6 y la promo es 2x1, lleva 3, no solo 1).
 * 2. Soporta TOPE MÁXIMO (ej: Máximo 5 unidades de regalo por transacción).
 * 3. Actualiza dinámicamente la cantidad del regalo si cambia la cantidad del producto base.
 * 
 * REQUISITOS SQL:
 * ALTER TABLE wp_item_ptc ADD COLUMN TOPE_MAXIMO INT DEFAULT 0;
 */

add_action('woocommerce_before_calculate_totals', 'agregar_beneficio_por_plan_de_tratamiento_v2', 15, 1);

function agregar_beneficio_por_plan_de_tratamiento_v2($cart)
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

    // 1. Identificar productos de beneficio actuales en el carrito para limpiar o actualizar
    $cart_items = $cart->get_cart();
    $productos_beneficio_keys = []; // Mapa: producto_id_regalo => cart_item_key

    foreach ($cart_items as $key => $item) {
        if (!empty($item['is_gift'])) {
            $productos_beneficio_keys[$item['product_id']] = $key;
        }
    }

    $beneficios_a_mantener = []; // IDs de productos regalo que deben quedarse

    // 2. Iterar sobre productos normales para aplicar reglas
    foreach ($cart_items as $key => $item) {
        // Saltar regalos
        if (!empty($item['is_gift']))
            continue;

        $producto = wc_get_product($item['product_id']);
        if (!$producto)
            continue;

        $sku = $producto->get_sku();
        $cantidad_compra = $item['quantity'];

        // Buscar regla PTC activa
        // Se asume que solo hay 1 regla activa por fecha para un SKU dado
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
            $id_regalo_sku = $beneficio->ITEM_ID_RECAMBIO;
            $id_regalo = wc_get_product_id_by_sku($id_regalo_sku);

            if (!$id_regalo)
                continue;

            $por_compra_de = intval($beneficio->POR_COMPRA_DE);
            $recibe_ptc = intval($beneficio->RECIBE_PTC);
            $tope_maximo = isset($beneficio->TOPE_MAXIMO) ? intval($beneficio->TOPE_MAXIMO) : 0;

            if ($por_compra_de <= 0)
                continue; // Evitar división por cero

            // CÁLCULO DE CANTIDAD A REGALAR
            // Cuántas veces aplica la promo: floor(compra / requisito)
            $veces_aplica = floor($cantidad_compra / $por_compra_de);

            if ($veces_aplica > 0) {
                $cantidad_total_regalo = $veces_aplica * $recibe_ptc;

                // APLICAR TOPE MÁXIMO
                if ($tope_maximo > 0 && $cantidad_total_regalo > $tope_maximo) {
                    $cantidad_total_regalo = $tope_maximo;
                }

                // --- LÓGICA DE ACTUALIZACIÓN DEL CARRITO ---

                // Caso A: Ya existe el regalo en el carrito
                if (isset($productos_beneficio_keys[$id_regalo])) {
                    $gift_key = $productos_beneficio_keys[$id_regalo];
                    $current_gift_qty = $cart_items[$gift_key]['quantity'];

                    if ($current_gift_qty != $cantidad_total_regalo) {
                        $cart->set_quantity($gift_key, $cantidad_total_regalo);
                    }
                    $beneficios_a_mantener[] = $id_regalo; // Marcar como procesado/válido
                }
                // Caso B: No existe, agregarlo
                else {
                    $cart->add_to_cart($id_regalo, $cantidad_total_regalo, 0, [], ['is_gift' => true]);
                    // Nota: Al agregar, se regenerará el cart y en la sig ejecución se marcará como mantenido
                    // O podemos agregarlo a la lista 'mantener' para evitar borrado inmediato si la lógica siguiera
                    $beneficios_a_mantener[] = $id_regalo;
                }
            }
        }
    }

    // 3. Limpieza: Eliminar beneficios que ya no aplican
    // (Ej: Usuario redujo cantidad del producto base y ya no alcanza para promo, o eliminó el producto base)
    foreach ($productos_beneficio_keys as $prod_id => $cart_key) {
        if (!in_array($prod_id, $beneficios_a_mantener)) {
            $cart->remove_cart_item($cart_key);
        }
    }
}

// Asegurar precio cero y mostrar meta data (igual que antes)
add_filter('woocommerce_get_item_data', function ($item_data, $cart_item) {
    if (!empty($cart_item['is_gift'])) {
        $item_data[] = [
            'name' => 'Beneficio',
            'value' => 'Producto gratuito por promoción',
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
