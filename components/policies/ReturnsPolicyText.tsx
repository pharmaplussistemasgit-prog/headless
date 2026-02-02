import React from 'react';

export default function ReturnsPolicyText() {
    return (
        <div className="space-y-8 text-gray-700">
            <div className="bg-blue-50 border-l-4 border-[var(--color-pharma-blue)] p-6 rounded-r-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-2">POLÍTICAS DE DEVOLUCIONES – CIRCULAR PARA CLIENTES</h2>
                <p className="text-gray-700">
                    Estimados y apreciados clientes. El objetivo del presente comunicado es dar a conocer las políticas internas para el manejo de devoluciones de medicamentos y dispositivos para todos los clientes de Pharmaplus, definiendo los lineamientos para su reporte y gestión.
                </p>
                <p className="mt-4 font-semibold text-gray-800">
                    En cada devolución reportada se debe informar el número de la factura a la cual corresponde el (los) producto(s); así como lote, fecha de vencimiento, laboratorio, cantidades y causal de la devolución.
                </p>
            </div>

            <section>
                <h3 className="text-xl font-bold text-[var(--color-pharma-blue)] mb-4 flex items-center gap-2">
                    <span className="bg-[var(--color-pharma-blue)] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Fecha de vencimiento
                </h3>
                <div className="space-y-4 pl-4 border-l-2 border-gray-100 ml-4">
                    <ul className="list-[lower-alpha] space-y-3 ml-5">
                        <li className="pl-2">
                            <strong className="text-gray-900">Plazo de Solicitud:</strong> Solamente se aceptará cuando la solicitud de "devolución" por parte del cliente haya sido efectuada al Ejecutivo Comercial de Pharmaplus tres (3) meses (90 días) antes del vencimiento del producto. Excepto productos nutricionales, medicamentos biológicos o de cadena de frio, dermocosméticos e institucionales.
                        </li>
                        <li className="pl-2">
                            <strong className="text-gray-900">Verificación y Entrega:</strong> Pharmaplus efectúa verificación interna de la información suministrada; una vez autorizado, el Ejecutivo Comercial de Pharmaplus informará al cliente, quien debe hacer la devolución física dentro de los diez (10) días hábiles siguientes (de lo contrario no se gestionará la devolución).
                        </li>
                        <li className="pl-2">
                            <strong className="text-gray-900">Nota Crédito:</strong> A partir del día en que lleguen los productos autorizados para devolución por vencimiento a la bodega de Pharmaplus, se generará la nota crédito en un tiempo no mayor a 15 días.
                        </li>
                        <li className="pl-2">
                            <strong className="text-gray-900">Condiciones del Producto:</strong> Los productos próximos para vencer serán aceptados en devolución, siempre y cuando no se haya abierto su empaque, alterado las cintas de seguridad o roto el estuche y no se trate de medicamentos entregados como producto bonificado o con valor cero por convenio.
                        </li>
                        <li className="pl-2">
                            <strong className="text-gray-900">Costo:</strong> El costo de la devolución (flete) será asumido por el Cliente.
                        </li>
                    </ul>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-bold text-[var(--color-pharma-blue)] mb-4 flex items-center gap-2">
                    <span className="bg-[var(--color-pharma-blue)] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Calidad del producto
                </h3>
                <div className="space-y-4 pl-4 border-l-2 border-gray-100 ml-4">
                    <p>
                        El cliente debe informar al Ejecutivo Comercial de Pharmaplus la inconformidad del producto de acuerdo con su protocolo de Q&R con sus respectivos soportes para así mismo ser reportado al laboratorio y poder tramitar el cambio.
                    </p>

                    <div className="bg-gray-50 p-5 rounded-xl mt-4">
                        <h4 className="font-bold text-gray-900 mb-2">2.1. Manejo de productos nutricionales, medicamentos biológicos o de cadena de frio, dermocosméticos e institucionales</h4>
                        <p className="text-sm mb-3">
                            No se acreditarán devoluciones de productos nutricionales, medicamentos biológicos o de cadena de frio, dermocosméticos e institucionales por políticas internas tanto de Pharmaplus como del laboratorio fabricante; solo serán recibidos para asegurar su destrucción; como excepción se acreditarán por daños en el transporte.
                        </p>
                        <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                            <p className="text-xs font-bold text-blue-800 uppercase mb-1">📢 Información Importante sobre Cadena de Frío:</p>
                            <p className="text-sm text-blue-900">
                                Para garantizar la integridad de los medicamentos que requieren refrigeración, <strong>el envío incluye obligatoriamente una nevera de icopor y geles refrigerantes</strong> con un costo adicional de <strong>$12.000 COP</strong>. Este valor se sumará automáticamente a su factura. Por seguridad sanitaria, <strong>NO se aceptan devoluciones</strong> de estos productos bajo ninguna circunstancia una vez entregados.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4 className="font-bold text-gray-900 mb-2">2.2. Avería</h4>
                        <ul className="list-[lower-alpha] space-y-3 ml-5">
                            <li className="pl-2">
                                Se aceptará como devolución por avería de cajas o frascos siempre y cuando se reporte en las 48 horas hábiles después de recibida la mercancía.
                            </li>
                            <li className="pl-2">
                                La novedad por avería debe quedar registrada en la guía de la transportadora de Pharmaplus y los medicamentos averiados deben ser devueltos inmediatamente con la misma transportadora en el momento de la entrega.
                            </li>
                            <li className="pl-2">
                                En caso de que no se revise el contenido en el momento de la recepción se debe dejar clara la nota de “Recibido sin verificar contenido”, en la guía del transportador y reportar la novedad oficialmente a más tardar 48 horas hábiles después de la recepción, solo si se cumple con estos parámetros se realiza la reposición de la mercancía averiada o nota crédito según sea el caso.
                            </li>
                            <li className="pl-2">
                                Es indispensable comunicarse con el Ejecutivo Comercial y reportar formalmente la novedad con sus respectivos soportes, preferiblemente adjuntar evidencias fotográficas.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="bg-red-50 border border-red-100 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                    EXCEPCIONES IMPORTANTES
                </h3>
                <p className="mb-3 text-red-800 font-medium">No se aceptan devoluciones por:</p>
                <ul className="list-[lower-alpha] space-y-2 ml-5 text-red-800/80">
                    <li className="pl-2">Productos deteriorados por mal manejo del cliente.</li>
                    <li className="pl-2">Productos con sobreprecios, tachones y/o sellos del cliente.</li>
                    <li className="pl-2">Empaques rotos o manchados, frascos con las franjas de seguridad violadas o envases con contenido incompleto.</li>
                    <li className="pl-2">Presentaciones descontinuadas.</li>
                    <li className="pl-2">Productos que el cliente manifiesta no haber pedido existiendo una orden de compra o pedido previamente.</li>
                    <li className="pl-2">Clientes que no le hayan comprado el producto directamente a Pharmaplus, salvo previa autorización por parte del Laboratorio correspondiente (aplica para las tercerizaciones).</li>
                    <li className="pl-2">Fechas de Vencimiento de productos de la línea Dermocosmética, salvo previa autorización del Laboratorio correspondiente.</li>
                    <li className="pl-2">Fechas de Vencimiento de productos de la línea Nutricional.</li>
                    <li className="pl-2">Rotación y fecha de vencimiento de productos institucionales.</li>
                </ul>
            </section>

            <div className="bg-gray-100 p-6 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">Liquidación de Devoluciones</h3>
                <p>
                    Pharmaplus liquidará la devolución de acuerdo con el precio de venta teniendo en cuenta el número de la factura del producto. No se deberán efectuar descuentos directos sobre las facturas por concepto de las devoluciones en trámite, con el fin de evitar errores y confusiones contables.
                </p>
                <p className="mt-4 font-bold text-[var(--color-pharma-blue)]">
                    Nota: Tener en cuenta que cualquier afectación a la cartera de Pharmaplus no será tenida en cuenta si no ha sido aprobada la devolución según lo descrito en este instructivo con su respectiva Nota Crédito.
                </p>
            </div>
        </div>
    );
}
