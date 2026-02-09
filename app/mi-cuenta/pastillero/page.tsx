'use client';

import { useState, useEffect } from 'react';
import { Loader2, Send, Pill, Clock, Phone, User, CalendarCheck, Package, Bell, Calendar, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '@/lib/auth';
import ProductAutocomplete from '@/components/ui/ProductAutocomplete';

interface Reminder {
    id: string;
    patient_name: string;
    medication_name: string;
    first_dose_time: string;
    phone_number: string;
    created_at: string;
}

export default function PastilleroAccountPage() {
    const [loading, setLoading] = useState(false);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Configuration State (Patient Info) - Visible
    const [configData, setConfigData] = useState({
        patient_name: '',
        phone_number: ''
    });

    // Medication Form State
    const [formData, setFormData] = useState({
        medication_name: '',
        start_date: new Date().toISOString().split('T')[0],
        first_dose_time: '08:00',
        frequency_hours: '8', // Default "Cada 8 Horas"
        dose_quantity: '1',
        duration_days: '7',
        manage_inventory: false,
        current_stock: '30',
        stock_alert_threshold: '5'
    });

    useEffect(() => {
        const user = auth.getUser();
        if (user) {
            setUserEmail(user.email);
            if (user.name) setConfigData(prev => ({ ...prev, patient_name: user.name }));
            fetchReminders(user.email);

            const savedPhone = localStorage.getItem('pillbox_phone');
            const savedName = localStorage.getItem('pillbox_name');
            if (savedPhone) {
                setConfigData({ phone_number: savedPhone, patient_name: savedName || user.name || '' });
            }
        }
    }, []);

    const fetchReminders = async (email: string) => {
        try {
            const res = await fetch(`/api/pillbox?email=${email}`);
            const data = await res.json();
            if (data.success) {
                setReminders(data.data);
                // Auto-fill config from last reminder if local storage was empty
                if (data.data.length > 0 && !configData.phone_number) {
                    const last = data.data[0];
                    setConfigData({ patient_name: last.patient_name, phone_number: last.phone_number });
                    localStorage.setItem('pillbox_phone', last.phone_number);
                    localStorage.setItem('pillbox_name', last.patient_name);
                }
            }
        } catch (error) {
            console.error('Error fetching reminders:', error);
        }
    };

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfigData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!configData.phone_number || configData.phone_number.length < 10) {
            toast.error('Por favor ingresa un número de celular válido para recibir las alertas.', {
                duration: 4000,
                icon: <Phone className="w-5 h-5 text-red-500" />
            });
            // Focus on phone input
            const phoneInput = document.querySelector('input[name="phone_number"]') as HTMLInputElement;
            if (phoneInput) phoneInput.focus();
            return;
        }

        if (!configData.patient_name) {
            toast.error('Por favor ingresa el nombre del paciente.');
            return;
        }

        setLoading(true);

        try {
            // Save contact preference locally
            localStorage.setItem('pillbox_phone', configData.phone_number);
            localStorage.setItem('pillbox_name', configData.patient_name);

            const payload = {
                ...formData,
                ...configData, // Merge contact info
                user_email: userEmail
            };

            const response = await fetch('/api/pillbox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('¡Recordatorio Creado!', {
                    description: `Notificación enviada a ${configData.phone_number}`
                });

                // Clear Form Only (Keep Config)
                setFormData(prev => ({
                    medication_name: '',
                    start_date: new Date().toISOString().split('T')[0],
                    first_dose_time: '08:00',
                    frequency_hours: '8', // Restore default
                    dose_quantity: '1',
                    duration_days: '7',
                    manage_inventory: false,
                    current_stock: '30',
                    stock_alert_threshold: '5'
                }));

                if (userEmail) fetchReminders(userEmail);

            } else {
                toast.error('Error al guardar', { description: data.error });
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans animate-fade-in-up max-w-5xl mx-auto">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                    <Pill className="text-[#0066cc]" /> Pastillero Virtual
                </h1>
                <p className="text-gray-500 text-sm">Organiza tus tratamientos y recibe alertas SMS directamente en tu celular.</p>
            </div>

            <div className="space-y-10">

                {/* 1. CONFIG & FORM (Create) */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* CONTACT SECTION - ALWAYS VISIBLE AT TOP */}
                    <div className="bg-blue-50/50 p-6 border-b border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Bell className="w-5 h-5 text-[#0066cc]" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Datos de Notificación</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Nombre del Paciente</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="patient_name"
                                        required
                                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white font-medium text-gray-800"
                                        placeholder="Ej: Juan Pérez"
                                        value={configData.patient_name}
                                        onChange={handleConfigChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Celular para Alertas (SMS)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        required
                                        pattern="[0-9]{10}"
                                        maxLength={10}
                                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white font-medium text-gray-800"
                                        placeholder="Ej: 3001234567"
                                        value={configData.phone_number}
                                        onChange={handleConfigChange}
                                    />
                                </div>
                                <p className="text-xs text-blue-600 mt-1 pl-1 flex items-center gap-1">
                                    <span className="font-bold">Nota:</span> Ingresa solo los 10 dígitos. El sistema agrega el +57 automáticamente.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* SECTION 1: PRODUCT INFO */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                                <h4 className="text-[#00cc99] font-bold text-sm uppercase tracking-wide">1. Información del Medicamento</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-full">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Medicamento</label>
                                    <ProductAutocomplete
                                        value={formData.medication_name}
                                        onChange={(val) => setFormData(prev => ({ ...prev, medication_name: val }))}
                                        placeholder="Escribe para buscar (ej: Dolex, Acetaminofén...)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#00cc99]/30 outline-none"
                                        value={formData.start_date}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Hora 1ra Dosis</label>
                                    <input
                                        type="time"
                                        name="first_dose_time"
                                        className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#00cc99]/30 outline-none"
                                        value={formData.first_dose_time}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="col-span-full">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Frecuencia de Toma</label>
                                    <select
                                        name="frequency_hours"
                                        className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#00cc99]/30 outline-none text-gray-700"
                                        value={formData.frequency_hours}
                                        onChange={handleFormChange}
                                    >
                                        <option value="4">Cada 4 Horas</option>
                                        <option value="6">Cada 6 Horas</option>
                                        <option value="8">Cada 8 Horas</option>
                                        <option value="12">Cada 12 Horas</option>
                                        <option value="24">Una vez al día</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: INVENTORY */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                                <h4 className="text-[#00cc99] font-bold text-sm uppercase tracking-wide">2. Inventario y Duración</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Dosis (Cant.)</label>
                                    <input
                                        type="number"
                                        name="dose_quantity"
                                        min="1"
                                        className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#00cc99]/30 outline-none"
                                        value={formData.dose_quantity}
                                        onChange={handleFormChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Duración (Días)</label>
                                    <input
                                        type="number"
                                        name="duration_days"
                                        min="1"
                                        className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#00cc99]/30 outline-none"
                                        placeholder="Ej: 7"
                                        value={formData.duration_days}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </div>

                            {/* Inventory Box */}
                            <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id="manage_inventory"
                                            name="manage_inventory"
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-orange-300 shadow-sm transition-all checked:border-orange-500 checked:bg-orange-500 hover:border-orange-400"
                                            checked={formData.manage_inventory}
                                            onChange={handleFormChange}
                                        />
                                        <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <label htmlFor="manage_inventory" className="text-sm font-bold text-gray-800 cursor-pointer select-none">
                                        Gestionar Inventario
                                    </label>
                                </div>

                                <div className={`grid grid-cols-2 gap-4 transition-all duration-300 ${!formData.manage_inventory ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Stock Actual</label>
                                        <div className="relative">
                                            <Package className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="number"
                                                name="current_stock"
                                                className="w-full pl-8 pr-3 py-2 rounded-lg border border-orange-200 bg-white focus:outline-none focus:border-orange-400 text-sm"
                                                value={formData.current_stock}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Avisar con:</label>
                                        <div className="relative">
                                            <AlertCircle className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="number"
                                                name="stock_alert_threshold"
                                                className="w-full pl-8 pr-3 py-2 rounded-lg border border-orange-200 bg-white focus:outline-none focus:border-orange-400 text-sm"
                                                value={formData.stock_alert_threshold}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col md:flex-row gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        medication_name: '',
                                        start_date: new Date().toISOString().split('T')[0],
                                        first_dose_time: '08:00',
                                        frequency_hours: '8',
                                        dose_quantity: '1',
                                        duration_days: '7',
                                        manage_inventory: false,
                                        current_stock: '30',
                                        stock_alert_threshold: '5'
                                    });
                                    toast('Formulario limpiado');
                                }}
                                className="w-full md:w-1/3 py-4 rounded-xl text-gray-600 font-bold border border-gray-200 hover:bg-gray-50 transition-all text-lg"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-2/3 flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                                <span className="text-lg">Guardar Recordatorio</span>
                            </button>
                        </div>
                    </div>
                </form>

                {/* 2. HISTORY / LIST - MOVED TO BOTTOM */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CalendarCheck className="w-6 h-6 text-[#0066cc]" /> Mis Tratamientos Activos
                    </h3>

                    {reminders.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No tienes recordatorios activos.</p>
                            <p className="text-sm text-gray-400 mt-1">Completa el formulario de arriba para programar tu primer medicamento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reminders.map((r, idx) => (
                                <div key={idx} className="group bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0066cc]" />

                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-800">{r.medication_name}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Creado el {new Date(r.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-xs font-bold text-[#0066cc] bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-100">
                                            {r.first_dose_time.substring(0, 5)}
                                        </span>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 flex flex-col gap-1.5 text-sm text-gray-600">
                                        <span className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /> {r.patient_name}</span>
                                        <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {r.phone_number}</span>
                                    </div>

                                    <button
                                        className="mt-4 w-full text-center text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded transition-colors"
                                        onClick={() => toast.error('Función de eliminar en desarrollo')}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
