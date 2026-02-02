'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Search, FileText, Calendar, ExternalLink, Loader2, Edit3 } from 'lucide-react';
import Link from 'next/link';

interface Post {
    id: number;
    title: { rendered: string };
    date: string;
    excerpt: { rendered: string };
    status: string;
    link: string;
    _embedded?: {
        'wp:featuredmedia'?: Array<{ source_url: string }>;
    };
}

export default function MyArticlesPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const currentUser = auth.getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);
        fetchMyPosts(currentUser.id, auth.getToken());
    }, []);

    const fetchMyPosts = async (userId: number | string, token: string | null) => {
        try {
            // Ensure userId is a valid integer
            const validAuthorId = parseInt(String(userId), 10);

            if (isNaN(validAuthorId)) {
                console.error('Invalid User ID for posts fetch:', userId);
                setLoading(false);
                return;
            }

            // Using context=edit if authorized to see drafts/private, otherwise public
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Fetch posts by this author. Include embedded for images.
            const url = `https://tienda.pharmaplus.com.co/wp-json/wp/v2/posts?author=${validAuthorId}&_embed&per_page=50&context=edit`;

            const res = await fetch(url, {
                headers
            });

            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            } else {
                const errText = await res.text();
                // If 403, might be not enough permissions for context=edit, retry without context or handle 
                console.error('Error fetching posts:', res.status, errText);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.rendered.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                <p>Cargando tus artículos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Artículos</h1>
                    <p className="text-sm text-gray-500">Gestiona y edita tu contenido desde aquí.</p>
                </div>
                <a
                    href="https://tienda.pharmaplus.com.co/wp-admin/post-new.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Edit3 className="w-4 h-4" />
                    Nuevo Artículo
                </a>
            </div>

            {/* Filter */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>

            {/* Grid */}
            <div className="grid gap-4">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            className="group bg-white border border-gray-100 rounded-xl p-4 hover:shadow-lg hover:border-blue-100 transition-all duration-300 flex flex-col md:flex-row gap-4 items-start md:items-center"
                        >
                            {/* Thumbnail if exists */}
                            <div className="w-full md:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                                    <img
                                        src={post._embedded['wp:featuredmedia'][0].source_url}
                                        alt={post.title.rendered}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`
                                        px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full
                                        ${post.status === 'publish' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                    `}>
                                        {post.status === 'publish' ? 'Publicado' : post.status}
                                    </span>
                                    <span className="flex items-center text-xs text-gray-400">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(post.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

                                <div className="text-sm text-gray-500 line-clamp-2 md:line-clamp-1 mb-3" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />

                                <div className="flex items-center gap-3">
                                    <a
                                        href={`https://tienda.pharmaplus.com.co/wp-admin/post.php?post=${post.id}&action=edit`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <Edit3 className="w-3 h-3 mr-1" />
                                        Editar en WordPress
                                    </a>
                                    <span className="text-gray-300">|</span>
                                    <Link
                                        href={`/blog/${post.id}`} // Assuming detailed view logic exists or just external view
                                        className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Ver Previsualización
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No se encontraron artículos</h3>
                        <p className="text-gray-500 mb-4">{searchTerm ? 'Intenta con otra búsqueda' : 'Aún no has escrito nada.'}</p>
                        {!searchTerm && (
                            <a
                                href="https://tienda.pharmaplus.com.co/wp-admin/post-new.php"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 font-medium hover:underline"
                            >
                                ¡Empieza a escribir tu primero post!
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
