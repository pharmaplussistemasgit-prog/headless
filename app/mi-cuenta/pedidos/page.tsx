'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import { Package, Calendar, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Tipos para Pedidos
interface Order {
    id: number;
    status: string;
    total: string;
    currency: string;
    date_created: string;
    line_items: Array<{
        name: string;
        quantity: number;
    }>;
}

export default function PedidosPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const user = auth.getUser();
                if (!user || (!user.id && !user.email)) {
                    setError('No se pudo identificar al usuario.');
                    setLoading(false);
                    return;
                }

                // NOTA: Para producción ideal, se debe crear un endpoint en el Headless (Next.js API Route)
                // que use las credenciales de Admin (Consumer Key/Secret) para buscar pedidos POR EMAIL o ID
                // ya que el token JWT del usuario a veces no basta para listar pedidos via REST API estándar de WC.
                // 
                // Por ahora, simularemos la llamada al endpoint PROXY que deberíamos crear.
                // Usaremos /api/pedidos?customer_id=X

                const response = await fetch(`/api/orders?customer=${user.id || user.email}`);
                if (!response.ok) throw new Error('Error al cargar pedidos');

                const data = await response.json();
                setOrders(data);
            } catch (err) {
                console.error(err);
                // Si falla, mostrar estado vacío por ahora para no bloquear
                setOrders([]);
                setError('No tienes pedidos recientes o hubo un error al cargarlos.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-[var(--color-pharma-blue)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Pedidos</h2>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No se encontraron pedidos recientes.</p>
                    <Link href="/tienda" className="inline-block mt-4 text-[var(--color-pharma-blue)] font-bold hover:underline">
                        Ir a la tienda
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:border-[var(--color-pharma-blue)] transition-colors group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-900">Pedido #{order.id}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                            ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.status === 'completed' ? 'Completado' :
                                                order.status === 'processing' ? 'Procesando' :
                                                    order.status === 'cancelled' ? 'Cancelado' : order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(order.date_created).toLocaleDateString()}
                                        </div>
                                        <div className="font-medium text-gray-900">
                                            ${parseInt(order.total).toLocaleString()} {order.currency}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden md:block text-sm text-gray-500">
                                        {order.line_items.length} artículo(s)
                                    </div>
                                    <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 group-hover:bg-[var(--color-pharma-blue)] group-hover:text-white transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
