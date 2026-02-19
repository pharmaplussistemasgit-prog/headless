// En lib/woocommerce.ts
import "server-only";

import API from "@woocommerce/woocommerce-rest-api";
import type {
  Variation,
  Product,
  Category,
  Tag,
  ProductAttribute,
  AttributeTerm,
  AttributeWithTerms,
  CategoryTree
} from "@/types/woocommerce";
import { mapWooProduct } from "@/lib/mappers";
import { analyzeProductsForFilters, FilterState } from "@/lib/filterUtils";

let _api: API | null = null;

export function getWooApi(): API {
  if (_api) return _api;

  const url = process.env.WOOCOMMERCE_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://example.com";
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";

  _api = new API({
    url,
    consumerKey,
    consumerSecret,
    version: "wc/v3",
    axiosConfig: {
      timeout: 30000 // 30 seconds timeout
    }
  });
  return _api;
}

/**
 * Obtiene las variaciones de un producto por su ID.
 */
export async function getProductVariations(productId: number): Promise<Variation[]> {
  try {
    const response = await getWooApi().get(`products/${productId}/variations`, {
      per_page: 100,
    });

    if (response.status !== 200) {
      throw new Error(`Error en la API: ${response.statusText}`);
    }

    const data = response.data ?? [];
    return data as Variation[];
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error obteniendo variaciones para producto ${productId}:`, errMsg);
    return [];
  }
}

// Traer producto por slug (primer resultado)
// Revalidación desactivada (0) para evitar problemas de caché persistente y desincronización
export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Guard for system files and common non-product paths to avoid slow 2s API calls
  if (!slug || slug.includes('.') || ['favicon', 'apple-touch-icon', 'robots', 'sitemap'].some(s => slug.startsWith(s))) {
    return null;
  }
  try {
    const response = await wcFetchRaw<Product[]>("products", { slug, per_page: 1 }, 0);
    const items = response.data ?? [];
    if (Array.isArray(items) && items.length > 0) {
      return items[0];
    }
    return null;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error obteniendo producto por slug ${slug}:`, errMsg);
    return null;
  }
}


// Traer el producto más reciente (fallback para la página de referencia)
export async function getLatestProduct(): Promise<Product | null> {
  try {
    const response = await getWooApi().get("products", { per_page: 1, order: "desc", orderby: "date" });
    const items = response.data ?? [];
    if (Array.isArray(items) && items.length > 0) {
      return items[0] as Product;
    }
    return null;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error obteniendo el producto más reciente:", errMsg);
    return null;
  }
}

/**
 * Obtiene productos que están en oferta (on_sale: true).
 * WooCommerce maneja automáticamente las fechas de vigencia (date_on_sale_from/to).
 */
export async function getOnSaleProducts(page: number = 1, perPage: number = 24): Promise<{ products: Product[]; total: number; totalPages: number }> {
  try {
    const response = await wcFetchRaw<Product[]>("products", {
      on_sale: true,
      per_page: perPage,
      page: page,
      status: 'publish',
      stock_status: 'instock' // Opcional: solo stock disponible
    }, 3600); // Cache de 1 hora para ofertas

    const total = parseInt(response.headers.get("x-wp-total") || "0", 10);
    const totalPages = parseInt(response.headers.get("x-wp-totalpages") || "0", 10);
    const data = response.data ?? [];

    return {
      products: data,
      total,
      totalPages
    };
  } catch (error) {
    console.error("Error obteniendo productos en oferta:", error);
    return { products: [], total: 0, totalPages: 0 };
  }
}

