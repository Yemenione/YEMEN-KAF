"use client";

import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

interface FarmsContentProps {
    sections: Array<{
        image: string;
        theme: string;
    }>;
}

export default function FarmsContent({ sections }: FarmsContentProps) {
    const { t, language } = useLanguage();

    const isRTL = language === 'ar';

    // Helper to get translated content for sections based on index
    // Index 0 -> doan
    // Index 1 -> haraz
    const getSectionContent = (index: number) => {
        if (index === 0) {
            return {
                subtitle: t('farms.doan.location'),
                title: t('farms.doan.title'),
                content: t('farms.doan.desc'),
                features: [], // Translation file doesn't have features list yet
                shopText: t('farms.doan.shop')
            };
        } else {
            return {
                subtitle: t('farms.haraz.location'),
                title: t('farms.haraz.title'),
                content: t('farms.haraz.desc'),
                features: [],
                shopText: t('farms.haraz.shop')
            };
        }
    };

    return (
        <main className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Hero */}
            <div className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto space-y-6">
                <span className="text-[var(--honey-gold)] text-xs font-bold uppercase tracking-[0.4em]">
                    {t('farms.terroir') || 'TERROIR'}
                </span>
                <h1 className="text-6xl md:text-8xl font-serif text-[var(--coffee-brown)]">
                    {t('farms.title') || 'The Farms'}
                </h1>
                <p className="text-[var(--coffee-brown)]/60 text-lg leading-relaxed">
                    {t('farms.subtitle') || "Yemen's geography is unlike anywhere else on Earth..."}
                </p>
            </div>

            {/* Regions */}
            {sections.map((section, idx) => {
                const content = getSectionContent(idx);

                return (
                    <section key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[80vh] overflow-hidden">
                        {/* Image Side - Sticky Effect */}
                        <div className={`relative min-h-[50vh] ${section.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} ${idx % 2 === 1 ? 'md:order-2' : 'md:order-1'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={section.image}
                                alt={content.title}
                                className="object-cover w-full h-full"
                            />
                        </div>

                        {/* Content Side */}
                        <div className={`flex items-center justify-center p-12 md:p-24 ${section.theme === 'dark' ? 'bg-[var(--coffee-brown)] text-white' : 'bg-white text-[var(--coffee-brown)]'} ${idx % 2 === 1 ? 'md:order-1' : 'md:order-2'}`}>
                            <motion.div
                                initial={{ opacity: 0, x: idx % 2 === 1 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6 max-w-md"
                            >
                                <div className="flex items-center gap-2 text-[var(--honey-gold)]">
                                    <span className="text-xs font-bold uppercase tracking-widest">{content.subtitle}</span>
                                </div>
                                <h2 className="text-4xl font-serif">{content.title}</h2>
                                <p className={`leading-relaxed ${section.theme === 'dark' ? 'text-white/70' : 'text-[var(--coffee-brown)]/70'}`}>
                                    {content.content}
                                </p>

                                {content.shopText && (
                                    <div className="pt-4">
                                        <button className="text-[var(--honey-gold)] hover:text-white transition-colors uppercase text-sm font-bold tracking-widest border-b border-[var(--honey-gold)] pb-1">
                                            {content.shopText}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </section>
                );
            })}
        </main>
    );
}
