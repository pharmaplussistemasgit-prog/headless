import { Suspense } from 'react';
import { getProducts, getAllProductCategories } from '@/lib/woocommerce';
import { ShopClient } from '@/components/shop/ShopClient';
import { Metadata } from 'next';

interface LabPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: LabPageProps): Promise<Metadata> {
    const params = await props.params;
    const labName = params.slug.replace(/-/g, ' ').toUpperCase();
    return {
        title: `${labName} | PharmaPlus`,
        description: `Descubre todos los productos de ${labName} disponibles en PharmaPlus.`,
    };
}

export default async function LabPage(props: LabPageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const slug = params.slug;

    // Parse pagination from URL
    const page = searchParams?.page ? parseInt(searchParams.page as string) : 1;
    const minPrice = searchParams?.min_price as string;
    const maxPrice = searchParams?.max_price as string;
    const search = searchParams?.search as string;

    // Fetch products and categories in parallel
    const [productsData, categories] = await Promise.all([
        getProducts({
            laboratorySlug: slug,
            page: page,
            perPage: 12, // Match ShopClient standard
            search: search,
            minPrice: minPrice,
            maxPrice: maxPrice,
        }),
        getAllProductCategories(),
    ]);

    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="text-lg font-medium text-gray-500 animate-pulse">Cargando laboratorio...</div>
        </div>}>
            <ShopClient
                initialProducts={productsData.products}
                categories={categories}
                tags={[]} // Let client derive
                attributes={[]} // Let client derive
                totalPages={productsData.totalPages}
                currentPage={page}
            />
        </Suspense>
    );
}
