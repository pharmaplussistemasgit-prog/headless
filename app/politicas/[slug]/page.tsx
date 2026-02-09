import { POLICIES } from '@/lib/policies';
import { notFound } from 'next/navigation';
import { FileText, Download, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// SEO Text Components
import FAQText from '@/components/policies/FAQText';
import TermsText from '@/components/policies/TermsText';
import PrivacyText from '@/components/policies/PrivacyText';
import DataProtectionText from '@/components/policies/DataProtectionText';
import ReturnsPolicyText from '@/components/policies/ReturnsPolicyText';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const policy = POLICIES.find((p) => p.slug === slug);

    if (!policy) {
        return {
            title: 'Política no encontrada - PharmaPlus',
        };
    }

    return {
        title: `${policy.title} - PharmaPlus`,
        description: policy.description,
    };
}

export default async function PolicyDetailPage({ params }: Props) {
    const { slug } = await params;
    const policy = POLICIES.find((p) => p.slug === slug);

    if (!policy) {
        notFound();
    }

    // Determine which text component to render (if any)
    let ContentComponent = null;
    if (slug === 'preguntas-frecuentes') ContentComponent = FAQText;
    if (slug === 'terminos-condiciones') ContentComponent = TermsText;
    if (slug === 'aviso-privacidad') ContentComponent = PrivacyText;
    if (slug === 'proteccion-datos') ContentComponent = DataProtectionText;
    if (slug === 'politicas-devolucion') ContentComponent = ReturnsPolicyText;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb / Back Link */}
                <div className="mb-8">
                    <Link href="/politicas" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Centro de Políticas
                    </Link>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-[var(--color-pharma-blue)] p-8 sm:p-12 text-center relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-pharma-green)] opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                                {policy.title}
                            </h1>
                            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
                                {policy.category}
                            </p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 sm:p-12">
                        {/* SEO Text Content (If available) */}
                        {ContentComponent && (
                            <div className="mb-12 border-b border-gray-100 pb-12">
                                <div className="prose max-w-none text-gray-600">
                                    <ContentComponent />
                                </div>
                            </div>
                        )}

                        <div className="prose max-w-none text-gray-600">
                            {!ContentComponent && (
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Descripción del Documento</h3>
                            )}

                            <p className="mb-8 leading-relaxed">
                                {!ContentComponent && policy.description}
                                <br /><br />
                                Este es un documento oficial de PharmaPlus. Para su comodidad y referencia legal, puede descargar la versión original firmada y completa en formato PDF a continuación.
                            </p>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-red-500">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{policy.title}.pdf</p>
                                        <p className="text-sm text-blue-600">Documento Oficial • Formato PDF</p>
                                    </div>
                                </div>
                                <a
                                    href={policy.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-8 py-3 bg-[var(--color-pharma-green)] hover:bg-green-600 text-white font-bold rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                                >
                                    Descargar PDF
                                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                </a>
                            </div>
                        </div>

                        {/* PDF Preview (Iframe) */}
                        <div className="mt-12">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Vista Previa del Documento</h3>
                            <div className="w-full h-[600px] bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative">
                                <iframe
                                    src={`${policy.url}#toolbar=0`}
                                    className="w-full h-full relative z-10"
                                    title="PDF Preview"
                                ></iframe>
                                {/* Fallback message behind iframe */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-0">
                                    Cargando vista previa...
                                </div>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-2">
                                Si no puedes ver el documento, utiliza el botón de descarga arriba.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
