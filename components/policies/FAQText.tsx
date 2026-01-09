import React from 'react';

export default function FAQText() {
    return (
        <div className="space-y-12 text-gray-700">
            {/* 1. NAVEGACIÓN Y CUENTA */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-1.5 h-8 bg-[var(--color-pharma-blue)] rounded-full"></span>
                    <h2 className="text-2xl font-bold text-gray-900">Navegación y Cuenta</h2>
                </div>
                <div className="space-y-6 pl-4 border-l border-gray-100 ml-[3px]">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">1. ¿Puedo comprar sin crear una cuenta?</h3>
                        <p className="text-sm leading-relaxed">
                            No. Al crear una cuenta podrás hacer seguimiento de tus pedidos, acceder a tu historial de compras, recibir promociones exclusivas y recuperar tus datos fácilmente.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">2. ¿Cómo navego por el sitio para encontrar productos?</h3>
                        <p className="text-sm leading-relaxed">
                            Utiliza la barra de búsqueda por nombre de producto o principio activo. También puedes usar los filtros por categoría, marca, precio y requisito de fórmula médica. En cada ficha de producto encontrarás su descripción, precio, disponibilidad y condiciones de envío.
                        </p>
                    </div>
                </div>
            </section>

            {/* 2. PAGO */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-1.5 h-8 bg-[var(--color-pharma-blue)] rounded-full"></span>
                    <h2 className="text-2xl font-bold text-gray-900">Pagos</h2>
                </div>
                <div className="space-y-6 pl-4 border-l border-gray-100 ml-[3px]">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">1. ¿Cuáles son los medios de pago disponibles?</h3>
                        <p className="text-sm leading-relaxed mb-2">En PharmaPlus contamos con diferentes opciones de pago para facilitar tu compra:</p>
                        <ul className="text-sm leading-relaxed list-none space-y-1 ml-1 text-gray-600">
                            <li>✔️ Tarjetas de crédito y débito</li>
                            <li>✔️ PSE (cuentas de ahorro o corriente)</li>
                            <li>✔️ Pago contra entrega (disponible según la zona)</li>
                            <li>✔️ Convenios de pago con cooperativas o fondos aliados</li>
                            <li>✔️ Pago a crédito con Wompi (requiere afiliación previa)</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">2. No puedo finalizar el pago con tarjeta o PSE, ¿qué hago?</h3>
                        <p className="text-sm leading-relaxed">
                            Verifica que los datos ingresados sean correctos y que tengas habilitadas las compras en línea para PSE. Si el problema persiste, comunícate con nuestro call center al 601 593 4010.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">3. ¿Puedo usar dos medios de pago en una misma compra?</h3>
                        <p className="text-sm leading-relaxed">
                            No. Solo se permite un medio de pago por transacción.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">4. ¿Es seguro comprar en Pharmaplus?</h3>
                        <p className="text-sm leading-relaxed">
                            Sí. Nuestra tienda cumple con altos estándares de seguridad y contamos con aliados de pago certificados que garantizan la protección de tus transacciones.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. ENVÍO Y ENTREGA */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-1.5 h-8 bg-[var(--color-pharma-blue)] rounded-full"></span>
                    <h2 className="text-2xl font-bold text-gray-900">Envío y Entrega</h2>
                </div>
                <div className="space-y-6 pl-4 border-l border-gray-100 ml-[3px]">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">1. ¿Cómo hago seguimiento a mi pedido?</h3>
                        <p className="text-sm leading-relaxed">
                            Recibirás notificaciones por correo electrónico sobre el estado de tu pedido. Además, un asesor se comunicará contigo para coordinar la entrega. También puedes llamar al 601 593 4010.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">2. ¿Puedo cambiar la dirección de entrega?</h3>
                        <p className="text-sm leading-relaxed">
                            Sí. Debes comunicarte dentro de los primeros 15 minutos después de realizar el pedido al 601 593 4010.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">3. ¿Qué pasa si no estaba presente al momento de la entrega?</h3>
                        <p className="text-sm leading-relaxed">
                            Si no te encontrabas disponible al momento de la entrega, te invitamos a comunicarte con nuestro call center para verificar el estado de tu pedido y coordinar una nueva entrega.
                            <br /><br />
                            También puedes indicar previamente, en el campo de observaciones, si deseas que el pedido sea entregado a una persona diferente.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">4. ¿Cuál es la cobertura de envío?</h3>
                        <p className="text-sm leading-relaxed">
                            Somos expertos entregas a nivel nacional, si desea puede consultar nuestro cubrimiento así mismo como valores de envío y tiempos de entrega.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">5. ¿Qué tipo de productos puedo comprar?</h3>
                        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 ml-1 text-gray-600">
                            <li>Productos de venta libre (OTC).</li>
                            <li>Productos con fórmula médica, adjuntando la prescripción correspondiente.</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">6. ¿Qué información debo tener al comprar?</h3>
                        <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 ml-1 text-gray-600">
                            <li>Datos personales completos.</li>
                            <li>Dirección de entrega correcta.</li>
                            <li>Medio de pago seleccionado.</li>
                            <li>Receta médica si el producto lo requiere.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 4. DEVOLUCIONES Y CAMBIOS */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-1.5 h-8 bg-[var(--color-pharma-blue)] rounded-full"></span>
                    <h2 className="text-2xl font-bold text-gray-900">Devoluciones y Cambios</h2>
                </div>
                <div className="space-y-6 pl-4 border-l border-gray-100 ml-[3px]">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">1. ¿Puedo devolver un producto?</h3>
                        <p className="text-sm leading-relaxed">
                            Sí, siempre que el producto esté sin uso, con empaque intacto y dentro del plazo permitido hasta 48 horas despues de recibido, productos de control especial, productos de cadena de frio y/o productos de uso personal NO tienen devolución.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">2. ¿Puedo solicitar un reembolso?</h3>
                        <p className="text-sm leading-relaxed">
                            Sí, siempre que se cumplan los requisitos de devolución. El dinero será reintegrado según el medio de pago utilizado.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">3. ¿Qué hago si el producto llega dañado o equivocado?</h3>
                        <p className="text-sm leading-relaxed">
                            Comunícate de inmediato al 601 593 4010, indicando tu número de pedido.
                        </p>
                    </div>
                </div>
            </section>

            {/* 5. ATENCIÓN AL CLIENTE */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-1.5 h-8 bg-[var(--color-pharma-blue)] rounded-full"></span>
                    <h2 className="text-2xl font-bold text-gray-900">Atención al Cliente</h2>
                </div>
                <div className="space-y-6 pl-4 border-l border-gray-100 ml-[3px]">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">¿Cómo puedo comunicarme?</h3>
                        <ul className="text-sm leading-relaxed space-y-1 ml-1 text-gray-600">
                            <li><span className="font-semibold">Línea telefónica:</span> 601 593 4010</li>
                            <li><span className="font-semibold">WhatsApp:</span> 317 365 6157</li>
                            <li><span className="font-semibold">Horario:</span> Lunes a viernes 7:30 am – 6:00 pm / Sábados 8:00 am – 12:00 m</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">¿Dónde puedo resolver dudas sobre dosis o uso?</h3>
                        <p className="text-sm leading-relaxed">
                            Puedes comunicarte con un asesor. Esta orientación no reemplaza la consulta médica profesional.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-2">Política de privacidad y protección de datos</h3>
                        <p className="text-sm leading-relaxed">
                            Tus datos se tratan conforme a la Ley 1581 de 2012 y normativa vigente en Colombia. No compartimos tu información con terceros salvo obligación legal.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
