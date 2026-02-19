import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
    Hr,
    Button
} from '@react-email/components';
import * as React from 'react';

interface OrderShippedEmailProps {
    orderId: string | number;
    trackingNumber?: string;
    trackingCompany?: string; // e.g. 'Coordinadora', 'TCC', 'Mensajeros Urbanos'
    trackingUrl?: string;
    firstName?: string;
    items?: Array<{ name: string; quantity: number }>;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://pharmaplus.com.co';

export const OrderShippedEmail = ({
    orderId = '12345',
    trackingNumber = '999999999',
    trackingCompany = 'Transportadora Aliada',
    trackingUrl = '#',
    firstName = 'Cliente',
    items = []
}: OrderShippedEmailProps) => {
    return (
        <Html>
            <Tailwind>
                <Head />
                <Preview>Tu pedido #{String(orderId)} está en camino 🚚</Preview>
                <Body className="bg-gray-100 font-sans">
                    <Container className="mx-auto my-[40px] max-w-xl rounded-lg bg-white p-5 shadow-sm">
                        <Section className="mt-[20px] mb-[30px] text-center">
                            <Img
                                src={`${baseUrl}/brand/logo-new-clean.png`}
                                alt="PharmaPlus"
                                width="180"
                                className="mx-auto"
                            />
                        </Section>

                        <Heading className="mb-4 text-center text-xl font-bold text-gray-800">
                            ¡Tu pedido está en camino!
                        </Heading>

                        <Text className="mb-6 text-center text-gray-600 leading-relaxed text-lg">
                            Hola <strong>{firstName}</strong>, tenemos buenas noticias. Tu pedido <strong>#{String(orderId)}</strong> ha sido despachado y pronto llegará a tu dirección.
                        </Text>

                        <Section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
                            <Text className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">
                                Información de Rastreo
                            </Text>

                            <div className="mb-4">
                                <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">Empresa</Text>
                                <Text className="font-bold text-gray-800 text-lg m-0">{trackingCompany}</Text>
                            </div>

                            {trackingNumber && (
                                <div className="mb-6">
                                    <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">Número de Guía</Text>
                                    <Text className="font-mono bg-white inline-block px-4 py-2 rounded border border-gray-200 text-gray-800 text-xl font-bold tracking-widest select-all">
                                        {trackingNumber}
                                    </Text>
                                </div>
                            )}

                            {trackingUrl && trackingUrl !== '#' && (
                                <Button
                                    href={trackingUrl}
                                    className="bg-[var(--color-pharma-blue)] text-white font-bold px-8 py-3 rounded-full hover:bg-blue-700 no-underline inline-block shadow-lg shadow-blue-900/10"
                                >
                                    Rastrear Paquete
                                </Button>
                            )}
                        </Section>

                        {items.length > 0 && (
                            <Section className="mb-8">
                                <Text className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 border-b pb-2">
                                    Contenido del Paquete
                                </Text>
                                <ul className="pl-5 m-0 text-sm text-gray-600 list-disc">
                                    {items.slice(0, 5).map((item, idx) => (
                                        <li key={idx} className="mb-1">
                                            <span className="font-bold text-gray-800">{item.quantity}x</span> {item.name}
                                        </li>
                                    ))}
                                    {items.length > 5 && (
                                        <li className="italic text-gray-400">...y {items.length - 5} más</li>
                                    )}
                                </ul>
                            </Section>
                        )}

                        <Section className="text-center bg-gray-50 p-4 rounded-lg">
                            <Text className="text-sm font-bold text-gray-600 mb-2">Recuerda:</Text>
                            <Text className="text-xs text-gray-500 m-0 leading-relaxed">
                                Si tu pedido contiene medicamentos refrigerados, por favor asegúrate de guardarlos en la nevera inmediatamente al recibirlos.
                                Verifica el estado del paquete antes de firmar el recibido.
                            </Text>
                        </Section>

                        <Hr className="border-gray-200 my-8" />

                        <Section className="text-center text-xs text-gray-400">
                            <Text>PharmaPlus - Tu Salud, Nuestra Prioridad</Text>
                            <Text>
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

export default OrderShippedEmail;
