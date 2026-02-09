'use client';

import { Check, Star, Truck, Zap, Calendar, ArrowRight, HelpCircle, Shield, Heart } from 'lucide-react';
import Link from 'next/link';

export default function PharmaPrimePage() {
    const plans = [
        {
            id: 'monthly',
            name: 'Mensual',
            price: '$14.900',
            period: '/ mes',
            description: 'Facturación mensual recurrente',
            features: [
                'Envíos GRATIS ilimitados (pedidos > $30.000)',
                'Descuentos exclusivos Prime',
                'Atención prioritaria',
                'Cancela cuando quieras'
            ],
            cta: 'Suscribirme Mensual',
            popular: false
        },
        {
            id: 'biannual',
            name: 'Semestral',
            price: '$74.900',
            period: '/ semestre',
            description: 'Ahorras un 16% vs mensual',
            features: [
                'Todos los beneficios mensuales',
                'Envíos GRATIS ilimitados',
                'Acceso anticipado a ofertas',
                'Regalo de bienvenida sorpresa'
            ],
            cta: 'Suscribirme Semestral',
            popular: true
        },
        {
            id: 'annual',
            name: 'Anual',
            price: '$149.000',
            period: '/ año',
            description: 'La mejor oferta: 2 meses gratis',
            features: [
                'Todos los beneficios semestrales',
                'Envíos GRATIS ilimitados',
                'Descuentos especiales de aniversario',
                'Atención VIP exclusiva'
            ],
            cta: 'Suscribirme Anual',
            popular: false
        }
    ];

    const benefits = [
        {
            icon: Truck,
            title: 'Envíos Gratis Ilimitados',
            description: 'Olvídate de pagar domicilios. En todos tus pedidos superiores a $30.000, el envío va por nuestra cuenta.'
        },
        {
            icon: Zap,
            title: 'Ofertas Relámpago',
            description: 'Accede a descuentos exclusivos y ofertas relámpago 30 minutos antes que el resto de usuarios.'
        },
        {
            icon: Shield,
            title: 'Garantía Extendida',
            description: 'Disfruta de una política de devoluciones extendida y garantía de satisfacción garantizada.'
        },
        {
            icon: Heart,
            title: 'Alianzas Médicas',
            description: 'Precios especiales en telemedicina y consultas con nuestros especialistas aliados.'
        }
    ];

    const faqs = [
        {
            q: '¿Cómo funcionan los envíos gratis?',
            a: 'Una vez te suscribas a Pharma Prime, el costo de envío se descontará automáticamente en todos tus pedidos superiores a $30.000.'
        },
        {
            q: '¿Puedo cancelar mi suscripción?',
            a: 'Sí, puedes cancelar tu suscripción en cualquier momento desde tu perfil. Mantendrás tus beneficios hasta que finalice el periodo facturado.'
        },
        {
            q: '¿Los descuentos son acumulables?',
            a: 'Los descuentos Prime son adicionales a muchas ofertas vigentes, pero te recomendamos revisar los términos de cada promoción específica.'
        },
        {
            q: '¿Cómo activo mi suscripción?',
            a: 'Solo elige el plan que prefieras arriba, completa el pago y ¡listo! Tus beneficios se activarán inmediatamente en tu cuenta.'
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-[var(--color-pharma-blue)] text-white pt-16 pb-24 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative max-w-7xl mx-auto text-center z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-800/50 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold tracking-wide uppercase">Programa de Lealtad</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Pharma <span className="text-yellow-400 italic">Prime</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Desbloquea envíos gratis ilimitados, ofertas exclusivas y mucho más por menos de lo que cuesta un café al mes.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#planes" className="w-full sm:w-auto px-8 py-4 bg-yellow-400 text-blue-900 font-bold rounded-2xl shadow-lg hover:bg-yellow-300 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                            Ver Planes
                            <ArrowRight className="w-5 h-5" />
                        </a>
                        <Link href="/mi-cuenta" className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center">
                            Ya soy miembro
                        </Link>
                    </div>
                </div>
            </div>

            {/* Benefits Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-[var(--color-pharma-blue)]">
                                <benefit.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{benefit.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pricing Section */}
            <div id="planes" className="py-24 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Elige tu plan ideal</h2>
                        <p className="text-gray-500 text-lg">Sin cláusulas de permanencia. Cancela cuando quieras.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 transform hover:-translate-y-2 ${plan.popular
                                    ? 'border-[var(--color-pharma-blue)] shadow-2xl scale-105 z-10'
                                    : 'border-transparent shadow-xl hover:border-gray-200'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-pharma-blue)] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        Más Popular
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-end justify-center gap-1 mb-2">
                                        <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                                        <span className="text-gray-500 mb-1">{plan.period}</span>
                                    </div>
                                    <p className="text-sm text-green-600 font-medium bg-green-50 inline-block px-3 py-1 rounded-full">{plan.description}</p>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                            <Check className="w-5 h-5 text-green-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-4 rounded-xl font-bold transition-colors ${plan.popular
                                    ? 'bg-[var(--color-pharma-blue)] text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20'
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}>
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white py-24 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Preguntas Frecuentes</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-[var(--color-pharma-blue)]" />
                                    {faq.q}
                                </h3>
                                <p className="text-gray-600 pl-7 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
