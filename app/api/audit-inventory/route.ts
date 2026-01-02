
import { NextResponse } from 'next/server';
import { getWooApi } from '@/lib/woocommerce';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch a batch of products to analyze inventory
        // We'll fetch 100 products for this audit sample
        const response = await getWooApi().get("products", {
            per_page: 100,
            orderby: 'date',
            order: 'desc'
        });

        const products = response.data;

        // Extract inventory data
        const inventoryReport = products.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            type: p.type,
            manage_stock: p.manage_stock,
            stock_quantity: p.stock_quantity,
            stock_status: p.stock_status, // instock, outofstock, onbackorder
            variations: p.variations?.length || 0
        }));

        const summary = {
            total_analyzed: products.length,
            in_stock_count: inventoryReport.filter((p: any) => p.stock_status === 'instock').length,
            out_of_stock_count: inventoryReport.filter((p: any) => p.stock_status === 'outofstock').length,
            managing_stock_count: inventoryReport.filter((p: any) => p.manage_stock === true).length
        };

        return NextResponse.json({
            summary,
            products: inventoryReport
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
