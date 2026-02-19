import { HeroSection } from "@/components/home/HeroSection";
import { HERO_MARKETING_CONFIG } from "@/lib/marketing";
import CategoryIconsSection from "@/components/home/CategoryIconsSection";
import FeaturedBrands from "@/components/home/FeaturedBrands";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ColdChainSection from "@/components/home/ColdChainSection";
import RecommendedSection from "@/components/home/RecommendedSection";
import ValueProposition from "@/components/home/ValueProposition";
import { getProducts, getCategoryTreeData, getOnSaleProducts, getCustomApiOffers } from "@/lib/woocommerce";
import { Product, CategoryTree } from '@/types/woocommerce';
import { getShippingRates } from '@/lib/shipping';
import dynamic from 'next/dynamic';

// Lazy load below-the-fold sections for better performance
const FlashDeals = dynamic(() => import('@/components/home/FlashDeals'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const BeautySection = dynamic(() => import('@/components/home/BeautySection'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const HealthSection = dynamic(() => import('@/components/home/HealthSection'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const FAQSection = dynamic(() => import('@/components/home/FAQSection'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100" />
});

// Enable ISR - revalidate every 1 minute for homepage (high traffic)
export const revalidate = 0;


export default async function HomePage() {
  // Parallelize Data Fetching using Promise.all
  // 1. Featured (with fallback logic inside if needed, but here simple)
  // 2. Flash Deals (with complex fallback)
  // 3. Cold Chain
  // 4. Beauty
  // 5. Health (with complex fallback)
  // 6. Categories (New)

  const [
    featuredResult,
    flashDealsProducts,
    coldChainResult,
    beautyResult,
    healthResult,
    categories
  ] = await Promise.all([
    // 1. Featured Products
    (async () => {
      let res = await getProducts({ perPage: 30, featured: true, orderby: 'popularity' });
      if (res.products.length === 0) {
        console.warn('No featured products found, falling back to popular products');
        res = await getProducts({ perPage: 30, orderby: 'popularity' });
      }
      return res;
    })(),

    // 2. Flash Deals (Custom API con fallback silencioso)
    (async () => {
      // getCustomApiOffers ya es tolerante a fallos (retorna [] si falla)
      const { products: realOffers } = await getCustomApiOffers(1, 12);

      if (realOffers.length >= 4) {
        return realOffers;
      }

      // Fallback: completar con productos populares en oferta desde WooCommerce estándar
      const needed = Math.max(4, 8 - realOffers.length);
      try {
        const { products: fillers } = await getProducts({
          perPage: needed,
          orderby: 'popularity',
          stockStatus: 'instock',
        });
        const offerIds = new Set(realOffers.map(p => p.id));
        const uniqueFillers = fillers.filter((p: Product) => !offerIds.has(p.id));
        return [...realOffers, ...uniqueFillers];
      } catch {
        return realOffers; // Devolver lo que tengamos aunque sea vacío
      }
    })(),


    // 3. Cold Chain
    getProducts({ search: 'insulina', perPage: 24, orderby: 'popularity' }),

    // 4. Beauty
    getProducts({ search: 'shampoo', perPage: 24, orderby: 'popularity' }),

    // 5. Health (with chained fallbacks)
    (async () => {
      let res = await getProducts({ category: '20', perPage: 24, orderby: 'popularity' });
      if (res.products.length > 0) return res;

      res = await getProducts({ search: 'farmacia', perPage: 24 });
      if (res.products.length > 0) return res;

      return await getProducts({ search: 'medicamento', perPage: 24 });
    })(),

    // 6. Categories (New)
    getCategoryTreeData(),
  ]) as unknown as [
      { products: Product[]; total: number; totalPages: number },
      Product[],
      { products: Product[]; total: number; totalPages: number },
      { products: Product[]; total: number; totalPages: number },
      { products: Product[]; total: number; totalPages: number },
      CategoryTree[]
    ];

  // Helper function for shuffling
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Randomize all lists
  const shuffledBeautyProducts = shuffleArray(beautyResult.products);
  const shuffledFeaturedTotal = shuffleArray(featuredResult.products);
  const shuffledFlashDeals = shuffleArray(flashDealsProducts);
  const shuffledColdChain = shuffleArray(coldChainResult.products);
  const shuffledHealth = shuffleArray(healthResult.products);

  // Split featured for variety between sections
  // Assuming we fetched ~30 items.
  const midpoint = Math.ceil(shuffledFeaturedTotal.length / 2);
  const recommendedSlice = shuffledFeaturedTotal.slice(0, midpoint);
  const featuredSlice = shuffledFeaturedTotal.slice(midpoint);

  // If not enough products, fallback to sharing
  const recommendedProducts = recommendedSlice.length > 4 ? recommendedSlice : shuffledFeaturedTotal;
  const featuredProductsList = featuredSlice.length > 4 ? featuredSlice : shuffledFeaturedTotal;

  return (
    // Force re-render to fix hydration mismatch
    <div className="w-full bg-[var(--color-bg-light)]">
      {/* Hero Section */}
      <HeroSection
        slides={HERO_MARKETING_CONFIG.slides}
        bannerTop={HERO_MARKETING_CONFIG.banners.top}
        bannerBottom={HERO_MARKETING_CONFIG.banners.bottom}
      />

      {/* Category Icons */}
      <CategoryIconsSection categories={categories} />

      {/* Recommended Section (Complementa tu bienestar) */}
      <RecommendedSection
        products={recommendedProducts}
        title={
          <span>
            <span className="text-[var(--color-pharma-blue)] italic font-bold">Complementa tu </span>
            <span className="text-[var(--color-pharma-green)] font-extrabold">bienestar...</span>
          </span>
        }
      />

      {/* Featured Products Grid */}
      {featuredResult.products.length > 0 && (
        <FeaturedProducts
          title={
            <span>
              <span className="text-[var(--color-pharma-blue)] italic font-bold">Estos productos te pueden </span>
              <span className="text-[var(--color-pharma-green)] font-extrabold">interesar...</span>
            </span>
          }
          products={featuredProductsList}
        />
      )}

      {/* Featured Brands (Highlight - T21) */}
      <FeaturedBrands />

      {/* Cold Chain Section */}
      <ColdChainSection products={shuffledColdChain} />

      {/* Flash Deals Section */}
      {flashDealsProducts.length > 0 && (
        <FlashDeals
          title={
            <span>
              <span className="text-[var(--color-pharma-blue)] italic font-bold">Mundo </span>
              <span className="text-[var(--color-pharma-green)] font-extrabold">Ofertas</span>
            </span>
          }
          products={shuffledFlashDeals}
        />
      )}

      {/* Beauty Section */}
      {(() => {
        const facialNode = categories.find(c => c.id === 299);
        const facialSubcategories = facialNode?.children || [];

        return (
          <BeautySection
            products={shuffledBeautyProducts}
            subcategories={facialSubcategories}
          />
        );
      })()}

      {/* Health Section */}
      <HealthSection products={shuffledHealth} />

      {/* FAQ Section */}
      <FAQSection />

      {/* Value Proposition */}
      <ValueProposition />
    </div>
  );
}
