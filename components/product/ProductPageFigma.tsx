"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Plus, Minus, Ruler, ChevronDown, Check } from "lucide-react";
import SizeGuide from "./SizeGuide";
import GoogleReviews from "./GoogleReviews";
import ImageZoomModal from "./ImageZoomModal";
import { useCart } from "@/context/CartContext";
import { ensureHttps } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner"; // Assuming sonner is installed/used

type Media = { src: string; alt?: string };
type ColorOption = { option: string; variations: number[]; image?: string };
type SizeOption = { option: string; variations: number[] };

type Props = {
  mapped: any;
  images: Media[];
  colorOptions: ColorOption[];
  sizeOptions: SizeOption[];
  variations?: any[];
  slug: string;
};

export default function ProductPageFigma({ mapped, images, colorOptions, sizeOptions, variations = [], slug }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(colorOptions?.[0]?.option ?? "");
  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions?.[0]?.option ?? "");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Accordion states
  const [openSections, setOpenSections] = useState<string[]>(['description', 'details']);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const selectedVariantId = useMemo(() => {
    // If no options, return standard product ID if it's a simple product, but usually 0 for variants logic.
    // Logic for finding intersection of variations
    const c = colorOptions.find((x) => x.option === selectedColor)?.variations ?? [];
    const s = sizeOptions.find((x) => x.option === selectedSize)?.variations ?? [];

    // If we have options, find intersection
    if (colorOptions.length > 0 || sizeOptions.length > 0) {
      // If only one type of option exists, handle gracefully
      if (colorOptions.length > 0 && sizeOptions.length === 0) return c[0];
      if (sizeOptions.length > 0 && colorOptions.length === 0) return s[0];

      const inter = c.filter((id) => s.includes(id));
      return inter[0];
    }
    return undefined; // No variants
  }, [selectedColor, selectedSize, colorOptions, sizeOptions]);

  const sizeAvailability = useMemo(() => {
    return sizeOptions.map((s) => {
      const cvars = colorOptions.find((x) => x.option === selectedColor)?.variations ?? [];
      // If no colors, just check size availability
      if (colorOptions.length === 0) return { option: s.option, available: true }; // Simplified for now

      const inter = cvars.filter((id) => s.variations.includes(id));
      return { option: s.option, available: inter.length > 0 };
    });
  }, [selectedColor, colorOptions, sizeOptions]);

  // Selected variation and stock information
  const selectedVariation = useMemo(
    () => variations?.find((v) => v.id === selectedVariantId),
    [selectedVariantId, variations]
  );

  const variationStock =
    selectedVariation?.stock_quantity ?? mapped?.stock_quantity ??
    (selectedVariation?.stock_status === "outofstock" || mapped?.stock_status === "outofstock" ? 0 : undefined);

  const isOutOfStock =
    variationStock === 0 ||
    (selectedVariation ? selectedVariation.stock_status === "outofstock" : mapped?.stock_status === "outofstock");

  const mainImages: Media[] = useMemo(() => {
    const baseImages = images && images.length > 0
      ? images.map(img => ({ ...img, src: ensureHttps(img.src) }))
      : [{ src: ensureHttps(mapped?.image) ?? "/placeholder-image.png" }];

    // Add variation images if they are not already in baseImages
    if (variations) {
      variations.forEach(v => {
        if (v.image && v.image.src) {
          const src = ensureHttps(v.image.src);
          if (!baseImages.some(img => img.src === src)) {
            baseImages.push({ src, alt: v.image.alt || v.name });
          }
        }
      });
    }
    return baseImages;
  }, [images, mapped, variations]);

  const priceFmt = useMemo(() => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  }, []);

  const currentPrice = useMemo(() => {
    if (selectedVariation) {
      return Number(selectedVariation.price || selectedVariation.sale_price || selectedVariation.regular_price || 0);
    }
    return Number(mapped?.final_price || mapped?.price || 0);
  }, [selectedVariation, mapped]);

  const currentRegularPrice = useMemo(() => {
    if (selectedVariation) {
      return Number(selectedVariation.regular_price || 0);
    }
    return Number(mapped?.regular_price || 0);
  }, [selectedVariation, mapped]);

  const { addItem } = useCart();

  function addToCart() {
    const imagen = ensureHttps(mainImages?.[0]?.src) || "/placeholder-image.png";
    const nombre = mapped?.name || slug;

    addItem({
      id: mapped?.id || 0,
      name: nombre,
      price: currentPrice,
      quantity: quantity,
      image: imagen,
      slug: slug,
      variationId: selectedVariantId,
      attributes: {
        ...(selectedColor && { Color: selectedColor }),
        ...(selectedSize && { Talla: selectedSize })
      },
      categories: mapped?.categories // Pass categories for cold chain logic
    });
    toast.success("Producto agregado al carrito");
  }

  function handleQuantityChange(delta: number) {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, variationStock || 99)));
  }

  function toggleWishlist() {
    setIsWishlisted((v) => !v);
    toast.success(isWishlisted ? "Eliminado de lista de deseos" : "Agregado a lista de deseos");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
            <Link href="/" className="hover:text-[var(--color-pharma-blue)] transition-colors">Inicio</Link>
            <span className="text-gray-300">/</span>
            <Link href="/tienda" className="hover:text-[var(--color-pharma-blue)] transition-colors">Tienda</Link>
            {mapped?.categories && mapped.categories.length > 0 && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-[var(--color-pharma-blue)] font-semibold truncate max-w-[200px]">{mapped.categories[0].name}</span>
              </>
            )}
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 truncate max-w-[200px]">{mapped?.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">

          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 cursor-zoom-in group"
              onClick={() => setIsZoomOpen(true)}
            >
              <Image
                src={mainImages[selectedImage]?.src || "/placeholder-image.png"}
                alt={mainImages[selectedImage]?.alt || mapped?.name}
                fill
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {/* Badges */}
                {((currentRegularPrice > currentPrice) || mapped?.on_sale) && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    OFERTA
                  </span>
                )}
                {isOutOfStock && (
                  <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    AGOTADO
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Grid */}
            {mainImages.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {mainImages.map((image, index) => (
                  <button
                    key={`${image.src}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index
                      ? "border-[var(--color-pharma-blue)] ring-2 ring-[var(--color-pharma-blue)] ring-opacity-20 opacity-100"
                      : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-200"
                      }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt || `Thumbnail ${index}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-8">

              {/* Header */}
              <div className="space-y-4 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">(51 valoraciones)</span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {mapped?.name ?? slug}
                </h1>

                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-[var(--color-pharma-green)]">
                      {priceFmt.format(currentPrice)}
                    </span>
                    {currentRegularPrice > currentPrice && (
                      <span className="text-xl text-gray-400 line-through decoration-gray-300">
                        {priceFmt.format(currentRegularPrice)}
                      </span>
                    )}
                  </div>
                  {currentRegularPrice > currentPrice && (
                    <p className="text-green-600 text-sm font-medium mt-1">
                      Ahorras {priceFmt.format(currentRegularPrice - currentPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Variations - Colors */}
              {colorOptions && colorOptions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Color: <span className="text-[var(--color-pharma-blue)] capitalize font-normal">{selectedColor}</span></h3>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.option}
                        onClick={() => setSelectedColor(color.option)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedColor === color.option
                          ? "ring-2 ring-offset-2 ring-[var(--color-pharma-blue)] scale-110 shadow-md"
                          : "hover:scale-105 hover:shadow-sm"
                          }`}
                        title={color.option}
                      >
                        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative">
                          {color.image ? (
                            <Image src={color.image} alt={color.option} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500">
                              {color.option.substring(0, 2)}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variations - Sizes */}
              {sizeOptions && sizeOptions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Talla: <span className="text-[var(--color-pharma-blue)] uppercase font-normal">{selectedSize}</span></h3>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-sm text-[var(--color-pharma-blue)] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Ruler className="w-4 h-4" /> Guía de tallas
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {sizeAvailability.map((sz) => (
                      <button
                        key={sz.option}
                        onClick={() => setSelectedSize(sz.option)}
                        disabled={!sz.available}
                        className={`h-12 min-w-[3rem] px-4 rounded-lg font-bold text-sm transition-all border-2 ${selectedSize === sz.option
                          ? "border-[var(--color-pharma-blue)] bg-[var(--color-pharma-blue)] text-white shadow-md transform scale-105"
                          : sz.available
                            ? "border-gray-200 bg-white text-gray-700 hover:border-[var(--color-pharma-blue)] hover:text-[var(--color-pharma-blue)]"
                            : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed decoration-slice"
                          }`}
                      >
                        {sz.option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border-2 border-gray-200 rounded-xl max-w-[140px] h-14 bg-white">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-[var(--color-pharma-blue)] active:scale-90 transition-transform disabled:opacity-30"
                      disabled={quantity <= 1 || isOutOfStock}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="flex-1 h-full flex items-center justify-center font-bold text-xl text-gray-900">
                      {quantity}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-[var(--color-pharma-blue)] active:scale-90 transition-transform disabled:opacity-30"
                      disabled={isOutOfStock}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={addToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 ${isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[var(--color-pharma-blue)] text-white hover:bg-[var(--color-blue-classic)]"
                      }`}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {isOutOfStock ? "Agotado" : "Comprar"}
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={toggleWishlist}
                    className={`w-14 h-14 border-2 rounded-xl flex items-center justify-center transition-all ${isWishlisted
                      ? "border-red-50 text-red-500 bg-red-50"
                      : "border-gray-200 text-gray-400 hover:border-[var(--color-pharma-blue)] hover:text-[var(--color-pharma-blue)] bg-white"
                      }`}
                  >
                    <Heart className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Benefits List */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="p-2 bg-blue-50 rounded-full text-[var(--color-pharma-blue)]">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span>Envío gratis desde $300.000</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="p-2 bg-blue-50 rounded-full text-[var(--color-pharma-blue)]">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span>Compra 100% Segura</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="p-2 bg-blue-50 rounded-full text-[var(--color-pharma-blue)]">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <span>Garantía de Satisfacción</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="p-2 bg-blue-50 rounded-full text-[var(--color-pharma-blue)]">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Producto Auténtico</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Info Section - Accordions */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              {/* Description */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection('description')}
                  className="w-full py-6 flex justify-between items-center text-left group hover:bg-gray-50 px-2 rounded-lg transition-colors"
                >
                  <span className="font-bold text-lg text-gray-900">Descripción</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 text-gray-400 group-hover:text-[var(--color-pharma-blue)] ${openSections.includes('description') ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSections.includes('description') ? 'max-h-[1000px] opacity-100 pb-6 px-2' : 'max-h-0 opacity-0'}`}>
                  <div className="prose prose-sm prose-blue text-gray-600 max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: mapped?.description || mapped?.short_description || 'Sin descripción.' }} />
                </div>
              </div>

              {/* Details */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection('details')}
                  className="w-full py-6 flex justify-between items-center text-left group hover:bg-gray-50 px-2 rounded-lg transition-colors"
                >
                  <span className="font-bold text-lg text-gray-900">Detalles del Producto</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 text-gray-400 group-hover:text-[var(--color-pharma-blue)] ${openSections.includes('details') ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSections.includes('details') ? 'max-h-[1000px] opacity-100 pb-6 px-2' : 'max-h-0 opacity-0'}`}>
                  <ul className="space-y-3 text-sm text-gray-600">
                    {mapped?.attributes?.map((attr: any, idx: number) => (
                      <li key={idx} className="flex justify-between border-b border-dashed border-gray-100 pb-2 last:border-0 hover:bg-gray-50 p-1">
                        <span className="font-semibold text-gray-900">{attr.name}</span>
                        <span>{Array.isArray(attr.options) ? attr.options.join(', ') : attr.options}</span>
                      </li>
                    ))}
                    {mapped?.sku && (
                      <li className="flex justify-between border-b border-dashed border-gray-100 pb-2 last:border-0 hover:bg-gray-50 p-1">
                        <span className="font-semibold text-gray-900">SKU</span>
                        <span className="font-mono text-gray-500">{mapped.sku}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Reviews Section - Full Width */}
        <div className="mt-20 border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-2">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            Valoraciones de Clientes
          </h2>
          <div className="max-w-4xl mx-auto bg-gray-50 rounded-2xl p-6 lg:p-10">
            <GoogleReviews />
          </div>
        </div>

      </div>

      <SizeGuide
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        productName={mapped?.name || slug}
        categories={mapped?.categories?.map((c: any) => c.name) || []}
      />
      <ImageZoomModal
        images={mainImages}
        initialIndex={selectedImage}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
}
