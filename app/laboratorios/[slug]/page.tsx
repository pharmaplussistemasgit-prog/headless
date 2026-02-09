import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/woocommerce';
import ProductCard from '@/components/product/ProductCard';
import { mapWooProduct } from '@/lib/mappers';
import { ALL_BRANDS_SLIDER } from '@/lib/brands-data';
import { FlaskConical } from 'lucide-react';

export const revalidate = 60;

interface LaboratorioPageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata(props: LaboratorioPageProps) {
    const params = await props.params;
    const brand = ALL_BRANDS_SLIDER.find(b => b.slug === params.slug);

    if (!brand) {
        return {
            title: 'Laboratorio no encontrado - PharmaPlus',
        };
    }

    return {
        title: `${brand.title} - Laboratorios | PharmaPlus`,
        description: `Explora todos los productos de ${brand.title}. Calidad y confianza garantizada.`,
    };
}

export default async function LaboratorioPage(props: LaboratorioPageProps) {
    const params = await props.params;
    const brand = ALL_BRANDS_SLIDER.find(b => b.slug === params.slug);

    if (!brand || !brand.brandId) {
        notFound();
    }


    // Obtener productos del laboratorio usando el parámetro específico que getProducts espera
    const { products } = await getProducts({
        perPage: 100,
        laboratory: String(brand.brandId)
    });


    const mappedProducts = products.map((p: any) => mapWooProduct(p));

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <section className="bg-white py-12 border-b border-gray-200">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-[var(--color-pharma-blue)]">
                            <FlaskConical className="w-8 h-8" />
                        </div>

                        {brand.url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={brand.url}
                                alt={brand.title}
                                className="max-w-xs max-h-24 object-contain mb-4"
                            />
                        ) : (
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                <span className="text-[var(--color-pharma-blue)]">{brand.title.split(' ')[0]}</span>
                                {brand.title.split(' ').length > 1 && (
                                    <>
                                        {' '}
                                        <span className="text-[var(--color-pharma-green)]">{brand.title.split(' ').slice(1).join(' ')}</span>
                                    </>
                                )}
                            </h1>
                        )}

                        <p className="text-gray-600 max-w-2xl">
                            {mappedProducts.length} {mappedProducts.length === 1 ? 'producto disponible' : 'productos disponibles'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-12">
                <div className="container mx-auto px-4 max-w-7xl">
                    {mappedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {mappedProducts.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-lg">
                                No hay productos disponibles para este laboratorio en este momento.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
