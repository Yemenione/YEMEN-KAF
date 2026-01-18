"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface Product {
    id: number;
    name: string;
    price: number;
    compare_at_price?: number | null;
    slug: string;
    images?: string | null;
    category_name?: string;
}

interface ProductCarouselProps {
    title: string;
    products: Product[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (!products || products.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const getMainImage = (product: Product): string => {
        try {
            if (!product.images) return '/images/honey-jar.jpg';
            if (product.images.startsWith('http') || product.images.startsWith('/')) return product.images;
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
            return product.images;
        } catch {
            return product.images || '/images/honey-jar.jpg';
        }
    };

    return (
        <section className="py-16">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-serif text-black">{title}</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full border border-gray-200 hover:border-black transition-colors bg-white shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full border border-gray-200 hover:border-black transition-colors bg-white shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            >
                {products.map((product) => {
                    const price = Number(product.price);
                    const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : null;
                    const hasDiscount = compareAtPrice && compareAtPrice > price;

                    return (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="flex-shrink-0 w-[280px] snap-start group"
                        >
                            <div className="relative aspect-[4/5] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4 transition-transform duration-500 group-hover:scale-[1.02]">
                                <Image
                                    src={getMainImage(product)}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="280px"
                                />
                                {hasDiscount && (
                                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                                        -{Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}%
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{product.category_name}</p>
                                <h4 className="text-sm font-medium text-black line-clamp-1">{product.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">{price.toFixed(2)}€</span>
                                    {hasDiscount && (
                                        <span className="text-xs text-gray-400 line-through">{compareAtPrice.toFixed(2)}€</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
