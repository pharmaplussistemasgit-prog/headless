'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
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
        // Simple check if PDF based on extension
        const isPdf = currentUrl.toLowerCase().endsWith('.pdf');

        return (
            <div className="relative group overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 transition-all">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden border border-emerald-100 bg-white flex items-center justify-center">
                        {isPdf ? (
                            <FileText className="w-5 h-5 text-red-500" />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={currentUrl}
                                alt="Fórmula"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-emerald-900 text-sm flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Fórmula Adjuntada
                        </h4>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="text-[10px] text-red-500 hover:text-red-700 font-medium hover:underline mt-0.5"
                        >
                            Eliminar y subir otra
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
                    relative border border-dashed rounded-lg p-4 text-center transition-all cursor-pointer group bg-white
                    ${isDragging
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/30'
                    }
                    ${error ? 'border-red-300 bg-red-50' : ''}
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
                    <div className="flex flex-row items-center justify-center gap-3 py-1">
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                        <span className="text-xs font-medium text-gray-600">Subiendo...</span>
                    </div>
                ) : (
                    <div className="flex flex-row items-center justify-center gap-3 py-1 pointer-events-none">
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0
                            ${error ? 'bg-red-100 text-red-500' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}
                        `}>
                            {error ? <AlertCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        </div>

                        <div className="text-left">
                            {error ? (
                                <>
                                    <p className="text-xs font-bold text-red-600">{error}</p>
                                    <p className="text-[10px] text-red-400">Clic para reintentar</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs font-medium text-gray-700 group-hover:text-emerald-800 transition-colors">
                                        Clic aquí para adjuntar tu fórmula
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        JPG, PNG o PDF (Máx 5MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-2 flex items-start gap-1.5 px-2 text-gray-400 text-[10px]">
                <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5 text-emerald-600" />
                <p>
                    Tus documentos se almacenan de forma segura y solo son accesibles por nuestro equipo farmacéutico.
                </p>
            </div>
        </div>
    );
}
