'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import { User, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DetallesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form fields
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        current_password: '', // WC API might require separate endpoint or special handling for password
        new_password: '',
        confirm_password: ''
    });

    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const user = auth.getUser();
                if (!user || !user.id) {
                    setError('No se pudo identificar al usuario.');
                    setLoading(false);
                    return;
                }
                setUserId(user.id);

                const response = await fetch(`/api/customer?id=${user.id}`);
                if (!response.ok) throw new Error('Error al cargar datos');

                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    email: data.email || ''
                }));
            } catch (err) {
                console.error(err);
                setError('Error al cargar tus datos.');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            setError('las contraseñas no coinciden');
            setSaving(false);
            return;
        }

        try {
            // Prepared payload
            const payload: any = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email
            };

            // Only send password if changing
            if (formData.new_password) {
                // NotA: Changing password via REST API normally requires admin privileges or current password validation
                // Depending on WC setup. We will try sending it.
                // Standard: 'password' field.
                payload.password = formData.new_password;
            }

            const response = await fetch(`/api/customer?id=${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Error al guardar');

            setSuccess('Datos actualizados correctamente.');
            // Optionally update local session if name/email changed
        } catch (err) {
            console.error(err);
            setError('Error al guardar los cambios.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-[var(--color-pharma-blue)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalles de la Cuenta</h2>

            {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Nombre *</label>
                        <input
                            type="text"
                            name="first_name"
                            required
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Apellidos *</label>
                        <input
                            type="text"
                            name="last_name"
                            required
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Correo electrónico *</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:outline-none transition-colors"
                    />
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Cambio de Contraseña (Opcional)</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Nueva contraseña</label>
                            <input
                                type="password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                placeholder="Dejar en blanco para no cambiar"
                                className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Confirmar nueva contraseña</label>
                            <input
                                type="password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                placeholder="Dejar en blanco para no cambiar"
                                className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-[var(--color-pharma-blue)] focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-[var(--color-pharma-blue)] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
}
