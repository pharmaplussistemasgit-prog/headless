import { FileText, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { POLICIES } from '@/lib/policies';

export const metadata = {
    title: 'Políticas y Legales - PharmaPlus',
    description: 'Consulta y descarga nuestras políticas corporativas, términos y condiciones.',
};

export default function PoliciesPage() {
    // Group documents by category
    const groupedDocs = POLICIES.reduce((acc, doc) => {
        if (!acc[doc.category]) acc[doc.category] = [];
        acc[doc.category].push(doc);
        return acc;
    }, {} as Record<string, typeof POLICIES>);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Centro de <span className="text-[var(--color-pharma-blue)]">Políticas y Legales</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        En PharmaPlus, la transparencia es nuestra prioridad. Aquí encontrarás toda la documentación legal y corporativa disponible para su consulta y descarga.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="space-y-12">
                    {Object.entries(groupedDocs).map(([category, docs]) => (
                        <div key={category}>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <span className="w-10 h-1 bg-[var(--color-pharma-green)] rounded-full"></span>
                                {category}
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {docs.map((doc) => {
                                    const isInternal = ['terminos-condiciones', 'proteccion-datos', 'aviso-privacidad', 'preguntas-frecuentes', 'politicas-devolucion'].includes(doc.slug);
                                    const href = isInternal ? `/politicas/${doc.slug}` : doc.url;
                                    const target = isInternal ? undefined : "_blank";

                                    return (
                                        <Link
                                            key={doc.id}
                                            href={href}
                                            target={target}
                                            rel={isInternal ? undefined : "noopener noreferrer"}
                                            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[var(--color-pharma-blue)] transition-all duration-300 flex flex-col justify-between h-full"
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-pharma-blue)] transition-colors">
                                                    <FileText className="w-6 h-6 text-[var(--color-pharma-blue)] group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 group-hover:text-[var(--color-pharma-blue)] transition-colors line-clamp-2">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {isInternal ? 'Documento digital' : 'Formato PDF'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end pt-4 border-t border-gray-50">
                                                <span className="text-sm font-semibold text-[var(--color-pharma-green)] flex items-center gap-2 opacity-80 group-hover:opacity-100">
                                                    {isInternal ? 'Leer política' : 'Descargar'}
                                                    {isInternal ? <ArrowRight className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Disclaimer */}
                <div className="mt-16 bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                    <p className="text-sm text-blue-800">
                        ¿Necesitas más información? Contacta a nuestro equipo de soporte en{' '}
                        <a href="mailto:atencionalusuario@pharmaplus.com.co" className="font-bold underline hover:text-blue-900">
                            atencionalusuario@pharmaplus.com.co
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
