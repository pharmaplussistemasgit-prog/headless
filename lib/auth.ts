import { getWooApi } from "./woocommerce";

// Tipos de respuesta del plugin JWT
interface LoginResponse {
    token: string;
    user_email: string;
    user_nicename: string;
    user_display_name: string;
    user_id?: number;
    id?: number;
    user_role?: string[]; // Adding roles support
}

interface AuthError {
    code: string;
    message: string;
    data: {
        status: number;
    }
}

// Clave para guardar el token en localStorage
const TOKEN_KEY = 'pharma_auth_token';
const USER_KEY = 'pharma_user_data';

export const auth = {
    /**
     * Iniciar sesión con usuario y contraseña
     */
    login: async (username: string, password: string): Promise<{ success: boolean; data?: LoginResponse; error?: string }> => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://tienda.pharmaplus.com.co/';
            // Asegurar que la URL no termine en /
            const cleanUrl = baseUrl.replace(/\/$/, '');

            const response = await fetch(`${cleanUrl}/wp-json/jwt-auth/v1/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message ? data.message.replace(/<[^>]*>/g, '') : 'Credenciales inválidas'
                };
            }

            // Guardar sesión
            if (data.token) {
                // 2. Fetch full user profile to get ROLES (JWT often omits them)
                try {
                    // context=edit is REQUIRED to see roles, capabilities, email, etc.
                    const profileRes = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me?context=edit`, {
                        headers: {
                            'Authorization': `Bearer ${data.token}`
                        }
                    });

                    if (profileRes.ok) {
                        const profile = await profileRes.json();
                        // Merge roles from profile into data before saving
                        data.user_role = profile.roles || [];

                        // Fallback: If roles is empty but is_super_admin is true, assign administrator
                        if ((!data.user_role || data.user_role.length === 0) && profile.is_super_admin) {
                            data.user_role = ['administrator'];
                        }

                        console.log('Roles fetched successfully:', data.user_role);
                    }
                } catch (e) {
                    console.error('Failed to fetch user roles, using default:', e);
                }

                auth.saveSession(data);
            }

            return { success: true, data };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    },

    /**
     * Cerrar sesión
     */
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            // Disparar evento para actualizar UI
            window.dispatchEvent(new Event('auth-change'));
            window.location.href = '/login';
        }
    },

    /**
     * Guardar datos de sesión
     */
    saveSession: (data: LoginResponse) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, data.token);
            // Identificar ID (puede venir como id o user_id)
            const id = data.user_id || data.id;

            localStorage.setItem(USER_KEY, JSON.stringify({
                email: data.user_email,
                name: data.user_display_name,
                username: data.user_nicename,
                id: id,
                roles: data.user_role || [] // Store roles
            }));
            window.dispatchEvent(new Event('auth-change'));
        }
    },

    /**
     * Actualizar datos brutos de sesión (para actualizaciones de perfil)
     */
    saveSessionRaw: (userData: any) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            window.dispatchEvent(new Event('auth-change'));
        }
    },

    /**
     * Obtener token actual
     */
    getToken: () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    },

    /**
     * Obtener usuario actual
     */
    getUser: () => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem(USER_KEY);
            return user ? JSON.parse(user) : null;
        }
        return null;
    },

    /**
     * Verificar si está logueado
     */
    isAuthenticated: () => {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem(TOKEN_KEY);
        }
        return false;
    }
};
