# Integración de Checkout Headless para WooCommerce

Este fragmento de código PHP permite que WooCommerce reciba el carrito enviado desde el frontend Headless y redirija al usuario directamente a la página de pago (Checkout).

## Instrucciones

1.  En tu WordPress, ve a **Code Snippets** > **Add New**.
2.  Ponle de título: `Headless Cart Handover`.
3.  Copia y pega el siguiente código.
4.  Guarda y **Activa**.

```php
<?php

add_action('template_redirect', 'pharma_handle_headless_handover');

function pharma_handle_headless_handover() {
    if (isset($_GET['saprix_handover']) && $_GET['saprix_handover'] == 'true') {
        
        // Asegurar que WooCommerce y la sesión estén cargados
        if (function_exists('WC') && WC()->cart) {
            
            // Si el usuario es invitado y no hay sesión, iniciarla
            if (!is_user_logged_in() && WC()->session && !WC()->session->has_session()) {
                WC()->session->set_customer_session_cookie(true);
            }

            // 1. Limpiar carrito actual
            WC()->cart->empty_cart();
            
            // 2. Procesar Items
            if (isset($_GET['items'])) {
                $items = explode(',', $_GET['items']);
                
                foreach ($items as $item) {
                    // Formato esperado: ID:QTY o VARIATION_ID:QTY
                    $parts = explode(':', $item);
                    $product_id = intval($parts[0]);
                    $quantity = isset($parts[1]) ? intval($parts[1]) : 1;
                    
                    if ($product_id > 0 && $quantity > 0) {
                        WC()->cart->add_to_cart($product_id, $quantity);
                    }
                }
            }
            
            // 3. Procesar Datos de Cliente (Pre-llenado)
            if (isset($_GET['billing_email'])) {
                $customer_data = array(
                    'billing_first_name' => sanitize_text_field($_GET['billing_first_name']),
                    'billing_last_name'  => sanitize_text_field($_GET['billing_last_name']),
                    'billing_email'      => sanitize_email($_GET['billing_email']),
                    'billing_phone'      => sanitize_text_field($_GET['billing_phone']),
                    'billing_address_1'  => sanitize_text_field($_GET['billing_address_1']),
                    'billing_city'       => sanitize_text_field($_GET['billing_city']),
                    'billing_state'      => sanitize_text_field($_GET['billing_state']), // Dep maps to billing_state
                );
                
                // Guardar en sesión de WC para que aparezcan en el checkout
                foreach ($customer_data as $key => $value) {
                    // Solo setear si tiene valor para evitar borrar datos si el user ya estaba logueado
                    if (!empty($value) || !is_user_logged_in()) {
                         WC()->customer->set_props(array($key => $value));
                    }
                }
                WC()->customer->save();
            }

            // 4. Redirigir al Checkout (limpiando la URL)
            wp_redirect(wc_get_checkout_url());
            exit;
        }
    }
}
```

## ¿Por qué es necesario?
El frontend de Next.js está en un dominio/puerto diferente al de WordPress. Cuando el usuario hace clic en "Pagar", enviamos los IDs de los productos a WordPress. Este código "atrapa" esa petición, reconstruye el carrito en el lado de WordPress y envía al usuario a la pasarela de pagos.
