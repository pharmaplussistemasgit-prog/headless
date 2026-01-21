export default function EmailPreviewPage() {
    return (
        <div className="h-screen w-full bg-gray-100 p-4 flex flex-col items-center">
            <h1 className="mb-4 text-xl font-bold text-gray-800">Vista Previa de Correo</h1>
            <div className="h-full w-full max-w-4xl overflow-hidden rounded-lg border border-gray-300 bg-white shadow-xl">
                <iframe
                    src="/api/preview-email"
                    className="h-full w-full"
                    title="Email Preview"
                />
            </div>
        </div>
    );
}
