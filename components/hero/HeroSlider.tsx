"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface Product {
    id: number;
    name: string;
    description: string;
    slug: string;
    images?: string; // JSON string
    image_url: string; // Keep for legacy if needed, or remove if fully deprecated
}

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState<Product[]>([]);
    const { t } = useLanguage();
    const { settings } = useSettings();

    // Helper to extract main image from JSON
    const getMainImage = (product: Product): string => {
        try {
            if (!product.images) return product.image_url || '/images/honey-jar.jpg';

            // Check if it's already a clean URL (legacy/csv import support)
            if (product.images.startsWith('http') || product.images.startsWith('/')) {
                return product.images;
            }

            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
            }
        } catch (e) {
            // Fallback for non-JSON strings
            if (product.images && (product.images.startsWith('http') || product.images.startsWith('/'))) {
                return product.images;
            }
        }
        return product.image_url || '/images/honey-jar.jpg';
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let url = '/api/products?limit=4';

                if (settings.homepage_hero_products) {
                    const ids = JSON.parse(settings.homepage_hero_products);
                    if (Array.isArray(ids) && ids.length > 0) {
                        url = `/api/products?ids=${ids.join(',')}`;
                    }
                }

                // Fetch featured/newest products for the slider
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.products && data.products.length > 0) {
                        setSlides(data.products);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch hero products:", error);
            }
        };

        fetchProducts();
    }, [settings.homepage_hero_products]);

    // Auto-advance
    useEffect(() => {
        if (slides.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null; // Or a loading skeleton/default static slide

    return (
        <section className="relative h-screen w-full overflow-hidden bg-[var(--cream-white)]">
            {/* Background Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={clsx(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        index === currentSlide ? "opacity-100" : "opacity-0"
                    )}
                >
                    <Image
                        src={getMainImage(slide)}
                        alt={slide.name}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="100vw"
                    />
                    {/* Light/White Overlay for readability of black text */}
                    <div className="absolute inset-0 bg-white/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                </div>
            ))}

            {/* Content - Bottom Aligned for Magazine Look */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end pb-32 px-6 md:px-20">
                <div className="max-w-4xl space-y-8 animate-fade-in-up">

                    {/* Slide Specific Text */}
                    <div key={currentSlide} className="animate-fade-in space-y-4">
                        <span className="text-[var(--coffee-brown)]/60 text-sm font-medium uppercase tracking-[0.4em] block ps-1">
                            {t("home.hero.tagline")}
                        </span>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-[var(--coffee-brown)] leading-none tracking-tight line-clamp-2">
                            {slides[currentSlide].name}
                        </h1>
                        <p className="text-xl md:text-2xl text-[var(--coffee-brown)] font-light max-w-xl leading-relaxed ps-1 pt-2 line-clamp-2">
                            {slides[currentSlide].description}
                        </p>
                    </div>

                    <div className="pt-4 flex items-center gap-6">
                        <Link href={`/shop/${slides[currentSlide].slug}`}>
                            <button className="group flex items-center gap-4 px-12 py-5 bg-[var(--coffee-brown)] text-[var(--cream-white)] font-bold uppercase tracking-widest hover:bg-[var(--coffee-brown)]/90 transition-all shadow-xl">
                                {t("home.hero.cta")}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Pagination Lines */}
            <div className="absolute bottom-12 end-6 md:end-20 z-30 flex items-center gap-4">
                <span className="text-xs font-bold text-[var(--coffee-brown)]">0{currentSlide + 1}</span>
                <div className="flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={clsx(
                                "h-[2px] transition-all duration-500",
                                index === currentSlide ? "w-16 bg-[var(--coffee-brown)]" : "w-8 bg-[var(--coffee-brown)]/20 hover:bg-[var(--coffee-brown)]/40"
                            )}
                        />
                    ))}
                </div>
                <span className="text-xs font-bold text-[var(--coffee-brown)]/40">0{slides.length}</span>
            </div>
        </section>
    );
}
