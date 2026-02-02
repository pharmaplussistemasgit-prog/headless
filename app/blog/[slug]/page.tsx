import { getPostBySlug } from '@/lib/blog';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Artículo no encontrado',
        };
    }

    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    return {
        title: `${post.title.rendered} | Blog PharmaPlus`,
        description: post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 160),
        openGraph: {
            images: featuredImage ? [featuredImage] : [],
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const authorName = post._embedded?.author?.[0]?.name || 'Equipo PharmaPlus';

    return (
        <article className="bg-[#FAFAFA] min-h-screen pb-20">
            {/* Hero Header */}
            <div className="relative w-full h-[400px] md:h-[500px] bg-gray-900 flex items-end">
                {featuredImage && (
                    <Image
                        src={featuredImage}
                        alt={post.title.rendered}
                        fill
                        priority
                        className="object-cover opacity-60"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

                <div className="relative z-10 w-full max-w-[95%] lg:max-w-[1400px] mx-auto px-4 sm:px-6 mb-12 text-center md:text-left">
                    <span className="inline-block px-3 py-1 bg-[var(--color-pharma-blue)] text-white text-xs font-bold uppercase tracking-wider rounded mb-4">
                        Artículo
                    </span>
                    <h1
                        className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                    <div className="flex items-center justify-center md:justify-start gap-4 text-gray-300 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xs border border-gray-600">
                                {authorName.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{authorName}</span>
                        </div>
                        <span>•</span>
                        <time>{new Date(post.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    </div>
                </div>
            </div>

            {/* Contenido Prose */}
            <div className="w-full max-w-[95%] lg:max-w-[1400px] mx-auto px-4 sm:px-6 -mt-10 relative z-20">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
                    <div
                        className="prose prose-lg prose-blue max-w-none prose-img:rounded-2xl prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-[var(--color-pharma-blue)] prose-a:no-underline hover:prose-a:underline"
                        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                    />
                </div>

                {/* Botón Volver */}
                <div className="mt-12 text-center">
                    <a href="/blog" className="inline-flex items-center text-gray-500 hover:text-[var(--color-pharma-blue)] font-medium transition-colors">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Volver al Blog
                    </a>
                </div>
            </div>
        </article>
    );
}
