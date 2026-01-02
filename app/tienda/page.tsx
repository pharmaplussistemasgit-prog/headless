import { Suspense } from 'react';
import { ShopClient } from '@/components/shop/ShopClient';
import { getAllProductCategories, getProducts, getAllProductTags, getAllProductAttributesWithTerms } from '@/lib/woocommerce';

export const metadata = {
  title: 'Tienda - Saprix',
  description: 'Descubre nuestra colección completa de productos de salud y bienestar',
};

export default async function TiendaPage(props: {
  searchParams: Promise<{ category?: string; page?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  // Extract params
  const categorySlug = searchParams?.category;
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const search = searchParams?.search;

  // Fetch parallel
  const [productsData, categories, tags, attributes] = await Promise.all([
    getProducts({
      category: categorySlug,
      search: search,
      page: page,
      perPage: 24, // Standard page size
    }),
    getAllProductCategories(),
    getAllProductTags(),
    getAllProductAttributesWithTerms(),
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Cargando productos...</div>
    </div>}>
      <ShopClient
        initialProducts={productsData.products}
        categories={categories}
        tags={tags}
        attributes={attributes}
      />
    </Suspense>
  );
}