/**
 * CONFIGURACIÓN DE MARKETING Y PUBLICIDAD (HERO SECTION)
 * 
 * Aquí puedes cambiar las imágenes y enlaces del Slider principal y los Banners laterales.
 * Las imágenes se cargan directamente desde el WordPress para no sobrecargar el repositorio.
 */

export const HERO_MARKETING_CONFIG = {
    // Slider Principal (Grande - 70% ancho)
    slides: [
        {
            id: 'slide-1',
            title: 'Slider Publicitario 1',
            image: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2026/02/Slider-Publicitario-1.webp',
            ctaLink: '/ofertas',
        },
        {
            id: 'slide-2',
            title: 'Slider Publicitario 2',
            image: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2026/02/Slider-Publicitario-2.webp',
            ctaLink: '/tienda',
        },
        {
            id: 'slide-3',
            title: 'Slider Publicitario 3',
            image: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2026/02/Slider-Publicitario-3.jpeg',
            ctaLink: '/ofertas',
        }
    ],

    // Banners Publicitarios (Derecha - 30% ancho)
    banners: {
        // Banner que aparece arriba
        top: {
            title: 'Banner Publicitario Arriba',
            image: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2026/02/Banner-Publicitario-Arriba-1.jpg',
            link: '/tienda',
        },
        // Banner que aparece abajo
        bottom: {
            title: 'Banner Publicitario Abajo',
            image: 'https://tienda.pharmaplus.com.co/wp-content/uploads/2026/02/Banner-Publicitario-Abajo-1.png',
            link: '/tienda',
        }
    }
};
