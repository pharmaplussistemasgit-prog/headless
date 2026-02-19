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
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
    firstName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://pharmaplus.com.co';

export const WelcomeEmail = ({ firstName = 'Cliente' }: WelcomeEmailProps) => {
    return (
        <Html>
            <Tailwind>
                <Head />
                <Preview>Bienvenido a PharmaPlus 🌿</Preview>
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

                        <Heading className="mb-4 text-center text-2xl font-bold text-gray-800">
                            ¡Bienvenido a PharmaPlus!
                        </Heading>

                        <Text className="mb-6 text-center text-gray-600 text-lg">
                            Hola <strong>{firstName}</strong>, gracias por crear tu cuenta con nosotros.
                        </Text>

                        <Text className="text-gray-600 mb-6 leading-relaxed">
                            Ahora eres parte de nuestra comunidad. Desde tu cuenta podrás:
                        </Text>

                        <Section className="mb-8 pl-4 border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                            <ul className="m-0 pl-4 text-gray-700 list-disc">
                                <li className="mb-2">Realizar pedidos de forma más rápida.</li>
                                <li className="mb-2">Guardar tus direcciones de entrega.</li>
                                <li className="mb-2">Consultar tu historial de compras.</li>
                                <li>Gestionar tus fórmulas médicas.</li>
                            </ul>
                        </Section>

                        <Section className="text-center mb-8">
                            <Link
                                href={`${baseUrl}/login`}
                                className="inline-block rounded-full bg-[var(--color-pharma-blue)] px-8 py-3 text-sm font-bold text-white no-underline shadow-sm hover:bg-blue-700 w-full md:w-auto"
                            >
                                Ingresar a mi Cuenta
                            </Link>
                        </Section>

                        <Hr className="border-gray-200 my-8" />

                        <Section className="text-center">
                            <Text className="text-sm font-bold text-gray-500 mb-2">¿Necesitas ayuda?</Text>
                            <div className="flex justify-center gap-4 text-sm text-gray-600">
                                <span>📞 (601) 593 - 4010</span>
                                <span>📱 +57 316 839 7933</span>
                            </div>
                        </Section>

                        <Section className="text-center mt-8">
                            <Text className="text-xs text-gray-400">
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

export default WelcomeEmail;
