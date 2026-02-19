<?php
/**
 * 21 - Woocommerce Beneficios B2C - V3 (Final)
 * 
 * LOGICA:
 * 1. Pague X Lleve Y (PTC).
 * 2. Multiplicador: Si compra 2 paquetes, lleva 2 regalos.
 * 3. TOPE_MAXIMO: Límite global de unidades de regalo (Protección de stock).
 * 4. LIMITE_POR_USUARIO: Límite de cuántas VECES (combos) puede aplicar la promo el usuario.
 * 
 * REQUISITOS SQL:
 * ALTER TABLE wp_item_ptc ADD COLUMN TOPE_MAXIMO INT DEFAULT 0;
 * ALTER TABLE wp_item_ptc ADD COLUMN LIMITE_POR_USUARIO INT DEFAULT 0;
 */

add_action('woocommerce_before_calculate_totals', 'agregar_beneficio_por_plan_de_tratamiento_v3', 15, 1);

function agregar_beneficio_por_plan_de_tratamiento_v3($cart)
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

    // 1. Mapeo de carrito actual para gestión
    $cart_items = $cart->get_cart();
    $productos_regalo_en_carrito = []; // [product_id => cart_item_key]

    foreach ($cart_items as $key => $item) {
        if (!empty($item['is_gift'])) {
            $productos_regalo_en_carrito[$item['product_id']] = $key;
        }
    }

    $regalos_validos = []; // IDs de regalos que se calcularon y deben permanecer

    // 2. Procesar productos base
    foreach ($cart_items as $key => $item) {
        if (!empty($item['is_gift']))
            continue; // Ignorar regalos

        $producto = wc_get_product($item['product_id']);
        if (!$producto)
            continue;

        $sku = $producto->get_sku();
        $cantidad_compra = $item['quantity'];

        // Buscar regla PTC
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
            // Límite de regalos totales (ej: max 10 pastillas regaladas)
            $tope_maximo = isset($beneficio->TOPE_MAXIMO) ? intval($beneficio->TOPE_MAXIMO) : 0;
            // Límite de combos/compras (ej: max 2 promociones por usuario)
            $limite_usuario = isset($beneficio->LIMITE_POR_USUARIO) ? intval($beneficio->LIMITE_POR_USUARIO) : 0;

            if ($por_compra_de <= 0)
                continue;

            // --- LÓGICA DE CÁLCULO MEJORADA ---

            // ¿Cuántas veces aplica "teóricamente" según cantidad comprada?
            $veces_aplica = floor($cantidad_compra / $por_compra_de);

            // Restricción 1: Límite por Usuario (Combos máximos)
            if ($limite_usuario > 0 && $veces_aplica > $limite_usuario) {
                $veces_aplica = $limite_usuario;
            }

            if ($veces_aplica > 0) {
                // Cantidad base de regalo
                $cantidad_total_regalo = $veces_aplica * $recibe_ptc;

                // Restricción 2: Tope Máximo Global de Unidades (Stock protection)
                if ($tope_maximo > 0 && $cantidad_total_regalo > $tope_maximo) {
                    $cantidad_total_regalo = $tope_maximo;
                }

                // Aplicar al carrito
                if (isset($productos_regalo_en_carrito[$id_regalo])) {
                    // Actualizar existente
                    $gift_key = $productos_regalo_en_carrito[$id_regalo];
                    if ($cart_items[$gift_key]['quantity'] != $cantidad_total_regalo) {
                        $cart->set_quantity($gift_key, $cantidad_total_regalo);
                    }
                    $regalos_validos[] = $id_regalo;
                } else {
                    // Agregar nuevo
                    $cart->add_to_cart($id_regalo, $cantidad_total_regalo, 0, [], ['is_gift' => true]);
                    $regalos_validos[] = $id_regalo;
                }
            }
        }
    }

    // 3. Limpieza de regalos huerfanos
    foreach ($productos_regalo_en_carrito as $prod_id => $cart_key) {
        if (!in_array($prod_id, $regalos_validos)) {
            $cart->remove_cart_item($cart_key);
        }
    }
}

// Meta Data visual en carrito
add_filter('woocommerce_get_item_data', function ($item_data, $cart_item) {
    if (!empty($cart_item['is_gift'])) {
        $item_data[] = [
            'name' => 'Oferta Especial',
            'value' => 'Producto Gratuito (Pague X Lleve Y)',
        ];
    }
    return $item_data;
}, 10, 2);

// Precio Cero
add_action('woocommerce_before_calculate_totals', function ($cart) {
    if (is_admin() && !defined('DOING_AJAX'))
        return;
    foreach ($cart->get_cart() as $cart_item) {
        if (!empty($cart_item['is_gift'])) {
            $cart_item['data']->set_price(0);
        }
    }
}, 30, 1);
