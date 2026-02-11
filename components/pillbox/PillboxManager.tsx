'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Calendar as CalendarIcon, Pill, Loader2, Check, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getReminders, addReminder, deleteReminder, Reminder } from '@/app/actions/pillbox';
// Dynamic import for server action to avoid bundling issues if any
// import { searchProducts } from '@/app/actions/products'; 
import { format, addDays, startOfWeek, isSameDay, startOfMonth, endOfMonth, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface PillboxManagerProps {
    userId: string;
    userName: string;
}

export default function PillboxManager({ userId, userName }: PillboxManagerProps) {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'dashboard' | 'create'>('dashboard');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Defensive check
    if (!userId) {
        return <div className="p-8 text-center text-red-500">
            Error: Identificador de usuario no encontrado. <br />
            <span className="text-xs text-gray-400">(ID Recibido: {String(userId)})</span>
        </div>;
    }

    // Ensure ID is string
    const validUserId = String(userId);

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        try {
            const data = await getReminders(userId);
            setReminders(data);
        } catch (err) {
            toast.error('Error cargando pastillero');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar medicamento?')) return;
        await deleteReminder(id, userId);
        setReminders(prev => prev.filter(r => r.id !== id));
        toast.success('Eliminado correctamente');
    };

    // --- CALENDAR MONTH COMPONENT ---
    const CalendarMonth = () => {
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const days = eachDayOfInterval({
            start: startDate,
            end: endDate,
        });

        const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        const changeMonth = (increment: number) => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + increment);
            setSelectedDate(newDate);
        };

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                {/* Header Month */}
                <div className="bg-[var(--color-pharma-green)] p-4 flex justify-between items-center text-white">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold capitalize flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        {format(selectedDate, "MMMM yyyy", { locale: es })}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Days Grid */}
                <div className="p-4">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {weekDays.map(d => (
                            <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day) => {
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, monthStart);

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        h-14 flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all border
                                        ${isSelected
                                            ? 'bg-[var(--color-pharma-green)] text-white border-[var(--color-pharma-green)] shadow-md transform scale-105 z-10'
                                            : 'bg-white text-gray-700 border-transparent hover:bg-gray-50 hover:border-gray-200'
                                        }
                                        ${!isCurrentMonth ? 'opacity-30' : ''}
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {/* Dot indicator for reminders (mock logic for now or connect to real count) */}
                                    {isSameDay(day, new Date()) && !isSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1"></div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // --- CREATE FORM COMPONENT (PRO) ---
    const CreateForm = () => {
        const [query, setQuery] = useState('');
        const [results, setResults] = useState<any[]>([]);
        const [isSearching, setIsSearching] = useState(false);
        const [showResults, setShowResults] = useState(false);
        const [showFrequencyHours, setShowFrequencyHours] = useState(true);

        // Smart Search Handler
        useEffect(() => {
            let active = true; // Race condition protection

            const delayDebounce = setTimeout(async () => {
                if (query.length > 2) {
                    setIsSearching(true);
                    try {
                        // Dynamically import to ensure server-client boundary respect
                        const { searchProductsLight } = await import('@/app/actions/products');

                        // Use the optimized light search
                        const products = await searchProductsLight(query);

                        // Only update if this effect is still active (latest query)
                        if (active) {
                            setResults(products);
                            setShowResults(true);
                        }
                    } catch (e) {
                        console.error("Search error", e);
                    } finally {
                        if (active) setIsSearching(false);
                    }
                } else {
                    setResults([]);
                    setShowResults(false);
                }
            }, 500); // Increased debounce to 500ms

            return () => {
                active = false; // Cancel this run on cleanup
                clearTimeout(delayDebounce);
            };
        }, [query]);

        const selectProduct = (name: string) => {
            setQuery(name);
            setShowResults(false);
        };

        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Programar Nuevo Medicamento</h3>
                    <button onClick={() => setView('dashboard')} className="text-sm text-gray-500 hover:text-red-500">Cancelar</button>
                </div>

                <form action={async (formData) => {
                    await addReminder(formData, validUserId);
                    toast.success('Medicamento guardado exitosamente');
                    setView('dashboard');
                    loadData();
                }} className="p-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* LEFT: Info Product & Timing */}
                        <div className="space-y-6">
                            <div className="bg-[var(--color-pharma-green)]/10 p-3 rounded-lg text-[var(--color-pharma-green)] font-bold text-sm mb-4">
                                1. Información del Producto
                            </div>

                            {/* SMART SEARCH INPUT */}
                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Medicamento</label>
                                <div className="relative">
                                    <Pill className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        name="medication_name"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        autoComplete="off"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-pharma-green)] outline-none"
                                        placeholder="Escribe para buscar... (Ej: Dolex)"
                                    />
                                    {isSearching && <Loader2 className="absolute right-3 top-3 w-5 h-5 animate-spin text-gray-400" />}
                                </div>

                                {/* DROPDOWN RESULTS */}
                                {showResults && results.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                        {results.map((p) => (
                                            <div
                                                key={p.id}
                                                onClick={() => selectProduct(p.name)}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3"
                                            >
                                                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">💊</div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{p.name}</p>
                                                    <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* START DATE & TIME PICKERS */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hora 1ra Dosis</label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        defaultValue="08:00"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                    />
                                </div>
                            </div>

                            {/* FREQUENCY */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Frecuencia de Toma</label>
                                <select
                                    name="frequency_type"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                    onChange={(e) => setShowFrequencyHours(e.target.value === 'every_x_hours')}
                                >
                                    <option value="every_x_hours">Por Intervalo (Horas)</option>
                                    <option value="daily">Una vez al día</option>
                                </select>
                            </div>

                            {showFrequencyHours && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Intervalo de horas</label>
                                    <select name="frequency_hours" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                                        <option value="8">Cada 8 Horas</option>
                                        <option value="12">Cada 12 Horas</option>
                                        <option value="6">Cada 6 Horas</option>
                                        <option value="24">Cada 24 Horas</option>
                                        <option value="4">Cada 4 Horas</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Inventory & Duration */}
                        <div className="space-y-6">
                            <div className="bg-[var(--color-pharma-green)]/10 p-3 rounded-lg text-[var(--color-pharma-green)] font-bold text-sm mb-4">
                                2. Inventario y Duración
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dosis (Cant.)</label>
                                    <input type="number" name="dose_quantity" defaultValue={1} min={1} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-center font-bold" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duración (Días)</label>
                                    <input type="number" name="duration_days" placeholder="Ej: 7" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-center" />
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <label className="flex items-center gap-2 mb-3">
                                    <input type="checkbox" name="notify_low_stock" defaultChecked className="w-4 h-4 text-amber-500 rounded" />
                                    <span className="font-bold text-amber-800 text-sm">Gestionar Inventario</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-amber-700 block mb-1">Stock Actual</span>
                                        <input type="number" name="current_stock" placeholder="30" className="w-full p-2 text-sm border border-amber-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-amber-700 block mb-1">Avisar con:</span>
                                        <input type="number" name="low_stock_threshold" defaultValue={5} className="w-full p-2 text-sm border border-amber-200 rounded-lg" />
                                    </div>
                                </div>
                            </div>

                            {/* Hidden User ID for robust passing */}
                            <input type="hidden" name="user_id" value={validUserId} />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <button type="submit" className="bg-[var(--color-pharma-green)] text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Guardar Tratamiento
                        </button>
                    </div>
                </form>
            </div>
        )
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-[var(--color-pharma-green)]" /></div>;

    return (
        <div className="max-w-5xl mx-auto py-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <Pill className="text-[var(--color-pharma-green)] w-8 h-8" />
                Pastillero Virtual <span className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-normal">Versión Pro</span>
            </h1>

            {view === 'create' ? <CreateForm /> : (
                <div className="space-y-6">
                    {/* Calendar Header */}
                    <CalendarMonth />

                    {/* Action Bar */}
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Tratamientos Activos</h3>
                        <button
                            onClick={() => setView('create')}
                            className="bg-[var(--color-pharma-green)] hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Crear Recordatorio
                        </button>
                    </div>

                    {/* Reminders Grid */}
                    {reminders.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Pill className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-600">No tienes medicamentos hoy</h3>
                            <p className="text-gray-400 max-w-sm mx-auto mt-2">Agrega tu primer tratamiento usando el botón verde de arriba para empezar a organizar tu salud.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reminders.map(r => (
                                <div key={r.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                                            💊
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg">{r.medication_name}</h4>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                Cada {r.frequency_hours} horas
                                            </p>

                                            <div className="flex gap-2 mt-4">
                                                <button className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-200 transition-colors">
                                                    ✔ Tomar Dosis ({r.dose_quantity})
                                                </button>
                                                <button className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                                                    Omitir
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stock Alert Mini */}
                                    {r.notify_low_stock && r.current_stock <= r.low_stock_threshold && (
                                        <div className="mt-4 bg-amber-50 text-amber-800 text-xs p-2 rounded-lg flex items-center gap-2 font-medium">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>¡Quedan pocas pastillas! ({r.current_stock})</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
