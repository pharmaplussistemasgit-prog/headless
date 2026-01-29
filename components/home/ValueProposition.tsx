'use client';

import React from 'react';
import { ShieldCheck, Truck, CreditCard, Headphones } from 'lucide-react';

export default function ValueProposition() {
    const features = [
        {
            image: "https://tienda.pharmaplus.com.co/wp-content/uploads/2025/09/Portafolio-completo-y-especializado.png",
            title: "Portafolio completo",
            description: "Productos certificados y 100% originales."
        },
        {
            image: "https://tienda.pharmaplus.com.co/wp-content/uploads/2025/09/Variedad-de-m%E2%80%9Atodos-de-pago.png",
            title: "Variedad de medios de pago",
            description: "Transacciones seguras Online y Contra entrega."
        },
        {
            image: "https://tienda.pharmaplus.com.co/wp-content/uploads/2025/09/Respeto-riguroso-a-las-prescripciones-m%E2%80%9Adicas.png",
            title: "Respeto a prescripciones",
            description: "Seguimiento riguroso de fórmulas médicas."
        },
        {
            image: "https://tienda.pharmaplus.com.co/wp-content/uploads/2025/09/Planes-de-beneficios-a-clientes.png",
            title: "Planes de beneficios",
            description: "Ofertas exclusivas para nuestros clientes."
        },
        {
            image: "https://tienda.pharmaplus.com.co/wp-content/uploads/2025/09/Compra-segura-y-garantizada.png",
            title: "Compra segura",
            description: "Tu satisfacción es nuestra prioridad."
        }
    ];

    return (
        <section className="w-full bg-blue-50/50 py-10 border-y border-blue-100/50">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-[5%]">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-blue-50 transition-colors group"
                        >
                            <div className="relative w-16 h-16 mb-3 transition-transform group-hover:scale-110">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="object-contain w-full h-full"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-[var(--color-pharma-blue)] text-sm mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-xs text-gray-500 leading-tight">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
