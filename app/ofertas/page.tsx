import { getCustomApiOffers, wcFetchRaw, getCategoryTreeData } from "@/lib/woocommerce";
import { mapWooProduct } from "@/lib/mappers";
import { Metadata } from "next";
import { getPromotedProductSkus } from "@/services/promotions";
import { enrichProductsWithPromotions } from "@/lib/enrichProducts";
import type { Product } from "@/types/woocommerce";
import CategoryCatalogue from "@/components/category/CategoryCatalogue";
import Breadcrumbs from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
    title: "Mundo Ofertas | PharmaPlus",
    description: "Descubre las mejores ofertas y descuentos en medicamentos y productos de salud. Aprovecha nuestras promociones por tiempo limitado.",
};

export const revalidate = 60;

export default async function OfertasPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;

    // Parallel fetch for everything
    const [promotedSkus, categoryTree, { products: saleProducts, total, totalPages }] = await Promise.all([
        getPromotedProductSkus(),
        getCategoryTreeData(),
        getCustomApiOffers(currentPage, 12) // Limit to 12
    ]);

    // Fetch PTC products
    let ptcProducts: Product[] = [];
    if (promotedSkus.length > 0) {
        try {
            const { data } = await wcFetchRaw<any>('products', {
                skus: promotedSkus.join(','),
                stock_status: 'instock',
                fields: 'full'
            }, 60, 'custom-api/v1');

            if (data && data.success && Array.isArray(data.rows)) {
                ptcProducts = data.rows as Product[];
            } else if (Array.isArray(data)) {
                ptcProducts = data as Product[];
            }
        } catch (error) {
            console.error('Error fetching PTC products:', error);
        }
    }

    // Merge and Deduplicate (Priority: PTC)
    const ptcIds = new Set(ptcProducts.map(p => p.id));
    const uniqueSaleProducts = saleProducts.filter(p => !ptcIds.has(p.id));
    const allRawProducts = [...ptcProducts, ...uniqueSaleProducts];

    // Map and Enrich
    const mappedProducts = (allRawProducts as any[]).map(mapWooProduct);
    const enrichedProducts = await enrichProductsWithPromotions(mappedProducts);


    const HeroHeader = (
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-10 px-6 rounded-2xl mb-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/pattern.png')] mix-blend-overlay"></div>
            <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2 drop-shadow-md">
                    Mundo <span className="text-yellow-300">Ofertas</span>
                </h1>
                <p className="text-lg font-medium opacity-95 text-green-50 max-w-xl">
                    Ahorra en grande con nuestros descuentos exclusivos por tiempo limitado.
                </p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumbs
                items={[
                    { label: 'Inicio', href: '/' },
                    { label: 'Ofertas', href: '/ofertas' }
                ]}
            />

            <CategoryCatalogue
                initialProducts={enrichedProducts}
                categoryName="Ofertas"
                categorySlug="ofertas"
                page={currentPage}
                totalPages={totalPages}
                searchParams={params}
                categoryTree={categoryTree}
                basePath="/ofertas"
                customHeader={HeroHeader}
            />
        </div>
    );
}
