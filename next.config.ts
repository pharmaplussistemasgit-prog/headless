import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuramos next/image para cargar imágenes remotas desde WordPress
  images: {
    // unoptimized: true, // Removed to enable optimization
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tienda.pharmaplus.com.co",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "http",
        hostname: "tienda.pharmaplus.com.co",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "trae-api-us.mchost.guru",
        port: "",
        pathname: "/api/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/productos',
        destination: '/tienda',
        permanent: true,
      },
      {
        source: '/productos/page/:page',
        destination: '/tienda',
        permanent: true,
      },
      {
        source: '/product/:slug',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/producto/:slug',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/category/:slug',
        destination: '/categoria/:slug',
        permanent: true,
      },
      {
        source: '/pastillero',
        destination: '/mi-cuenta/pastillero',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/finalizar-compra',
        destination: '/checkout',
      },
    ];
  },
};

// Trigger Vercel Redeploy
export default nextConfig;
