'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
    const phoneNumber = "573001234567"; // Replace with real number
    const message = "Hola PharmaPlus, quisiera hacer un pedido.";

    return (
        <a
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-24 right-4 z-40 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center animate-bounce-slow md:bottom-8 md:right-8"
            aria-label="Chat en WhatsApp"
        >
            <MessageCircle className="w-8 h-8" />
        </a>
    );
}
