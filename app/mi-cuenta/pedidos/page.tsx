'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import { Package, Calendar, ChevronDown, ChevronUp, Loader2, ShoppingBag, FileText } from 'lucide-react';
import Link from 'next/link';
import OrderTracking from '@/components/order/OrderTracking';
import OrderTimeline from '@/components/order/OrderTimeline';

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
        price: number;
        total: string;
        product_id: number;
        sku?: string;
    }>;
    shipping_company?: string;
    shipping_tracking_number?: string;
    shipping_total: string;
}

export default function PedidosPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI States
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

    // Filtros
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
    const [selectedDate, setSelectedDate] = useState<string>('');

    const toggleOrder = (orderId: number) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const user = auth.getUser();
                if (!user || (!user.id && !user.email)) {
                    setError('No se pudo identificar al usuario.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`/api/orders?customer=${user.id || user.email}`);
                if (!response.ok) throw new Error('Error al cargar pedidos');

                const data = await response.json();
                setOrders(data);
                setFilteredOrders(data);
            } catch (err) {
                console.error(err);
                setOrders([]);
                setError('No tienes pedidos recientes o hubo un error al cargarlos.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Apply Filters
    useEffect(() => {
        let result = [...orders];

        // 1. Status Filter
        if (activeTab === 'active') {
            result = result.filter(o => ['pending', 'processing', 'on-hold', 'en-alistamiento', 'facturado', 'en proceso', 'wc-facturado', 'wc-en-alistamiento'].includes(o.status));
        } else if (activeTab === 'completed') {
            result = result.filter(o => !['pending', 'processing', 'on-hold', 'en-alistamiento', 'facturado', 'en proceso', 'wc-facturado', 'wc-en-alistamiento'].includes(o.status));
        }

        // 2. Date Filter
        if (selectedDate) {
            result = result.filter(o => o.date_created.startsWith(selectedDate));
        }

        setFilteredOrders(result);
    }, [activeTab, selectedDate, orders]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                <Loader2 className="w-10 h-10 text-[var(--color-pharma-blue)] animate-spin mb-4" />
                <p className="text-gray-500 animate-pulse">Buscando tu historial...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header & Filters */}
            <div className="p-6 lg:p-8 border-b border-gray-100 bg-gray-50/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Mis Pedidos</h2>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm">
                        <span className="text-gray-500 text-xs font-bold uppercase">Fecha</span>
                        <input
                            type="date"
                            className="outline-none text-gray-700 bg-transparent cursor-pointer font-medium"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        {selectedDate && (
                            <button onClick={() => setSelectedDate('')} className="text-xs text-red-500 hover:text-red-700 font-bold ml-2">
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 text-sm overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-[var(--color-pharma-blue)] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${activeTab === 'active' ? 'bg-[var(--color-pharma-blue)] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        En Curso
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${activeTab === 'completed' ? 'bg-[var(--color-pharma-blue)] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Historial
                    </button>
                </div>
            </div>

            <div className="p-4 lg:p-6 bg-gray-50 text-sm min-h-[300px]">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 mt-4 shadow-sm">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-gray-900 mb-1">No hay pedidos</h3>
                        <p className="text-gray-500 mb-6 text-sm">No encontramos pedidos con estos filtros.</p>
                        <Link href="/tienda" className="inline-flex items-center gap-2 bg-[var(--color-pharma-blue)] text-white px-5 py-2 rounded-full font-bold hover:opacity-90 transition-opacity text-sm">
                            Ir a la tienda
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const isExpanded = expandedOrders.has(order.id);

                            return (
                                <div key={order.id} className={`border rounded-xl transition-all duration-300 overflow-hidden bg-white ${isExpanded ? 'shadow-md border-blue-100 ring-1 ring-blue-50' : 'border-gray-200 hover:shadow-sm'}`}>
                                    {/* Header - Clickable Trigger */}
                                    <div
                                        onClick={() => toggleOrder(order.id)}
                                        className="flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors gap-4 select-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-lg hidden md:flex items-center justify-center transition-colors
                                                ${['completed', 'entregado', 'wc-entregado'].includes(order.status) ? 'bg-green-100/50 text-green-600' :
                                                    ['processing', 'en-alistamiento', 'facturado', 'en proceso'].includes(order.status) ? 'bg-blue-100/50 text-blue-600' :
                                                        'bg-gray-100/50 text-gray-500'}`}>
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2.5 mb-1">
                                                    <span className="text-base font-bold text-gray-900">#{order.id}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                        ${['completed', 'entregado', 'wc-entregado'].includes(order.status) ? 'bg-green-100 text-green-700' :
                                                            ['processing', 'en-alistamiento', 'facturado', 'en proceso', 'wc-facturado'].includes(order.status) ? 'bg-blue-100 text-blue-700' :
                                                                ['cancelled', 'failed', 'refunded', 'cancelado'].includes(order.status) ? 'bg-red-100 text-red-700' :
                                                                    ['shipped', 'enviado', 'wc-enviado'].includes(order.status) ? 'bg-purple-100 text-purple-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {(() => {
                                                            const s = order.status.replace('wc-', '');
                                                            const labels: Record<string, string> = {
                                                                'completed': 'Entregado',
                                                                'entregado': 'Entregado',
                                                                'pending': 'Pendiente',
                                                                'processing': 'En Proceso',
                                                                'on-hold': 'En Espera',
                                                                'cancelled': 'Cancelado',
                                                                'refunded': 'Reembolsado',
                                                                'failed': 'Fallido',
                                                                'en-alistamiento': 'En Alistamiento',
                                                                'facturado': 'Facturado',
                                                                'confirmado-en-pagina': 'Confirmado',
                                                                'enviado': 'Enviado',
                                                                'trash': 'Papelera'
                                                            };
                                                            return labels[s] || s.replace(/-/g, ' ');
                                                        })()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>
                                                            {new Date(order.date_created).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-none border-gray-100">
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total</p>
                                                <span className="font-bold text-gray-900 text-base md:text-lg">
                                                    ${parseInt(order.total).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className={`p-1.5 rounded-full transition-all duration-300 ${isExpanded ? 'bg-[var(--color-pharma-blue)] text-white rotate-180' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                                                <ChevronDown className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 bg-gray-50/30 animate-in slide-in-from-top-1 duration-200">
                                            <div className="p-5">
                                                {/* Status Timeline */}
                                                {!['cancelled', 'failed', 'refunded'].includes(order.status) && (
                                                    <div className="mb-8 pl-1">
                                                        <OrderTimeline
                                                            status={order.status}
                                                            dateCreated={order.date_created}
                                                            trackingNumber={order.shipping_tracking_number}
                                                        />
                                                    </div>
                                                )}

                                                {/* Invoice Style Product List */}
                                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-6">
                                                    <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100">
                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detalle de Facturación</h4>
                                                    </div>
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-white text-gray-400 text-xs uppercase font-bold tracking-wider border-b border-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 font-medium">Producto</th>
                                                                <th className="px-6 py-3 font-medium text-center w-24">Cant.</th>
                                                                <th className="px-6 py-3 font-medium text-right w-32">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {order.line_items.map((item, idx) => (
                                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                                    <td className="px-6 py-3.5">
                                                                        <div className="font-medium text-gray-900 text-sm leading-snug">{item.name}</div>
                                                                        {item.sku && <div className="text-[10px] text-gray-400 mt-0.5 font-mono">SKU: {item.sku}</div>}
                                                                    </td>
                                                                    <td className="px-6 py-3.5 text-center text-gray-600 font-medium bg-gray-50/30">
                                                                        {item.quantity}
                                                                    </td>
                                                                    <td className="px-6 py-3.5 text-right font-bold text-gray-900">
                                                                        ${parseInt(item.total).toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {/* Shipping Row */}
                                                            {parseInt(order.shipping_total || '0') > 0 && (
                                                                <tr className="bg-gray-50/30">
                                                                    <td className="px-6 py-3.5 font-medium text-gray-600">Envío / Domicilio</td>
                                                                    <td className="px-6 py-3.5 text-center text-gray-400">-</td>
                                                                    <td className="px-6 py-3.5 text-right font-medium text-gray-900">
                                                                        ${parseInt(order.shipping_total).toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                        <tfoot className="bg-gray-50 border-t border-gray-100">
                                                            <tr>
                                                                <td colSpan={2} className="px-6 py-4 text-right font-bold text-gray-700 text-xs uppercase tracking-wide">Total a Pagar</td>
                                                                <td className="px-6 py-4 text-right font-bold text-lg text-[var(--color-pharma-blue)]">
                                                                    ${parseInt(order.total).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>

                                                {/* Tracking */}
                                                {(order.shipping_company || order.shipping_tracking_number) && !['cancelled', 'failed'].includes(order.status) && (
                                                    <OrderTracking
                                                        company={order.shipping_company || ''}
                                                        trackingNumber={order.shipping_tracking_number || ''}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
