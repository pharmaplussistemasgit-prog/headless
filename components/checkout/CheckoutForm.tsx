'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingBag, ArrowRight, Truck, ShieldCheck, MapPin, AlertTriangle, ThermometerSnowflake, Calendar, FileText, CreditCard, Building, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/product/ProductCard';

import { auth } from '@/lib/auth';
import AgreementModal from './AgreementModal';
import WompiButton from './WompiButton';

interface CheckoutFormProps {
    shippingRules: import('@/lib/shipping').ShippingRule[];
}

import { COLOMBIA_STATES, COLOMBIA_CITIES, ISO_TO_DANE_MAP } from '@/lib/colombia-data';
import PrescriptionUploader from './PrescriptionUploader';

import { isHoliday, isSunday } from '@/lib/holidays';

export default function CheckoutForm({ shippingRules }: CheckoutFormProps) {
    const { items, cartTotal, removeItem, updateQuantity, clearCart, requiresColdChain, coldChainFee, requiresPrescription } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [isCompany, setIsCompany] = useState(false);
    const [marketingAccepted, setMarketingAccepted] = useState(false); // T25: Marketing Consent

    // T25: OrbisFarma / Convenios State
    const [agreementTransactionId, setAgreementTransactionId] = useState<string | null>(null);
    const [showAgreementModal, setShowAgreementModal] = useState(false);

    const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [dateError, setDateError] = useState(''); // NEW: Date Error State
    const [prescriptionConfirmed, setPrescriptionConfirmed] = useState(false);
    const [prescriptionFileUrl, setPrescriptionFileUrl] = useState<string | null>(null);

    // Shipping State
    const [selectedState, setSelectedState] = useState('');
    const [shippingCost, setShippingCost] = useState(0);
    const [deliveryDays, setDeliveryDays] = useState(0);
    const [shippingMethodName, setShippingMethodName] = useState('');
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [cityCode, setCityCode] = useState('');
    const [availableCities, setAvailableCities] = useState<Array<{ code: string, name: string }>>([]);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'credibanco'>('wompi');

    const [customerData, setCustomerData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentType: 'CC',
        documentId: '',
        address: '',
        address2: '', // Apartamento/Unidad (Opcional)
        country: 'CO', // Colombia
        city: '',
        state: '',
        zipCode: '',
        companyName: '',
    });

    const DOCUMENT_TYPES = [
        { value: 'CC', label: 'Cédula de Ciudadanía' },
        { value: 'CE', label: 'Cédula de Extranjería' },
        { value: 'NIT', label: 'NIT' },
        { value: 'PAS', label: 'Pasaporte' },
        { value: 'PEP', label: 'PEP' },
    ];

    const [userRoles, setUserRoles] = useState<string[]>([]);

    // Load cities when state changes
    useEffect(() => {
        if (deliveryMethod === 'pickup') {
            setShippingCost(0);
            setShippingMethodName('Retiro en Tienda');
        } else if (customerData.city && selectedState) {
            // Re-calculate standard shipping if switching back to shipping
            // We need cityCode here. It's in state 'cityCode'.
            const stateName = COLOMBIA_STATES.find(s => s.code === selectedState)?.name || '';
            calculateShipping(cityCode, customerData.city, stateName);
        }
    }, [deliveryMethod]);

    useEffect(() => {
        // Reset city when state changes
        setCustomerData(prev => ({ ...prev, city: '' }));
        setCityCode('');
        setShippingCost(0);
        setDeliveryDays(0);
        setShippingMethodName('');

        if (!selectedState) {
            setAvailableCities([]);
            setDeliveryMethod('shipping'); // Reset method
            return;
        }

        // Load cities for selected state from API
        const loadCities = async () => {
            try {
                const response = await fetch(`/api/shipping/cities?stateCode=${selectedState}`);
                const data = await response.json();

                if (data.success) {
                    setAvailableCities(data.data);

                    // Auto-select if only one city (e.g. Bogotá)
                    if (data.data.length === 1) {
                        const singleCity = data.data[0];
                        setCustomerData(prev => ({ ...prev, city: singleCity.name }));
                        setCityCode(singleCity.code);
                        // Calculate shipping automatically
                        const stateName = COLOMBIA_STATES.find(s => s.code === selectedState)?.name || '';
                        calculateShipping(singleCity.code, singleCity.name, stateName);
                    }
                } else {
                    console.error('Error loading cities:', data.message);
                    setAvailableCities([]);
                }
            } catch (error) {
                console.error('Error loading cities:', error);
                setAvailableCities([]);
            }
        };

        loadCities();
    }, [selectedState]);

    // Calculate shipping when city changes
    const calculateShipping = async (cityCodeParam: string, cityNameParam: string, stateNameParam: string) => {
        if (!cityCodeParam || !cityNameParam) return;

        setLoadingShipping(true);
        try {
            const response = await fetch('/api/shipping/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cityCode: cityCodeParam,
                    cityName: cityNameParam,
                    stateName: stateNameParam
                })
            });

            const data = await response.json();

            if (data.success) {
                setShippingCost(data.data.shippingCost);
                setDeliveryDays(data.data.deliveryDays);
                setShippingMethodName(`Envío a ${data.data.cityName}`);
            } else {
                toast.error('No se pudo calcular el costo de envío');
                setShippingCost(0);
                setDeliveryDays(0);
                setShippingMethodName('Sin cobertura');
            }
        } catch (error) {
            console.error('Error calculating shipping:', error);
            toast.error('Error al calcular el envío');
            setShippingCost(0);
            setDeliveryDays(0);
        } finally {
            setLoadingShipping(false);
        }
    };

    // Pre-fill data if logged in
    useEffect(() => {
        if (auth.isAuthenticated()) {
            const user = auth.getUser();
            if (user) {
                setCustomerData(prev => ({
                    ...prev,
                    firstName: user.name?.split(' ')[0] || '',
                    lastName: user.name?.split(' ').slice(1).join(' ') || '',
                    email: user.email || '',
                }));
                if (user.roles) {
                    setUserRoles(user.roles);
                }
            }
        }
    }, []);

    // Logic for Snippet #05 (Minimum Purchase)
    // Adjusted: Only apply to Wholesale / Corporate customers.
    // Roles: 'empresa', 'wholesale_customer'
    const MIN_PURCHASE_AMOUNT = 50000;
    const isWholesaleUser = userRoles.some(role => ['empresa', 'wholesale_customer'].includes(role));

    // Only block if user IS wholesale AND amount is less than min
    const isBelowMinAmount = isWholesaleUser && cartTotal < MIN_PURCHASE_AMOUNT;

    const finalTotal = cartTotal + shippingCost;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Snippet #09: Validation for Cedula (Numbers only)
        if (name === 'documentId') {
            // Allow only numbers
            const numericValue = value.replace(/\D/g, '');
            setCustomerData({ ...customerData, [name]: numericValue });
            return;
        }

        // Handle city selection
        if (name === 'city') {
            setCustomerData({ ...customerData, [name]: value });

            // Find the selected city to get its code
            const selectedCity = availableCities.find(c => c.name === value);
            if (selectedCity) {
                setCityCode(selectedCity.code);
                // Get state name from COLOMBIA_STATES
                const stateName = COLOMBIA_STATES.find(s => s.code === selectedState)?.name || '';
                // Calculate shipping
                calculateShipping(selectedCity.code, value, stateName);
            }
            return;
        }

        setCustomerData({ ...customerData, [name]: value });
    };

    const toggleCompanyMode = (checked: boolean) => {
        setIsCompany(checked);
        if (!checked) {
            setCustomerData(prev => ({ ...prev, companyName: '' }));
        }
    };

    const handleAgreementAuthorized = (data: any) => {
        // data: { ...response, provider }
        setAgreementTransactionId(data.transactionid || data.response?.transactionid || data.transactionId);
        // We might want to store the provider to send it later, or encoded in the ID if needed.
        // For now, we assume the backend handles the ID validation downstream or we just pass the ID.
        // Ideally we should pass the provider too.
        setShowAgreementModal(false);
        const msg = data.provider === 'coopmsd' ? 'Cupo Coopmsd autorizado' : 'Cupo Inicio TX autorizado';
        toast.success(`${msg}. Saldo: ${data.balance || data.response?.cardbalance || 'N/A'}`);
    };

    // Validaciones comunes antes de pago
    const validateForm = (): boolean => {
        if (!selectedState) {
            toast.error("Selecciona un departamento de envío");
            return false;
        }
        if (shippingMethodName === 'Sin cobertura') {
            toast.error("No tenemos cobertura en esta zona");
            return false;
        }
        if (!customerData.firstName || !customerData.email || !customerData.documentId || !customerData.phone) {
            toast.error("Completa tus datos personales (incluyendo celular)");
            return false;
        }
        if (deliveryMethod === 'shipping' && !customerData.address) {
            toast.error("Ingresa la dirección de envío");
            return false;
        }
        if (isCompany && !customerData.companyName) {
            toast.error("Ingresa la Razón Social de la empresa");
            return false;
        }
        if (!termsAccepted || !privacyAccepted) {
            toast.error("Debes aceptar los Términos y la Política de Datos para continuar");
            return false;
        }
        if (requiresPrescription && !prescriptionFileUrl) {
            toast.error("Debes adjuntar la fórmula médica para continuar");
            return false;
        }
        return true;
    };

    // Formulario listo para Wompi (validaciones OK sin necesidad de click)
    const isFormReady =
        !!selectedState &&
        shippingMethodName !== 'Sin cobertura' &&
        !!customerData.firstName &&
        !!customerData.email &&
        !!customerData.documentId &&
        !!customerData.phone &&
        (deliveryMethod !== 'shipping' || !!customerData.address) &&
        (!isCompany || !!customerData.companyName) &&
        termsAccepted &&
        privacyAccepted &&
        (!requiresPrescription || !!prescriptionFileUrl) &&
        !isBelowMinAmount;

    // Generar referencia única para Wompi (usa ID de sesión + timestamp)
    const wompiReference = `PP-${Date.now()}-${customerData.documentId || 'G'}`.slice(0, 30);

    // Callback cuando Wompi termina el pago
    const handleWompiResult = async (transaction: any) => {
        if (!transaction) return;

        const status = transaction.status;

        if (status === 'APPROVED') {
            // Crear la orden en WooCommerce con estado 'processing'
            try {
                await fetch('/api/checkout/process-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer: {
                            ...customerData,
                            shippingZone: selectedState,
                        },
                        billing: customerData,
                        cartItems: items,
                        cartTotal: finalTotal,
                        paymentMethod: 'wompi',
                        shippingCost,
                        wompiTransactionId: transaction.id,
                        wompiReference: transaction.reference,
                        // Add Prescription Data
                        prescriptionUrl: prescriptionFileUrl,
                        requiresPrescription: requiresPrescription
                    }),
                });
            } catch (e) {
                console.error('Error registrando orden tras Wompi:', e);
            }
            clearCart();
            window.location.href = `/checkout/resultado?id=${transaction.id}`;
        } else if (status === 'PENDING') {
            toast.info('Tu pago está en proceso. Te notificaremos por correo.');
            window.location.href = `/checkout/resultado?id=${transaction.id}`;
        } else {
            toast.error('El pago fue rechazado. Intenta con otro método.');
        }
    };

    const handleCredibancoPayment = async () => {
        if (!validateForm()) return;
        setIsLoading(true);

        try {
            // 1. Create Pending Order in WooCommerce
            const createRes = await fetch('/api/checkout/create-pending-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: customerData,
                    items: items,
                    paymentMethod: 'credibanco',
                    paymentMethodTitle: 'Credibanco',
                    shippingLine: {
                        method_id: deliveryMethod === 'pickup' ? 'local_pickup' : 'flat_rate',
                        method_title: shippingMethodName,
                        total: shippingCost.toString()
                    },
                    metaData: [
                        { key: "fee_amount", value: requiresColdChain ? coldChainFee.toString() : "0" },
                        // Standard Keys from Snippet
                        { key: "_cl_rx_attachment_url", value: prescriptionFileUrl || "" },
                        { key: "_cl_rx_missing", value: (requiresPrescription && !prescriptionFileUrl) ? "1" : "0" }
                    ],
                    amount: finalTotal
                })
            });

            const createData = await createRes.json();
            if (!createData.success) {
                toast.error(createData.message || 'Error creando el pedido');
                setIsLoading(false);
                return;
            }

            const orderId = createData.orderId;

            // 2. Register Payment with Credibanco
            const registerRes = await fetch('/api/checkout/credibanco', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderId.toString(),
                    amount: finalTotal,
                    tax: 0,
                    returnUrl: `${window.location.origin}/checkout/resultado?ref=${orderId}`,
                    description: `Pedido #${orderId} - PharmaPlus`,
                })
            });

            const registerData = await registerRes.json();

            if (registerData.formUrl) {
                // 3. Redirect User
                window.location.href = registerData.formUrl;
            } else {
                toast.error(registerData.error || 'Error iniciando pago con Credibanco');
                setIsLoading(false);
            }

        } catch (error) {
            console.error('Credibanco Error:', error);
            toast.error('Ocurrió un error al procesar el pago');
            setIsLoading(false);
        }
    };

    const handleCheckout = async (isAgreement = false) => {
        if (!validateForm()) return;

        // Agreement Validation
        if (isAgreement && !agreementTransactionId) {
            setShowAgreementModal(true);
            return;
        }

        setIsLoading(true);

        // HEADLESS CHECKOUT FLOW (Convenios)
        if (isAgreement && agreementTransactionId) {
            try {
                const response = await fetch('/api/checkout/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer: customerData,
                        items: items,
                        agreementId: agreementTransactionId,
                        agreementCardNumber: customerData.documentId, // Assuming ID is the card number used
                        marketingAccepted, // T25: Pass marketing consent
                        shippingLine: {
                            method_id: deliveryMethod === 'pickup' ? 'local_pickup' : 'flat_rate',
                            method_title: shippingMethodName,
                            total: shippingCost.toString()
                        },
                        metaData: [
                            { key: "fee_amount", value: requiresColdChain ? coldChainFee.toString() : "0" },
                            // Standard Keys from Snippet
                            { key: "_cl_rx_attachment_url", value: prescriptionFileUrl || "" },
                            { key: "_cl_rx_missing", value: (requiresPrescription && !prescriptionFileUrl) ? "1" : "0" }
                        ]
                    })
                });

                const result = await response.json();

                if (result.success) {
                    clearCart();
                    toast.success("¡Pedido creado exitosamente!");
                    window.location.href = `/checkout/success?id=${result.orderId}`;
                } else {
                    toast.error(result.message || "Error creando el pedido");
                    setIsLoading(false);
                }

            } catch (error) {
                console.error(error);
                toast.error("Error de conexión al procesar el pedido.");
                setIsLoading(false);
            }
            return;
        }
        // Si llega aquí sin ser convenio, no hace nada
        // (Wompi se maneja con WompiButton directamente)
        setIsLoading(false);
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-pharma-blue)] mb-2">Tu carrito está vacío</h2>
                <p className="text-gray-500 mb-8 max-w-md">Explora nuestro catálogo y encuentra lo que necesitas.</p>
                <Link href="/tienda" className="bg-[var(--color-pharma-blue)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--color-dark-blue)] transition-colors">
                    Ir a la Tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-7 space-y-6">
                {/* 1. Datos Personales */}
                {/* 1. Detalles de Facturación y Envío */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-[var(--color-pharma-blue)] mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <FileText className="w-5 h-5" />
                        Detalles de facturación
                    </h2>

                    <div className="space-y-4">

                        {/* Tipo y Número de Documento */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Tipo de documento <span className="text-red-500">*</span></label>
                                <select
                                    name="documentType"
                                    value={customerData.documentType}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none bg-white h-[42px]"
                                >
                                    {DOCUMENT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Número de documento <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="documentId"
                                    value={customerData.documentId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none h-[42px]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Nombres y Apellidos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Nombre <span className="text-red-500">*</span></label>
                                <input type="text" name="firstName" value={customerData.firstName} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Apellidos <span className="text-red-500">*</span></label>
                                <input type="text" name="lastName" value={customerData.lastName} onChange={handleInputChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none" required />
                            </div>
                        </div>

                        {/* País / Región */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">País / Región <span className="text-red-500">*</span></label>
                            <input type="text" value="Colombia" disabled className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-medium" />
                        </div>

                        {/* Departamento y Ciudad */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Departamento <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none bg-white h-[42px]"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {COLOMBIA_STATES.map(st => (
                                        <option key={st.code} value={st.code}>{st.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Ciudad <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        name="city"
                                        value={customerData.city}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none bg-white h-[42px]"
                                        required
                                        disabled={!selectedState}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {availableCities.map((city) => (
                                            <option key={city.code} value={city.name}>{city.name}</option>
                                        ))}
                                    </select>
                                    {selectedState && availableCities.length === 0 && (
                                        <span className="text-[10px] text-gray-400 absolute right-2 top-3">Cargando...</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lógica de Método de Entrega (integrada sutilmente) */}
                        {selectedState && (
                            <div className="py-2 animate-in fade-in">
                                {(selectedState === 'CO-DC' || customerData.city === 'Bogotá D.C.') && (
                                    <div className="flex items-center gap-4 mb-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                        <span className="text-xs font-bold uppercase text-gray-500">Método:</span>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="deliveryMethod" value="shipping" checked={deliveryMethod === 'shipping'} onChange={() => setDeliveryMethod('shipping')} className="text-[var(--color-pharma-blue)] focus:ring-[var(--color-pharma-blue)]" />
                                            <span className="text-sm font-medium">Domicilio</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="deliveryMethod" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} className="text-[var(--color-pharma-green)] focus:ring-[var(--color-pharma-green)]" />
                                            <span className="text-sm font-medium">Retiro en Tienda</span>
                                        </label>
                                    </div>
                                )}

                                {deliveryMethod === 'pickup' ? (
                                    <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800 flex items-start gap-2">
                                        <MapPin className="w-5 h-5 text-green-600 shrink-0" />
                                        <div>
                                            <strong>Punto de Retiro: Sede Principal</strong><br />
                                            Calle 86 # 27-54, Bogotá D.C. (Lunes a Viernes 7am - 7pm)
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium text-gray-700">{loadingShipping ? 'Calculando envío...' : (shippingMethodName || 'Envío estándar')}</span>
                                        </div>
                                        <span className="font-bold text-[var(--color-pharma-blue)]">{shippingCost > 0 ? `$${shippingCost.toLocaleString()}` : (loadingShipping ? '...' : '$0')}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Dirección de la calle */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Dirección de entrega <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="address"
                                value={customerData.address}
                                onChange={handleInputChange}
                                placeholder="Número de casa y nombre de la calle"
                                className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none"
                                required
                            />
                        </div>

                        {/* Apartamento (Opcional) */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Apartamento, habitación, etc. (opcional)</label>
                            <input
                                type="text"
                                name="address2"
                                value={customerData.address2}
                                onChange={handleInputChange}
                                placeholder="Apartamento, suite, unidad, etc. (opcional)"
                                className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none"
                            />
                        </div>

                        {/* ZIP y Teléfono */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Código postal / ZIP (opcional)</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={customerData.zipCode}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Teléfono / Celular <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={customerData.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">Correo electrónico <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={customerData.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none"
                                required
                            />
                        </div>

                        {/* Empresa Toggle */}
                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isCompany}
                                    onChange={(e) => toggleCompanyMode(e.target.checked)}
                                    className="w-4 h-4 text-[var(--color-pharma-blue)] rounded border-gray-300 focus:ring-[var(--color-pharma-blue)]"
                                />
                                <span className="text-sm font-bold text-gray-700">¿Requieres Factura Electrónica para Empresa?</span>
                            </label>

                            {isCompany && (
                                <div className="mt-3 space-y-1 animate-in fade-in">
                                    <label className="text-xs font-bold uppercase text-gray-500">Razón Social</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={customerData.companyName}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:border-[var(--color-pharma-blue)] outline-none bg-blue-50/20"
                                        placeholder="Nombre de la empresa"
                                        required={isCompany}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* T25: Delivery Schedule */}
                <div className="pt-4 border-t border-gray-100 relative">
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        ¿Cuándo quieres recibir tu pedido?
                    </label>

                    {/* Inline Error Message */}
                    {dateError && (
                        <div className="absolute top-0 right-0 -mt-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full animate-in fade-in slide-in-from-bottom-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {dateError}
                        </div>
                    )}

                    <input
                        type="date"
                        className={`w-full p-2 border rounded-lg outline-none text-gray-700 bg-white transition-colors ${dateError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                        min={new Date().toISOString().split('T')[0]} // Min today
                        value={deliveryDate}
                        onChange={(e) => {
                            if (!e.target.value) {
                                setDeliveryDate('');
                                setDateError('');
                                return;
                            }
                            const [year, month, day] = e.target.value.split('-').map(Number);
                            // Create date in local time (months are 0-indexed)
                            const date = new Date(year, month - 1, day);

                            // 0 = Sunday
                            if (isSunday(date)) {
                                setDateError("No entregamos domingos. Selecciona otra fecha.");
                                setDeliveryDate('');
                                return;
                            }

                            // Checks for Colombia Holidays
                            if (isHoliday(e.target.value)) {
                                setDateError("Es festivo. No hay servicio.");
                                setDeliveryDate('');
                                return;
                            }

                            // Valid date
                            setDateError('');
                            setDeliveryDate(e.target.value);
                        }}
                    />
                    <p className="text-[10px] text-gray-500 mt-1 font-medium">
                        * Horario de entregas: Lunes a Sábado. Domingos y festivos no hay servicio de domicilio.
                    </p>
                </div>

                {/* T25: Prescription Check */}
                {requiresPrescription && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div className="w-full">
                                <h4 className="font-bold text-emerald-800 text-sm">Requiere Fórmula Médica</h4>
                                <p className="text-xs text-emerald-700 mt-1 mb-3 leading-relaxed">
                                    Este producto requiere prescripción. Adjunta el soporte digital.
                                </p>

                                {/* T25: File Uploader */}
                                <PrescriptionUploader
                                    onUploadComplete={(url) => {
                                        setPrescriptionFileUrl(url);
                                        setPrescriptionConfirmed(true); // Auto-confirm on upload for state consistency
                                    }}
                                    onRemove={() => {
                                        setPrescriptionFileUrl(null);
                                        setPrescriptionConfirmed(false);
                                    }}
                                    currentUrl={prescriptionFileUrl || undefined}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                    <h2 className="text-lg font-bold text-[var(--color-pharma-blue)] mb-6">Resumen del Pedido</h2>

                    {/* Items List (Brief) */}
                    <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4">
                        {items.map((item) => (
                            <div key={`${item.id}-${item.variationId || 'base'}`} className="flex gap-3">
                                <div className="relative w-12 h-12 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 text-sm">
                                    <p className="font-medium text-[var(--color-pharma-blue)] line-clamp-1">{item.name}</p>
                                    <div className="flex flex-col">
                                        <p className="text-gray-500 text-xs">Cant: {item.quantity}</p>
                                        {item.promotion && (
                                            <p className="text-[10px] text-purple-600 font-bold mt-0.5 flex items-center gap-1">
                                                🎁 {item.promotion.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right text-sm font-bold text-gray-900">
                                    ${(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Valor Productos</span>
                            {/* Product Sum Only */}
                            <span className="font-bold">${(cartTotal - (requiresColdChain ? coldChainFee : 0)).toLocaleString()}</span>
                        </div>

                        {requiresColdChain && (
                            <>
                                <div className="mt-2 mb-3 bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-800">
                                    <p className="font-bold mb-1">Costo Adicional: Nevera ($12.000)</p>
                                    <p>Este valor se sumará a tu pedido por la nevera certificada obligatoria para el transporte.</p>
                                </div>

                                <div className="flex justify-between text-sm text-blue-600">
                                    <span className="flex items-center gap-1">
                                        <ThermometerSnowflake className="w-4 h-4" />
                                        Nevera de Icopor
                                    </span>
                                    <span className="font-bold">${coldChainFee.toLocaleString()}</span>
                                </div>

                                {/* Intermediate Subtotal (Products + Fridge) */}
                                <div className="flex justify-between text-sm font-bold text-gray-800 pt-2 border-t border-dashed border-gray-200 mt-2">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toLocaleString()}</span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between text-sm pt-1">
                            <span className="text-gray-600">Envío</span>
                            {shippingCost === 0 ? (
                                <span className="text-green-600 font-bold">Gratis</span>
                            ) : (
                                <span className="font-bold">${shippingCost.toLocaleString()}</span>
                            )}
                        </div>
                        <div className="flex justify-between text-xl font-bold text-[var(--color-pharma-blue)] pt-2 border-t border-gray-100 mt-2">
                            <span>Total</span>
                            <span>${finalTotal.toLocaleString()}</span>
                        </div>
                    </div>


                    {/* Snippet #05: Minimum Purchase Alert */}
                    {isBelowMinAmount && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4 rounded-r-lg shadow-sm">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-orange-800">Monto Mínimo Requerido</h4>
                                    <p className="text-xs text-orange-700 mt-1">
                                        El pedido mínimo para tu cuenta es de <strong>${MIN_PURCHASE_AMOUNT.toLocaleString()}</strong>.
                                        Por favor agrega más productos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Agreement Status Feedback */}
                    {agreementTransactionId && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-green-800 text-sm">Convenio Autorizado</h4>
                                    <p className="text-xs text-green-700 mt-1">
                                        Validación exitosa. Ya puedes finalizar tu compra.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legal Checkboxes */}
                    <div className="space-y-4 py-6 border-t border-gray-100">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="peer h-4 w-4 cursor-pointer appearance-none border border-gray-300 rounded bg-white transition-all checked:border-[var(--color-pharma-blue)] checked:bg-[var(--color-pharma-blue)] hover:border-[var(--color-pharma-blue)]"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-xs text-gray-600">
                                Acepto los <Link href="/politicas/terminos-condiciones" target="_blank" className="text-[var(--color-pharma-blue)] underline">Términos y Condiciones</Link>
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={privacyAccepted}
                                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                    className="peer h-4 w-4 cursor-pointer appearance-none border border-gray-300 rounded bg-white transition-all checked:border-[var(--color-pharma-blue)] checked:bg-[var(--color-pharma-blue)] hover:border-[var(--color-pharma-blue)]"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-xs text-gray-600">
                                Acepto la <Link href="/politicas/proteccion-datos" target="_blank" className="text-[var(--color-pharma-blue)] underline">Política de Tratamiento de Datos</Link> y el uso de cookies.
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={marketingAccepted}
                                    onChange={(e) => setMarketingAccepted(e.target.checked)}
                                    className="peer h-4 w-4 cursor-pointer appearance-none border border-gray-300 rounded bg-white transition-all checked:border-[var(--color-pharma-blue)] checked:bg-[var(--color-pharma-blue)] hover:border-[var(--color-pharma-blue)]"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                                Quiero recibir promociones, descuentos y novedades exclusivas en mi correo o celular.
                            </span>
                        </label>
                    </div>

                    <div className="space-y-3">
                        {/* WOMPI – Pago con tarjeta/PSE/Nequi/Efectivo */}
                        {/* Payment Method Selector */}
                        {!agreementTransactionId && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 text-sm">Selecciona el método de pago:</h3>
                                <div className="space-y-3">
                                    {/* Option: Wompi */}
                                    <button
                                        onClick={() => setPaymentMethod('wompi')}
                                        className={`w-full text-left p-4 border rounded-xl flex items-center justify-between transition-all duration-200 group ${paymentMethod === 'wompi'
                                            ? 'border-[var(--color-pharma-blue)] bg-blue-50/50 shadow-sm ring-1 ring-[var(--color-pharma-blue)]'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Icon/Logo Placeholder */}
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                                <CreditCard size={20} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm">Wompi</div>
                                                <div className="text-xs text-gray-500 font-medium">
                                                    Nequi, PSE, Bancolombia, Tarjetas
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'wompi'
                                            ? 'bg-[var(--color-pharma-blue)] border-[var(--color-pharma-blue)]'
                                            : 'border-gray-300 bg-white group-hover:border-gray-400'
                                            }`}>
                                            {paymentMethod === 'wompi' && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                    </button>

                                    {/* Option: Credibanco */}
                                    <button
                                        onClick={() => setPaymentMethod('credibanco')}
                                        className={`w-full text-left p-4 border rounded-xl flex items-center justify-between transition-all duration-200 group ${paymentMethod === 'credibanco'
                                            ? 'border-[var(--color-pharma-blue)] bg-blue-50/50 shadow-sm ring-1 ring-[var(--color-pharma-blue)]'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                                <CreditCard size={20} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm">Credibanco</div>
                                                <div className="text-xs text-gray-500 font-medium">
                                                    Tarjetas Crédito y Débito
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'credibanco'
                                            ? 'bg-[var(--color-pharma-blue)] border-[var(--color-pharma-blue)]'
                                            : 'border-gray-300 bg-white group-hover:border-gray-400'
                                            }`}>
                                            {paymentMethod === 'credibanco' && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                    </button>
                                </div>

                                {paymentMethod === 'wompi' && (
                                    <WompiButton
                                        amountCOP={finalTotal}
                                        reference={wompiReference}
                                        customerData={{
                                            email: customerData.email,
                                            fullName: `${customerData.firstName} ${customerData.lastName}`.trim(),
                                            phoneNumber: customerData.phone,
                                            legalId: customerData.documentId,
                                            legalIdType: isCompany ? 'NIT' : 'CC',
                                        }}
                                        shippingAddress={deliveryMethod === 'shipping' ? {
                                            addressLine1: customerData.address,
                                            city: customerData.city,
                                            region: COLOMBIA_STATES.find(s => s.code === selectedState)?.name || selectedState,
                                            phoneNumber: customerData.phone,
                                        } : undefined}
                                        redirectUrl={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/checkout/resultado`}
                                        onResult={handleWompiResult}
                                        disabled={!isFormReady}
                                    />
                                )}

                                {paymentMethod === 'credibanco' && (
                                    <button
                                        onClick={handleCredibancoPayment}
                                        disabled={!isFormReady || isLoading}
                                        className={`
                                            w-full py-4 rounded-xl font-bold text-base
                                            flex items-center justify-center gap-3
                                            transition-all duration-200 shadow-md
                                            bg-[var(--color-pharma-blue)] hover:bg-blue-700 text-white
                                            disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                                        `}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                <span>Procesando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard size={20} />
                                                <span>Pagar con Credibanco</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => handleCheckout(true)}
                            disabled={isLoading || !selectedState || isBelowMinAmount}
                            className={`
                                w-full py-4 font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed
                                ${agreementTransactionId
                                    ? 'bg-[var(--color-pharma-blue)] text-white hover:bg-blue-700 shadow-md ring-2 ring-offset-2 ring-[var(--color-pharma-blue)]'
                                    : 'bg-white text-[var(--color-pharma-blue)] border-2 border-[var(--color-pharma-blue)] hover:bg-blue-50'
                                }
                                disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400
                            `}
                        >
                            {isLoading && agreementTransactionId ? 'Procesando Convenio...'
                                : agreementTransactionId ? 'Finalizar Compra con Convenio'
                                    : 'Pagar con Convenio / Libranza'}
                            <CreditCard size={18} />
                        </button>

                        {agreementTransactionId && (
                            <button
                                onClick={() => {
                                    setAgreementTransactionId(null);
                                    toast.info("Convenio removido. Selecciona otro método de pago.");
                                }}
                                className="w-full py-2 text-xs text-red-500 hover:text-red-700 underline"
                            >
                                Cancelar / Cambiar Método de Pago
                            </button>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col items-center justify-center gap-2 text-xs text-gray-400 text-center">
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={14} />
                            <span>Pagos procesados de forma segura</span>
                        </div>
                        <p className="max-w-xs">
                            Al continuar, aceptas nuestros{' '}
                            <Link href="/politicas/terminos-condiciones" target="_blank" className="text-[var(--color-pharma-blue)] hover:underline">
                                Términos y Condiciones
                            </Link>
                            {' '}y{' '}
                            <Link href="/revision-pago-electronico" target="_blank" className="text-[var(--color-pharma-blue)] hover:underline">
                                Política de Reversión de Pago
                            </Link>.
                        </p>
                    </div>
                </div>
            </div >

            {showAgreementModal && (
                <AgreementModal
                    onAuthorized={handleAgreementAuthorized}
                    onCancel={() => setShowAgreementModal(false)}
                />
            )
            }
        </div >
    );
}
