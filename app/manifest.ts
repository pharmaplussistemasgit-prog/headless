import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'PharmaPlus Droguerías',
        short_name: 'PharmaPlus',
        description: 'Tu salud, bienestar y belleza a un clic. Envíos a todo el país.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#002040', // var(--color-pharma-blue)
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon.png', // Assuming this might exist or Next.js generates it, otherwise fallback to favicon
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/brand/logo-new-clean.png', // Fallback to brand logo for larger icons if specific icons aren't generated yet
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
