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
}

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState<Product[]>([]);
    const { t, locale } = useLanguage();
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
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-20 py-20 z-10 relative">
                <div className="max-w-xl space-y-8 animate-fade-in-up">
                    <div key={currentSlide} className="animate-fade-in space-y-6">
                        <span className="text-[var(--coffee-brown)]/60 text-sm font-bold uppercase tracking-[0.3em] block border-l-2 border-[var(--coffee-brown)] pl-4">
                            {t("home.hero.tagline")}
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[var(--coffee-brown)] leading-[0.9] tracking-tight">
                            {slides[currentSlide].name}
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--coffee-brown)]/80 font-light leading-relaxed max-w-md line-clamp-5">
                            {slides[currentSlide].description}
                        </p>
                    </div>

                    <div className="flex items-center gap-6 pt-4">
                        <Link href={`/shop/${slides[currentSlide].slug}`}>
                            <button className="group flex items-center gap-4 px-10 py-4 bg-[var(--coffee-brown)] text-[var(--cream-white)] font-bold uppercase tracking-widest hover:bg-[var(--coffee-brown)]/90 transition-all shadow-xl rounded-full">
                                {t("home.hero.cta")}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </Link>

                        {/* Pagination - Moved near CTA for accessibility */}
                        <div className="flex items-center gap-3 ml-4">
                            <span className="text-xs font-bold text-[var(--coffee-brown)]">0{currentSlide + 1}</span>
                            <div className="flex gap-2">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={clsx(
                                            "h-[2px] transition-all duration-500",
                                            index === currentSlide ? "w-12 bg-[var(--coffee-brown)]" : "w-4 bg-[var(--coffee-brown)]/20 hover:bg-[var(--coffee-brown)]/40"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Image Slider */}
            <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-full">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={clsx(
                            "absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-start pt-32 md:pt-48",
                            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                        )}
                    >
                        <div className="relative w-full max-w-2xl px-4 md:px-8">
                            {/* Image Container - Clean, Large, Framed */}
                            <div className="relative w-full aspect-square shadow-2xl rounded-[3rem] overflow-hidden border border-gray-100">
                                <Image
                                    src={getMainImage(slide)}
                                    alt={slide.name}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                    sizes="(min-width: 1024px) 50vw, 100vw"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
}
