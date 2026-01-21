'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { X, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Prevent scrolling when lightbox is open
    if (typeof window !== 'undefined') {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div
                className="relative w-full aspect-square bg-white rounded-xl border border-gray-100 flex items-center justify-center p-4 overflow-hidden cursor-zoom-in group"
                onClick={() => setIsLightboxOpen(true)}
            >
                <Image
                    src={selectedImage}
                    alt={productName}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-5 h-5 text-gray-500" />
                </div>
            </div>

            {/* Thumbnails (only if more than 1) */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(img);
                            }}
                            className={cn(
                                "relative w-20 h-20 flex-shrink-0 bg-white rounded-lg border cursor-pointer overflow-hidden transition-all",
                                selectedImage === img ? "border-[var(--color-primary-blue)] ring-1 ring-[var(--color-primary-blue)]" : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${productName} thumbnail ${idx + 1}`}
                                fill
                                className="object-contain p-1"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox / Zoom Modal */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8" onClick={() => setIsLightboxOpen(false)}>
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50 p-2"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <X size={32} />
                    </button>
                    <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={selectedImage}
                            alt={productName}
                            fill
                            className="object-contain"
                            priority
                            sizes="100vw"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
