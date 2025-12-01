'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

interface Product {
    id: number;
    name: string;
    slug: string;
    images: Array<{ src: string; alt?: string }>;
    price_html?: string;
    price?: string;
}

interface ProductShowcaseProps {
    products: Product[];
    title?: string;
    subtitle?: string;
}

export default function ProductShowcase({
    products,
    title = "Productos Destacados",
    subtitle = "Lo mejor de nuestra colección seleccionado para ti"
}: ProductShowcaseProps) {
    // Tomar los primeros 6 productos
    const displayProducts = products.slice(0, 6);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
            },
        },
    };



    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white font-inter italic"
                    >
                        {title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                {/* Products Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8"
                >
                    {displayProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={itemVariants}
                        >
                            <ProductCard
                                id={product.id}
                                name={product.name}
                                price={product.price || product.price_html?.replace(/[^0-9.]/g, '') || "0"}
                                imageUrl={product.images[0]?.src || '/placeholder-image.png'}
                                slug={product.slug}
                                images={product.images.map(img => img.src)}
                                category="Destacado"
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* View All Products Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/tienda"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-saprix-electric-blue text-white font-semibold rounded-full hover:bg-saprix-electric-blue-dark transition-colors duration-300 shadow-lg hover:shadow-xl"
                    >
                        Ver Todos los Productos
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
