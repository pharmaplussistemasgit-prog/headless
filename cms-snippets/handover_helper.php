<?php
/**
 * Title: Saprix Headless Handover Helper
 * Description: Allows populating the WooCommerce Cart and Checkout fields via URL parameters for a seamless Headless -> WordPress transition.
 * Usage: https://your-site.com/checkout/?saprix_handover=true&items=123:1,456:2&billing_first_name=Juan...
 */

// 1. Intercept the request to populate the Cart
add_action('template_redirect', 'saprix_handle_cart_handover');

function saprix_handle_cart_handover()
{
    // Only run if our flag is present
    if (!isset($_GET['saprix_handover'])) {
        return;
    }

    // Ensure WooCommerce is loaded
    if (!function_exists('WC')) {
        return;
    }

    // A. Empty the current cart to avoid duplicates
    WC()->cart->empty_cart();

    // B. Parse Items from URL (Format: id:qty,id:qty)
    if (isset($_GET['items'])) {
        $items = explode(',', sanitize_text_field($_GET['items']));

        foreach ($items as $item) {
            $parts = explode(':', $item);
            $product_id = intval($parts[0]);
            $quantity = isset($parts[1]) ? intval($parts[1]) : 1;

            if ($product_id > 0) {
                // Add to cart (Product ID, Qty)
                WC()->cart->add_to_cart($product_id, $quantity);
            }
        }
    }

    // Note: We don't redirect here, we let the page continue to load the Checkout
    // The query params remain in the URL so step 2 can read them.
}

// 2. Pre-fill Checkout Fields from URL parameters
add_filter('woocommerce_checkout_get_value', 'saprix_prefill_checkout_fields', 10, 2);

function saprix_prefill_checkout_fields($value, $input)
{
    // Only if we are in our handover mode
    if (!isset($_GET['saprix_handover'])) {
        return $value;
    }

    // If WordPress already has a value (e.g. logged in user), prefer that unless empty
    if (!empty($value)) {
        return $value;
    }

    // Map URL params to fields. 
    // Example: ?billing_first_name=Juan maps to $input 'billing_first_name'
    if (isset($_GET[$input])) {
        return sanitize_text_field($_GET[$input]);
    }

    // Special handling for Cedula variations
    $cedula_keys = array('billing_cedula', 'cedula', 'billing_dni', 'dni', 'billing_identification');
    if (in_array($input, $cedula_keys)) {
        // Try to find ANY cedula param in the URL
        if (isset($_GET['billing_cedula']))
            return sanitize_text_field($_GET['billing_cedula']);
        if (isset($_GET['cedula']))
            return sanitize_text_field($_GET['cedula']);
        if (isset($_GET['documentId']))
            return sanitize_text_field($_GET['documentId']);
    }

    return $value;
}
