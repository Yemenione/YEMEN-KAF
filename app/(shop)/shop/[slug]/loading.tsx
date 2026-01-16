import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <main className="min-h-screen bg-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left: Image Skeleton */}
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Skeleton className="w-full h-full" />
                    </div>

                    {/* Right: Details Skeleton */}
                    <div className="space-y-8">
                        <div>
                            <Skeleton className="h-4 w-1/4 mb-2" /> {/* Breadcrumb/Category */}
                            <Skeleton className="h-10 w-3/4 mb-4" /> {/* Title */}
                            <Skeleton className="h-6 w-1/3" /> {/* Price */}
                        </div>

                        <div className="space-y-3 py-6 border-t border-b border-gray-100">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>

                        <div className="flex gap-4">
                            <Skeleton className="h-12 w-32 rounded-full" /> {/* Quantity */}
                            <Skeleton className="h-12 flex-1 rounded-full" /> {/* Add to Cart */}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
