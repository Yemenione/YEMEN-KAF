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
        <section className="relative w-full px-4 pt-32 pb-12 lg:px-8 bg-white min-h-[700px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full max-w-[1400px] mx-auto aspect-[4/5] lg:aspect-[21/9] bg-black rounded-[3rem] overflow-hidden shadow-2xl group border border-white/50"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={getMainImage(slides[currentSlide])}
                            alt={getLocalizedValue(slides[currentSlide], 'name')}
                            fill
                            className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-[10s] ease-linear"
                            priority
                            sizes="100vw"
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-20 z-20 pb-16 lg:pb-24">
                        <div className="max-w-xl space-y-6">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="space-y-4"
                            >
                                {/* Badge from Mockup */}
                                <span className="inline-block px-4 py-1.5 bg-[#E3C069] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-2 shadow-lg">
                                    HÉRITAGE MILLÉNAIRE
                                </span>

                                <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-4 drop-shadow-md">
                                    {getLocalizedValue(slides[currentSlide], 'name') || "L'excellence du café Yéménite"}
                                </h1>

                                <p className="text-white/80 line-clamp-2 text-sm md:text-lg font-light max-w-md hidden lg:block">
                                    {getLocalizedValue(slides[currentSlide], 'description')}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                <Link href={`/shop/${slides[currentSlide].slug}`}>
                                    <button className="px-8 py-4 bg-[#E3C069] text-black font-bold uppercase tracking-[0.1em] hover:bg-white transition-all rounded-full text-xs shadow-[0_4px_14px_rgba(227,192,105,0.4)] hover:shadow-white/20 flex items-center gap-3">
                                        {t("home.hero.cta") || "Découvrir la collection"}
                                        <ArrowRight size={16} />
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={clsx(
                                    "w-2 h-2 rounded-full transition-all duration-300 backdrop-blur-sm",
                                    index === currentSlide ? "bg-[#E3C069] w-6" : "bg-white/30 hover:bg-white/80"
                                )}
                            />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
