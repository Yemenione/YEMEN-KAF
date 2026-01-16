export default function ProductDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20 animate-pulse">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image Gallery Skeleton */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-200 rounded-2xl" />
                        <div className="grid grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
                            ))}
                        </div>
                    </div>

                    {/* Product Info Skeleton */}
                    <div className="space-y-6">
                        {/* Title */}
                        <div className="h-10 bg-gray-200 rounded w-3/4" />

                        {/* Price */}
                        <div className="h-12 bg-gray-200 rounded w-32" />

                        {/* Description */}
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-5/6" />
                            <div className="h-4 bg-gray-200 rounded w-4/5" />
                        </div>

                        {/* Quantity and Buttons */}
                        <div className="space-y-4 pt-6">
                            <div className="h-12 bg-gray-200 rounded w-32" />
                            <div className="flex gap-4">
                                <div className="h-14 bg-gray-200 rounded flex-1" />
                                <div className="h-14 bg-gray-200 rounded w-14" />
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 pt-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                                    <div className="h-4 bg-gray-200 rounded flex-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Products Skeleton */}
                <div className="mt-20">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <div className="aspect-square bg-gray-200 rounded-xl" />
                                <div className="h-6 bg-gray-200 rounded w-3/4" />
                                <div className="h-8 bg-gray-200 rounded w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
