import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default function robots(): MetadataRoute.Robots {
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saprix.com.co';

    // Sanitize baseUrl: FIRST trim & remove query params, THEN remove trailing slashes
    baseUrl = baseUrl.trim().split('?')[0].replace(/\/+$/, '');

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/checkout/', '/mapeo-secreto/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
