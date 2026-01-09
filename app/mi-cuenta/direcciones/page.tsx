'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import { MapPin, Loader2, Edit2 } from 'lucide-react';

interface Address {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email?: string;
    phone?: string;
}

interface CustomerData {
    billing: Address;
    shipping: Address;
}

export default function DireccionesPage() {
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const user = auth.getUser();
                if (!user || !user.id) {
                    setError('No se pudo identificar al usuario.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`/api/customer?id=${user.id}`);
                if (!response.ok) throw new Error('Error al cargar direcciones');

                const data = await response.json();
                setCustomer(data);
            } catch (err) {
                console.error(err);
                setError('Error al cargar tus direcciones.');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-[var(--color-pharma-blue)] animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }

    const renderAddress = (title: string, address: Address, type: 'billing' | 'shipping') => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <button className="p-2 text-[var(--color-pharma-blue)] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 space-y-2 text-sm text-gray-600">
                {!address.address_1 ? (
                    <p className="italic text-gray-400">No has configurado esta dirección.</p>
                ) : (
                    <>
                        <p className="font-semibold text-gray-900">{address.first_name} {address.last_name}</p>
                        {address.company && <p>{address.company}</p>}
                        <p>{address.address_1}</p>
                        {address.address_2 && <p>{address.address_2}</p>}
                        <p>{address.city}, {address.state}</p>
                        <p>{address.country}</p>
                        {type === 'billing' && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                                <p><span className="font-medium">Tel:</span> {address.phone}</p>
                                <p><span className="font-medium">Email:</span> {address.email}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mis Direcciones</h2>
            <p className="text-gray-500 text-sm mb-6">Administra tus direcciones de envío y facturación para el checkout.</p>

            <div className="grid md:grid-cols-2 gap-6">
                {customer && renderAddress('Dirección de Facturación', customer.billing, 'billing')}
                {customer && renderAddress('Dirección de Envío', customer.shipping, 'shipping')}
            </div>
        </div>
    );
}
