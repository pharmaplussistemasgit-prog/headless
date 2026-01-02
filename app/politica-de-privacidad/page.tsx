import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidad | PharmaPlus',
    description: 'Política de tratamiento de datos personales.',
};

export default function PrivacidadPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-[var(--color-primary-blue)] mb-6">Política de Privacidad</h1>
            <div className="prose max-w-none text-gray-600">
                <p className="mb-4">Última actualización: {new Date().toLocaleDateString()}</p>
                <p>En PharmaPlus nos tomamos muy en serio la privacidad de tus datos.</p>
                {/* Contenido pendiente de definir */}
                <p className="italic text-gray-400 mt-4">[Contenido legal pendiente de redacción]</p>
            </div>
        </div>
    );
}
