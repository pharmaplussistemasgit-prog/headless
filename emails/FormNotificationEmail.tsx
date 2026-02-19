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

interface FormNotificationEmailProps {
    formId: string;
    data: Record<string, string>;
    title: string;
    adminName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://pharmaplus.com.co';

export const FormNotificationEmail = ({ formId, data, title, adminName = 'Administrador' }: FormNotificationEmailProps) => {
    return (
        <Html>
            <Tailwind>
                <Head />
                <Preview>Nueva solicitud recibida ({title}) 📩</Preview>
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
                            {title}
                        </Heading>

                        <Text className="mb-6 text-center text-gray-600">
                            Hola {adminName}, has recibido una nueva solicitud a través del sitio web.
                        </Text>

                        <Section className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                            <Text className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-wide">
                                Detalles del Formulario (#{formId})
                            </Text>

                            <table className="w-full text-sm">
                                <tbody>
                                    {Object.entries(data).map(([key, value]) => {
                                        // Skip technical fields or very long ones if needed
                                        if (key.includes('__') || value === '') return null;

                                        return (
                                            <tr key={key} className="border-b border-blue-100 last:border-0">
                                                <td className="py-2 pr-4 font-bold text-gray-700 w-1/3 align-top capitalize">
                                                    {key.replace(/_/g, ' ')}:
                                                </td>
                                                <td className="py-2 text-gray-600 align-top">
                                                    {String(value)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Section>

                        <Section className="text-center">
                            <Button
                                href={`${baseUrl}/admin`} // Assuming an admin dashboard exists, otherwise direct to WordPress
                                className="bg-[var(--color-pharma-blue)] text-white font-bold px-6 py-3 rounded-md hover:bg-blue-700 no-underline inline-block"
                            >
                                Gestionar en CRM/WordPress
                            </Button>
                        </Section>

                        <Hr className="border-gray-200 my-8" />

                        <Section className="text-center text-xs text-gray-400">
                            <Text>Este mensaje fue enviado automáticamente desde PharmaPlus Web.</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default FormNotificationEmail;
