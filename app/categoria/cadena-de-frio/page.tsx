import { getCategoryBySlug } from '@/app/actions/products';
import { getCategoryTreeData, getProducts } from '@/lib/woocommerce';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';
import { ThermometerSnowflake, Info, AlertTriangle, Snowflake } from 'lucide-react';
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
    const [categoryTree, productsRes] = await Promise.all([
        getCategoryTreeData(),
        getProducts({
            category: currentCategory.id.toString(),
            search: searchQuery,
            perPage: 12, // Pagination enabled (12 items)
            page: page
        }),
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
                        {/* Packaging Cost Alert */}
                        <div className="flex items-start gap-3 bg-cyan-50 p-4 rounded-xl border border-cyan-100 hover:shadow-sm transition-shadow h-full">
                            <div className="bg-cyan-100 p-2 rounded-full flex-shrink-0">
                                <Snowflake className="w-5 h-5 text-cyan-700" />
                            </div>
                            <div className="text-sm text-cyan-900">
                                <strong className="font-bold block mb-1 text-cyan-800 text-[15px]">Costo Adicional: Nevera ($12.000)</strong>
                                <span className="opacity-90">Este valor <span className="font-bold">se sumará a tu pedido</span> por la nevera certificada obligatoria para el transporte.</span>
                            </div>
                        </div>

                        {/* No Returns Warning */}
                        <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100 hover:shadow-sm transition-shadow h-full">
                            <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="text-sm text-red-900">
                                <strong className="font-bold block mb-1 text-red-800 text-[15px]">Sin Devolución</strong>
                                <span className="opacity-90">Por seguridad sanitaria, los productos de cadena de frío <span className="font-bold underline decoration-red-300">no tienen cambio</span>.</span>
                            </div>
                        </div>
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
                />
            </div>
        </div>
    );
}
