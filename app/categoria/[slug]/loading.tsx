import { ChevronRight } from "lucide-react";

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs Skeleton */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <ChevronRight className="w-4 h-4" />
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Skeleton */}
                <div className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="h-6 w-3/4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-8 w-full bg-gray-100 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <main className="flex-1">
                    {/* Header Skeleton */}
                    <div className="mb-8 animate-pulse">
                        <div className="h-10 w-1/3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                    </div>

                    {/* Filters active skeleton */}
                    <div className="mb-6 h-8 w-64 bg-gray-50 rounded animate-pulse"></div>

                    {/* Products Grid Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse flex flex-col h-[380px]">
                                {/* Image Placeholder */}
                                <div className="aspect-square bg-gray-200 rounded-lg mb-4 w-full"></div>

                                {/* Content Placeholders */}
                                <div className="space-y-3 flex-1">
                                    <div className="h-4 w-20 bg-blue-50 rounded-full"></div> {/* Badge */}
                                    <div className="h-4 w-full bg-gray-200 rounded"></div> {/* Title line 1 */}
                                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div> {/* Title line 2 */}
                                </div>

                                {/* Price & Button */}
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <div className="h-6 w-24 bg-gray-200 rounded mb-3"></div>
                                    <div className="h-10 w-full bg-gray-100 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
