import { Suspense } from 'react';
import { ShopClient } from '@/components/shop/ShopClient';
import { getAllProductCategories, getProducts, getAllProductTags, getAllProductAttributesWithTerms } from '@/lib/woocommerce';

export const metadata = {
  title: 'Tienda - PharmaPlus',
  description: 'Descubre nuestra colección completa de productos de salud y bienestar',
};

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300;

export default async function TiendaPage(props: {
  searchParams: Promise<{ category?: string; page?: string; search?: string; min_price?: string; max_price?: string }>;
}) {
  const searchParams = await props.searchParams;
  // Extract params
  const categorySlug = searchParams?.category;
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const search = searchParams?.search;
  const minPrice = searchParams?.min_price;
  const maxPrice = searchParams?.max_price;

  // 1. Fetch metadata first (needed to resolve slugs to IDs)
  const [categories, tags, attributes] = await Promise.all([
    getAllProductCategories(),
    getAllProductTags(),
    getAllProductAttributesWithTerms(),
  ]);

  // 2. Resolve category slug to ID
  let categoryId: string | undefined;
  if (categorySlug) {
    const matchedCat = categories.find(c => c.slug.toLowerCase() === categorySlug.toLowerCase());
    // If found, use ID. If not found, use '-1' to force empty result (customer filters for non-existent category)
    categoryId = matchedCat ? matchedCat.id.toString() : '-1';
  }

  // 3. Fetch products with resolved ID
  const productsData = await getProducts({
    category: categoryId,
    search: search,
    page: page,
    perPage: 12, // Standard page size
    minPrice: minPrice,
    maxPrice: maxPrice,
  });

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Cargando productos...</div>
    </div>}>
      <ShopClient
        initialProducts={productsData.products}
        categories={categories}
        tags={tags}
        attributes={attributes}
        totalPages={productsData.totalPages}
        currentPage={page}
      />
    </Suspense>
  );
}