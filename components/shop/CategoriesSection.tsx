import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { useSettings } from "@/context/SettingsContext";

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: Record<string, any>;
}

export default function CategoriesSection() {
    const [categories, setCategories] = useState<Category[]>([]);
    const { t, getLocalizedValue } = useLanguage();
    const { settings } = useSettings();
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    let cats = data.categories || [];

                    if (settings.homepage_featured_categories) {
                        const ids = JSON.parse(settings.homepage_featured_categories);
                        if (Array.isArray(ids) && ids.length > 0) {
                            cats = cats.filter((c: Category) => ids.includes(c.id));
                        }
                    }

                    setCategories(cats);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        fetchCategories();
    }, [settings.homepage_featured_categories]);

    if (categories.length === 0) return null;

    return (
        <section className="py-24 bg-white overflow-hidden relative group/section">
            {/* Desktop Navigation Arrows */}
            <div className="hidden md:block">
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 opacity-0 group-hover/section:opacity-100 -translate-x-4 group-hover/section:translate-x-0"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 opacity-0 group-hover/section:opacity-100 translate-x-4 group-hover/section:translate-x-0"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
                <div>
                    <span className="text-gray-400 uppercase tracking-[0.4em] text-xs font-semibold block mb-4">{t('home.categories.discover')}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-black leading-tight">{t('home.categories.title')}</h2>
                </div>

                {/* Mobile Navigation Arrows */}
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory scroll-smooth">
                <div className="flex gap-6 px-6 md:px-0 max-w-7xl mx-auto min-w-max">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="group flex flex-col items-center gap-3 flex-shrink-0 snap-center"
                        >
                            <div className="relative w-[80px] md:w-[140px] aspect-square rounded-full overflow-hidden bg-gray-100 border-2 border-transparent group-hover:border-[var(--honey-gold)] transition-all duration-300 shadow-md">
                                <Image
                                    src={cat.image_url || '/images/honey-jar.jpg'}
                                    alt={cat.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100px, 150px"
                                />
                            </div>

                            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-center text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors max-w-[90px] md:max-w-[140px]">
                                {getLocalizedValue(cat, 'name')}
                            </h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
