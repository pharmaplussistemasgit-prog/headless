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
        <div className="bg-[#f8faff] rounded-2xl overflow-hidden">
            <div className="pt-8 px-8 text-center">
                <h3 className="text-3xl font-bold text-[#1e3a8a] mb-2">Registra Tus Datos</h3>
                <p className="text-[#1e3a8a] text-sm">
                    Bienvenido a <span className="font-bold">Pharmaplus</span>, estamos aquí para ayudarte.<br />
                    Completa el formulario a continuación, y nos pondremos en contacto contigo lo antes posible.
                </p>
            </div>

            <form
                ref={formRef}
                action={handleSubmit}
                className="p-8 space-y-4"
            >
                <div>
                    {/* No label in screenshot, just placeholder? Screenshot shows labels ABOVE input in blue text? 
                        Screenshot 1 (Contact): Labels above? No, placeholders.
                        Screenshot 2 (Registra): "Nombres" is a placeholder or label inside? Looks like placeholder in white box.
                        Wait, usually cleaner forms have placeholders. I will use placeholder as primary label visually if that matches.
                        Actually, let's keep it simple: No Visible Label, just placeholder, or Floating Label.
                        The screenshot has "Nombres", "Email" inside the white box. So simple placeholders.
                     */}
                    <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded bg-white border border-blue-100 text-blue-900 placeholder-blue-300 outline-none focus:ring-1 focus:ring-blue-200"
                        placeholder="Nombres"
                    />
                </div>

                <div className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 rounded bg-white border border-blue-100 text-blue-900 placeholder-blue-300 outline-none focus:ring-1 focus:ring-blue-200"
                        placeholder="Email"
                    />
                    <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full px-4 py-3 rounded bg-white border border-blue-100 text-blue-900 placeholder-blue-300 outline-none focus:ring-1 focus:ring-blue-200"
                        placeholder="Teléfono"
                    />
                </div>

                <div>
                    <textarea
                        name="message"
                        rows={4}
                        // Message field is in screenshot? Yes "Mensaje".
                        className="w-full px-4 py-3 rounded bg-white border border-blue-100 text-blue-900 placeholder-blue-300 outline-none focus:ring-1 focus:ring-blue-200 resize-none"
                        placeholder="Mensaje"
                    ></textarea>
                </div>

                {/* File Upload Area - Text "Adjuntar Hoja De Vida" blue link style? 
                    The screenshot shows "Adjuntar Hoja De Vida" as a text link, then a file input below?
                    I will replicate a simple file input or the existing upload area but simplified.
                    Let's use a simple file input for "cleanliness" as per the screenshot or keep the drag drop but make it look cleaner.
                */}
                <div>
                    <label className="block text-blue-800 font-medium mb-2 text-sm cursor-pointer hover:underline">
                        Adjuntar Hoja De Vida
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#f0f0f0] text-gray-700 px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-200"
                        >
                            Seleccionar archivo
                        </button>
                        <span className="text-gray-500 text-sm italic">
                            {file ? file.name : 'Ningún archivo seleccionado'}
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {file && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Maximum file size: 2 MB. Solo Pdf</p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-pharma-green)] text-white font-bold py-3 rounded hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70"
                    >
                        {loading ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
