'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        category: 'Navegación y Cuenta',
        color: 'bg-[var(--color-pharma-blue)]',
        items: [
            { question: '¿Puedo comprar sin crear una cuenta?', answer: 'No, al crear una cuenta tendrás beneficios como seguimiento más fácil de pedidos, historial, promociones exclusivas y la posibilidad de recuperar tus datos fácilmente.' },
            { question: '¿Cómo navego por el sitio para encontrar productos?', answer: 'Utiliza la barra de búsqueda para buscar por nombre de producto o principio activo, usa los filtros (categoría, marca, precio, fórmula/requisito de receta), y revisa la ficha del producto donde se describe su uso, si requiere receta, precio, disponibilidad y condiciones de envío.' }
        ]
    },
    {
        category: 'Pagos',
        color: 'bg-[var(--color-pharma-blue)]',
        items: [
            { question: '¿Cuáles son los medios de pago aceptados?', answer: 'Puedes pagar con tarjeta de crédito, tarjeta de débito, por medio de PSE (cuenta de ahorros o cuenta corriente) y/o contra entrega (si está habilitado para tu zona).' },
            { question: '¿Es seguro comprar en Pharmaplus?', answer: 'Sí. Nuestra plataforma cuenta con sellos de confianza y aliados de pago que cumplen con los más altos estándares de seguridad online.' }
        ]
    },
    {
        category: 'Envíos',
        color: 'bg-[var(--color-pharma-blue)]',
        items: [
            { question: '¿Cuál es la cobertura de envío?', answer: 'Hacemos envíos a domicilio en Bogotá, poblaciones aledañas y a nivel nacional.' },
            { question: '¿Cómo hago seguimiento de mi pedido?', answer: 'Recibirás notificaciones por correo electrónico. También puedes comunicarte al 601 593 4010 para consultar el estado.' }
        ]
    },
    {
        category: 'Atención al Cliente',
        color: 'bg-[var(--color-pharma-blue)]',
        items: [
            { question: '¿Cómo puedo comunicarme con servicio al cliente?', answer: 'Línea telefónica: 601 593 4010. WhatsApp: 317 365 6157. Horario: Lunes a Jueves 7:30am-6pm, Viernes 7:30am-5pm, Sábados 8am-12pm.' }
        ]
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggleAccordion = (index: string) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="w-full bg-white py-16">
            <div className="w-[90%] mx-auto max-w-7xl">

                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-3xl font-bold text-gray-900">
                        Preguntas <span className="text-[var(--color-pharma-blue)]">Frecuentes</span>
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 max-w-2xl mx-auto">
                        Resolvemos tus inquietudes para que tu experiencia de compra sea la mejor.
                    </p>
                </div>

                {/* FAQ Grid */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Column 1 */}
                    <div className="space-y-6">
                        {faqs.slice(0, 2).map((category, catIdx) => (
                            <div key={catIdx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                                    <span className={`w-2 h-8 ${category.color} rounded-full`}></span>
                                    <h3 className="font-bold text-gray-800 text-lg">{category.category}</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {category.items.map((item, itemIdx) => {
                                        const index = `c${catIdx}-i${itemIdx}`;
                                        const isOpen = openIndex === index;
                                        return (
                                            <div key={itemIdx} className="group">
                                                <button
                                                    onClick={() => toggleAccordion(index)}
                                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                                >
                                                    <span className={`font-medium text-sm md:text-base ${isOpen ? 'text-[var(--color-pharma-blue)]' : 'text-gray-700'}`}>
                                                        {item.question}
                                                    </span>
                                                    {isOpen ?
                                                        <ChevronUp className="w-5 h-5 text-[var(--color-pharma-blue)] flex-shrink-0" /> :
                                                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-pharma-blue)] flex-shrink-0" />
                                                    }
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-6 pb-5 pt-0 text-sm text-gray-600 leading-relaxed">
                                                                {item.answer}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                        {faqs.slice(2).map((category, catIdx) => (
                            <div key={catIdx + 2} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                                    <span className={`w-2 h-8 ${category.color} rounded-full`}></span>
                                    <h3 className="font-bold text-gray-800 text-lg">{category.category}</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {category.items.map((item, itemIdx) => {
                                        const index = `c${catIdx + 2}-i${itemIdx}`;
                                        const isOpen = openIndex === index;
                                        return (
                                            <div key={itemIdx} className="group">
                                                <button
                                                    onClick={() => toggleAccordion(index)}
                                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                                >
                                                    <span className={`font-medium text-sm md:text-base ${isOpen ? 'text-[var(--color-pharma-blue)]' : 'text-gray-700'}`}>
                                                        {item.question}
                                                    </span>
                                                    {isOpen ?
                                                        <ChevronUp className="w-5 h-5 text-[var(--color-pharma-blue)] flex-shrink-0" /> :
                                                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-pharma-blue)] flex-shrink-0" />
                                                    }
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-6 pb-5 pt-0 text-sm text-gray-600 leading-relaxed">
                                                                {item.answer}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* More Link */}
                        <div className="pt-4 text-center">
                            <a href="/politicas/preguntas-frecuentes" className="inline-flex items-center gap-2 text-[var(--color-pharma-blue)] font-bold hover:underline">
                                <HelpCircle className="w-5 h-5" />
                                Ver todas las preguntas frecuentes
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
