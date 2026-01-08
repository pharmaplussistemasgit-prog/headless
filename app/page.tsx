import HeroSection, { HeroSlide } from "@/components/home/HeroSection";
import CategoryIconsSection from "@/components/home/CategoryIconsSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ColdChainSection from "@/components/home/ColdChainSection";
import FlashDeals from "@/components/home/FlashDeals";
import RecommendedSection from "@/components/home/RecommendedSection";
import BeautySection from "@/components/home/BeautySection";
import HealthSection from "@/components/home/HealthSection";
import { getProducts } from "@/lib/woocommerce";

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
  // 1. Fetch Featured Products
  let featuredResult = await getProducts({
    perPage: 12,
    featured: true,
    orderby: 'popularity'
  });

  if (featuredResult.products.length === 0) {
    console.warn('No featured products found, falling back to popular products');
    featuredResult = await getProducts({
      perPage: 12,
      orderby: 'popularity'
    });
  }

  // 2. Fetch Flash Deals (Specific SKUs or Fallback)
  let flashDealsProducts: any[] = [];
  try {
    const flashDealsResult = await getProducts({
      perPage: 10,
      sku: '3294,76205',
    });
    flashDealsProducts = flashDealsResult.products;
    if (flashDealsProducts.length === 0) {
      const tempResult = await getProducts({ perPage: 2, orderby: 'date', order: 'desc' });
      flashDealsProducts = tempResult.products;
    }
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    const tempResult = await getProducts({ perPage: 2 });
    flashDealsProducts = tempResult.products;
  }

  // 3. Fetch Cold Chain Products
  const coldChainResult = await getProducts({
    search: 'insulina',
    perPage: 8,
    orderby: 'popularity'
  });

  // 4. Fetch Beauty Products
  const beautyResult = await getProducts({
    search: 'shampoo', // Fallback search term for beauty/personal care
    perPage: 10,
    orderby: 'popularity'
  });

  // 5. Fetch Health Products
  // Using broad terms to get medicines like Electrolit, Pedialyte etc.
  // Fallback to 'farmacia' or 'medicamento'
  let healthResult = await getProducts({
    category: '20', // Try explicit category ID if known, otherwise search
    perPage: 10,
    orderby: 'popularity'
  });

  if (healthResult.products.length === 0) {
    healthResult = await getProducts({ search: 'farmacia', perPage: 10 });
  }

  if (healthResult.products.length === 0) {
    healthResult = await getProducts({ search: 'medicamento', perPage: 10 });
  }

  return (
    <div className="w-full bg-[var(--color-bg-light)]">
      {/* Hero Section */}
      <HeroSection
        slides={heroSlides}
        featuredProds={featuredResult.products.slice(0, 2)}
      />

      {/* Category Icons */}
      <CategoryIconsSection />

      {/* Recommended Section (New, using featured data) */}
      {/* Force rebuild: Updated columns to 4 */}
      <RecommendedSection products={featuredResult.products} />

      {/* Featured Products Grid */}
      {featuredResult.products.length > 0 && (
        <FeaturedProducts
          title="Estos productos te pueden interesar"
          products={featuredResult.products}
        />
      )}

      {/* Cold Chain Section */}
      <ColdChainSection products={coldChainResult.products} />

      {/* Flash Deals Section */}
      {flashDealsProducts.length > 0 && (
        <FlashDeals
          title="Mundo Ofertas"
          products={flashDealsProducts}
        />
      )}

      {/* Beauty Section */}
      <BeautySection products={beautyResult.products} />

      {/* Health Section (New) */}
      <HealthSection products={healthResult.products} />
    </div>
  );
}
