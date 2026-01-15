"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function TopMarquee() {
    return (
        <div className="bg-[var(--coffee-brown)] text-[var(--cream-white)] py-3 overflow-hidden border-b border-[var(--cream-white)]/10 z-50 relative">
            <div className="flex animate-marquee whitespace-nowrap">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-8 mx-4">
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">Authentic Yemeni Heritage</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--honey-gold)]" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">Free Worldwide Shipping over $150</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--honey-gold)]" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em]">Sidr Honey & Mocha Coffee</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--honey-gold)]" />
                    </div>
                ))}
            </div>

            {/* Gradient Fade Edges */}
            <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-[var(--coffee-brown)] to-transparent z-10" />
            <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-[var(--coffee-brown)] to-transparent z-10" />
        </div>
    );
}
