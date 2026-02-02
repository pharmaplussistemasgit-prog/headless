import React from 'react';
import { Heart, ShieldCheck, Star, Users, Award, Stethoscope } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Quiénes Somos - PharmaPlus',
    description: 'Conoce nuestra historia, valores y compromiso con la salud en Colombia.',
};

export default function AboutUsPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* HERO SECTION */}
            <div className="relative bg-[var(--color-pharma-blue)] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-pharma-green)] opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Nosotros
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                        Conectando a las personas de Colombia con sus tratamientos, con humanidad, tecnología y dedicación.
                    </p>
                </div>
            </div>

            {/* QUIÉNES SOMOS */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-[var(--color-pharma-blue)] text-sm font-bold mb-6">
                            Nuestra Historia
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Quiénes Somos
                        </h2>
                        <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                            <p>
                                Somos una empresa colombiana que, desde 2002, trabaja a nivel nacional para asegurar que los medicamentos de prescripción médica lleguen a tiempo, con seguridad y con el cuidado que merece la salud. Acompañamos a pacientes, médicos, IPS y laboratorios en todo Colombia con un servicio cercano y confiable.
                            </p>
                            <p>
                                Con el apoyo de un CRM inteligente y un equipo comprometido, garantizamos una atención clara, seguimiento constante y entregas seguras a través de nuestra propia red de domiciliarios. Nuestro propósito es conectar a las personas de Colombia con sus tratamientos, con humanidad, tecnología y dedicación.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
                            {/* Placeholder for About Us Image - You can use a generic medical image here */}
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                                <Users className="w-32 h-32 text-blue-200" />
                            </div>
                        </div>
                        {/* Stat Card */}
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-xs">
                            <p className="text-4xl font-bold text-[var(--color-pharma-green)] mb-1">20+</p>
                            <p className="text-sm text-gray-600 font-medium">Años de experiencia cuidando la salud de los colombianos.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NUESTROS VALORES */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-[var(--color-pharma-green)] text-sm font-bold mb-4">
                            Nuestra Esencia
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Nuestros Valores
                        </h2>
                        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                            Principios que guían cada entrega y cada decisión que tomamos.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Valor 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Heart className="w-6 h-6 text-[var(--color-pharma-blue)]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Compromiso con la Vida</h3>
                            <p className="text-gray-600 mb-4">
                                Cada acción tiene un propósito: garantizar que los pacientes reciban lo que necesitan, cuando lo necesitan. Actuamos con responsabilidad, empatía y sentido humano.
                            </p>
                            <p className="text-sm font-semibold text-[var(--color-pharma-blue)]">
                                Cada entrega cuenta, porque detrás de cada pedido hay una vida.
                            </p>
                        </div>

                        {/* Valor 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6 text-[var(--color-pharma-blue)]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Transparencia que Inspira Confianza</h3>
                            <p className="text-gray-600 mb-4">
                                Construimos relaciones sólidas a través de la verdad, la integridad y la coherencia. Cumplimos lo que prometemos, sin atajos ni excusas.
                            </p>
                            <p className="text-sm font-semibold text-[var(--color-pharma-blue)]">
                                Hacemos lo correcto, incluso cuando nadie nos ve.
                            </p>
                        </div>

                        {/* Valor 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Star className="w-6 h-6 text-[var(--color-pharma-blue)]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Excelencia con Propósito</h3>
                            <p className="text-gray-600 mb-4">
                                Buscamos la mejora continua, la precisión y la eficiencia en todo lo que hacemos. La excelencia no es un estándar: es nuestro sello.
                            </p>
                            <p className="text-sm font-semibold text-[var(--color-pharma-blue)]">
                                La excelencia técnica cobra sentido cuando mejora la vida de los demás.
                            </p>
                        </div>

                        {/* Valor 4 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Users className="w-6 h-6 text-[var(--color-pharma-blue)]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">4. Cercanía y Calidez en el Servicio</h3>
                            <p className="text-gray-600 mb-4">
                                Servir con empatía nos distingue. Escuchamos, comprendemos y acompañamos con una actitud positiva, humana y colaboradora.
                            </p>
                            <p className="text-sm font-semibold text-[var(--color-pharma-blue)]">
                                El mejor servicio nace del corazón.
                            </p>
                        </div>

                        {/* Valor 5 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Award className="w-6 h-6 text-[var(--color-pharma-blue)]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">5. Fuerza del Equipo</h3>
                            <p className="text-gray-600 mb-4">
                                Creemos en la unión, la diversidad y el orgullo de pertenecer. Juntos logramos más: un equipo, una misión, un propósito.
                            </p>
                            <p className="text-sm font-semibold text-[var(--color-pharma-blue)]">
                                Unidos para que cada paciente reciba lo mejor de nosotros.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* POLÍTICA DE CALIDAD */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="bg-[var(--color-pharma-blue)] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-6 text-center">Política de Calidad</h2>
                        <p className="text-lg text-blue-100 text-center max-w-4xl mx-auto mb-12">
                            En Pharmaplus S.A.S. trabajamos con un propósito claro: garantizar que cada producto farmacéutico llegue a su destino con seguridad, oportunidad y excelencia, contribuyendo al bienestar de los pacientes y al fortalecimiento del sistema de salud en Colombia.
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { 
                                    title: "1. Seguridad y cumplimiento", 
                                    desc: "Garantizamos la integridad de los productos en toda la cadena logística, cumpliendo con normas INVIMA y BPA. Trabajamos con más de 120 compañías nacionales y multinacionales, asegurando productos confiables y una entrega segura y trazable." 
                                },
                                { 
                                    title: "2. Excelencia operativa", 
                                    desc: "Ejecutamos procesos eficientes, trazables y medibles, orientados a resultados y a la satisfacción total del cliente." 
                                },
                                { 
                                    title: "3. Innovación y mejora continua", 
                                    desc: "Promovemos una cultura de aprendizaje constante que impulsa la optimización tecnológica, la digitalización y la innovación en la cadena de suministro farmacéutica." 
                                },
                                { 
                                    title: "4. Servicio centrado en el paciente", 
                                    desc: "Cada decisión, acción y entrega está guiada por la empatía y el compromiso con las personas que dependen de nuestros servicios." 
                                },
                                { 
                                    title: "5. Transparencia y ética empresarial", 
                                    desc: "Actuamos con honestidad, integridad y responsabilidad en cada interacción, fortaleciendo la confianza con nuestros aliados, autoridades y comunidades, cumpliendo las normas SAGRILAFT y PTEE." 
                                },
                                { 
                                    title: "6. Trabajo en equipo y desarrollo del talento", 
                                    desc: "Fomentamos un entorno colaborativo donde la formación, el respeto y la comunicación abierta impulsan el crecimiento individual y colectivo." 
                                }
                            ].map((item, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                                    <h4 className="font-bold text-[var(--color-pharma-green)] mb-2">{item.title}</h4>
                                    <p className="text-sm text-blue-50">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ESPECIALIDADES */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Especialidades</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[
                            "Anestesiología", "Angio-Flebol", "Cardiología", "Cirugía", "Cirugía Cardiovascular", "Cirugía Plástica / RP",
                            "Deportología", "Dermatología", "Diabetes", "Endocrinología", "Fertilidad", "Fisiatría",
                            "Gastroenterología", "Geriatría", "Ginecología", "Infectología", "Medicina General", "Medicina Interna",
                            "Nefrología-Dialisis", "Neumo-Tisiología", "Neurología", "Nutrición", "Oftalmología", "Oncología",
                            "Optometría", "Ortopedia", "Otorrinolaringología", "Pediatría", "Psiquiatría", "Reumatología",
                            "Sistema Nervioso", "Traumatología", "Urología"
                        ].map((spec, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg shadow-sm text-center text-sm font-medium text-gray-700 border border-gray-100 hover:border-blue-200 hover:text-[var(--color-pharma-blue)] transition-colors cursor-default">
                                {spec}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NUESTRO COMPROMISO */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-pharma-green)] text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Nuestro Compromiso</h2>
                    <p className="text-xl md:text-2xl font-medium leading-relaxed">
                        "En Pharmaplus, la calidad no es un proceso: es una actitud diaria.
                        <br className="my-4 block" />
                        Cada entrega, cada servicio y cada decisión reflejan nuestra promesa de confianza, cumplimiento y cuidado por la vida."
                    </p>
                </div>
            </section>
        </div>
    );
}
