"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { getMainImage } from "@/lib/image-utils";

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
        <section className="relative w-full bg-black h-screen overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="relative w-full h-full bg-black overflow-hidden"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={getMainImage(slides[currentSlide].images || slides[currentSlide].image_url)}
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
                    <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-24 lg:pb-32 z-20">
                        <div className="max-w-2xl space-y-8">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                                className="space-y-6"
                            >
                                {/* Badge from Mockup */}
                                <div className="flex items-center gap-3">
                                    <span className="inline-block px-4 py-1.5 bg-[var(--honey-gold)] text-black text-[10px] font-black uppercase tracking-[0.25em] rounded-sm shadow-xl">
                                        HÉRITAGE MILLÉNAIRE
                                    </span>
                                    <div className="h-px w-12 bg-white/30 hidden md:block"></div>
                                </div>

                                <h1 className="text-4xl md:text-7xl font-serif text-white leading-[1.1] mb-4 drop-shadow-2xl">
                                    {getLocalizedValue(slides[currentSlide], 'name') || "L'excellence du café Yéménite"}
                                </h1>

                                <p className="text-white/90 line-clamp-2 text-sm md:text-xl font-light max-w-lg hidden lg:block leading-relaxed">
                                    {getLocalizedValue(slides[currentSlide], 'description')}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="flex items-center gap-6"
                            >
                                <Link href={`/shop/${slides[currentSlide].slug}`}>
                                    <button className="px-10 py-5 bg-[var(--honey-gold)] text-black font-black uppercase tracking-[0.15em] hover:bg-white transition-all rounded-sm text-[11px] shadow-[0_10px_30px_rgba(227,192,105,0.4)] hover:shadow-white/20 flex items-center gap-4 group/btn">
                                        {t("home.hero.cta") || "Découvrir la collection"}
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <div className="hidden md:flex flex-col items-start gap-1">
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Origine</span>
                                    <span className="text-xs text-white uppercase tracking-widest font-bold">Yémen 🇾🇪</span>
                                </div>
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
