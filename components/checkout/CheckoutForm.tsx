'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingBag, ArrowRight, Truck, ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/product/ProductCard';

export default function CheckoutForm() {
    const { items, cartTotal, removeItem, updateQuantity } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [shippingZone, setShippingZone] = useState('');
    const [customerData, setCustomerData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentId: '',
        address: '',
        city: '',
        state: '',
    });

    // Shipping Logic (Preserved)
    const [shippingCost, setShippingCost] = useState(0);
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalWeight = totalQuantity * 0.5;

    useEffect(() => {
        if (cartTotal > 300000) {
            setShippingCost(0);
        } else {
            const baseRates = {
                recoger: 0,
                bogota: 10000,
                cercanos: 15000,
                nacional: 25000,
                costa_atlantica: 25000
            };
            const additionalRates = {
                recoger: 0,
                bogota: 3000,
                cercanos: 3000,
                nacional: 8000,
                costa_atlantica: 8000
            };

            let cost = baseRates[shippingZone as keyof typeof baseRates] ?? 0;

            // Weight markup
            if (totalWeight > 3 && shippingZone !== 'recoger' && shippingZone) {
                const extraWeight = Math.ceil(totalWeight - 3);
                cost += extraWeight * (additionalRates[shippingZone as keyof typeof additionalRates] ?? 0);
            }
            setShippingCost(cost);
        }
    }, [cartTotal, totalQuantity, shippingZone, totalWeight]);

    const finalTotal = cartTotal + shippingCost;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCustomerData({ ...customerData, [e.target.name]: e.target.value });
    };

    const handleCheckout = () => {
        if (!shippingZone) {
            toast.error("Selecciona una zona de envío");
            return;
        }
        if (!customerData.firstName || !customerData.email || !customerData.documentId) {
            toast.error("Completa tus datos personales");
            return;
        }

        setIsLoading(true);
        try {
            // Handover URL (Legacy/Backend)
            // Ideally this should be updated to a non-branded URL if possible, but keeping it functional.
            const baseUrl = "https://pagos.saprix.com.co/finalizar-compra/";

            const itemsString = items.map(item => {
                const idToUse = item.variationId || item.id;
                return `${idToUse}:${item.quantity}`;
            }).join(',');

            const params = new URLSearchParams();
            params.append('saprix_handover', 'true'); // Required by backend likely
            params.append('items', itemsString);
            params.append('shipping_zone', shippingZone);
            params.append('billing_first_name', customerData.firstName);
            params.append('billing_last_name', customerData.lastName);
            params.append('billing_email', customerData.email);
            params.append('billing_phone', customerData.phone);
            params.append('billing_address_1', customerData.address);
            params.append('billing_city', customerData.city);
            params.append('documentId', customerData.documentId);

            const handoverUrl = `${baseUrl}?${params.toString()}`;
            toast.success("Redirigiendo a pasarela de pagos segura...");

            setTimeout(() => {
                window.location.href = handoverUrl;
            }, 1000); // 1s delay

        } catch (error) {
            setIsLoading(false);
            toast.error("Error al procesar la solicitud");
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-primary-blue)] mb-2">Tu carrito está vacío</h2>
                <p className="text-gray-500 mb-8 max-w-md">Explora nuestro catálogo y encuentra lo que necesitas.</p>
                <Link href="/tienda" className="bg-[var(--color-primary-blue)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--color-dark-blue)] transition-colors">
                    Ir a la Tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-[var(--color-primary-blue)] mb-8">Finalizar Compra</h1>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Datos Personales */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-[var(--color-primary-blue)] mb-4 flex items-center gap-2">
                                <span className="bg-[var(--color-primary-blue)] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Datos Personales
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Nombre</label>
                                    <input type="text" name="firstName" value={customerData.firstName} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-primary-blue)] outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Apellido</label>
                                    <input type="text" name="lastName" value={customerData.lastName} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-primary-blue)] outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Cédula</label>
                                    <input type="text" name="documentId" value={customerData.documentId} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-primary-blue)] outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Celular</label>
                                    <input type="tel" name="phone" value={customerData.phone} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-primary-blue)] outline-none" required />
                                </div>
                                <div className="col-span-1 sm:col-span-2 space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Email</label>
                                    <input type="email" name="email" value={customerData.email} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-primary-blue)] outline-none" required />
                                </div>
                            </div>
                        </div>

                        {/* 2. Envío */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-[var(--color-primary-blue)] mb-4 flex items-center gap-2">
                                <span className="bg-[var(--color-primary-blue)] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Dirección de Envío
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Zona de Envío</label>
                                    <select
                                        value={shippingZone}
                                        onChange={(e) => setShippingZone(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-primary-blue)] outline-none bg-white"
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        <option value="bogota">Bogotá D.C.</option>
                                        <option value="cercanos">Alrededores (Sabana)</option>
                                        <option value="nacional">Nacional</option>
                                        <option value="recoger">Recoger en Tienda (Gratis)</option>
                                    </select>
                                </div>

                                {shippingZone && shippingZone !== 'recoger' && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold uppercase text-gray-500">Departamento</label>
                                                <input type="text" name="state" value={customerData.state} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg outline-none" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold uppercase text-gray-500">Ciudad</label>
                                                <input type="text" name="city" value={customerData.city} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-gray-500">Dirección Completa</label>
                                            <input type="text" name="address" value={customerData.address} onChange={handleInputChange} placeholder="Calle 123 # 45 - 67, Apto 101" className="w-full p-2 border border-gray-200 rounded-lg outline-none" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-bold text-[var(--color-primary-blue)] mb-6">Resumen del Pedido</h2>

                            {/* Items List (Brief) */}
                            <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4">
                                {items.map((item) => (
                                    <div key={`${item.id}-${item.variationId || 'base'}`} className="flex gap-3">
                                        <div className="relative w-12 h-12 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 text-sm">
                                            <p className="font-medium text-[var(--color-primary-blue)] line-clamp-1">{item.name}</p>
                                            <p className="text-gray-500 text-xs">Cant: {item.quantity}</p>
                                        </div>
                                        <div className="text-right text-sm font-bold text-gray-900">
                                            ${(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-bold">${cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Envío</span>
                                    {shippingCost === 0 ? (
                                        <span className="text-green-600 font-bold">Gratis</span>
                                    ) : (
                                        <span className="font-bold">${shippingCost.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-xl font-bold text-[var(--color-primary-blue)] pt-2 border-t border-gray-100 mt-2">
                                    <span>Total</span>
                                    <span>${finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isLoading || !shippingZone}
                                className="w-full py-4 bg-[var(--color-action-green)] text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Procesando...' : 'Pagar Ahora'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <ShieldCheck size={14} />
                                <span>Pagos procesados de forma segura</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
