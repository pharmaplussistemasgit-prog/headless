import Link from 'next/link';
import { ALL_BRANDS_SLIDER } from '@/lib/brands-data';
import { ChevronRight, FlaskConical } from 'lucide-react';

export const metadata = {
    title: 'Laboratorios Aliados | PharmaPlus',
    description: 'Conoce los laboratorios farmacéuticos que trabajan con nosotros. Calidad y confianza garantizada.',
};

export default function LaboratoriosPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Header Section */}
            <section className="bg-gray-50 py-12 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-[var(--color-pharma-blue)]">
                            <FlaskConical className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Nuestros Laboratorios Aliados
                        </h1>
                        <p className="text-gray-500 max-w-2xl text-lg">
                            Trabajamos con las mejores marcas y laboratorios farmacéuticos para garantizar la calidad y seguridad de todos nuestros productos.
                        </p>
                    </div>
                </div>
            </section>

            {/* Grid Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
                        {ALL_BRANDS_SLIDER.map((brand, index) => (
                            <Link
                                key={index}
                                href={brand.slug ? `/marca/${brand.slug}` : '/tienda'}
                                className="group flex flex-col items-center justify-center bg-white p-8 rounded-2xl border border-gray-100 hover:border-[var(--color-pharma-blue)] hover:shadow-xl transition-all duration-300 h-64 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="relative w-full h-32 flex items-center justify-center p-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={brand.url}
                                        alt={brand.alt}
                                        className="max-w-full max-h-full object-contain filter opacity-100 group-hover:scale-110 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <span className="text-sm font-bold text-[var(--color-pharma-blue)] uppercase tracking-wider">Ver Productos</span>
                                    <ChevronRight className="w-4 h-4 text-[var(--color-pharma-blue)]" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
