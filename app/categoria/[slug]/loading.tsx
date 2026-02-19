export default function CategoryLoading() {
    return (
        <div className="container mx-auto px-4 py-8 animate-pulse">
            {/* Breadcrumbs Skeleton */}
            <div className="flex gap-2 mb-8">
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-4 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Skeleton */}
                <div className="w-full md:w-72 flex-shrink-0 space-y-6">
                    <div className="h-12 bg-gray-200 rounded-2xl w-full" />
                    <div className="h-64 bg-gray-200 rounded-2xl w-full" />
                    <div className="h-32 bg-gray-200 rounded-2xl w-full" />
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1">
                    {/* Header Skeleton */}
                    <div className="mb-8 space-y-4">
                        <div className="h-10 w-48 bg-gray-200 rounded-lg" />
                        <div className="h-4 w-64 bg-gray-200 rounded" />
                    </div>

                    {/* Products Grid Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
                                <div className="aspect-square bg-gray-50 rounded-xl" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-6 bg-gray-200 rounded w-1/2" />
                                <div className="h-10 bg-gray-100 rounded-xl w-full mt-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
