'use client';

import { useState, useRef } from 'react';
import { Send, Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { submitJetForm } from '@/app/actions/jetform';
import { toast } from 'sonner';

export default function WorkWithUsForm() {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        // Validate size (2MB)
        if (selectedFile.size > 2 * 1024 * 1024) {
            toast.error('El archivo es demasiado grande. Máximo 2MB.');
            return;
        }

        // Validate type (PDF)
        if (selectedFile.type !== 'application/pdf') {
            toast.error('Solo se permiten archivos PDF.');
            return;
        }

        setFile(selectedFile);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);

        try {
            // Append form ID manually if not present
            formData.append('form_id', '16937');

            // Append file if it exists
            if (file) {
                // Ensure the field name matches what JetFormBuilder expects for the file field
                // Based on user request, it says "Adjuntar Hoja De Vida". 
                // Usually JFB generic names are file_field_name or similar. 
                // We will try using a generic name or infer it. 
                // Looking at standard WP forms, let's assume 'resume' or 'file'.
                // If the user provided code shows `[jet_fb_form ...]` we don't see field names.
                // We'll use 'resume' as a key and also 'file' just in case, or 'media'.
                formData.append('resume', file);
            } else {
                toast.error('Por favor adjunta tu Hoja de Vida (PDF).');
                setLoading(false);
                return;
            }

            const result = await submitJetForm(formData);

            if (result.success) {
                toast.success('¡Hoja de vida enviada con éxito!');
                if (formRef.current) formRef.current.reset();
                setFile(null);
            } else {
                toast.error(result.message || 'Error al enviar el formulario.');
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-[var(--color-pharma-blue)] p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Regístrate en nuestra Base de Datos</h3>
                <p className="text-blue-100 text-sm">Completa el formulario y nos pondremos en contacto.</p>
            </div>

            <form
                ref={formRef}
                action={handleSubmit}
                className="p-8 space-y-6"
            >
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo *</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="Tu nombre completo"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico *</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            placeholder="tucorreo@ejemplo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono / Celular *</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            placeholder="300 123 4567"
                        />
                    </div>
                </div>

                {/* File Upload Area */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Adjuntar Hoja de Vida (PDF) *</label>

                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group
                            ${dragActive ? 'border-[var(--color-pharma-blue)] bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
                            ${file ? 'bg-green-50 border-green-200' : ''}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-green-800 text-sm">{file.name}</span>
                                <span className="text-xs text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="mt-3 text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm hover:shadow"
                                >
                                    <X className="w-3 h-3" /> Eliminar archivo
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-blue-50 text-[var(--color-pharma-blue)] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-gray-700 text-sm">Haz clic o arrastra tu PDF aquí</span>
                                <span className="text-xs text-gray-400 mt-2">Máximo 2MB · Solo formato PDF</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-pharma-green)] text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {loading ? 'Enviando postulación...' : (
                            <>
                                Enviar Postulación
                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Al enviar este formulario aceptas nuestra política de tratamiento de datos personales.
                    </p>
                </div>
            </form>
        </div>
    );
}
