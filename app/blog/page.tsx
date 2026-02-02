import Link from 'next/link';
import Image from 'next/image';
import { getPosts, BlogPost } from '@/lib/blog';
import BlogSidebar from '@/components/blog/BlogSidebar';

// Helper to strip HTML from excerpt
const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...';
};

export const metadata = {
    title: 'Blog de Salud y Bienestar | PharmaPlus',
    description: 'Artículos sobre salud, consejos farmacéuticos y noticias de PharmaPlus.',
};

export default async function BlogPage() {
    const posts = await getPosts(1, 12);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header Simple */}
            <div className="bg-white border-b border-gray-200 py-16 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Saludable</h1>
                <p className="text-gray-500 max-w-2xl mx-auto px-4">
                    Descubre consejos de salud, novedades sobre medicamentos y guías de bienestar preparadas por nuestros expertos farmacéuticos.
                </p>
            </div>

            <div className="w-full max-w-[95%] lg:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 flex flex-col lg:flex-row gap-12">
                {/* Main Content */}
                <div className="flex-1">
                    {posts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500">No hay artículos disponibles en este momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {posts.map((post) => {
                                const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                                return (
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        key={post.id}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100"
                                    >
                                        <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                                            {featuredImage ? (
                                                <Image
                                                    src={featuredImage}
                                                    alt={post.title.rendered}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 pb-2">
                                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[var(--color-pharma-blue)] shadow-sm">
                                                BLOG
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <p className="text-xs text-gray-400 font-medium mb-3">
                                                {new Date(post.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[var(--color-pharma-blue)] transition-colors">
                                                {post.title.rendered}
                                            </h2>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
                                                {stripHtml(post.excerpt.rendered)}
                                            </p>
                                            <div className="mt-auto flex items-center text-[var(--color-pharma-blue)] font-semibold text-sm">
                                                Leer artículo
                                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <BlogSidebar />
            </div>
        </div>
    );
}
