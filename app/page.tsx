import HeroSection, { HeroSlide } from "@/components/home/HeroSection";
import CategoryIconsSection from "@/components/home/CategoryIconsSection";
import BrandCarousel from '@/components/home/BrandCarousel';
import FeaturedBrands from "@/components/home/FeaturedBrands";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ColdChainSection from "@/components/home/ColdChainSection";
import RecommendedSection from "@/components/home/RecommendedSection";
import ValueProposition from "@/components/home/ValueProposition";
import { getProducts, getCategoryTreeData, getOnSaleProducts } from "@/lib/woocommerce";
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

// Professional Hero Slides with local images
const heroSlides: HeroSlide[] = [
  {
    id: '1',
    image: '/Sliders/banner-1.png',
    title: 'Ofertas Especiales',
    subtitle: 'Promociones exclusivas',
    ctaText: 'Ver más',
    ctaLink: '/ofertas',
    discount: '65% OFF',
    bgColor: '#F5F0FF',
  },
  {
    id: '2',
    image: '/Sliders/Nuevo-Banner-Vitybell.jpg',
    title: 'Vitybell',
    subtitle: 'Suplementos vitamínicos',
    ctaText: 'Comprar ahora',
    ctaLink: '/tienda',
    discount: '45% OFF',
    bgColor: '#E8F4F8',
  },
  {
    id: '3',
    image: '/Sliders/Banner-Ties.jpg',
    title: 'Ties',
    subtitle: 'Cuidado personal',
    ctaText: 'Explorar',
    ctaLink: '/categoria/cuidado-personal',
    discount: '30% OFF',
    bgColor: '#F0F9F4',
  },
  {
    id: '4',
    image: '/Sliders/WhatsApp-Image-2025-11-11-at-9.01.56-AM.jpeg',
    title: 'Promoción Especial',
    subtitle: 'Productos seleccionados',
    ctaText: 'Ver ofertas',
    ctaLink: '/ofertas',
    discount: '50% OFF',
    bgColor: '#FFF8F0',
  },
  {
    id: '5',
    image: '/Sliders/WhatsApp-Image-2025-11-13-at-9.10.58-AM.jpeg',
    title: 'Nuevos Productos',
    subtitle: 'Recién llegados',
    ctaText: 'Descubrir',
    ctaLink: '/tienda',
    discount: '40% OFF',
    bgColor: '#FFF3E0',
  },
];

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

    // 2. Flash Deals (Real Offers Only - No Fallback)
    (async () => {
      try {
        const { products } = await getOnSaleProducts(1, 12);
        return products;
      } catch (error) {
        console.error('Error fetching flash deals:', error);
        return [];
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
  ]);

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
    <div className="w-full bg-[var(--color-bg-light)]">
      {/* Hero Section */}
      <HeroSection
        slides={heroSlides}
        featuredProds={shuffledFeaturedTotal.slice(0, 2)}
      />

      {/* Category Icons */}
      <CategoryIconsSection categories={categories} />

      {/* Brand Carousel (All Labs - T21) */}
      <BrandCarousel />

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

      {/* Featured Brands (Highlight - T21) Moved here as requested */}
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
        // ID 299 = Cuidado Facial. We find it in the tree to get its children.
        const facialNode = categories.find(c => c.id === 299);
        const facialSubcategories = facialNode?.children || [];

        return (
          <BeautySection
            products={shuffledBeautyProducts}
            subcategories={facialSubcategories}
          />
        );
      })()}

      {/* Health Section (New) */}
      <HealthSection products={shuffledHealth} />

      {/* FAQ Section */}
      <FAQSection />

      {/* Value Proposition (Moved to bottom as requested) */}
      <ValueProposition />
    </div>
  );
}
