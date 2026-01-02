import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
            <div className="mb-6 rounded-full bg-blue-50 p-6">
                <AlertCircle className="h-16 w-16 text-[var(--color-primary-blue)]" />
            </div>
            <h1 className="mb-2 text-4xl font-extrabold text-[var(--color-primary-blue)]">404</h1>
            <h2 className="mb-6 text-2xl font-semibold text-gray-700">Página no encontrada</h2>
            <p className="mb-8 max-w-md text-gray-500">
                Lo sentimos, no pudimos encontrar la página que buscas. Pudo haber sido movida o eliminada.
            </p>
            <Link href="/">
                <Button className="bg-[var(--color-action-blue)] hover:bg-blue-600 px-8 py-6 text-lg rounded-full">
                    Volver al Inicio
                </Button>
            </Link>
        </div>
    );
}
