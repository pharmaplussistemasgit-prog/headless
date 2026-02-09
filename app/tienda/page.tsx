import { Suspense } from 'react';
import { ShopClient } from '@/components/shop/ShopClient';
import { getAllProductCategories, getProducts } from '@/lib/woocommerce';

export const metadata = {
  title: 'Tienda - PharmaPlus',
  description: 'Descubre nuestra colección completa de productos de salud y bienestar',
};

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300;

export default async function TiendaPage(props: {
  searchParams: Promise<{ category?: string; brand?: string; page?: string; search?: string; min_price?: string; max_price?: string }>;
}) {
  const searchParams = await props.searchParams;
  // Extract params
  const categorySlug = searchParams?.category;
  const brandId = searchParams?.brand;
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const search = searchParams?.search;
  const minPrice = searchParams?.min_price;
  const maxPrice = searchParams?.max_price;

  // 1. Fetch metadata first (needed to resolve slugs to IDs)
  // OPTIMIZATION: Removed getAllProductTags and attributes to speed up load time.
  // ShopClient now derives filters from the loaded products.
  const [categories] = await Promise.all([
    getAllProductCategories(),
  ]);

  // 2. Resolve category slug or ID
  let categoryId: string | undefined;
  if (categorySlug) {
    // If it's a numeric ID, use it directly. Otherwise, find by slug.
    const isNumericId = /^\d+$/.test(categorySlug);
    if (isNumericId) {
      categoryId = categorySlug;
    } else {
      const matchedCat = categories.find(c => c.slug.toLowerCase() === categorySlug.toLowerCase());
      // If not found by slug, use '-1' to force empty result
      categoryId = matchedCat ? matchedCat.id.toString() : '-1';
    }
  }

  // 3. Fetch products with resolved ID
  const productsData = await getProducts({
    category: categoryId,
    laboratory: brandId,
    search: search,
    page: page,
    perPage: 12, // Standard page size
    minPrice: minPrice,
    maxPrice: maxPrice,
    stockStatus: search ? null : 'instock', // Show OOS only in search
  });

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-lg font-medium text-gray-500 animate-pulse">Cargando productos...</div>
    </div>}>
      <ShopClient
        initialProducts={productsData.products}
        categories={categories}
        tags={[]} // Pass empty, let client derive
        attributes={[]} // Pass empty, let client derive
        totalPages={productsData.totalPages}
        currentPage={page}
      />
    </Suspense>
  );
}