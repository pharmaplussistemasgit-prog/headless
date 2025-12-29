"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

const banners = [
    {
        id: "holiday-notice",
        src: "/banners/aviso_slider_fin_de_año_saprix.PNG",
        alt: "Aviso Importante - Despachos Fin de Año Saprix",
        title: "⚠️ Aviso Importante",
        subtitle: "Las compras realizadas entre el 31 de diciembre y el 4 de enero serán despachadas a partir del 5 de enero de 2026.",
        link: "https://api.whatsapp.com/send/?phone=573019086637&text&type=phone_number&app_absent=0",
        align: "center",
        buttonText: "¿Alguna duda? Más información aquí",
        isNotice: true, // Flag para identificar que es un aviso
        extraText: "Agradecemos tu comprensión y confianza.",
        festiveMessage: "🎉✨ ¡Feliz Fin de Año y Próspero 2026! ✨🎉",
        teamMessage: "El equipo Saprix te desea lo mejor 🎊🥳"
    },
    {
        id: 0,
        src: "/banners/nuevas-tokio-saprix.webp",
        alt: "Nueva Colección Tokio Saprix",
        title: "Lllegaron las más pedidas",
        subtitle: "Referencia",
        link: "/tienda",
        align: "center",
        buttonText: "Compralas yá!"
    },
    {
        id: 1,
        src: "/banners/Zapatillas Saprix - .ref Tokio Negra.webp",
        alt: "Zapatillas Saprix Tokio Negra",
        title: "Rendimiento Superior Tokio",
        subtitle: "Control y tracción en negro",
        link: "/tienda",
        align: "left" // Alineación del texto
    },
    {
        id: 2,
        src: "/banners/Zapatillas Saprix - ref Tokio Morada_5_11zon.webp",
        alt: "Zapatillas Saprix Tokio Morada",
        title: "Estilo Único Tokio",
        subtitle: "Diseñadas para destacar en morado",
        link: "/tienda",
        align: "left"
    },
    {
        id: 3,
        src: "/banners/Zapatillas Saprix - ref Londres.webp",
        alt: "Zapatillas Saprix Londres",
        title: "Pasión por el Futsal Londres",
        subtitle: "",
        link: "/tienda",
        align: "left"
    },
    {
        id: 4,
        src: "/banners/Zapatillas Saprix - ref Roma.webp",
        alt: "Zapatillas Saprix Roma",
        title: "Roma Edición Limitada",
        subtitle: "Exclusividad total y diseño premium",
        link: "/tienda?featured=true",
        align: "right"
    },
    {
        id: 5,
        src: "/banners/Zapatillas Saprix - Accesorios Deportivos Guantes Mochilas Balones.webp",
        alt: "Accesorios Deportivos Saprix",
        title: "Accesorios Deportivos",
        subtitle: "Guantes, mochilas y balones",
        link: "/ofertas",
        align: "center"
    },
];

export default function MainHeroSlider() {
    const getAlignClasses = (align: string) => {
        switch (align) {
            case 'left':
                return 'justify-start text-left pl-8 sm:pl-16 lg:pl-24';
            case 'right':
                return 'justify-end text-right pr-8 sm:pr-16 lg:pr-24';
            case 'center':
            default:
                return 'justify-center text-center px-4';
        }
    };

    return (
        <section className="relative w-full h-[45vh] md:h-[65vh] lg:h-[75vh] overflow-hidden bg-gray-900">
            <Swiper
                modules={[Autoplay, EffectFade, Pagination, Navigation]}
                effect="fade"
                speed={1000}
                autoplay={{
                    delay: 7000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                navigation={true}
                loop={true}
                className="w-full h-full"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id} className="relative w-full h-full">
                        {/* Imagen de fondo */}
                        <div className="absolute inset-0 w-full h-full">
                            <Image
                                src={banner.src}
                                alt={banner.alt}
                                fill
                                priority={banner.id === "holiday-notice" || banner.id === 0}
                                className="object-cover object-center"
                                sizes="100vw"
                            />
                            {/* Overlay degradado */}
                            {!banner.isNotice && (
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent ${banner.align === 'left' ? 'bg-gradient-to-r from-black/60 via-transparent to-transparent' : banner.align === 'right' ? 'bg-gradient-to-l from-black/60 via-transparent to-transparent' : ''}`} />
                            )}
                            {/* Overlay para avisos */}
                            {banner.isNotice && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            )}
                        </div>

                        {/* Contenido (Texto) - Para banners de aviso */}
                        {banner.isNotice && banner.title && (
                            <div className="absolute inset-0 flex items-center justify-center px-4">
                                <div className="max-w-3xl w-full space-y-4 md:space-y-6 text-center">
                                    {/* Título */}
                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#90FF00] drop-shadow-lg"
                                    >
                                        {banner.title}
                                    </motion.h2>

                                    {/* Subtítulo principal */}
                                    {banner.subtitle && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.3 }}
                                            className="text-base sm:text-lg md:text-xl text-white font-medium drop-shadow-md px-4"
                                        >
                                            {banner.subtitle}
                                        </motion.p>
                                    )}

                                    {/* Texto extra */}
                                    {banner.extraText && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.4 }}
                                            className="text-sm sm:text-base text-gray-200 drop-shadow-md"
                                        >
                                            {banner.extraText}
                                        </motion.p>
                                    )}

                                    {/* Mensaje festivo */}
                                    {banner.festiveMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.5 }}
                                            className="py-3"
                                        >
                                            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                                                {banner.festiveMessage}
                                            </p>
                                            {banner.teamMessage && (
                                                <p className="text-sm sm:text-base text-gray-200 mt-2">
                                                    {banner.teamMessage}
                                                </p>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Botón de WhatsApp */}
                                    {banner.link && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.6 }}
                                        >
                                            <a
                                                href={banner.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                </svg>
                                                <span className="text-sm md:text-base">{banner.buttonText}</span>
                                            </a>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contenido (Texto) - Para banners normales */}
                        {!banner.isNotice && banner.title && (
                            <div className={`absolute inset-0 flex items-center ${getAlignClasses(banner.align || 'center')}`}>
                                <div className="max-w-2xl space-y-6">
                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className="text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tight drop-shadow-lg"
                                    >
                                        {banner.title}
                                    </motion.h2>
                                    {banner.subtitle && (
                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.4 }}
                                            className="text-lg sm:text-2xl text-gray-200 font-medium drop-shadow-md"
                                        >
                                            {banner.subtitle}
                                        </motion.p>
                                    )}
                                    {banner.link && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.6 }}
                                        >
                                            <Link
                                                href={banner.link}
                                                className="inline-flex items-center gap-2 px-8 py-4 bg-saprix-electric-blue hover:bg-blue-700 text-white font-bold rounded-none -skew-x-6 transition-all transform hover:scale-105 shadow-lg hover:shadow-saprix-electric-blue/50"
                                            >
                                                <span className="skew-x-6">{banner.buttonText || "Ver Colección"}</span>
                                                <svg className="w-5 h-5 skew-x-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </Link>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Estilos personalizados para Swiper dots y arrows */}
            <style jsx global>{`
        .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 10px;
          height: 10px;
        }
        .swiper-pagination-bullet-active {
          background: #2500ff; /* Saprix Electric Blue */
          opacity: 1;
          transform: scale(1.2);
        }
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 24px;
          font-weight: bold;
        }
      `}</style>
        </section>
    );
}
