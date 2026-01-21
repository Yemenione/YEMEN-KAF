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
    images?: string | string[]; // Can be JSON string or array of URLs
    image_url: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: Record<string, any>;
}

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState<Product[]>([]);
    const { t, locale, getLocalizedValue } = useLanguage();
    const { settings } = useSettings();

    // Helper to extract main image from JSON or Array
    const getMainImage = (product: Product): string => {
        try {
            if (!product.images) return product.image_url || '/images/honey-jar.jpg';

            // If it's already an array, return the first item
            if (Array.isArray(product.images)) {
                return product.images.length > 0 ? product.images[0] : (product.image_url || '/images/honey-jar.jpg');
            }

            // Check if it's already a clean URL (legacy/csv import support)
            if (typeof product.images === 'string' && (product.images.startsWith('http') || product.images.startsWith('/'))) {
                return product.images;
            }

            const parsed = JSON.parse(product.images as string);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
            }
        } catch {
            // Fallback for non-JSON strings
            if (typeof product.images === 'string' && (product.images.startsWith('http') || product.images.startsWith('/'))) {
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
                const separator = url.includes('?') ? '&' : '?';
                const res = await fetch(`${url}${separator}lang=${locale || 'en'}`);
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
    }, [settings.homepage_hero_products, locale]);

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
        <section className="relative w-full min-h-[90vh] bg-[var(--cream-white)] overflow-hidden flex flex-col lg:flex-row">

            {/* Left Column: Content */}
            <div className="absolute inset-0 lg:relative lg:w-1/2 flex flex-col justify-end lg:justify-center items-center lg:items-start text-center lg:text-start px-8 md:px-20 pb-20 md:pb-32 lg:py-20 z-20 lg:min-h-full">
                <div className="max-w-xl space-y-6 md:space-y-8 animate-fade-in-up">
                    <div key={currentSlide} className="animate-fade-in space-y-3 md:space-y-6">
                        <span className="text-[var(--honey-gold)] lg:text-[var(--coffee-brown)]/60 text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] block lg:border-l-2 border-[var(--honey-gold)] lg:border-[var(--coffee-brown)] lg:pl-4">
                            {t("home.hero.tagline")}
                        </span>
                        <h1 className="text-3xl md:text-7xl lg:text-8xl font-serif text-white lg:text-[var(--coffee-brown)] leading-[1.2] lg:leading-[0.9] tracking-tight drop-shadow-sm">
                            {getLocalizedValue(slides[currentSlide], 'name')}
                        </h1>
                        <p className="text-xs md:text-xl text-white/80 lg:text-[var(--coffee-brown)]/80 font-light leading-relaxed max-w-[280px] md:max-w-md line-clamp-2 lg:line-clamp-5 mx-auto lg:mx-0">
                            {getLocalizedValue(slides[currentSlide], 'description')}
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-5 md:gap-6 pt-2 md:pt-4">
                        <Link href={`/shop/${slides[currentSlide].slug}`}>
                            <button className="group flex items-center gap-3 md:gap-4 px-6 md:px-10 py-3 md:py-4 bg-[var(--honey-gold)] lg:bg-[var(--coffee-brown)] text-white font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-xl rounded-full text-[10px] md:text-base">
                                {t("home.hero.cta")}
                                <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </Link>

                        {/* Pagination */}
                        <div className="flex items-center gap-3 lg:ml-4">
                            <span className="text-[10px] md:text-xs font-bold text-white/60 lg:text-[var(--coffee-brown)]">0{currentSlide + 1}</span>
                            <div className="flex gap-2">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={clsx(
                                            "h-[2px] transition-all duration-500",
                                            index === currentSlide ? "w-8 md:w-12 bg-[var(--honey-gold)] lg:bg-[var(--coffee-brown)]" : "w-3 md:w-4 bg-white/20 lg:bg-[var(--coffee-brown)]/20 hover:bg-white/40 lg:hover:bg-[var(--coffee-brown)]/40"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Slider */}
            <div className="absolute inset-0 lg:relative lg:w-1/2 h-full order-1 lg:order-2">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={clsx(
                            "absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-center lg:justify-start lg:pt-32",
                            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                        )}
                    >
                        {/* Overlay Gradient for readability on mobile */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden z-10" />

                        <div className="relative w-full h-full lg:h-auto lg:max-w-2xl px-0 lg:px-8">
                            <div className="relative w-full h-full lg:aspect-square lg:shadow-2xl lg:rounded-[3rem] overflow-hidden lg:border lg:border-gray-100">
                                <Image
                                    src={getMainImage(slide)}
                                    alt={slide.name}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                    sizes="100vw, (min-width: 1024px) 50vw"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
}
