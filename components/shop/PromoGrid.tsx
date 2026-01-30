"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { getMainImage } from "@/lib/image-utils";

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    image_url?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
}

interface PromoGridProps {
    categories?: Category[];
}

export default function PromoGrid({ categories }: PromoGridProps) {
    const { t, getLocalizedValue } = useLanguage();
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Map categories to promo cards
    // We want 3 specific cards. If we have categories, we use them.
    // We'll style them cyclically with the existing color palettes.

    // Fallback data if no categories provided (or while loading/server error)
    const defaultPromos = [
        {
            title: t('home.promo.honey.title') || "Royal Sidr Collection",
            subtitle: t('home.promo.honey.sub') || "Rare & Potent",
            image: "/images/honey-jar.jpg",
            link: "/shop?category=honey",
            color: "bg-amber-50"
        },
        {
            title: t('home.promo.coffee.title') || "Haraz Mocha Special",
            subtitle: t('home.promo.coffee.sub') || "Estate Grown",
            image: "/images/coffee-beans.jpg",
            link: "/shop?category=coffee",
            color: "bg-stone-100"
        },
        {
            title: t('home.promo.gifts.title') || "Luxury Gift Sets",
            subtitle: t('home.promo.gifts.sub') || "Perfect for Ramadan",
            image: "/images/placeholder.jpg",
            link: "/shop?category=gifts",
            color: "bg-gray-50"
        }
    ];

    let promos = defaultPromos;

    if (categories && categories.length >= 3) {
        // We have enough categories to replace the defaults
        // We'll pick the first 3, or specific ones if we had logic for it.
        // For now, simple mapping of first 3.
        promos = categories.slice(0, 3).map((cat, idx) => ({
            title: getLocalizedValue(cat, 'name'),
            subtitle: t('home.categories.explore') || "Discover",
            image: getMainImage(cat),
            link: `/shop?category=${cat.slug}`,
            color: idx === 0 ? "bg-amber-50" : idx === 1 ? "bg-stone-100" : "bg-gray-50"
        }));
    }

    return (
        <section className="py-12 bg-white relative group/section">
            {/* Scroll Buttons - Visible on Desktop hover, always on Mobile if desired or keep clean */}
            <div className="hidden md:block">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 opacity-0 group-hover/section:opacity-100 -translate-x-4 group-hover/section:translate-x-0"
                    aria-label="Scroll Left"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 opacity-0 group-hover/section:opacity-100 translate-x-4 group-hover/section:translate-x-0"
                    aria-label="Scroll Right"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Mobile Navigation Arrows (Visible always or subtle) */}
            <div className="md:hidden flex justify-end gap-2 px-6 mb-2">
                <button
                    onClick={() => scroll('left')}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div
                ref={scrollContainerRef}
                className="w-full overflow-x-auto pb-4 hide-scrollbar md:pb-0 snap-x snap-mandatory scroll-smooth"
            >
                <div className="flex md:grid md:grid-cols-3 gap-4 px-6 md:px-0 md:max-w-7xl md:mx-auto">
                    {promos.map((promo, idx) => (
                        <Link
                            key={idx}
                            href={promo.link}
                            className={`group relative flex-shrink-0 w-[85vw] md:w-auto overflow-hidden rounded-3xl ${promo.color} aspect-[4/3] flex flex-col justify-end p-6 md:p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 snap-center`}
                        >
                            <div suppressHydrationWarning className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                <Image
                                    src={promo.image}
                                    alt={promo.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 85vw, 33vw"
                                    priority={idx === 0}
                                    unoptimized
                                />
                            </div>

                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent pointer-events-none" />

                            <div className="relative z-10 space-y-1 md:space-y-2">
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[var(--coffee-brown)]/60">
                                    {promo.subtitle}
                                </span>
                                <h3 className="text-xl md:text-3xl font-serif text-[var(--coffee-brown)] leading-tight line-clamp-2">
                                    {promo.title}
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--honey-gold)] pt-2">
                                    {t('home.hero.cta') || "Voir la collection"} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
