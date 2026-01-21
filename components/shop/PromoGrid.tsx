"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

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
            image: cat.imageUrl || cat.image_url || "/images/placeholder.jpg", // Handle casing from DB vs API
            link: `/shop?category=${cat.slug}`,
            color: idx === 0 ? "bg-amber-50" : idx === 1 ? "bg-stone-100" : "bg-gray-50"
        }));
    }

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {promos.map((promo, idx) => (
                    <Link
                        key={idx}
                        href={promo.link}
                        className={`group relative overflow-hidden rounded-3xl ${promo.color} aspect-[4/3] flex flex-col justify-end p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1`}
                    >
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                            <Image
                                src={promo.image}
                                alt={promo.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        </div>

                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent pointer-events-none" />

                        <div className="relative z-10 space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--coffee-brown)]/60">
                                {promo.subtitle}
                            </span>
                            <h3 className="text-2xl md:text-3xl font-serif text-[var(--coffee-brown)] leading-tight line-clamp-2">
                                {promo.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--honey-gold)] pt-2">
                                {t('home.hero.cta') || "Voir la collection"} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
