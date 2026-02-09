import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Reversión pago electrónico | PharmaPlus',
    description: 'Procedimiento de reintegro de pagos a clientes.',
};

export default function ReversionPage() {
    return (
        <div className="min-h-screen bg-white py-12 text-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <Link href="/tienda" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a la Tienda
                    </Link>
                </div>

                <h1 className="text-3xl font-bold mb-8 text-[var(--color-pharma-blue)] uppercase">REINTEGRO DE PAGO A CLIENTES</h1>

                <div className="space-y-8 leading-relaxed">

                    {/* 1. Objetivo */}
                    <section>
                        <h2 className="font-bold text-lg mb-2">1. Objetivo</h2>
                        <p>
                            Establecer el procedimiento que deben seguir los clientes de PHARMAPLUS S.A.S. para solicitar el reintegro de valores, garantizando una gestión ágil, segura y transparente.
                        </p>
                    </section>

                    {/* 2. Alcance */}
                    <section>
                        <h2 className="font-bold text-lg mb-2">2. Alcance</h2>
                        <p>
                            Aplica para todos los clientes (personas naturales o jurídicas) que requieran el reintegro de dinero a favor por concepto de pagos duplicados, devoluciones, descuentos no aplicados u otros casos aprobados por el área comercial y cartera.
                        </p>
                    </section>

                    {/* 3. Procedimiento */}
                    <section>
                        <h2 className="font-bold text-lg mb-4">3. Procedimiento</h2>
                        <div className="space-y-6">

                            <div>
                                <h3 className="font-bold text-[var(--color-pharma-blue)] mb-1">Paso 1: Notificación al Asesor Comercial</h3>
                                <p className="mb-2">
                                    El cliente debe notificar al asesor comercial asignado o a la dirección de correo <a href="mailto:atencionalcliente@pharmaplus.com.co" className="text-blue-600 hover:underline">atencionalcliente@pharmaplus.com.co</a> el motivo del reintegro. El correo debe incluir la siguiente información y documentos adjuntos:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Nombre o razón social del cliente</li>
                                    <li>Número de identificación (Cédula o NIT)</li>
                                    <li>Número de contacto (celular)</li>
                                    <li>Motivo del reintegro</li>
                                    <li>Soporte de pago (comprobante de consignación, transferencia o recibo)</li>
                                    <li>Certificación bancaria (cuenta activa a nombre del cliente o empresa)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-[var(--color-pharma-blue)] mb-1">Paso 2: Envío al Área de Cartera</h3>
                                <p>
                                    El asesor comercial recopilará la información y remitirá la solicitud al área de Cartera para su validación.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-[var(--color-pharma-blue)] mb-1">Paso 3: Validación de Cartera</h3>
                                <p>
                                    El área de Cartera realizará la verificación correspondiente en los sistemas contables y bancarios. Una vez validada la información, se procederá a registrar la contabilización del reintegro.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-[var(--color-pharma-blue)] mb-1">Paso 4: Proceso en Tesorería</h3>
                                <p>
                                    Posterior a la contabilización, el caso será trasladado al área de Tesorería, encargada de efectuar el pago al cliente.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-[var(--color-pharma-blue)] mb-1">Paso 5: Plazo del Reintegro</h3>
                                <p>
                                    El tiempo estimado para el reintegro es de cinco (5) días hábiles, contados a partir de la confirmación de validación por parte del área de Cartera.
                                </p>
                            </div>

                        </div>
                    </section>

                    {/* 4. Consideraciones Generales */}
                    <section>
                        <h2 className="font-bold text-lg mb-2">4. Consideraciones Generales</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Solo se realizarán reintegros a cuentas bancarias registradas a nombre del cliente o empresa solicitante.</li>
                            <li>Las solicitudes incompletas o con información errónea no serán procesadas hasta ser corregidas.</li>
                            <li>PHARMAPLUS S.A.S. notificará al cliente una vez el reintegro haya sido efectuado.</li>
                        </ul>
                    </section>

                </div>
            </div>
        </div>
    );
}
