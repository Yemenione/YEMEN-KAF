import Skeleton from "../ui/Skeleton";

export default function ProductSkeleton() {
    return (
        <div className="flex flex-col bg-white rounded-lg overflow-hidden shadow-sm">
            {/* Image Placeholder */}
            <div className="aspect-square w-full">
                <Skeleton className="w-full h-full rounded-none" />
            </div>

            <div className="p-4 space-y-3">
                {/* Category Placeholder */}
                <Skeleton className="h-3 w-1/3" />

                {/* Title Placeholder */}
                <Skeleton className="h-5 w-3/4" />

                {/* Rating Placeholder */}
                <Skeleton className="h-3 w-1/4" />

                {/* Footer: Price and Button */}
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    );
}