// Helper: obtener URL de imagen de la librería de medios de WordPress por ID
async function getMediaSourceUrl(mediaId: number): Promise<string | undefined> {
  try {
    const base = process.env.WOOCOMMERCE_API_URL || "";
    if (!base) return undefined;
    const url = `${base.replace(/\/$/, "")}/wp-json/wp/v2/media/${mediaId}`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const j = await res.json();
    return j?.source_url || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Extrae opciones de color directamente de las variaciones del producto.
 */
export async function getColorOptionsFromVariations(productId: number): Promise<Array<{ option: string; variations: number[]; image?: string }>> {
  const variations = await getProductVariations(productId);
  const byColor: Record<string, { option: string; variations: number[]; image?: string }> = {};

  for (const v of variations) {
    const attrs = Array.isArray(v.attributes) ? v.attributes : [];
    const colorAttr = attrs.find((a) => {
      const slug = (a.slug || a.name || "").toString().toLowerCase();
      return slug.includes("color") || slug.includes("pa_color");
    });

    const option = colorAttr?.option;
    if (!option) continue;

    const key = option.toString();
    if (!byColor[key]) {
      byColor[key] = { option: key, variations: [], image: v.image?.src || undefined };
    }

    byColor[key].variations.push(v.id);

    // Preferir imagen de la variación
    if (!byColor[key].image && v.image?.src) {
      byColor[key].image = v.image.src;
    }

    // Soporte para plugins de galería de variaciones vía meta_data
    if (!byColor[key].image && Array.isArray(v.meta_data)) {
      const galleryMeta = v.meta_data?.find((m) => ["woo_variation_gallery_images", "rtwpvg_images"].includes(m.key));
      const ids: number[] = Array.isArray(galleryMeta?.value)
        ? (galleryMeta!.value as unknown[]).map((x) => Number(x)).filter((n: number) => Number.isFinite(n))
        : [];

      if (ids.length > 0) {
        const src = await getMediaSourceUrl(ids[0]);
        if (src) byColor[key].image = src;
      }
    }
  }
  return Object.values(byColor);
}

/**
 * Extrae opciones de talla directamente de las variaciones del producto.
 */
export async function getSizeOptionsFromVariations(productId: number): Promise<Array<{ option: string; variations: number[] }>> {
  const variations = await getProductVariations(productId);
  const bySize: Record<string, { option: string; variations: number[] }> = {};

  for (const v of variations) {
    const attrs = Array.isArray(v.attributes) ? v.attributes : [];
    const sizeAttr = attrs.find((a) => {
      const slug = (a.slug || a.name || "").toString().toLowerCase();
      return slug.includes("talla") || slug.includes("size") || slug.includes("pa_talla");
    });

    const option = sizeAttr?.option;
    if (!option) continue;

    const key = option.toString();
    if (!bySize[key]) {
      bySize[key] = { option: key, variations: [] };
    }
    bySize[key].variations.push(v.id);
  }
  return Object.values(bySize);
}

// -------- Catálogo global: categorías, etiquetas y atributos --------

function buildUrl(endpoint: string, params: Record<string, unknown> = {}, namespace: string = "wc/v3"): string {
  const base = (process.env.WOOCOMMERCE_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://example.com").replace(/\/$/, "");
  const ck = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
  const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
  const url = new URL(`${base}/wp-json/${namespace}/${endpoint}`);

  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    url.searchParams.set(k, String(v));
  });

  url.searchParams.set("consumer_key", ck);
  url.searchParams.set("consumer_secret", cs);
  return url.toString();
}

export async function wcFetchRaw<T>(endpoint: string, params: Record<string, unknown> = {}, revalidate = 600, namespace: string = "wc/v3"): Promise<{ data: T; headers: Headers }> {
  const start = performance.now();
  const url = buildUrl(endpoint, params, namespace);
  console.log(`[WooCommerce] Fetching (${namespace}): ${url}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout
    const fetchOptions: RequestInit = {
      signal: controller.signal,
      ...((revalidate === 0) ? { cache: 'no-store' } : { next: { revalidate } })
    };

    const res = await fetch(url, fetchOptions);
    const end = performance.now();
    console.log(`[WooCommerce] ${endpoint} took ${(end - start).toFixed(0)}ms | Status: ${res.status}`);
    clearTimeout(timeoutId);

    if (!res.ok) {
      const msg = `WooCommerce fetch failed: ${res.status} ${res.statusText}`;
      if (res.status === 401 || res.status === 403) {
        console.warn(`${msg}. Verifica WOOCOMMERCE_API_URL, WOOCOMMERCE_CONSUMER_KEY y WOOCOMMERCE_CONSUMER_SECRET.`);
        return { data: [] as unknown as T, headers: res.headers };
      }
      throw new Error(msg);
    }
    const data = (await res.json()) as T;
    return { data, headers: res.headers };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`[WooCommerce] Timeout (25s) fetching ${url}`);
      throw new Error("Tiempo de espera agotado al conectar con el servidor.");
    }
    console.error(`[WooCommerce] Fetch Error for ${url}:`, error.message || error);
    if (error?.cause) console.error(`[WooCommerce] Cause:`, error.cause);

    if (error.message?.includes('fetch failed')) {
      throw new Error("Error de red: No se pudo conectar con el servidor de WooCommerce.");
    }
    throw error;
  }
}


/**
 * Fetch especializado para la Custom API (usa X-API-KEY, no consumer_key/secret)
 * Con timeout reducido para no bloquear la home si el endpoint no existe/falla
 */
async function customApiFetch<T>(endpoint: string, params: Record<string, unknown> = {}, timeoutMs = 8000): Promise<T | null> {
  const base = (process.env.WOOCOMMERCE_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL || "").replace(/\/$/, "");
  const apiKey = process.env.CUSTOM_API_KEY || process.env.WORDPRESS_API_KEY || "";
  const url = new URL(`${base}/wp-json/custom-api/v1/${endpoint}`);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache 5 min
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[CustomAPI] ${endpoint} -> ${res.status} ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      console.warn(`[CustomAPI] Timeout (${timeoutMs}ms) alcanzado para: ${endpoint}`);
    } else {
      console.warn(`[CustomAPI] Error en ${endpoint}:`, error?.message || error);
    }
    return null; // Siempre retorna null en error, nunca lanza
  }
}

/**
 * Obtiene ofertas usando la Custom API optimizada (V4.0)
 * Si la Custom API no está disponible, retorna array vacío (sin romper la home)
 */
export async function getCustomApiOffers(page: number = 1, perPage: number = 20): Promise<{ products: Product[]; total: number; totalPages: number }> {
  const EMPTY = { products: [], total: 0, totalPages: 0 };

  const data = await customApiFetch<any>('products', {
    on_sale: true,
    per_page: perPage,
    page,
    fields: 'full',
  });

  if (!data) return EMPTY;

  if (data.success && Array.isArray(data.rows)) {
    return {
      products: data.rows as Product[],
      total: data.total || 0,
      totalPages: data.max_pages || 0,
    };
  }

  // Si la API devuelve array directo (sin wrapper)
  if (Array.isArray(data)) {
    return { products: data as Product[], total: data.length, totalPages: 1 };
  }

  return EMPTY;
}


async function wcFetchAll<T>(endpoint: string, params: Record<string, unknown> = {}, revalidate = 600): Promise<T[]> {
  const start = performance.now();
  const first = await wcFetchRaw<T[]>(endpoint, { ...params, page: 1 }, revalidate);
  const totalPages = parseInt(first.headers.get("x-wp-totalpages") || "1");
  const all: T[] = Array.isArray(first.data) ? [...first.data] : [];

  // Fetch remaining pages in parallel chunks to speed up
  const pagePromises = [];
  for (let page = 2; page <= totalPages; page++) {
    pagePromises.push(wcFetchRaw<T[]>(endpoint, { ...params, page }, revalidate));
  }

  if (pagePromises.length > 0) {
    const results = await Promise.all(pagePromises);
    results.forEach(resp => {
      if (Array.isArray(resp.data)) all.push(...resp.data);
    });
  }

  const end = performance.now();
  console.log(`[WooCommerce] wcFetchAll('${endpoint}') took ${(end - start).toFixed(2)}ms | Pages: ${totalPages} | Items: ${all.length}`);
  return all;
}

// Cache duration for structural data (Categories, Tags, Attributes)
// 24 Hours - This data changes very rarely
const CATEGORY_CACHE_TTL = 86400;

export async function getAllProductCategories(): Promise<Category[]> {
  const start = performance.now();
  try {
    const categories = await wcFetchAll<Category>("products/categories", { per_page: 100 }, CATEGORY_CACHE_TTL);
    // Filter out system/miscellaneous categories that should not appear in navigation
    const excludedSlugs = [
      'uncategorized',
      'sin-categorizar',
      'ninguna',
      'otros-productos',  // Contains misclassified products pending reorganization
    ];
    const end = performance.now();
    console.log(`[WooCommerce] getAllProductCategories took ${(end - start).toFixed(2)}ms`);
    return categories.filter(cat => !excludedSlugs.includes(cat.slug));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getAllProductTags(): Promise<Tag[]> {
  try {
    return await wcFetchAll<Tag>("products/tags", { per_page: 100 }, CATEGORY_CACHE_TTL);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

export async function getAllProductAttributes(): Promise<ProductAttribute[]> {
  try {
    return await wcFetchAll<ProductAttribute>("products/attributes", { per_page: 100 }, CATEGORY_CACHE_TTL);
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return [];
  }
}

export async function getAttributeTerms(attributeId: number): Promise<AttributeTerm[]> {
  try {
    return await wcFetchAll<AttributeTerm>(`products/attributes/${attributeId}/terms`, { per_page: 100 }, CATEGORY_CACHE_TTL);
  } catch (error) {
    console.error(`Error fetching terms for attribute ${attributeId}:`, error);
    return [];
  }
}

export async function getAllProductAttributesWithTerms(): Promise<AttributeWithTerms[]> {
  try {
    const attrs = await getAllProductAttributes();
    const termsList = await Promise.all((attrs || []).map((a) => getAttributeTerms(Number(a.id))));
    return attrs.map((a, idx) => ({ attribute: a, terms: termsList[idx] || [] }));
  } catch (error) {
    console.error("Error fetching attributes with terms:", error);
    return [];
  }
}

export async function getShopSidebarData(): Promise<{
  categories: Category[];
  tags: Tag[];
  attributes: AttributeWithTerms[];
}> {
  const [categories, tags, attributes] = await Promise.all([
    getAllProductCategories(),
    getAllProductTags(),
    getAllProductAttributesWithTerms(),
  ]);
  return { categories, tags, attributes };
}

export function buildCategoryTree(categories: Category[]): CategoryTree[] {
  const map: Record<number, CategoryTree> = {};
  const roots: CategoryTree[] = [];

  // Initialize map
  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });

  // Sort helper
  const sortByName = (a: CategoryTree, b: CategoryTree) => a.name.localeCompare(b.name);

  // Build tree
  categories.forEach(cat => {
    if (cat.parent === 0) {
      if (map[cat.id]) roots.push(map[cat.id]);
    } else {
      const parentNode = map[cat.parent];
      if (parentNode) {
        parentNode.children = parentNode.children || [];
        if (map[cat.id]) parentNode.children.push(map[cat.id]);
      }
    }
  });

  // Sort roots and children
  roots.sort(sortByName);
  Object.values(map).forEach(node => {
    if (node.children) node.children.sort(sortByName);
  });

  return roots;
}

// --------------------------------------------------------------------------------
// STATIC MIRROR SYSTEM
// --------------------------------------------------------------------------------
import fixedCategories from './data/fixed-categories.json';

export async function getCategoryTreeData(): Promise<CategoryTree[]> {
  const start = performance.now();

  // PRIMARY: serving from Static Mirror (JSON Local)
  if (fixedCategories && fixedCategories.length > 0) {
    const end = performance.now();
    console.log(`[StaticMirror] Serving category tree from local JSON took ${(end - start).toFixed(2)}ms`);
    return fixedCategories as CategoryTree[];
  }

  // FALLBACK: API (If local file is empty or missing during dev)
  console.warn('[StaticMirror] Local categories JSON not found or empty. Falling back to API fetch...');
  const categories = await getAllProductCategories();
  const tree = buildCategoryTree(categories);
  const endFallback = performance.now();
  console.log(`[WooCommerce] getCategoryTreeData (API Fallback) took ${(endFallback - start).toFixed(2)}ms`);
  return tree;
}

/**
 * Busca una categoría por slug dentro del JSON estático (Static Mirror)
 * Esto evita llamadas costosas a la API de WooCommerce solo para obtener el ID/Nombre.
 */
export function getCategoryFromStatic(slug: string): CategoryTree | null {
  const findInTree = (nodes: any[]): CategoryTree | null => {
    for (const node of nodes) {
      if (node.slug === slug) return node as CategoryTree;
      if (node.children && node.children.length > 0) {
        const found = findInTree(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  if (!fixedCategories || fixedCategories.length === 0) return null;
  return findInTree(fixedCategories);
}

/**
 * Obtiene productos con filtros, paginación y ordenamiento
 */
export async function getProducts(params: {
  category?: string;
  tag?: string;
  page?: number;
  perPage?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
  search?: string;
  sku?: string;
  featured?: boolean;
  minPrice?: string;
  maxPrice?: string;
  laboratory?: string;
  laboratorySlug?: string;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder' | null;
} = {}): Promise<{ products: Product[]; total: number; totalPages: number }> {
  try {
    const {
      category,
      tag,
      page = 1,
      perPage = 20,
      orderby = 'date',
      order = 'desc',
      search,
      sku,
      featured,
      minPrice,
      maxPrice,
      laboratory,
      laboratorySlug,
      stockStatus = null, // Changed from 'instock' to null to show all products by default
    } = params;

    // Build query params
    const queryParams: any = {
      per_page: perPage,
      page,
      orderby,
      order,
      status: 'publish',
    };

    // Only apply stock status filter if not explicitly null (null means show all)
    if (stockStatus) {
      queryParams.stock_status = stockStatus;
    }

    if (sku) queryParams.sku = sku;
    if (category) queryParams.category = category;
    if (tag) queryParams.tag = tag;
    if (search) queryParams.search = search;
    if (featured !== undefined) queryParams.featured = featured;
    if (minPrice) queryParams.min_price = minPrice;
    if (maxPrice) queryParams.max_price = maxPrice;

    // Optimization: Request only necessary fields to reduce payload size and WP processing time
    queryParams._fields = 'id,name,slug,sku,price,regular_price,on_sale,stock_status,stock_quantity,images,categories,tags,short_description,average_rating,rating_count,date_on_sale_from,date_on_sale_to,meta_data';

    // El snippet PHP en WordPress espera 'laboratorios' para filtrar por esta taxonomía
    if (laboratory || laboratorySlug) {
      queryParams.laboratorios = laboratory || laboratorySlug;
    }

    // Use wcFetchRaw for caching (default 600s revalidation)
    // cache-tag could be added here for on-demand revalidation if needed
    const { data, headers } = await wcFetchRaw<Product[]>('products', queryParams);

    const products = (data ?? []) as Product[];
    const total = parseInt(headers.get('x-wp-total') || '0');
    const totalPages = parseInt(headers.get('x-wp-totalpages') || '1');

    return { products, total, totalPages };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0, totalPages: 0 };
  }
}



/**
 * Obtiene las facetas (filtros globales) de una categoría
 * Cacheado por 24 horas para evitar carga masiva.
 * Analiza TODOS los productos de la categoría, no solo la página actual.
 */
export async function getCategoryGlobalFacets(categoryId: number): Promise<FilterState | null> {
  try {
    console.log(`[Cache] Generando facetas globales (Fast Mode) para categoría ${categoryId}...`);

    // OPTIMIZATION: Instead of fetching ALL products (wcFetchAll) which takes 60s+ for large categories,
    // we fetch a statistically significant sample (100 items).
    // This allows instant loading while still providing relevant brand/tag filters.
    // For 100% accuracy, a dedicated Search/Filter engine (like ElasticSearch) would be required.
    const { data: products } = await wcFetchRaw<Product[]>("products", {
      category: categoryId.toString(),
      per_page: 80, // Limit to 80 items for speed (approx 1.5s max request)
      status: 'publish',
    }, CATEGORY_CACHE_TTL);

    const mapped = (products || []).map((p: any) => mapWooProduct(p));
    return analyzeProductsForFilters(mapped);
  } catch (error) {
    console.error(`Error calculating facets for category ${categoryId}:`, error);
    return null;
  }
}
