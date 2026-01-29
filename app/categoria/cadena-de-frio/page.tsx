import { getCategoryBySlug } from '@/app/actions/products';
import { getCategoryTreeData, getProducts, getCategoryGlobalFacets } from '@/lib/woocommerce';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';
import { ThermometerSnowflake, Info } from 'lucide-react';
import { mapWooProduct } from '@/lib/mappers';
import { WooProduct } from '@/types/product';
import CategoryCatalogue from '@/components/category/CategoryCatalogue';

export const metadata: Metadata = {
    title: 'Cadena de Frío | PharmaPlus',
    description: 'Medicamentos refrigerados y especiales con control de temperatura garantizado.',
};

export default async function ColdChainPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const searchQuery = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;

    // 1. Get Category ID first (fast, likely cached by action or cheap)
    const category = await getCategoryBySlug('cadena-de-frio');

    // Fallback if category doesn't exist in WP
    const currentCategory = category || {
        id: 3368, // ID fijo de cadena de frío en Prod
        name: 'Cadena de Frío',
        slug: 'cadena-de-frio',
        description: 'Productos refrigerados',
        count: 0,
        parent: 0
    };

    // 2. Parallel Fetch: Tree, Products (for Grid), and Global Facets (for Sidebar)
    const [categoryTree, productsRes, facets] = await Promise.all([
        getCategoryTreeData(),
        getProducts({
            category: currentCategory.id.toString(),
            search: searchQuery,
            perPage: 12, // Pagination enabled (12 items)
            page: page
        }),
        getCategoryGlobalFacets(currentCategory.id)
    ]);

    const products = productsRes.products.map(p => {
        const mapped = mapWooProduct(p as unknown as WooProduct);
        mapped.isRefrigerated = true;
        return mapped;
    });

    // Custom Header Component
    const ColdChainHeader = (
        <>
            <div className="bg-white rounded-2xl p-8 mb-8 border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <ThermometerSnowflake className="w-48 h-48 text-blue-900" />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                        <ThermometerSnowflake className="w-3.5 h-3.5" />
                        Especialidad Farmacéutica
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Cadena de Frío
                    </h1>
                    <p className="text-gray-500 max-w-2xl text-lg mb-6">
                        Selección especializada de medicamentos que requieren estricto control de temperatura.
                        Garantizamos la integridad del producto desde nuestra farmacia hasta tu hogar.
                    </p>

                    <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 max-w-xl">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                            <strong>Nota Importante:</strong> Estos productos se entregan en empaques térmicos especiales con geles refrigerantes para mantener la temperatura entre 2°C y 8°C.
                        </p>
                    </div>
                </div>
            </div>

            {searchQuery && (
                <div className="mb-6 flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Filtrando por: <span className="text-[var(--color-primary-blue)]">"{searchQuery}"</span>
                    </h2>
                    <Link
                        href="/categoria/cadena-de-frio"
                        className="text-sm text-red-500 hover:underline px-3 py-1 bg-white border border-red-100 rounded-full"
                    >
                        Borrar Filtro
                    </Link>
                </div>
            )}
        </>
    );

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            {/* Breadcrumbs */}
            <Breadcrumbs
                items={[
                    { label: 'Categorías', href: '#' },
                    { label: 'Cadena de Frío', href: `/categoria/cadena-de-frio` }
                ]}
            />

            <div className="mt-6">
                <CategoryCatalogue
                    initialProducts={products}
                    categoryName={currentCategory.name}
                    categorySlug="cadena-de-frio"
                    page={page}
                    totalPages={productsRes.totalPages}
                    searchParams={searchParams}
                    categoryTree={categoryTree}
                    customHeader={ColdChainHeader}
                    facets={facets}
                />
            </div>
        </div>
    );
}
