import { Suspense } from 'react';
import { getCategoryTreeData, getProducts } from '@/lib/woocommerce';
import CategoryCatalogue from '@/components/category/CategoryCatalogue';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { mapWooProduct } from '@/lib/mappers';
import CategoryLoading from '@/app/categoria/[slug]/loading';

export const metadata = {
  title: 'Tienda - PharmaPlus',
  description: 'Descubre nuestra colección completa de productos de salud y bienestar',
};

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300;

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; page?: string; search?: string; min_price?: string; max_price?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams?.page ? parseInt(resolvedSearchParams.page) : 1;
  const minPrice = resolvedSearchParams?.min_price;
  const maxPrice = resolvedSearchParams?.max_price;
  const search = resolvedSearchParams?.search;
  const brandId = resolvedSearchParams?.brand;
  const categorySlug = resolvedSearchParams?.category;

  // 1. Fetch metadata and products in parallel
  const [categoryTree, productsData] = await Promise.all([
    getCategoryTreeData(),
    getProducts({
      category: categorySlug,
      laboratory: brandId,
      search: search,
      page: page,
      perPage: 12,
      minPrice: minPrice,
      maxPrice: maxPrice,
      stockStatus: null,
    })
  ]);

  const mappedProducts = (productsData.products || []).map((p: any) => mapWooProduct(p));

  return (
    <Suspense fallback={<CategoryLoading />}>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Tienda', href: '/tienda' }
          ]}
        />

        <CategoryCatalogue
          initialProducts={mappedProducts}
          categoryName="Nuestra Tienda"
          categorySlug="general"
          page={page}
          totalPages={productsData.totalPages}
          searchParams={resolvedSearchParams}
          categoryTree={categoryTree}
          basePath="/tienda"
        />
      </div>
    </Suspense>
  );
}