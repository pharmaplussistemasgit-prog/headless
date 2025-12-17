
import { NextResponse } from 'next/server'; // Correct Import
import { createAddiPayment } from '@/lib/addi';

// Configuración de WooCommerce
const WOO_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://pagos.saprix.com.co";
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY || "ck_88721898d82f29e0f8664d7e3316aa460340f587";
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET || "cs_37ebd5161dd1ed62e199570e702fb7d123454569";

// Configuración de Wompi
const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "pub_test_your_key_here";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("🔥 [API CHECKOUT] Iniciando proceso...", { paymentMethod: body.paymentMethod });
        console.log("DATA DE ENTRADA:", JSON.stringify(body, null, 2));

        const { customer, billing, cartItems, cartTotal, paymentMethod } = body;

        if (!customer || !cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        // 1. PREPARAR DATOS PARA WOOCOMMERCE
        const line_items = cartItems.map((item: any) => ({
            product_id: item.id,
            variation_id: item.variationId || undefined,
            quantity: item.quantity,
        }));

        // Determinar método de pago para WooCommerce
        const methodId = paymentMethod === 'addi' ? 'addi' : 'wompi';
        const methodTitle = paymentMethod === 'addi' ? 'Pago con Addi' : 'Pago con Wompi (Tarjetas/PSE)';

        const orderData = {
            payment_method: methodId,
            payment_method_title: methodTitle,
            set_paid: false,
            billing: {
                first_name: billing?.firstName || customer.firstName,
                last_name: billing?.lastName || customer.lastName,
                address_1: billing?.address || customer.address,
                address_2: billing?.apartment || customer.apartment || '',
                city: billing?.city || customer.city,
                state: billing?.state || customer.state,
                postcode: billing?.postcode || customer.postcode || '',
                country: 'CO',
                email: billing?.email || customer.email,
                phone: billing?.phone || customer.phone,
            },
            shipping: {
                first_name: customer.firstName,
                last_name: customer.lastName,
                address_1: customer.address,
                address_2: customer.apartment || '',
                city: customer.city,
                state: customer.state,
                postcode: customer.postcode || '',
                country: 'CO',
            },
            line_items: line_items,
            meta_data: [
                // ID Keys for standard WooCommerce
                { key: '_billing_cedula', value: customer.documentId }, // Common
                { key: 'billing_cedula', value: customer.documentId },
                { key: 'tipo_documento', value: 'CC' },
                { key: 'numero_documento', value: customer.documentId },
                // ID Keys for Addi Plugin for WooCommerce
                { key: '_billing_document_id', value: customer.documentId },
                { key: 'billing_document_id', value: customer.documentId },
                { key: '_billing_identification', value: customer.documentId },
                { key: 'billing_identification', value: customer.documentId },
                // ID Keys for Wompi Plugin for WooCommerce
                { key: '_billing_dni', value: customer.documentId },
                { key: 'billing_dni', value: customer.documentId }
            ],
            shipping_lines: [
                {
                    method_id: 'flat_rate',
                    method_title: customer.shippingZone === 'recoger' ? 'Recoger en Tienda' : 'Envío',
                    total: String(body.shippingCost || 0)
                }
            ]
        };

        // 2. CREAR ORDEN EN WOOCOMMERCE
        console.log(`📌 Creando orden en WooCommerce: ${WOO_URL}/wp-json/wc/v3/orders`);

        let wooResponse;
        try {
            wooResponse = await fetch(`${WOO_URL}/wp-json/wc/v3/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`${CK}:${CS}`),
                },
                body: JSON.stringify(orderData),
            });
        } catch (fetchError) {
            console.error("❌ ERROR FETCH WOOCOMMERCE:", fetchError);
            throw new Error(`Error de conexión con WooCommerce: ${(fetchError as Error).message}`);
        }

        const wooOrder = await wooResponse.json();

        if (!wooResponse.ok) {
            console.error('WooCommerce Error:', wooOrder);
            throw new Error(wooOrder.message || 'Error al crear la orden en WooCommerce');
        }

        const orderId = wooOrder.id;
        const orderKey = wooOrder.order_key; // Necesario para fallback

        // 3. PROCESAR PAGO SEGÚN SELECCIÓN
        let redirectUrl = '';

        if (paymentMethod === 'addi') {
            // --- LÓGICA ADDI ---
            const addiResponse = await createAddiPayment({
                orderId: String(orderId),
                totalAmount: cartTotal, // Addi Total
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                documentId: customer.documentId,
                redirectTo: `${SITE_URL}/orden-confirmada?order_id=${orderId}`
            });
            redirectUrl = addiResponse._links?.webRedirect?.href || addiResponse.redirectUrl;

        } else {
            // --- LÓGICA WOMPI ---
            if (WOMPI_PUBLIC_KEY && !WOMPI_PUBLIC_KEY.includes('test_your_key')) {
                const amountInCents = Math.round(cartTotal * 100);
                const wompiPayload = {
                    name: `Orden #${orderId}`,
                    description: `Pago de orden #${orderId} en Saprix`,
                    single_use: true,
                    collect_shipping: false,
                    currency: "COP",
                    amount_in_cents: amountInCents,
                    redirect_url: `${SITE_URL}/orden-confirmada?order_id=${orderId}`,
                    sku: `ORD-${orderId}`
                };

                const wompiResponse = await fetch('https://production.wompi.co/v1/payment_links', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(wompiPayload),
                });

                if (wompiResponse.ok) {
                    const wompiData = await wompiResponse.json();
                    const permalink = wompiData.data?.permalink;
                    if (permalink) {
                        redirectUrl = `${permalink}?customer_email=${customer.email}`;
                    }
                } else {
                    console.error('Wompi Link Error:', await wompiResponse.json());
                }
            }
        }

        // 4. RESPUESTA FINAL
        if (redirectUrl) {
            return NextResponse.json({
                success: true,
                permalink: redirectUrl,
                orderId,
                provider: paymentMethod
            });
            // ERROR: No se generó link de pago
            console.error("❌ ERROR: No se obtuvo link de pago del proveedor:", paymentMethod);
            return NextResponse.json(
                {
                    error: `No se pudo generar el link de pago con ${paymentMethod === 'addi' ? 'Addi' : 'Wompi'}. Por favor verifica la configuración o intenta más tarde.`,
                    details: 'Redirect URL is empty'
                },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error("🚨 CRITICAL ERROR EN API CHECKOUT:", error);
        return NextResponse.json(
            { error: error.message || 'Error interno del servidor', details: error.toString() },
            { status: 500 }
        );
    }
}
