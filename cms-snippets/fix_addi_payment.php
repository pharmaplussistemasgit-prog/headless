<?php
/**
 * Title: Fix Addi/Payment Validation for Headless Orders
 * Description: Pre-populates billing fields (specifically Cedula) on the 'Order Pay' page using metadata saved from the Headless checkout.
 */

add_filter( 'woocommerce_checkout_get_value', 'saprix_populate_order_pay_fields', 10, 2 );

function saprix_populate_order_pay_fields( $value, $input ) {
    // 1. Only run this on the "Order Pay" page (paying for a pending order)
    if ( ! is_checkout_pay_page() ) {
        return $value;
    }

    // 2. If the field already has a value, leave it alone
    if ( ! empty( $value ) ) {
        return $value;
    }

    // 3. Get the current Order ID from the URL
    global $wp;
    if ( isset( $wp->query_vars['order-pay'] ) ) {
        $order_id = absint( $wp->query_vars['order-pay'] );
        $order    = wc_get_order( $order_id );

        if ( ! $order ) {
            return $value;
        }

        // 4. Map fields: List of possible field names for "Cedula" that plugins might use
        // We check if the current input field ($input) matches any of these known "Cedula" keys
        $cedula_field_names = array(
            'billing_cedula',
            'cedula',
            'billing_dni',
            'dni',
            'billing_identification',
            'billing_creg_cedula', // Common in some plugins
            'billing_wooccm11',    // Custom field plugin default
            'identification_number'
        );

        if ( in_array( $input, $cedula_field_names ) ) {
            // 5. Retrieve the value we saved from the Headless API
            // We search for our saved meta keys in priority order
            $saved_cedula = $order->get_meta( '_billing_cedula' );
            
            if ( empty( $saved_cedula ) ) $saved_cedula = $order->get_meta( 'billing_cedula' );
            if ( empty( $saved_cedula ) ) $saved_cedula = $order->get_meta( 'cedula' );
            if ( empty( $saved_cedula ) ) $saved_cedula = $order->get_meta( 'dni' );
            if ( empty( $saved_cedula ) ) $saved_cedula = $order->get_meta( 'numero_documento' );

            if ( ! empty( $saved_cedula ) ) {
                return $saved_cedula;
            }
        }
    }

    return $value;
}

// Optional: Force fields to be "optional" validation-wise on the Pay page if they are causing blocks
// Uncomment if the above isn't enough
/*
add_filter( 'woocommerce_billing_fields', 'saprix_make_fields_optional_on_pay', 9999 );
function saprix_make_fields_optional_on_pay( $fields ) {
    if ( is_checkout_pay_page() ) {
        if ( isset( $fields['billing_cedula'] ) ) {
            //$fields['billing_cedula']['required'] = false; // Dangerous, usually Addi needs it
        }
    }
    return $fields;
}
*/
