'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface PrescriptionUploaderProps {
    onUploadComplete: (url: string) => void;
    onRemove: () => void;
    currentUrl?: string;
}

export default function PrescriptionUploader({ onUploadComplete, onRemove, currentUrl }: PrescriptionUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            validateAndUpload(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndUpload(e.target.files[0]);
        }
    };

    const validateAndUpload = async (file: File) => {
        setError(null);

        // Client-side Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Formato no válido. Usa JPG, PNG o PDF.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            setError('El archivo es muy pesado (Máx 5MB).');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload/prescription', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la subida');
            }

            onUploadComplete(data.url);
        } catch (err: any) {
            console.error('Upload failed', err);
            setError(err.message || 'Error al subir el archivo. Intenta de nuevo.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        onRemove();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setError(null);
    };

    // --- RENDER STATES ---

    // 1. STATE: FILE UPLOADED (SUCCESS)
    if (currentUrl) {
        const isPdf = currentUrl.toLowerCase().endsWith('.pdf');
        return (
            <div className="relative group overflow-hidden rounded-xl border-2 border-green-200 bg-green-50/50 p-4 transition-all">
                <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-green-100 bg-white shadow-sm flex items-center justify-center">
                        {isPdf ? (
                            <FileText className="w-8 h-8 text-red-500" />
                        ) : (
                            <Image
                                src={currentUrl}
                                alt="Fórmula Médica"
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-green-800 text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Archivo adjunto correctamente
                        </h4>
                        <p className="text-xs text-green-600 truncate mt-1">
                            {isPdf ? 'Documento PDF' : 'Imagen de la receta'}
                        </p>
                        <button
                            onClick={handleRemove}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold underline mt-2"
                        >
                            Cambiar archivo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. STATE: UPLOADING OR DEFAULT
    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group
                    ${isDragging
                        ? 'border-[var(--color-pharma-blue)] bg-blue-50'
                        : 'border-gray-200 hover:border-[var(--color-pharma-blue)] hover:bg-gray-50'
                    }
                    ${error ? 'border-red-200 bg-red-50' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-2">
                        <Loader2 className="w-8 h-8 text-[var(--color-pharma-blue)] animate-spin mb-3" />
                        <p className="text-sm font-bold text-gray-700">Subiendo archivo...</p>
                        <p className="text-xs text-gray-500">Por favor espera un momento</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
                            ${error ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-[var(--color-pharma-blue)] group-hover:scale-110'}
                        `}>
                            {error ? <AlertCircle className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                        </div>

                        {error ? (
                            <>
                                <p className="text-sm font-bold text-red-600">{error}</p>
                                <p className="text-xs text-red-400 mt-1">Clic para intentar de nuevo</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-bold text-gray-700">
                                    Haz clic o arrastra tu fórmula aquí
                                </p>
                                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                                    Soportamos JPG, PNG o PDF (Máx 5MB)
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-2 flex items-start gap-2 p-3 bg-yellow-50 rounded-lg text-yellow-800 text-xs shadow-sm border border-yellow-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                    <strong>Nota Importante:</strong> Sube una foto clara de tu fórmula médica completa.
                    Nuestros regentes farmacéuticos verificarán su validez antes de despachar el pedido.
                </p>
            </div>
        </div>
    );
}
