export default function ProductCardSkeleton() {
    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-black/5 animate-pulse">
            {/* Image Skeleton */}
            <div className="relative aspect-square bg-gray-200" />

            {/* Content Skeleton */}
            <div className="p-6 space-y-3">
                {/* Title */}
                <div className="h-6 bg-gray-200 rounded w-3/4" />

                {/* Description */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-4">
                    <div className="h-8 bg-gray-200 rounded w-20" />
                    <div className="h-10 bg-gray-200 rounded w-24" />
                </div>
            </div>
        </div>
    );
}
