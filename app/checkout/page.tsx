import CheckoutForm from '@/components/checkout/CheckoutForm';

export const metadata = {
    title: 'Finalizar Compra - PharmaPlus',
    description: 'Finaliza tu compra de forma segura en PharmaPlus',
};

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Finalizar Compra</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Completa tus datos para procesar el pedido.</p>
                </div>

                <CheckoutForm />
            </div>
        </div>
    );
}
