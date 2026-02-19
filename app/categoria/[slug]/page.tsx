import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategory } from '@/app/actions/products';
import { getCategoryTreeData, getAllProductCategories } from '@/lib/woocommerce';
import { analyzeProductsForFilters } from '@/lib/filterUtils';
import CategorySidebar from '@/components/category/CategorySidebar';
import ProductCard from '@/components/product/ProductCard';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CategoryCatalogue from '@/components/category/CategoryCatalogue';

// Enable ISR (Incremental Static Regeneration) - revalidate every 5 minutes
export const revalidate = 300;

// This function pre-builds all category pages at build time
// Solves the "First Load" slowness issue
export async function generateStaticParams() {
    const categories = await getAllProductCategories();
    return categories.map((category) => ({
        slug: category.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) return { title: 'Categoría no encontrada' };

    return {
        title: `${category.name} | PharmaPlus`,
        description: `Compra productos de ${category.name} en línea. Envíos a todo el país.`,
    };
}

export default async function CategoryPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const minPrice = typeof resolvedSearchParams.min_price === 'string' ? resolvedSearchParams.min_price : undefined;
    const maxPrice = typeof resolvedSearchParams.max_price === 'string' ? resolvedSearchParams.max_price : undefined;
    const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;

    const category = await getCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    // START: OPTIMIZATION FOR SMART FILTERS
    // We now fetch Global Facets (cached) to populate the sidebar with ALL options (not just page 1)
    // START: OPTIMIZATION FOR SMART FILTERS
    // We now fetch Global Facets (cached) to populate the sidebar with ALL options (not just page 1)
    const [{ products, totalPages }, categoryTree] = await Promise.all([
        getProductsByCategory(category.id, { minPrice, maxPrice, page, perPage: 12 }),
        getCategoryTreeData(),
    ]);


    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <Breadcrumbs
                items={[
                    { label: 'Categorías', href: '#' },
                    { label: category.name, href: `/categoria/${category.slug}` }
                ]}
            />

            {/* Smart Catalogue Interface */}
            {/* Replaces the old static Sidebar + Grid */}
            <CategoryCatalogue
                initialProducts={products}
                categoryName={category.name}
                categorySlug={category.slug}
                page={page}
                totalPages={totalPages}
                searchParams={resolvedSearchParams}
                categoryTree={categoryTree}
            />
        </div>
    );
}
