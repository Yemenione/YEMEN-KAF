"use client";

import { motion, AnimatePresence } from "framer-motion";
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
    images?: string | string[];
    image_url: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: Record<string, any>;
}

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState<Product[]>([]);
    const { t, locale, getLocalizedValue } = useLanguage();
    const { settings } = useSettings();

    const getMainImage = (product: Product): string => {
        try {
            if (!product.images) return product.image_url || '/images/honey-jar.jpg';
            if (Array.isArray(product.images)) {
                return product.images.length > 0 ? product.images[0] : (product.image_url || '/images/honey-jar.jpg');
            }
            if (typeof product.images === 'string' && (product.images.startsWith('http') || product.images.startsWith('/'))) {
                return product.images;
            }
            const parsed = JSON.parse(product.images as string);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        } catch {
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
                const separator = url.includes('?') ? '&' : '?';
                const res = await fetch(`${url}${separator}lang=${locale || 'en'}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.products && data.products.length > 0) setSlides(data.products);
                }
            } catch (error) {
                console.error("Failed to fetch hero products:", error);
            }
        };
        fetchProducts();
    }, [settings.homepage_hero_products, locale]);

    useEffect(() => {
        if (slides.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 10000); // 10s
        return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return (
        <div className="w-full h-[60vh] lg:h-[500px] bg-gray-50 flex items-center justify-center">
            <span className="text-gray-300 font-serif italic text-sm tracking-widest">YEM KAF PREMIUM...</span>
        </div>
    );

    return (
        <section className="relative w-full lg:h-[500px] bg-white overflow-hidden border-b border-gray-100/50">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 flex flex-col lg:flex-row"
                >
                    {/* Background Overlay for mobile */}
                    <div className="absolute inset-0 lg:hidden z-0">
                        <Image
                            src={getMainImage(slides[currentSlide])}
                            alt={getLocalizedValue(slides[currentSlide], 'name')}
                            fill
                            className="object-cover opacity-20"
                        />
                    </div>

                    {/* Content Column - More compact */}
                    <div className="relative flex-1 flex flex-col justify-center px-8 lg:px-24 z-20 py-12 lg:py-0">
                        <div className="max-w-xl space-y-6 lg:space-y-8">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="space-y-4"
                            >
                                <span className="inline-block text-[var(--coffee-brown)]/40 text-[10px] font-bold uppercase tracking-[0.4em] border-l-2 border-[var(--coffee-brown)]/20 pl-3">
                                    {t("home.hero.tagline")}
                                </span>
                                <h1 className="text-3xl md:text-5xl lg:text-5xl font-serif text-[var(--coffee-brown)] leading-tight tracking-tight line-clamp-2">
                                    {getLocalizedValue(slides[currentSlide], 'name')}
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="flex items-center gap-8"
                            >
                                <Link href={`/shop/${slides[currentSlide].slug}`}>
                                    <button className="group flex items-center gap-3 px-8 py-3 bg-black text-white font-bold uppercase tracking-[0.15em] hover:bg-[var(--coffee-brown)] transition-all rounded-xl text-[10px] shadow-lg hover:shadow-xl">
                                        {t("home.hero.cta")}
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>

                                <div className="flex gap-2">
                                    {slides.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={clsx(
                                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                                index === currentSlide ? "bg-[var(--coffee-brown)] scale-125" : "bg-gray-200 hover:bg-gray-300"
                                            )}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Image Column (Desktop) - 'TV' Look with Crystal Clear Image */}
                    <div className="hidden lg:flex flex-1 h-full items-center justify-center p-8 lg:pr-16 lg:pl-0">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative w-full max-w-[650px] aspect-video rounded-[2.5rem] shadow-2xl overflow-hidden group border-[8px] border-white ring-1 ring-gray-100"
                        >
                            <Image
                                src={getMainImage(slides[currentSlide])}
                                alt={getLocalizedValue(slides[currentSlide], 'name')}
                                fill
                                className="object-cover transition-transform duration-[10s] ease-linear group-hover:scale-105"
                                priority
                                sizes="(max-width: 1200px) 50vw, 800px"
                                quality={95}
                            />

                            {/* Cinematic Gradient - Subtle bottom only */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none" />
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
