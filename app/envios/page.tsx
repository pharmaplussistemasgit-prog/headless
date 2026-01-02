import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Envíos y Entregas | PharmaPlus',
  description: 'Información sobre cobertura y tiempos de entrega.',
};

export default function EnviosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[var(--color-primary-blue)] mb-6">Información de Envíos</h1>
      <div className="prose max-w-none text-gray-600">
        <p>Realizamos entregas seguras y rápidas.</p>
        <p className="italic text-gray-400 mt-4">[Contenido logístico pendiente de redacción]</p>
      </div>
    </div>
  );
}
