import Image from "next/image";
import { Plus } from "lucide-react";

interface ProductCardProps {
    title: string;
    price: string;
    image: string;
    category: string;
}

export default function ProductCard({ title, price, image, category }: ProductCardProps) {
    return (
        <div className="group relative w-full cursor-pointer">
            {/* Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 mb-6">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />

                {/* Minimal Overlay Badge */}
                <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-widest bg-white text-black font-medium">
                        {category}
                    </span>
                </div>

                {/* 'Quick Add' Button - Appears on hover */}
                <button className="absolute bottom-4 right-4 w-10 h-10 bg-white text-black flex items-center justify-center rounded-full translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white shadow-lg">
                    <Plus size={20} />
                </button>
            </div>

            {/* Content (Outside the image for cleanliness) */}
            <div className="flex justify-between items-start px-2">
                <div>
                    <h3 className="text-xl font-serif text-black mb-1 group-hover:underline decoration-1 underline-offset-4">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Premium Selection</p>
                </div>
                <span className="text-sm font-medium text-black">{price}</span>
            </div>
        </div>
    );
}
