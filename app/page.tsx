import HeroSection, { HeroSlide } from "@/components/home/HeroSection";
import CategoryIconsSection from "@/components/home/CategoryIconsSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FlashDeals from "@/components/home/FlashDeals";
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
  // Fetch featured products (on sale or featured)
  const featuredResult = await getProducts({
    perPage: 12,
    featured: true,
    orderby: 'popularity'
  });

  // Fetch specific flash deals products by SKU (only these 2)
  let flashDealsProducts: any[] = [];

  try {
    const flashDealsResult = await getProducts({
      perPage: 10,
      sku: '3294,76205',
    });
    flashDealsProducts = flashDealsResult.products;

    // Fallback: If SKUs not found, get any 2 products to show the section
    if (flashDealsProducts.length === 0) {
      console.warn('Flash deals SKUs not found, using fallback products');
      const tempResult = await getProducts({ perPage: 2, orderby: 'date', order: 'desc' });
      flashDealsProducts = tempResult.products;
    }
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    // Fallback to any products
    const tempResult = await getProducts({ perPage: 2 });
    flashDealsProducts = tempResult.products;
  }

  return (
    <div className="w-full bg-[var(--color-bg-light)]">
      {/* Hero Section - Slider + Top Features */}
      <HeroSection
        slides={heroSlides}
        featuredProds={featuredResult.products.slice(0, 2)}
      />

      {/* Category Icons Section */}
      <CategoryIconsSection />

      {/* Featured Products Section */}
      {featuredResult.products.length > 0 && (
        <FeaturedProducts
          title="¡Hola ! Estos productos te pueden interesar"
          products={featuredResult.products}
        />
      )}

      {/* Flash Deals Section - Mundo Ofertas */}
      {flashDealsProducts.length > 0 && (
        <FlashDeals
          title="Mundo Ofertas"
          products={flashDealsProducts}
        />
      )}
    </div>
  );
}
