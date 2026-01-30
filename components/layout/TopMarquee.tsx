"use client";

import { useSettings } from "@/context/SettingsContext";
import { useLanguage } from "@/context/LanguageContext";

interface TopMarqueeProps {
    enabled?: boolean;
    textEn?: string;
    textFr?: string;
    textAr?: string;
}

export default function TopMarquee({ enabled, textEn, textFr, textAr }: TopMarqueeProps = {}) {
    const { settings, loading } = useSettings();
    const { locale } = useLanguage();

    // Use props if provided (server-side), otherwise fall back to settings context
    const isEnabled = enabled !== undefined ? enabled : settings.show_marquee !== 'false';

    // Get language-specific text
    const marqueeTextEn = textEn || settings.marquee_text_en || "Authentic Yemeni Heritage • Free Worldwide Shipping over $150 • Sidr Honey & Mocha Coffee";
    const marqueeTextFr = textFr || settings.marquee_text_fr || "Héritage Yéménite Authentique • Livraison Gratuite dès 150€ • Miel Sidr & Café Mocha";
    const marqueeTextAr = textAr || settings.marquee_text_ar || "تراث يمني أصيل • شحن مجاني للطلبات فوق 150 دولار • عسل السدر والبن اليمني";

    if (loading && enabled === undefined) return null;
    if (!isEnabled) return null;

    // Select text based on current locale
    const text = locale === 'fr' ? marqueeTextFr : locale === 'ar' ? marqueeTextAr : marqueeTextEn;

    // Split by bullet point separator
    const items = text.split('•').map(s => s.trim()).filter(Boolean);

    // Fallback if no items
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="bg-[var(--coffee-brown)] text-[var(--cream-white)] py-2.5 overflow-hidden relative pointer-events-none">
            <div className="flex animate-marquee whitespace-nowrap">
                {[...Array(10)].map((_, groupIndex) => (
                    <div key={groupIndex} className="flex items-center gap-8 mx-4">
                        {items.map((item, i) => (
                            <div key={i} className="flex items-center gap-8">
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">{item}</span>
                                <span className="w-1 h-1 rounded-full bg-[var(--honey-gold)]" />
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
