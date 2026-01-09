'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import AccountNav from '@/components/account/AccountNav';

export default function MiCuentaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            if (!auth.isAuthenticated()) {
                router.push('/login');
            } else {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[var(--color-pharma-blue)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 lg:sticky lg:top-24">
                            <AccountNav />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
