import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';

export type UserRole =
    | 'administrator'
    | 'editor'
    | 'author'
    | 'contributor'
    | 'subscriber'
    | 'customer'
    | 'shop_manager'
    | 'empresa'; // Custom role mentioned by user

export function useUserRole() {
    const [roles, setRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRoles = () => {
            const user = auth.getUser();
            if (user && user.roles) {
                // Ensure roles is always an array
                const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
                setRoles(userRoles);
            } else {
                setRoles([]);
            }
            setIsLoading(false);
        };

        // Load initially
        loadRoles();

        // Listen for auth changes (login/logout)
        window.addEventListener('auth-change', loadRoles);
        return () => window.removeEventListener('auth-change', loadRoles);
    }, []);

    const hasRole = (role: UserRole) => roles.includes(role);

    const isBlogAuthor = roles.some(r =>
        ['administrator', 'editor', 'author', 'contributor'].includes(r)
    );

    const isAdmin = roles.includes('administrator');

    return {
        roles,
        isLoading,
        hasRole,
        isBlogAuthor,
        isAdmin
    };
}
