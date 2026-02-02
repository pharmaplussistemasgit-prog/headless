import Link from 'next/link';
import { getCategories } from '@/lib/blog';
import BlogAdminControls from './BlogAdminControls';

export default async function BlogSidebar() {
    const categories = await getCategories();

    // Organize categories: Parents vs Children could be done here if needed.
    // For now, simple list. Ideal: Group by parent.
    const parentCategories = categories.filter(c => c.parent === 0);

    return (
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-8">
            {/* Admin Controls (Client Side Check) */}
            <BlogAdminControls />

            {/* Categories Widget */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                    Categorías / Laboratorios
                </h3>
                <nav className="space-y-1">
                    {parentCategories.map(cat => {
                        const children = categories.filter(c => c.parent === cat.id);
                        return (
                            <div key={cat.id} className="py-1">
                                <Link
                                    href={`/blog/categoria/${cat.slug}`}
                                    className="block px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-[var(--color-pharma-blue)] rounded-lg font-medium transition-colors"
                                >
                                    {cat.name}
                                    <span className="ml-2 text-xs text-gray-400 font-normal">({cat.count})</span>
                                </Link>
                                {/* Rendering Subcategories (Topics) */}
                                {children.length > 0 && (
                                    <div className="ml-4 border-l border-gray-100 mt-1 pl-2 space-y-1">
                                        {children.map(child => (
                                            <Link
                                                key={child.id}
                                                href={`/blog/categoria/${child.slug}`}
                                                className="block px-3 py-1.5 text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {parentCategories.length === 0 && (
                        <p className="text-sm text-gray-400 italic px-2">No hay categorías disponibles.</p>
                    )}
                </nav>
            </div>

            {/* Newsletter or Promo Banner could go here */}
            <div className="bg-gradient-to-br from-[var(--color-pharma-blue)] to-blue-600 rounded-2xl p-6 text-white text-center">
                <h4 className="font-bold text-xl mb-2">¡Únete a nuestra comunidad!</h4>
                <p className="text-blue-100 text-sm mb-4">Recibe consejos de salud exclusivos.</p>
                <div className="bg-white/20 rounded-lg p-3 text-sm font-medium backdrop-blur-sm">
                    Próximamente Newsletter
                </div>
            </div>
        </aside>
    );
}
