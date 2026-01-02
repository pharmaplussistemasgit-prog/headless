import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos y Condiciones | PharmaPlus',
    description: 'Términos y condiciones de uso del sitio web.',
};

export default function TerminosPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-[var(--color-primary-blue)] mb-6">Términos y Condiciones</h1>
            <div className="prose max-w-none text-gray-600">
                <p className="mb-4">Última actualización: {new Date().toLocaleDateString()}</p>
                <p>Bienvenido a PharmaPlus. Al acceder a nuestro sitio web, aceptas cumplir con estos términos y condiciones.</p>
                {/* Contenido pendiente de definir */}
                <p className="italic text-gray-400 mt-4">[Contenido legal pendiente de redacción]</p>
            </div>
        </div>
    );
}
