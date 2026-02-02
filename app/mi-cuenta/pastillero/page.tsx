'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import PillboxManager from '@/components/pillbox/PillboxManager';

export default function PastilleroPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; name: string } | null>(null);
    const [isRecovering, setIsRecovering] = useState(false);

    // Secure Client-Side Entry Check & ID Recovery
    useEffect(() => {
        const checkUser = async () => {
            if (!auth.isAuthenticated()) {
                router.push('/login');
                return;
            }

            const localUser = auth.getUser();

            // Scenario A: We have a user AND an ID -> Good to go
            if (localUser && localUser.id) {
                setUser(localUser);
                return;
            }

            // Scenario B: We have user (or token) but NO ID -> Recover from WP
            setIsRecovering(true);
            try {
                const token = auth.getToken();
                if (!token) throw new Error('No token');

                const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://tienda.pharmaplus.com.co';
                const res = await fetch(`${baseUrl}/wp-json/wp/v2/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const wpUser = await res.json();
                    if (wpUser.id) {
                        // SUCCESS: Repair Session
                        const repairedUser = {
                            ...localUser,
                            id: String(wpUser.id), // Ensure string
                            name: wpUser.name || localUser?.name,
                            email: wpUser.email || localUser?.email
                        };

                        // Update Auth Store manually to fix it for other pages too
                        auth.saveSessionRaw(repairedUser);
                        setUser(repairedUser);
                        console.log('Session repaired with ID:', wpUser.id);
                        return;
                    }
                }
                // Fallback if recovery fails
                console.error('Failed to recover User ID');
            } catch (error) {
                console.error('User ID recovery error:', error);
            } finally {
                setIsRecovering(false);
            }
        };

        checkUser();
    }, [router]);

    if (isRecovering) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-gray-500 text-sm">Sincronizando perfil...</p>
            </div>
        );
    }

    if (!user || !user.id) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 sr-only">Mis Medicamentos</h1>
            {/* The Manager handles the UI */}
            <PillboxManager userId={String(user.id)} userName={user.name} />
        </div>
    );
}
