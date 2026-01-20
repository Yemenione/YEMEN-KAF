import { useState } from "react";
import Image from "next/image";
import { Plus, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface ProductCardProps {
    id?: number; // Make optional to avoid breaking existing usage immediately, but ideally required
    title: string;
    price: string;
    image: string;
    category: string;
}

export default function ProductCard({ id, title, price, image, category }: ProductCardProps) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Ideally, we fetch wishlist status on mount, but for now we start false
    // A more robust implementation would check if this ID is in the user's wishlist list context

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to product page
        e.stopPropagation();

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!id) return;

        setLoading(true);
        try {
            if (isWishlisted) {
                await fetch(`/api/wishlist?productId=${id}`, { method: 'DELETE' });
                setIsWishlisted(false);
            } else {
                await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: id })
                });
                setIsWishlisted(true);
            }
        } catch (error) {
            console.error("Failed to toggle wishlist", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group relative w-full cursor-pointer">
            {/* Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 mb-6">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Minimal Overlay Badge */}
                <div className="absolute top-4 start-4">
                    <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-widest bg-white text-black font-medium">
                        {category}
                    </span>
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={toggleWishlist}
                    disabled={loading}
                    className="absolute top-4 end-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-sm"
                >
                    <Heart
                        size={16}
                        className={clsx(
                            "transition-colors duration-300",
                            isWishlisted ? "fill-red-500 text-red-500" : "text-black group-hover:text-red-500"
                        )}
                    />
                </button>

                {/* 'Quick Add' Button - Appears on hover */}
                <button className="absolute bottom-4 end-4 w-10 h-10 bg-white text-black flex items-center justify-center rounded-full translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white shadow-lg z-20">
                    <Plus size={20} />
                </button>
            </div>

            {/* Content (Outside the image for cleanliness) */}
            <div className="flex justify-between items-start px-2">
                <div>
                    <h3 className="text-base md:text-xl font-serif text-black mb-1 group-hover:underline decoration-1 underline-offset-4 line-clamp-2">
                        {title}
                    </h3>
                    <p className="hidden md:block text-xs text-gray-400 uppercase tracking-wider">Premium Selection</p>
                </div>
                <span className="text-sm md:text-base font-medium text-black whitespace-nowrap">{price}</span>
            </div>
        </div>
    );
}
