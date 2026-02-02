/**
 * JetFormBuilder Connector
 * Handles the logic for sending form data to the WordPress REST API.
 */

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://tienda.pharmaplus.com.co';

export interface JetFormResponse {
    success: boolean;
    message?: string;
    data?: any;
}

/**
 * Universal function to submit forms to JetFormBuilder in WordPress
 * @param formId The ID of the form in WordPress (JetFormBuilder -> Forms)
 * @param data Object containing key-value pairs of the form fields
 * @returns JetFormResponse
 */
export async function submitToJetForm(
    formId: number,
    data: Record<string, string | File>,
    token?: string
): Promise<JetFormResponse> {
    try {
        const endpoint = `${WP_API_URL}/wp-json/jet-form-builder/v1/submit/${formId}`;

        const formData = new FormData();

        // Append all data fields to FormData
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });

        console.log(`[JetForm] Submitting to ${endpoint}`, data);

        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[JetForm] Error ${response.status}:`, errorText);
            return {
                success: false,
                message: `Error del servidor (${response.status}). Por favor intenta más tarde.`
            };
        }

        const result = await response.json();

        // JFB usually returns { status: 'success' | 'failed', message: '...' }
        const isSuccess = result.status === 'success' || result.success === true;

        return {
            success: isSuccess,
            message: result.message || (isSuccess ? 'Formulario enviado correctamente' : 'Error al enviar'),
            data: result
        };

    } catch (error) {
        console.error('[JetForm] Exception:', error);
        return {
            success: false,
            message: 'Error de conexión. Verifica tu internet o intenta más tarde.'
        };
    }
}
