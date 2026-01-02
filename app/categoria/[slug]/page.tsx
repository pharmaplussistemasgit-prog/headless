import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategory, getAllCategories } from '@/app/actions/products';
import ProductCard from '@/components/product/ProductCard';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) return { title: 'Categoría no encontrada' };

    return {
        title: `${category.name} | PharmaPlus`,
        description: `Compra productos de ${category.name} en línea. Envíos a todo el país.`,
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    const products = await getProductsByCategory(category.id);
    const allCategories = await getAllCategories(); // Para el sidebar simple

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <Breadcrumbs
                items={[
                    { label: 'Categorías', href: '#' }, // Podría ser /categories si existiera
                    { label: category.name, href: `/categoria/${category.slug}` }
                ]}
            />

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar (Simple Layout) */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
                        <h3 className="font-bold text-[var(--color-primary-blue)] mb-4 pb-2 border-b border-gray-100">Categorías</h3>
                        <ul className="space-y-2">
                            {allCategories.map(cat => (
                                <li key={cat.id}>
                                    <Link
                                        href={`/categoria/${cat.slug}`}
                                        className={`block py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${cat.slug === category.slug
                                            ? 'bg-blue-50 text-[var(--color-primary-blue)]'
                                            : 'text-gray-600 hover:text-[var(--color-action-blue)] hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat.name} <span className="text-xs text-gray-300 ml-1">({cat.count})</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Placeholder for future filters */}
                        <div className="mt-8 pt-6 border-t border-gray-100 opacity-50">
                            <h4 className="font-bold text-sm text-gray-400 mb-3">Filtrar por</h4>
                            <p className="text-xs text-gray-400 italic">Próximamente: Precio, Laboratorio, Formato.</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[var(--color-primary-blue)] mb-2 capitalize">
                            {category.name}
                        </h1>
                        {category.description && (
                            <p className="text-gray-500">{category.description}</p>
                        )}
                        <p className="text-sm text-gray-400 mt-2">
                            Mostrando {products.length} productos
                        </p>
                    </div>

                    {/* Products Grid */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-100 border-dashed">
                            <div className="text-5xl mb-4">💊</div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No encontramos medicamentos aquí</h3>
                            <p className="text-gray-500 mb-6">Esta categoría parece estar vacía por el momento.</p>
                            <Link href="/" className="text-[var(--color-action-blue)] font-bold hover:underline">
                                Volver al Inicio
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
