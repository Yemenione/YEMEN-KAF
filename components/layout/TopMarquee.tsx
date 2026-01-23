"use client";

import { useSettings } from "@/context/SettingsContext";
import { useLanguage } from "@/context/LanguageContext";



export default function TopMarquee() {
    const { settings, loading } = useSettings();
    const { locale } = useLanguage();

    // Don't show while loading ensuring no flicker, or show default?
    // Better to wait for settings or show default if loading?
    // Since settings load fast, let's wait or default to false to avoid flash.
    if (loading) return null;
    if (settings.marquee_enabled === 'false') return null;

    const textEn = settings.marquee_text_en || "Authentic Yemeni Heritage | Free Worldwide Shipping over $150 | Sidr Honey & Mocha Coffee";
    const textFr = settings.marquee_text_fr || "Héritage Yéménite Authentique | Livraison Gratuite dès 150€ | Miel Sidr & Café Mocha";
    const textAr = settings.marquee_text_ar || "تراث يمني أصيل | شحن مجاني للطلبات فوق 150 دولار | عسل السدر والبن اليمني";

    const text = locale === 'fr' ? textFr : locale === 'ar' ? textAr : textEn;
    const items = text.split('|').map(s => s.trim());

    return (
        <div className="bg-[var(--coffee-brown)] text-[var(--cream-white)] py-3 overflow-hidden border-b border-[var(--cream-white)]/10 z-50 relative">
            <div className="flex animate-marquee whitespace-nowrap">
                {[...Array(10)].map((_, groupIndex) => (
                    <div key={groupIndex} className="flex items-center gap-8 mx-4">
                        {items.map((item, i) => (
                            <div key={i} className="flex items-center gap-8">
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">{item}</span>
                                {i < items.length - 1 && (
                                    <span className="w-1 h-1 rounded-full bg-[var(--honey-gold)]" />
                                )}
                                {i === items.length - 1 && <span className="w-1 h-1 rounded-full bg-[var(--honey-gold)]" />}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Gradient Fade Edges */}
            <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-[var(--coffee-brown)] to-transparent z-10" />
            <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-[var(--coffee-brown)] to-transparent z-10" />
        </div>
    );
}
