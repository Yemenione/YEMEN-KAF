import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface ProductCardProps {
    title: string;
    price: string;
    image: string;
    category: string;
}

export default function ProductCard({ title, price, image, category }: ProductCardProps) {
    return (
        <div className="group relative w-full h-[450px] rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 hover:border-[var(--honey-gold)]/50">

            {/* Image Container */}
            <div className="relative w-full h-[65%] overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--coffee-brown)]/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                {/* Category Badge */}
                <span className="absolute top-4 left-4 px-3 py-1 text-xs uppercase tracking-widest text-[var(--coffee-brown)] bg-[var(--honey-gold)] font-bold rounded-full">
                    {category}
                </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 w-full p-6 flex flex-col justify-end h-[35%] bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="flex justify-between items-end transform transition-transform duration-500 group-hover:-translate-y-2">
                    <div>
                        <h3 className="text-2xl font-serif text-[var(--cream-white)] mb-1 group-hover:text-[var(--honey-gold)] transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm text-[var(--cream-white)]/70 font-light">Origin: Haraz Mountains</p>
                    </div>
                    <span className="text-xl font-medium text-[var(--honey-gold)]">{price}</span>
                </div>

                {/* Action Button (Slides up on hover) */}
                <div className="mt-4 overflow-hidden h-0 group-hover:h-12 transition-all duration-500">
                    <button className="flex items-center justify-between w-full px-4 py-2 bg-[var(--cream-white)] text-[var(--coffee-brown)] font-medium uppercase tracking-wider text-sm hover:bg-[var(--honey-gold)] transition-colors rounded">
                        View Details <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
