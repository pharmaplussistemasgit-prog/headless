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

interface FormReceiptEmailProps {
    userName: string;
    formType: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://pharmaplus.com.co';

export const FormReceiptEmail = ({ userName = 'Cliente', formType = 'Solicitud' }: FormReceiptEmailProps) => {
    return (
        <Html>
            <Tailwind>
                <Head />
                <Preview>Hemos recibido tu {formType} 📨</Preview>
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
                            ¡Gracias por contactarnos!
                        </Heading>

                        <Text className="mb-6 text-center text-gray-600 leading-relaxed text-lg">
                            Hola <strong>{userName}</strong>, hemos recibido tu solicitud de <strong>{formType}</strong> correctamente.
                        </Text>

                        <Section className="mb-8 p-6 bg-green-50 rounded-lg text-center border border-green-200">
                            <Text className="text-sm font-bold text-green-700 m-0 mb-2">
                                ¿Qué sigue?
                            </Text>
                            <Text className="text-gray-600 m-0 text-sm">
                                Nuestro equipo de servicio al cliente revisará tu mensaje y te responderemos a la brevedad posible.
                                El tiempo estimado de respuesta es de 24 a 48 horas hábiles.
                            </Text>
                        </Section>

                        <Section className="text-center">
                            <Text className="text-sm font-bold text-gray-500 mb-2">Mientras tanto, puedes contactarnos:</Text>
                            <div className="flex justify-center gap-4 text-sm text-gray-600 mb-4">
                                <span>📞 (601) 593 - 4010</span>
                                <span>📱 +57 316 839 7933</span>
                            </div>
                            <Button
                                href={`https://wa.me/573168397933`}
                                className="bg-[#25D366] text-white font-bold px-6 py-3 rounded-full hover:bg-green-600 no-underline inline-block shadow-sm"
                            >
                                Escribir al WhatsApp
                            </Button>
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

export default FormReceiptEmail;
