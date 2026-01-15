"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

const SLIDES = [
    {
        id: 1,
        image: "/images/honey-jar.jpg",
        title: "Royal Sidr Honey",
        subtitle: "Harvested from the ancient Do'an Valley"
    },
    {
        id: 2,
        image: "/images/coffee-beans.jpg",
        title: "Haraz Mocha",
        subtitle: "Sun-dried cherries, roasted to perfection"
    },
    {
        id: 3,
        image: "/images/honey-comb.jpg",
        title: "Pure Heritage",
        subtitle: "A taste of Yemen's untouched nature"
    }
];

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { t } = useLanguage();

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-[var(--cream-white)]">
            {/* Background Slides */}
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={clsx(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        index === currentSlide ? "opacity-100" : "opacity-0"
                    )}
                >
                    <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
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
                        <span className="text-[var(--coffee-brown)]/60 text-sm font-medium uppercase tracking-[0.4em] block pl-1">
                            {t("hero.tagline")}
                        </span>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-[var(--coffee-brown)] leading-none tracking-tight">
                            {SLIDES[currentSlide].title}
                        </h1>
                        <p className="text-xl md:text-2xl text-[var(--coffee-brown)] font-light max-w-xl leading-relaxed pl-1 pt-2">
                            {SLIDES[currentSlide].subtitle}
                        </p>
                    </div>

                    <div className="pt-4 flex items-center gap-6">
                        <button className="group flex items-center gap-4 px-12 py-5 bg-[var(--coffee-brown)] text-[var(--cream-white)] font-bold uppercase tracking-widest hover:bg-[var(--coffee-brown)]/90 transition-all shadow-xl">
                            {t("hero.cta")}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Pagination Lines */}
            <div className="absolute bottom-12 right-6 md:right-20 z-30 flex items-center gap-4">
                <span className="text-xs font-bold text-[var(--coffee-brown)]">0{currentSlide + 1}</span>
                <div className="flex gap-2">
                    {SLIDES.map((_, index) => (
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
                <span className="text-xs font-bold text-[var(--coffee-brown)]/40">0{SLIDES.length}</span>
            </div>
        </section>
    );
}
