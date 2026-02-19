'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart, Check, Info, ShieldCheck, MessageCircle, Facebook, Twitter, AlertCircle, FileText } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { MappedProduct } from '@/types/product';
import RecommendedSection from '@/components/home/RecommendedSection';
import ColdChainAlert from './ColdChainAlert';

import { getProductPromo } from '@/lib/promotions'; // Import added

interface ProductDetailsProps {
    product: MappedProduct;
    relatedProducts?: any[];
    alsoViewedProducts?: any[];
}

export default function ProductDetails({ product, relatedProducts = [], alsoViewedProducts = [] }: ProductDetailsProps) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(product.images[0]);

    // Get Promo Label
    const promoLabel = getProductPromo(product);

    // Helper to get image URL safely
    const getImgSrc = (img: any) => {
        if (!img) return '/placeholder.png';
        if (typeof img === 'string') return img;
        return img.src || '/placeholder.png';
    };

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && (!product.stock || newQty <= product.stock)) {
            setQuantity(newQty);
        }
    };

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: getImgSrc(product.images[0]),
            quantity: quantity,
            slug: product.slug,
            sku: product.sku || undefined, // T19: ERP Support
            categories: product.categories, // T23: Cold Chain
            requiresPrescription: product.requiresRx,
            promotion: product.promotion, // T27: PTC Promotion
        });
        toast.success(`Agregado al carrito: ${product.name}`);
    };

    return (
        <div className="bg-[var(--color-bg-light)] min-h-screen">
            <div className="w-full lg:w-[90%] mx-auto px-4 sm:px-6 lg:px-0 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <Link href="/" className="hover:text-[var(--color-pharma-blue)] transition-colors">Home</Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <Link href="/tienda" className="hover:text-[var(--color-pharma-blue)] transition-colors">Salud</Link>
                    {product.categories?.[0] && (
                        <>
                            <span className="mx-2 text-gray-300">/</span>
                            <span className="text-[var(--color-pharma-blue)] font-medium">{product.categories[0].name}</span>
                        </>
                    )}
                    <span className="mx-2 text-gray-300">/</span>
                    <span className="text-[var(--color-pharma-blue)] truncate">{product.name}</span>
                </nav>

                <div className="bg-white rounded-3xl shadow-sm p-6 lg:p-10 mb-5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Column: Gallery (5 cols) */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 group">
                                <Image
                                    src={getImgSrc(activeImage)}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
                                    priority
                                />
                                {product.isOnSale && product.discountPercentage && (
                                    <div className="absolute top-4 left-4 bg-[#FF4D8D] text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm z-10">
                                        -{product.discountPercentage}%
                                    </div>
                                )}
                                {promoLabel && (
                                    <div className="absolute top-4 right-4 bg-[#9333ea] text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm z-10 animate-pulse border-2 border-white">
                                        {promoLabel}
                                    </div>
                                )}
                            </div>

                            {product.images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-white transition-all ${getImgSrc(activeImage) === getImgSrc(img)
                                                ? 'border-[var(--color-pharma-blue)] shadow-md scale-95'
                                                : 'border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            <Image
                                                src={getImgSrc(img)}
                                                alt={`${product.name} thumbnail ${idx + 1}`}
                                                fill
                                                className="object-contain p-2"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Info (7 cols) */}
                        <div className="lg:col-span-7 flex flex-col">
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-pharma-blue)] mb-2 leading-tight">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 font-medium">
                                    {product.sku && (
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs tracking-wider uppercase">REFERENCIA: {product.sku}</span>
                                    )}
                                    <div className="flex items-center gap-1 text-yellow-400">
                                    </div>
                                </div>

                                <div className="flex flex-col mb-8">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-4xl font-extrabold text-[var(--color-pharma-green)]">
                                            {/* Snippet #33: Variable Product Price Logic */}
                                            {product.type === 'variable' && <span className="text-2xl text-gray-500 mr-1">Desde:</span>}
                                            ${product.price.toLocaleString('es-CO')}
                                        </span>
                                        {product.isOnSale && (
                                            <span className="text-lg text-gray-400 line-through decoration-gray-300">
                                                ${product.regularPrice.toLocaleString('es-CO')}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 font-medium">
                                        Unitarios a ${(product.price / 1).toLocaleString('es-CO')}
                                    </span>

                                    {/* T22: Stock Status Badges - Always Show Quantity */}
                                    <div className="mt-3 flex flex-col gap-2">
                                        {!product.isInStock ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide w-fit">
                                                <AlertCircle size={14} /> Agotado
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide w-fit ${product.stock && product.stock <= 5 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                                                {product.stock && product.stock <= 5 ? <AlertCircle size={14} /> : <Check size={14} />}
                                                {product.stock ? `Disponibles: ${product.stock} unidades` : 'En Stock'}
                                            </span>
                                        )}

                                        {/* Promo Dates */}
                                        {product.isOnSale && (product.dateOnSaleFrom || product.dateOnSaleTo) && (
                                            <div className="text-xs text-[var(--color-pharma-blue)] font-medium mt-1 p-2 bg-blue-50 rounded border border-blue-100 inline-block w-fit">
                                                📅 Oferta válida
                                                {product.dateOnSaleFrom && ` desde ${new Date(product.dateOnSaleFrom).toLocaleDateString()}`}
                                                {product.dateOnSaleTo && ` hasta ${new Date(product.dateOnSaleTo).toLocaleDateString()}`}
                                            </div>
                                        )}

                                        {/* NEW: PTC Promo Banner */}
                                        {promoLabel && (
                                            <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3 animate-pulse">
                                                <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                                    <span className="font-extrabold text-xs">🎁</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-purple-800 text-sm">{promoLabel}</h4>
                                                    <p className="text-xs text-purple-600">¡Aprovecha esta promoción especial!</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Snippet #32: Short Description near price */}
                                    {product.shortDescription && (
                                        <div
                                            className="mt-4 text-sm text-gray-600 leading-relaxed border-l-2 border-[var(--color-pharma-blue)] pl-3"
                                            dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                                        />
                                    )}

                                    <div className="mt-4">
                                        <ColdChainAlert categories={product.categories || []} product={product} />

                                        {product.requiresRx && (
                                            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-amber-800 text-sm">Requiere Fórmula Médica</h4>
                                                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                                            Este es un medicamento de venta bajo fórmula médica.
                                                            <br />
                                                            <span className="font-semibold text-amber-900">Deberás adjuntar una foto de la receta al finalizar la compra.</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-gray-100 mb-8" />

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                                    {/* Quantity */}
                                    <div className="flex items-center border border-[var(--color-pharma-blue)] rounded-lg h-12 w-full sm:w-auto overflow-hidden">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            className="w-12 h-full flex items-center justify-center bg-[var(--color-pharma-blue)] text-white hover:bg-blue-800 transition-colors disabled:opacity-50"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <div className="w-16 h-full flex items-center justify-center font-bold text-[var(--color-pharma-blue)] text-lg bg-white">
                                            {quantity}
                                        </div>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="w-12 h-full flex items-center justify-center bg-[var(--color-pharma-blue)] text-white hover:bg-blue-800 transition-colors disabled:opacity-50"
                                            disabled={product.stock ? quantity >= product.stock : false}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!product.isInStock}
                                        className="w-full bg-[var(--color-pharma-blue)] text-white h-14 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 uppercase tracking-wider"
                                    >
                                        {product.isInStock ? (
                                            <>
                                                <ShoppingCart size={20} />
                                                <span>Agregar al Carrito</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={20} />
                                                <span>Agotado</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Out of Stock Explicit Message */}
                                {!product.isInStock && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0 mt-0.5">
                                            <AlertCircle size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-red-700 text-sm">Producto No Disponible</h4>
                                            <p className="text-sm text-red-600 mt-1 leading-snug">
                                                En el momento no hay producto en existencias, por favor comuniquese con nuestras lineas de atencion para consultar disponibilidad
                                            </p>
                                            <div className="mt-3 flex flex-col sm:flex-row gap-3">
                                                <a
                                                    href="tel:6015934010"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-pharma-blue)] text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-semibold"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                    </svg>
                                                    PBX: (601) 593 - 4010
                                                </a>
                                                <a
                                                    href="https://wa.me/573168397933"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors text-sm font-semibold"
                                                >
                                                    <MessageCircle size={16} />
                                                    WhatsApp: +57 316 839 7933
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>Comparte</span>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 rounded-full bg-[#25D366] text-white hover:scale-110 transition-transform"><MessageCircle size={16} /></button>
                                        <button className="p-1.5 rounded-full bg-[#1877F2] text-white hover:scale-110 transition-transform"><Facebook size={16} /></button>
                                        <button className="p-1.5 rounded-full bg-[#1DA1F2] text-white hover:scale-110 transition-transform"><Twitter size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specs Section - 90% Page Width / 90% Inner Width */}
            <div className="w-full lg:w-[90%] mx-auto bg-white rounded-3xl shadow-sm p-6 lg:p-10 mb-5">
                <div className="w-full lg:w-[90%] mx-auto">
                    <h3 className="text-2xl font-bold text-[var(--color-pharma-blue)] mb-8">Especificaciones:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                        {product.brand && (
                            <div className="flex justify-between border-b border-gray-50 pb-3">
                                <span className="font-bold text-[var(--color-pharma-blue)] text-base">Marca</span>
                                <span className="text-gray-600 text-base uppercase">{product.brand}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-b border-gray-50 pb-3">
                            <span className="font-bold text-[var(--color-pharma-blue)] text-base">Presentación</span>
                            <span className="text-gray-600 text-base uppercase">UNIDAD</span>
                        </div>
                        {product.invima && (
                            <div className="flex justify-between border-b border-gray-50 pb-3">
                                <span className="font-bold text-[var(--color-pharma-blue)] text-base">ID Invima</span>
                                <span className="text-gray-600 text-base">{product.invima}</span>
                            </div>
                        )}
                        {product.productType && (
                            <div className="flex justify-between border-b border-gray-50 pb-3">
                                <span className="font-bold text-[var(--color-pharma-blue)] text-base">Tipo de Producto</span>
                                <span className="text-gray-600 text-base uppercase">{product.productType}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Description Section - 90% Page Width / 90% Inner Width */}
            <div className="w-full lg:w-[90%] mx-auto bg-white rounded-3xl shadow-sm p-6 lg:p-10 mb-5">
                <div className="w-full lg:w-[90%] mx-auto">
                    <h3 className="text-2xl font-bold text-[var(--color-pharma-blue)] mb-6">Descripción:</h3>
                    <div
                        className="prose prose-lg text-gray-600 max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription }}
                    />
                </div>
            </div>

            <div className="w-full lg:w-[90%] mx-auto pb-16">
                {/* Related Products Carousel */}
                {relatedProducts.length > 0 && (
                    <div className="mb-5">
                        <RecommendedSection
                            products={relatedProducts}
                            title={
                                <span>
                                    <span className="text-[var(--color-pharma-blue)] italic font-bold">Productos </span>
                                    <span className="text-[var(--color-pharma-green)] font-extrabold">Similares...</span>
                                </span>
                            }
                        />
                    </div>
                )}

                {/* Also Viewed Carousel */}
                {alsoViewedProducts.length > 0 && (
                    <div>
                        <RecommendedSection
                            products={alsoViewedProducts}
                            title={
                                <span>
                                    <span className="text-[var(--color-pharma-blue)] italic font-bold">Otras personas </span>
                                    <span className="text-[var(--color-pharma-green)] font-white font-extrabold">también vieron...</span>
                                </span>
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
