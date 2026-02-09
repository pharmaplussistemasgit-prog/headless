# Ejemplos de Uso - WordPress/WooCommerce Headless Mapper

## Ejemplo 1: Página de Listado de Productos

```typescript
// app/shop/page.tsx
import { Suspense } from 'react';
import ProductGrid from '@/components/ProductGrid';
import Sidebar from '@/components/Sidebar';

export default async function ShopPage({
  searchParams
}: {
  searchParams: { category?: string; brand?: string; page?: string }
}) {
  // Fetch usando estructura mapeada
  const products = await fetchProducts({
    category: searchParams.category,
    attribute: searchParams.brand ? `pa_laboratorio:${searchParams.brand}` : undefined,
    page: parseInt(searchParams.page || '1'),
    per_page: 24
  });

  const categories = await fetchCategories();
  const brands = await fetchBrands();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar con filtros */}
        <aside className="lg:col-span-1">
          <Sidebar categories={categories} brands={brands} />
        </aside>

        {/* Grid de productos */}
        <main className="lg:col-span-3">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

## Ejemplo 2: Sidebar de Filtros

```typescript
// components/Sidebar.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SidebarProps {
  categories: Category[];
  brands: Brand[];
}

export default function Sidebar({ categories, brands }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', categorySlug);
    params.delete('page'); // Reset página
    router.push(`/shop?${params.toString()}`);
  };

  const handleBrandChange = (brandSlug: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('brand', brandSlug);
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  // Categorías con jerarquía
  const rootCategories = categories.filter(cat => cat.parent === 0);

  return (
    <div className="space-y-6">
      {/* Categorías */}
      <div>
        <h3 className="font-bold text-lg mb-4">Categorías</h3>
        <ul className="space-y-2">
          {rootCategories.map(category => (
            <li key={category.id}>
              <button
                onClick={() => handleCategoryChange(category.slug)}
                className="flex items-center justify-between w-full hover:text-blue-600"
              >
                <span>{category.name}</span>
                <span className="text-sm text-gray-500">({category.count})</span>
              </button>
              
              {/* Subcategorías */}
              {categories.filter(c => c.parent === category.id).length > 0 && (
                <ul className="ml-4 mt-2 space-y-1">
                  {categories
                    .filter(c => c.parent === category.id)
                    .map(subcat => (
                      <li key={subcat.id}>
                        <button
                          onClick={() => handleCategoryChange(subcat.slug)}
                          className="text-sm hover:text-blue-600"
                        >
                          {subcat.name} ({subcat.count})
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Marcas/Laboratorios */}
      <div>
        <h3 className="font-bold text-lg mb-4">Marcas</h3>
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {brands
            .filter(brand => brand.count > 0)
            .map(brand => (
              <li key={brand.id}>
                <button
                  onClick={() => handleBrandChange(brand.slug)}
                  className="flex items-center justify-between w-full hover:text-blue-600"
                >
                  <span>{brand.name}</span>
                  <span className="text-sm text-gray-500">({brand.count})</span>
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
```

## Ejemplo 3: Card de Producto con Ofertas

```typescript
// components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Calcular descuento
  const discount = product.on_sale
    ? Math.round(
        ((parseFloat(product.regular_price) - parseFloat(product.sale_price)) /
          parseFloat(product.regular_price)) *
          100
      )
    : 0;

  // Validar imagen
  const imageUrl = product.images?.[0]?.src || '/placeholder.jpg';

  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        {/* Badge de oferta */}
        {product.on_sale && discount > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {discount}% OFF
          </div>
        )}

        {/* Badge de stock */}
        {product.stock_status === 'outofstock' && (
          <div className="absolute top-2 left-2 z-10 bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
            Agotado
          </div>
        )}

        {/* Imagen */}
        <div className="relative h-64 bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Título */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Categoría */}
          {product.categories?.[0] && (
            <p className="text-sm text-gray-500 mb-2">
              {product.categories[0].name}
            </p>
          )}

          {/* Precio */}
          <div className="flex items-center gap-2">
            {product.on_sale ? (
              <>
                <span className="text-xl font-bold text-red-600">
                  ${parseFloat(product.sale_price).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${parseFloat(product.regular_price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900">
                ${parseFloat(product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock */}
          {product.stock_status === 'instock' && product.stock_quantity && (
            <p className="text-sm text-green-600 mt-2">
              {product.stock_quantity} disponibles
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
```

## Ejemplo 4: Funciones de Utilidad

```typescript
// lib/woocommerce-utils.ts

/**
 * Calcula el porcentaje de descuento
 */
export function calculateDiscount(regular: number, sale: number): number {
  if (!regular || !sale || sale >= regular) return 0;
  return Math.round(((regular - sale) / regular) * 100);
}

/**
 * Formatea precio con símbolo de moneda
 */
export function formatPrice(price: string | number, currency: string = 'USD'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: currency
  }).format(numPrice);
}

/**
 * Obtiene el estado de stock legible
 */
export function getStockStatus(status: string): {
  label: string;
  color: string;
} {
  const statuses = {
    instock: { label: 'En stock', color: 'text-green-600' },
    outofstock: { label: 'Agotado', color: 'text-red-600' },
    onbackorder: { label: 'En pedido', color: 'text-yellow-600' }
  };
  return statuses[status as keyof typeof statuses] || statuses.outofstock;
}

/**
 * Valida si un producto está en oferta válida
 */
export function isValidSale(product: Product): boolean {
  if (!product.on_sale) return false;
  
  const regular = parseFloat(product.regular_price);
  const sale = parseFloat(product.sale_price);
  
  if (!regular || !sale || sale >= regular) return false;
  
  // Verificar fechas de oferta
  if (product.date_on_sale_from || product.date_on_sale_to) {
    const now = new Date();
    const from = product.date_on_sale_from ? new Date(product.date_on_sale_from) : null;
    const to = product.date_on_sale_to ? new Date(product.date_on_sale_to) : null;
    
    if (from && now < from) return false;
    if (to && now > to) return false;
  }
  
  return true;
}

/**
 * Extrae valor de meta_data
 */
export function getMetaValue(
  product: Product,
  key: string,
  defaultValue: any = null
): any {
  const meta = product.meta_data?.find(m => m.key === key);
  return meta ? meta.value : defaultValue;
}
```

## Ejemplo 5: Caching con Next.js

```typescript
// lib/woocommerce-api.ts
import { cache } from 'react';

const CACHE_DURATION = 60 * 60; // 1 hora

/**
 * Fetch productos con caching
 */
export const getCachedProducts = cache(
  async (params: {
    category?: string;
    attribute?: string;
    page?: number;
    per_page?: number;
    on_sale?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.set('category', params.category);
    if (params.attribute) queryParams.set('attribute', params.attribute);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.per_page) queryParams.set('per_page', params.per_page.toString());
    if (params.on_sale) queryParams.set('on_sale', 'true');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products?${queryParams}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
          ).toString('base64')}`
        },
        next: { revalidate: CACHE_DURATION }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return response.json();
  }
);

/**
 * Fetch categorías con caching
 */
export const getCachedCategories = cache(
  async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products/categories?per_page=100`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
          ).toString('base64')}`
        },
        next: { revalidate: CACHE_DURATION * 24 } // 24 horas
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return response.json();
  }
);
```

---

Estos ejemplos muestran cómo usar el mapeo completo de WordPress/WooCommerce en una aplicación headless real.
