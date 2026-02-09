'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import WorkWithUsForm from './WorkWithUsForm'; // Reutilizamos el formulario existente

interface WorkWithUsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WorkWithUsModal({ isOpen, onClose }: WorkWithUsModalProps) {
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
                        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" // Darker overlay for focus
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto"
                        >
                            {/* Close Button - Top Right */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            {/* Reuse the existing form component but we might need to adjust its internal styling if it has a header inside. 
                                Looking at previous `read_file` of WorkWithUsForm:
                                It has a header: "Regístrate en nuestra Base de Datos".
                                We can just render it. 
                            */}
                            <WorkWithUsForm />

                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
