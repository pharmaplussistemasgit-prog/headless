export interface CoopmsdResponse {
    success: boolean;
    balance?: number;
    transactionId?: string;
    message?: string;
    data?: any;
}

const COOPMSD_CONFIG = {
    AUTH_URL: 'https://coopmsd.sifonecompany.com/cupo/api/login',
    QUERY_URL: 'https://coopmsd.sifonecompany.com/cupo/api/consultarCupo',
    USER: 'gilbertoescarraga@pharmaplus.com.co',
    PASS: 'ghphlalups2718hDSL',
};

export const coopmsdService = {
    /**
     * Valida el cupo del asociado por Cédula usando la API real de Coopmsd
     * Paso 1: Autenticación (Login) para obtener Token
     * Paso 2: Consultar Cupo usando el Token
     */
    validate: async (documentId: string): Promise<CoopmsdResponse> => {
        try {
            // --- PASO 1: AUTENTICACIÓN ---
            const authResponse = await fetch(COOPMSD_CONFIG.AUTH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: COOPMSD_CONFIG.USER,
                    password: COOPMSD_CONFIG.PASS
                })
            });

            if (!authResponse.ok) {
                console.error('Coopmsd Auth Error:', authResponse.status, await authResponse.text());
                return { success: false, message: 'Error de autenticación con Coopmsd' };
            }

            const authData = await authResponse.json();
            const token = authData.token;

            if (!token) {
                return { success: false, message: 'No se obtuvo token de Coopmsd' };
            }

            // --- PASO 2: CONSULTAR CUPO ---
            const queryUrl = `${COOPMSD_CONFIG.QUERY_URL}?cedula=${documentId}`;
            const queryResponse = await fetch(queryUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!queryResponse.ok) {
                console.error('Coopmsd Query Error:', queryResponse.status, await queryResponse.text());
                return { success: false, message: 'Error al consultar cupo en Coopmsd' };
            }

            const data = await queryResponse.json();

            // Lógica de determinación de éxito basada en el campo "Cupo"
            // Según doc: Si el cupo es positivo, tiene cupo disponible.
            const cupo = typeof data.Cupo === 'number' ? data.Cupo : parseFloat(data.Cupo);

            if (cupo > 0) {
                return {
                    success: true,
                    balance: cupo,
                    transactionId: `COOP-${Date.now()}-${documentId}`, // Generamos un ID local ya que la API no retorna uno de transacción en la consulta
                    message: data.Mensaje || 'Cupo disponible',
                    data: data
                };
            } else {
                return {
                    success: false,
                    balance: cupo,
                    message: data.Mensaje || 'No tiene cupo disponible'
                };
            }

        } catch (error) {
            console.error('Coopmsd Service Error:', error);
            return { success: false, message: 'Error de conexión con el servicio Coopmsd.' };
        }
    }
};
