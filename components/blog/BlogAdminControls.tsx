'use client';

import { useUserRole } from '@/hooks/useUserRole';
import { PenTool } from 'lucide-react';

export default function BlogAdminControls() {
    const { isBlogAuthor, isLoading } = useUserRole();

    if (isLoading || !isBlogAuthor) return null;

    return (
        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900">
            <h3 className="text-sm font-bold text-[var(--color-pharma-blue)] mb-2 uppercase tracking-wide">
                Gestión
            </h3>
            <a
                href="https://tienda.pharmaplus.com.co/wp-admin/post-new.php"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full justify-center px-4 py-2 bg-[var(--color-pharma-blue)] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
                <PenTool size={16} />
                Escribir Nuevo Artículo
            </a>
        </div>
    );
}
