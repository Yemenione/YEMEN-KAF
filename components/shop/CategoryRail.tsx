"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface Category {
    id: number;
    name: string;
    slug: string;
    image?: string;
    image_url?: string;
}

export default function CategoryRail() {
    const { t } = useLanguage();
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');

    // Hardcoded images mapping for demo purposes/fallback
    const categoryImages: Record<string, string> = {
        'honey': '/images/honey-jar.jpg',
        'coffee': '/images/coffee-beans.jpg',
        'spices': '/images/yemen-heritage.jpg',
        'beauty': '/images/honey-comb.jpg',
        'all': '/images/logo.png'
    };

    useEffect(() => {
        // Fetch categories
        const fetchCats = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();

                    // Add "All" category at start
                    const allCat = { id: 0, name: t('shop.allProducts') || 'All', slug: 'all', image_url: '/images/logo.png' };
                    setCategories([allCat, ...(data.categories || [])]);
                }
            } catch (error) {
                console.error("Failed to fetch categories for rail", error);
            }
        };
        fetchCats();

        // Check active category from URL
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        if (cat) setActiveCategory(cat);
        else setActiveCategory('all');

    }, [t]);

    const getImageForCategory = (cat: Category) => {
        // Priority 1: API provided image (real data)
        if (cat.image_url) return cat.image_url;
        // Priority 2: Manual mapping (fallback)
        if (categoryImages[cat.slug]) return categoryImages[cat.slug];
        // Priority 3: Dynamic defaults (Only if very specific)
        if (cat.slug === 'honey' || cat.slug === 'miel') return '/images/honey-jar.jpg';
        if (cat.slug === 'coffee' || cat.slug === 'cafe') return '/images/coffee-beans.jpg';

        // If no image found, return null to filter it out
        return null;
    };

    // Filter categories that have valid images
    const visibleCategories = categories.filter(cat => getImageForCategory(cat) !== null);

    return (
        <div className="w-full bg-white border-b border-gray-100 py-4 lg:py-8 mb-4">
            <div className={clsx(
                "flex overflow-x-auto snap-x snap-mandatory gap-4 lg:gap-8 px-4 lg:px-12 scrollbar-hide pb-2",
                visibleCategories.length < 6 ? "justify-start lg:justify-center" : "justify-start"
            )}>
                {visibleCategories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={cat.slug === 'all' ? '/shop' : `/shop?category=${cat.slug}`}
                        onClick={() => setActiveCategory(cat.slug)}
                        className="flex flex-col items-center gap-2 min-w-[72px] lg:min-w-[100px] snap-start transition-opacity hover:opacity-80 group"
                    >
                        <div className={clsx(
                            "relative w-16 h-16 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 p-0.5 transition-all duration-300",
                            activeCategory === cat.slug
                                ? "border-[var(--honey-gold)] shadow-md scale-105"
                                : "border-gray-200 group-hover:border-gray-300"
                        )}>
                            <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-50">
                                <Image
                                    src={getImageForCategory(cat) || '/images/logo.png'}
                                    alt={cat.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <span className={clsx(
                            "text-[10px] lg:text-sm font-bold uppercase tracking-wide text-center truncate w-full",
                            activeCategory === cat.slug ? "text-[var(--coffee-brown)]" : "text-gray-500 group-hover:text-gray-700"
                        )}>
                            {cat.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
