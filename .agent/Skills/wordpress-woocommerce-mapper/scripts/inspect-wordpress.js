/**
 * WordPress/WooCommerce Complete Inspector
 * 
 * Este script es parte de la skill "WordPress/WooCommerce Headless Mapper"
 * 
 * Inspecciona TODA la estructura de WordPress/WooCommerce:
 * - Productos (todos los campos)
 * - Categorías (con jerarquía)
 * - Atributos de productos
 * - Tags
 * - Órdenes
 * - Clientes
 * - Métodos de envío
 * - Métodos de pago
 * 
 * Genera un archivo JSON completo con toda la información
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WOOCOMMERCE_API_URL;
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

console.log('🔍 Configuración:');
console.log('   WP_URL:', WP_URL);
console.log('   WC_KEY:', WC_KEY ? `${WC_KEY.substring(0, 10)}...` : '❌');
console.log('   WC_SECRET:', WC_SECRET ? `${WC_SECRET.substring(0, 10)}...` : '❌');

if (!WP_URL || !WC_KEY || !WC_SECRET) {
    console.error('\n❌ Faltan credenciales de WooCommerce');
    console.error('\nAsegúrate de tener en .env.local:');
    console.error('   NEXT_PUBLIC_WORDPRESS_URL=https://tu-sitio.com');
    console.error('   WOOCOMMERCE_CONSUMER_KEY=ck_xxxxx');
    console.error('   WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx');
    process.exit(1);
}

// Utilidad para hacer peticiones autenticadas a WooCommerce
async function fetchWC(endpoint, params = {}) {
    const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
    const queryString = new URLSearchParams(params).toString();
    const url = `${WP_URL}/wp-json/wc/v3${endpoint}${queryString ? '?' + queryString : ''}`;

    console.log(`\n🔍 Consultando: ${endpoint}`);

    const response = await fetch(url, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

// 1. Inspeccionar TODOS los atributos de productos
async function inspectProductAttributes() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 INSPECCIONANDO ATRIBUTOS DE PRODUCTOS');
    console.log('='.repeat(80));

    const attributes = await fetchWC('/products/attributes');

    console.log(`\n✅ Total de atributos: ${attributes.length}`);

    const attributesDetail = [];

    for (const attr of attributes) {
        console.log(`\n📊 Atributo: ${attr.name} (ID: ${attr.id})`);
        console.log(`   Slug: ${attr.slug}`);
        console.log(`   Type: ${attr.type}`);
        console.log(`   Order by: ${attr.order_by}`);

        // Obtener términos de este atributo
        try {
            let allTerms = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const terms = await fetchWC(`/products/attributes/${attr.id}/terms`, {
                    per_page: 100,
                    page: page
                });

                allTerms = allTerms.concat(terms);
                hasMore = terms.length === 100;
                page++;
            }

            console.log(`   ✅ Términos: ${allTerms.length}`);

            if (allTerms.length > 0) {
                console.log(`   📝 Ejemplo de término:`);
                console.log(`      ${JSON.stringify(allTerms[0], null, 6)}`);
            }

            attributesDetail.push({
                ...attr,
                terms: allTerms,
                totalTerms: allTerms.length
            });

        } catch (error) {
            console.log(`   ❌ Error obteniendo términos: ${error.message}`);
            attributesDetail.push({
                ...attr,
                terms: [],
                error: error.message
            });
        }
    }

    return attributesDetail;
}

// 2. Inspeccionar categorías de productos
async function inspectProductCategories() {
    console.log('\n' + '='.repeat(80));
    console.log('📁 INSPECCIONANDO CATEGORÍAS DE PRODUCTOS');
    console.log('='.repeat(80));

    let allCategories = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const categories = await fetchWC('/products/categories', {
            per_page: 100,
            page: page
        });

        allCategories = allCategories.concat(categories);
        hasMore = categories.length === 100;
        page++;
    }

    console.log(`\n✅ Total de categorías: ${allCategories.length}`);

    if (allCategories.length > 0) {
        console.log(`\n📝 Ejemplo de categoría:`);
        console.log(JSON.stringify(allCategories[0], null, 2));
    }

    return allCategories;
}

// 3. Inspeccionar tags de productos
async function inspectProductTags() {
    console.log('\n' + '='.repeat(80));
    console.log('🏷️  INSPECCIONANDO TAGS DE PRODUCTOS');
    console.log('='.repeat(80));

    let allTags = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const tags = await fetchWC('/products/tags', {
            per_page: 100,
            page: page
        });

        allTags = allTags.concat(tags);
        hasMore = tags.length === 100;
        page++;
    }

    console.log(`\n✅ Total de tags: ${allTags.length}`);

    if (allTags.length > 0) {
        console.log(`\n📝 Ejemplo de tag:`);
        console.log(JSON.stringify(allTags[0], null, 2));
    }

    return allTags;
}

// 4. Inspeccionar productos (muestra completa de estructura)
async function inspectProducts() {
    console.log('\n' + '='.repeat(80));
    console.log('🛍️  INSPECCIONANDO PRODUCTOS (Muestra)');
    console.log('='.repeat(80));

    // Obtener 5 productos de muestra para ver TODOS los campos
    const products = await fetchWC('/products', {
        per_page: 5,
        page: 1
    });

    console.log(`\n✅ Productos de muestra: ${products.length}`);

    if (products.length > 0) {
        const product = products[0];

        console.log(`\n📊 Estructura COMPLETA de producto:`);
        console.log(`   ID: ${product.id}`);
        console.log(`   SKU: ${product.sku}`);
        console.log(`   Nombre: ${product.name}`);
        console.log(`   Tipo: ${product.type}`);
        console.log(`   Status: ${product.status}`);
        console.log(`   Featured: ${product.featured}`);
        console.log(`   Precio: ${product.price}`);
        console.log(`   Precio regular: ${product.regular_price}`);
        console.log(`   Precio oferta: ${product.sale_price}`);
        console.log(`   Stock: ${product.stock_quantity}`);
        console.log(`   Stock status: ${product.stock_status}`);

        console.log(`\n📋 Campos disponibles en producto:`);
        const fields = Object.keys(product);
        fields.forEach((field, idx) => {
            const value = product[field];
            const type = Array.isArray(value) ? 'array' : typeof value;
            const preview = Array.isArray(value) ? `[${value.length} items]` :
                typeof value === 'object' && value !== null ? '{object}' :
                    JSON.stringify(value);
            console.log(`   ${idx + 1}. ${field} (${type}): ${preview}`);
        });

        console.log(`\n📝 Producto COMPLETO (JSON):`);
        console.log(JSON.stringify(product, null, 2));
    }

    return products;
}

// 5. Inspeccionar estructura de órdenes
async function inspectOrders() {
    console.log('\n' + '='.repeat(80));
    console.log('📦 INSPECCIONANDO ÓRDENES (Muestra)');
    console.log('='.repeat(80));

    try {
        const orders = await fetchWC('/orders', {
            per_page: 2,
            page: 1
        });

        console.log(`\n✅ Órdenes de muestra: ${orders.length}`);

        if (orders.length > 0) {
            console.log(`\n📝 Estructura de orden:`);
            console.log(JSON.stringify(orders[0], null, 2));
        }

        return orders;
    } catch (error) {
        console.log(`\n⚠️  No se pudieron obtener órdenes: ${error.message}`);
        return [];
    }
}

// 6. Inspeccionar clientes
async function inspectCustomers() {
    console.log('\n' + '='.repeat(80));
    console.log('👥 INSPECCIONANDO CLIENTES (Muestra)');
    console.log('='.repeat(80));

    try {
        const customers = await fetchWC('/customers', {
            per_page: 2,
            page: 1
        });

        console.log(`\n✅ Clientes de muestra: ${customers.length}`);

        if (customers.length > 0) {
            console.log(`\n📝 Estructura de cliente:`);
            console.log(JSON.stringify(customers[0], null, 2));
        }

        return customers;
    } catch (error) {
        console.log(`\n⚠️  No se pudieron obtener clientes: ${error.message}`);
        return [];
    }
}

// 7. Inspeccionar métodos de envío
async function inspectShippingMethods() {
    console.log('\n' + '='.repeat(80));
    console.log('🚚 INSPECCIONANDO MÉTODOS DE ENVÍO');
    console.log('='.repeat(80));

    try {
        const zones = await fetchWC('/shipping/zones');

        console.log(`\n✅ Zonas de envío: ${zones.length}`);

        const zonesDetail = [];
        for (const zone of zones) {
            const methods = await fetchWC(`/shipping/zones/${zone.id}/methods`);
            zonesDetail.push({
                ...zone,
                methods: methods
            });

            console.log(`\n📍 Zona: ${zone.name}`);
            console.log(`   Métodos: ${methods.length}`);
        }

        return zonesDetail;
    } catch (error) {
        console.log(`\n⚠️  No se pudieron obtener métodos de envío: ${error.message}`);
        return [];
    }
}

// 8. Inspeccionar métodos de pago
async function inspectPaymentGateways() {
    console.log('\n' + '='.repeat(80));
    console.log('💳 INSPECCIONANDO MÉTODOS DE PAGO');
    console.log('='.repeat(80));

    try {
        const gateways = await fetchWC('/payment_gateways');

        console.log(`\n✅ Métodos de pago: ${gateways.length}`);

        if (gateways.length > 0) {
            console.log(`\n📝 Métodos disponibles:`);
            gateways.forEach(gateway => {
                console.log(`   - ${gateway.title} (${gateway.id}): ${gateway.enabled ? '✅ Activo' : '❌ Inactivo'}`);
            });
        }

        return gateways;
    } catch (error) {
        console.log(`\n⚠️  No se pudieron obtener métodos de pago: ${error.message}`);
        return [];
    }
}

// Función principal
async function main() {
    console.log('\n🚀 INSPECCIÓN COMPLETA DE WORDPRESS/WOOCOMMERCE');
    console.log(`📍 URL: ${WP_URL}`);
    console.log('='.repeat(80));

    const report = {
        timestamp: new Date().toISOString(),
        wpUrl: WP_URL,
        sections: {}
    };

    try {
        // 1. Atributos de productos (INCLUYE LABORATORIOS/MARCAS)
        report.sections.productAttributes = await inspectProductAttributes();

        // 2. Categorías
        report.sections.productCategories = await inspectProductCategories();

        // 3. Tags
        report.sections.productTags = await inspectProductTags();

        // 4. Productos (muestra)
        report.sections.productsSample = await inspectProducts();

        // 5. Órdenes (muestra)
        report.sections.ordersSample = await inspectOrders();

        // 6. Clientes (muestra)
        report.sections.customersSample = await inspectCustomers();

        // 7. Métodos de envío
        report.sections.shippingMethods = await inspectShippingMethods();

        // 8. Métodos de pago
        report.sections.paymentGateways = await inspectPaymentGateways();

        // Guardar reporte completo
        const reportPath = path.join(process.cwd(), 'wordpress-complete-mapping.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log('\n' + '='.repeat(80));
        console.log('✅ INSPECCIÓN COMPLETADA');
        console.log('='.repeat(80));
        console.log(`\n📄 Reporte guardado en: ${reportPath}`);
        console.log(`\n📊 Resumen:`);
        console.log(`   - Atributos de productos: ${report.sections.productAttributes.length}`);
        console.log(`   - Categorías: ${report.sections.productCategories.length}`);
        console.log(`   - Tags: ${report.sections.productTags.length}`);
        console.log(`   - Productos (muestra): ${report.sections.productsSample.length}`);
        console.log(`   - Órdenes (muestra): ${report.sections.ordersSample.length}`);
        console.log(`   - Clientes (muestra): ${report.sections.customersSample.length}`);
        console.log(`   - Zonas de envío: ${report.sections.shippingMethods.length}`);
        console.log(`   - Métodos de pago: ${report.sections.paymentGateways.length}`);

        console.log(`\n💡 Próximos pasos:`);
        console.log(`   1. Revisa el archivo wordpress-complete-mapping.json`);
        console.log(`   2. Identifica TODOS los campos disponibles`);
        console.log(`   3. Mapea los datos necesarios para tu aplicación`);
        console.log(`   4. Genera tipos TypeScript (opcional)`);

    } catch (error) {
        console.error('\n❌ Error durante la inspección:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
