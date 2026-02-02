'use server';

/**
 * Server Action para enviar datos a JetFormBuilder en WordPress.
 * Form ID: 16937 (Trabaja con Nosotros / Contacto)
 */
export async function submitJetForm(formData: FormData) {
    const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WOOCOMMERCE_API_URL;

    if (!WP_API_URL) {
        return { success: false, message: 'Configuration Error: Missing WordPress URL' };
    }

    // Allow formId to be passed in FormData, default to 16937 if not present
    const formId = formData.get('form_id') ? parseInt(formData.get('form_id') as string) : 16937;

    const submitUrl = `${WP_API_URL}/?jet_form_builder_action=submit&form_id=${formId}`;

    try {
        const dataToSend = new FormData();

        // Iterate over all entries to support generic fields and files
        for (const [key, value] of formData.entries()) {
            // Skip internal Next.js/React fields if any, though usually clean in Server Actions
            dataToSend.append(key, value);
        }

        // Ensure form_id is present in the body as well
        if (!dataToSend.has('form_id')) {
            dataToSend.append('form_id', formId.toString());
        }

        // JetFormBuilder generic credentials (if needed globally, otherwise could come from env)
        // Keeping existing hardcoded credential from previous implementation for backward compat with existing forms
        if (!dataToSend.has('K1hqZ0')) {
            dataToSend.append('K1hqZ0', '8gGBWV9bdM');
        }

        if (!dataToSend.has('submitted_at')) {
            dataToSend.append('submitted_at', new Date().toISOString());
        }

        const response = await fetch(submitUrl, {
            method: 'POST',
            body: dataToSend,
            // Headers are automatically set by fetch for FormData (multipart/form-data boundary)
        });

        let result;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            if (response.ok) {
                return { success: true, message: 'Mensaje enviado correctamente.' };
            }
            result = { message: 'Respuesta del servidor no válida (HTML).' };
            console.error('JetFormBuilder HTML Response:', text.substring(0, 200));
        }

        if (!response.ok || (result.status && result.status === 'failed')) {
            console.error('JetFormBuilder Submission Error:', result);
            return {
                success: false,
                message: result?.message || 'Error al enviar el formulario.'
            };
        }

        return { success: true, message: 'Mensaje enviado correctamente' };
    } catch (error) {
        console.error('Network Error submitting JetForm:', error);
        return { success: false, message: 'Error de conexión con el servidor.' };
    }
}
