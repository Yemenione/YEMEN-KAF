"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function TheFarmsPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-white">
            {/* Header */}
            <div className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto space-y-6">
                <span className="text-[var(--honey-gold)] text-xs font-bold uppercase tracking-[0.4em]">{t('farms.terroir')}</span>
                <h1 className="text-6xl md:text-8xl font-serif text-[var(--coffee-brown)]">{t('farms.title')}</h1>
                <p className="text-[var(--coffee-brown)]/60 text-lg leading-relaxed">
                    {t('farms.subtitle')}
                </p>
            </div>

            {/* Region 1: Do'an */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[80vh]">
                <div className="relative bg-gray-100 order-2 md:order-1 min-h-[50vh]">
                    <Image src="/images/honey-comb.jpg" alt="Doan Valley" fill className="object-cover" />
                </div>
                <div className="flex items-center justify-center p-12 md:p-24 bg-white order-1 md:order-2">
                    <div className="space-y-6 max-w-md">
                        <div className="flex items-center gap-2 text-[var(--honey-gold)]">
                            <MapPin size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">{t('farms.doan.location')}</span>
                        </div>
                        <h2 className="text-4xl font-serif text-[var(--coffee-brown)]">{t('farms.doan.title')}</h2>
                        <p className="text-[var(--coffee-brown)]/70 leading-relaxed">
                            {t('farms.doan.desc')}
                        </p>
                        <Link href="/shop?category=honey" className="inline-block border-b border-[var(--coffee-brown)] pb-1 text-xs uppercase tracking-widest font-bold pt-4">
                            {t('farms.doan.shop')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Region 2: Haraz */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[80vh]">
                <div className="flex items-center justify-center p-12 md:p-24 bg-[var(--coffee-brown)] text-white">
                    <div className="space-y-6 max-w-md">
                        <div className="flex items-center gap-2 text-[var(--honey-gold)]">
                            <MapPin size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">{t('farms.haraz.location')}</span>
                        </div>
                        <h2 className="text-4xl font-serif">{t('farms.haraz.title')}</h2>
                        <p className="text-white/70 leading-relaxed">
                            {t('farms.haraz.desc')}
                        </p>
                        <Link href="/shop?category=coffee" className="inline-block border-b border-white pb-1 text-xs uppercase tracking-widest font-bold pt-4 hover:text-[var(--honey-gold)] hover:border-[var(--honey-gold)] transition-colors">
                            {t('farms.haraz.shop')}
                        </Link>
                    </div>
                </div>
                <div className="relative bg-gray-800 min-h-[50vh]">
                    <Image src="/images/coffee-beans.jpg" alt="Haraz Mountains" fill className="object-cover" />
                </div>
            </section>
        </main>
    );
}
