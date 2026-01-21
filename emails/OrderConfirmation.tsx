import {
    Body,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';
import * as React from 'react';
import { isColdChain } from '../lib/coldChain';

interface OrderConfirmationProps {
    order?: any; // Using any for flexibility with WooCommerce webhook payload
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://pharmaplus.com.co';

export const OrderConfirmation = ({
    order = {
        id: 12345,
        billing: {
            first_name: 'Angela',
            email: 'angela@example.com',
            address_1: 'Calle 123 # 45-67',
            city: 'Bogotá',
            phone: '3001234567',
        },
        line_items: [
            {
                id: 1,
                name: 'Dolex Forte Caja x 10',
                quantity: 1,
                total: '12000',
                image: { src: 'https://via.placeholder.com/100' }, // WooCommerce usually doesn't send image in line_item default, would need plugin or filter. We'll handle fallback.
            },
            {
                id: 2,
                name: 'Insulina Glargina (Cadena de Frío)',
                quantity: 2,
                total: '150000',
                meta_data: [{ key: '_cadena_de_frio', value: 'yes' }]
            }
        ],
        total: '162000',
        shipping_total: '5000',
        discount_total: '0',
    },
}: OrderConfirmationProps) => {
    const { billing, line_items, id, total, shipping_total, discount_total } = order;

    return (
        <Html>
            <Tailwind>
                <Head />
                <Preview>Tu pedido #{id} ha sido confirmado 💊</Preview>
                <Body className="bg-gray-100 font-sans">
                    <Container className="mx-auto my-[40px] max-w-xl rounded-lg bg-white p-5 shadow-sm">
                        {/* Header */}
                        <Section className="mt-[20px] mb-[30px] text-center">
                            <Img
                                src={`${baseUrl}/brand/logo-new-clean.png`}
                                alt="PharmaPlus"
                                width="180"
                                className="mx-auto"
                            />
                        </Section>

                        {/* Greeting */}
                        <Heading className="mb-4 text-center text-2xl font-bold text-gray-800">
                            ¡Gracias por tu compra!
                        </Heading>
                        <Text className="mb-6 text-center text-gray-600">
                            Hola {billing.first_name}, hemos recibido tu pedido #{id} y lo estamos procesando.
                        </Text>

                        <Hr className="border-gray-200 my-6" />

                        {/* Order Summary */}
                        <Section>
                            <Text className="mb-4 text-lg font-bold text-blue-900">Resumen del Pedido</Text>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                                        <th className="pb-2">Producto</th>
                                        <th className="pb-2 text-center">Cant.</th>
                                        <th className="pb-2 text-right">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {line_items.map((item: any, index: number) => {
                                        // Check Cold Chain
                                        // Use imported helper if possible, or manual check on name/meta
                                        const isCold = isColdChain([], item);

                                        return (
                                            <tr key={index} className="border-b border-gray-50">
                                                <td className="py-3 pr-2 align-top">
                                                    {/* We might not have image URL in standard webhook, so we skip or use filler if needed. 
                                For now assume text only or if we enrich data later. 
                            */}
                                                    <div className="flex flex-col">
                                                        <Text className="m-0 font-medium text-gray-800">
                                                            {item.name}
                                                        </Text>
                                                        {isCold && (
                                                            <Section className="mt-2 rounded-md border border-solid border-blue-200 bg-blue-50 p-2">
                                                                <Text className="m-0 flex items-center text-sm font-bold text-blue-700">
                                                                    <span className="mr-1 text-lg">❄️</span>
                                                                    Producto de Cadena de Frío
                                                                </Text>
                                                                <Text className="m-0 mt-1 text-xs text-blue-600">
                                                                    Requiere refrigeración inmediata al recibirlo.
                                                                </Text>
                                                            </Section>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-center align-top text-gray-600">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-3 text-right align-top font-medium text-gray-900">
                                                    ${parseInt(item.total).toLocaleString('es-CO')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Section>

                        <Hr className="border-gray-200 my-6" />

                        {/* Financial Details */}
                        <Section className="bg-gray-50 p-4 rounded-lg">
                            <Row className="mb-2">
                                <Column className="text-gray-600">Subtotal</Column>
                                <Column className="text-right font-medium text-gray-900">
                                    ${(parseInt(total) - parseInt(shipping_total) + parseInt(discount_total)).toLocaleString('es-CO')}
                                </Column>
                            </Row>
                            <Row className="mb-2">
                                <Column className="text-gray-600">Envío</Column>
                                <Column className="text-right font-medium text-gray-900">
                                    ${parseInt(shipping_total).toLocaleString('es-CO')}
                                </Column>
                            </Row>
                            {parseInt(discount_total) > 0 && (
                                <Row className="mb-2">
                                    <Column className="text-green-600">Descuento</Column>
                                    <Column className="text-right font-bold text-green-600">
                                        -${parseInt(discount_total).toLocaleString('es-CO')}
                                    </Column>
                                </Row>
                            )}
                            <Hr className="border-gray-200 my-2" />
                            <Row>
                                <Column className="text-lg font-bold text-blue-900">Total</Column>
                                <Column className="text-right text-lg font-bold text-blue-900">
                                    ${parseInt(total).toLocaleString('es-CO')}
                                </Column>
                            </Row>
                        </Section>

                        {/* Delivery Info */}
                        <Section className="mt-8">
                            <Text className="mb-2 text-lg font-bold text-gray-800">Datos de Entrega</Text>
                            <Text className="m-0 text-gray-600">
                                {billing.first_name} {billing.last_name}
                            </Text>
                            <Text className="m-0 text-gray-600">
                                {billing.address_1}
                            </Text>
                            {billing.address_2 && (
                                <Text className="m-0 text-gray-600">{billing.address_2}</Text>
                            )}
                            <Text className="m-0 text-gray-600">
                                {billing.city}, {billing.state}
                            </Text>
                            <Text className="mt-1 text-gray-600">
                                Tel: {billing.phone}
                            </Text>
                        </Section>

                        <Hr className="border-gray-200 my-8" />

                        {/* Footer */}
                        <Section className="text-center">
                            <Link
                                href="https://wa.me/573001234567"
                                className="inline-block rounded-full bg-green-500 px-6 py-3 text-sm font-bold text-white no-underline shadow-sm hover:bg-green-600"
                            >
                                ¿Necesitas ayuda? Escríbenos a WhatsApp
                            </Link>
                            <Text className="mt-8 text-xs text-gray-400">
                                PharmaPlus - Tu Salud, Nuestra Prioridad
                                <br />
                                <Link href={`${baseUrl}/politicas`} className="text-gray-500 underline">
                                    Términos y Condiciones
                                </Link>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default OrderConfirmation;
