'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck } from 'lucide-react';
import ShippingCalculator from './ShippingCalculator';
import { ShippingRule } from '@/lib/shipping';
import { ShippingRate } from '@/lib/shipping-rates';

interface ShippingModalProps {
    isOpen: boolean;
    onClose: () => void;
    rules: ShippingRule[];
    rates: ShippingRate[];
}

export default function ShippingModal({ isOpen, onClose, rules, rates }: ShippingModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            <div className="relative">
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-20 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                {/* Reuse the existing calculator logic/UI but stripped of outer containers if needed */}
                                {/* Since ShippingCalculator has its own header, we can just render it. 
                                    However, ShippingCalculator has a shadow/border we might want to reset? 
                                    Let's just wrap it cleanly. The calculator component is designed as a Card. */}
                                <ShippingCalculator rules={rules} rates={rates} />
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
