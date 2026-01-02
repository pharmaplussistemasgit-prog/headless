import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Devoluciones | PharmaPlus',
  description: 'Información sobre cambios y devoluciones.',
};

export default function DevolucionesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[var(--color-primary-blue)] mb-6">Política de Devoluciones</h1>
      <div className="prose max-w-none text-gray-600">
        <p>Queremos que estés satisfecho con tu compra. Revisa nuestras políticas de cambio y devolución a continuación.</p>
        <p className="italic text-gray-400 mt-4">[Contenido legal pendiente de redacción]</p>
      </div>
    </div>
  );
}
