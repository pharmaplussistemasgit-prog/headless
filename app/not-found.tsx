import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 select-none">
                <Image
                    src="https://tienda.pharmaplus.com.co/wp-content/uploads/2026/01/erro-404-pharmaplus-scaled.webp"
                    alt="Error 404 - Página no encontrada"
                    fill
                    priority
                    className="object-cover object-center"
                    quality={100}
                />
                {/* Overlay opcional para mejorar contraste si fuera necesario, por ahora transparente para lucir la imagen */}
                {/* <div className="absolute inset-0 bg-black/10" /> */}
            </div>

            {/* Content Container - Centered */}
            <div className="relative z-10 flex flex-col items-center justify-end h-full pb-20 md:pb-32 w-full">
                {/* El texto 404 se eliminó porque la imagen ya lo contiene, según requerimiento. 
                   Solo dejamos el botón de regreso para UX esencial. */}

                <Link href="/">
                    <Button
                        size="lg"
                        className="rounded-full bg-[var(--color-primary-blue)] px-8 py-6 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                    >
                        <Home className="mr-2 h-5 w-5" />
                        Volver al Inicio
                    </Button>
                </Link>
            </div>
        </div>
    );
}
