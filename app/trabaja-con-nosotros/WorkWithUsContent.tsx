'use client';

import React from 'react';
import { Briefcase, Users, Target } from 'lucide-react';
import WorkWithUsModal from '@/components/form/WorkWithUsModal';

export default function WorkWithUsContent() {
    const [showModal, setShowModal] = React.useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HERO SECTION */}
            <div className="relative bg-[var(--color-pharma-blue)] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-pharma-green)] opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium mb-6">
                        <Briefcase className="w-4 h-4" />
                        <span>Oportunidades Laborales</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        ¡Únete al equipo PharmaPlus!
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Construyamos juntos el futuro de la salud en Colombia.
                    </p>
                    <div className="mt-8">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-[var(--color-pharma-green)] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-600 transition-colors shadow-lg hover:checkbox-md transform hover:-translate-y-1"
                        >
                            Postularme Ahora
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                {/* Intro Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-12">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Trabaja con nosotros</h2>
                        <div className="prose prose-lg text-gray-600 space-y-6">
                            <p>
                                En <span className="font-bold text-[var(--color-pharma-blue)]">PharmaPlus</span> buscamos personas con vocación de servicio, compromiso social y pasión por la salud. Si te identificas con valores como el trabajo en equipo, la responsabilidad y la excelencia, ¡queremos conocerte!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                            <Target className="w-6 h-6 text-[var(--color-pharma-blue)]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Nuestro Propósito</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Desde nuestra fundación en 2002, nos hemos consolidado como una empresa líder en la distribución de medicamentos de prescripción médica, brindando atención y cobertura a nivel nacional. Nuestro propósito es generar valor para pacientes, médicos y la industria farmacéutica, trabajando con calidad, integridad y respeto por la vida.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                            <Users className="w-6 h-6 text-[var(--color-pharma-green)]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Cultura y Crecimiento</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Creemos firmemente que el éxito de PharmaPlus está en el talento y compromiso de nuestra gente. Por eso, promovemos un ambiente laboral basado en el reconocimiento, el crecimiento profesional y el bienestar de nuestros colaboradores, impulsando oportunidades para aprender, desarrollarse y contribuir a una mejor salud en Colombia.
                        </p>
                    </div>
                </div>
            </section>

            {/* Modal */}
            <WorkWithUsModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
}
