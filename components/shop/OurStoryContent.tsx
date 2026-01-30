"use client";

import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import Image from "next/image";
import { getMainImage } from "@/lib/image-utils";

interface OurStoryContentProps {
    hero: {
        title: string;
        subtitle: string;
        image: string;
    };
    sections: Array<{
        type: 'image-text' | 'grid';
        title: string;
        content?: string;
        image?: string;
        imagePosition?: 'left' | 'right';
        items?: Array<{
            title: string;
            content: string;
        }>;
    }>;
    conclusion: {
        title: string;
        content: string;
    };
}

export default function OurStoryContent({ hero, sections, conclusion }: OurStoryContentProps) {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    return (
        <main className="min-h-screen bg-[var(--cream-white)] text-[var(--coffee-brown)] overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Hero Section with Parallax Effect */}
            <div className="relative h-[90vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={getMainImage(hero?.image)}
                        alt={t('story.title') || "Our Story"}
                        fill
                        className="object-cover scale-105 animate-slow-zoom"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl space-y-8"
                    >
                        <span className="block text-[var(--honey-gold)] text-sm md:text-base font-medium tracking-[0.3em] uppercase mb-4">
                            {t('common.est') || 'Est. 2024'}
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] tracking-tight drop-shadow-lg">
                            {t('story.origin') || hero?.title || "Notre Histoire"}
                        </h1>
                        <div className="w-24 h-1 bg-[var(--honey-gold)] mx-auto mt-8 mb-8" />
                        <p className="text-lg md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                            {t('story.philosophy') || hero?.subtitle}
                        </p>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/70">
                    <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent mx-auto" />
                </div>
            </div>

            {/* Content Sections */}
            <div className="max-w-7xl mx-auto py-32 px-6 sm:px-12 space-y-40">
                {sections.map((section, idx) => {
                    // We assume the sections follow a specific order and we map them to translation keys
                    // Section 0: Legacy (Image-Text)
                    // Section 1: Process (Grid)

                    let sectionTitle = section.title;
                    let sectionContent = section.content;

                    if (idx === 0) {
                        sectionTitle = t('story.legacyTitle') || section.title;
                        sectionContent = t('story.philosophy') || section.content; // Or keep original if distinct
                    } else if (idx === 1 && section.type === 'grid') {
                        sectionTitle = t('story.processTitle') || section.title;
                    }

                    return (
                        <div key={idx}>
                            {section?.type === 'image-text' && (
                                <div className={`flex flex-col md:flex-row gap-12 lg:gap-24 items-center ${section.imagePosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'}`}>

                                    {/* Image with Decorative Frame */}
                                    <div className={`w-full md:w-1/2 relative group`}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.7 }}
                                        >
                                            <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-2xl">
                                                <Image
                                                    src={getMainImage(section.image)}
                                                    alt={sectionTitle}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                />
                                                <div className="absolute inset-0 border-[1px] border-white/20 m-4 pointer-events-none" />
                                            </div>
                                            {/* Decorative Background Element */}
                                            <div className={`absolute -z-10 top-[-20px] ${section.imagePosition === 'left' ? 'left-[-20px]' : 'right-[-20px]'} w-full h-full border-2 border-[var(--coffee-brown)]/10`} />
                                        </motion.div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="w-full md:w-1/2 space-y-8">
                                        <motion.div
                                            initial={{ opacity: 0, x: section.imagePosition === 'left' ? 30 : -30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.7, delay: 0.2 }}
                                        >
                                            <div className="items-center gap-4 mb-4 hidden md:flex">
                                                <span className="w-12 h-[1px] bg-[var(--coffee-brown)]"></span>
                                                <span className="text-[var(--coffee-brown)] text-xs font-bold uppercase tracking-widest opacity-60">Chapter 0{idx + 1}</span>
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-serif text-[var(--coffee-brown)] leading-tight">
                                                {sectionTitle}
                                            </h2>
                                            <p className="text-lg md:text-xl text-[var(--coffee-brown)]/75 leading-relaxed font-light text-justify">
                                                {sectionContent}
                                            </p>
                                        </motion.div>
                                    </div>
                                </div>
                            )}

                            {section?.type === 'grid' && (
                                <div className="space-y-20">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="text-center space-y-6 max-w-3xl mx-auto"
                                    >
                                        <span className="text-[var(--honey-gold)] text-xs font-bold uppercase tracking-[0.2em]">{t('contact.subtitle') ? 'PROCESS' : 'OUR PROCESS'}</span>
                                        <h2 className="text-4xl md:text-6xl font-serif text-[var(--coffee-brown)]">{sectionTitle}</h2>
                                        <div className="w-16 h-[2px] bg-[var(--coffee-brown)]/20 mx-auto"></div>
                                    </motion.div>

                                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                                        {(t('story.steps', { returnObjects: true }) as unknown as Array<{ title: string; desc: string }> || section.items || []).map((step, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.15 }}
                                                className="bg-white p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-[var(--honey-gold)] text-center group cursor-default"
                                            >
                                                <div className="w-16 h-16 bg-[var(--bg-cream)] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[var(--coffee-brown)] transition-colors duration-300">
                                                    <span className="text-2xl text-[var(--coffee-brown)] group-hover:text-white transition-colors duration-300">{i + 1}</span>
                                                </div>
                                                <h3 className="text-2xl font-serif text-[var(--coffee-brown)] mb-4">{step.title}</h3>
                                                <p className="text-[var(--coffee-brown)]/70 leading-relaxed font-light text-sm">
                                                    {step.desc || (step as any).content}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Conclusion with Signature Style */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-center max-w-4xl mx-auto py-20 bg-[var(--coffee-brown)] text-[var(--cream-white)] rounded-tl-[80px] rounded-br-[80px] shadow-2xl relative overflow-hidden px-8 md:px-20"
                >
                    {/* Abstract Patterns */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-[var(--honey-gold)]/10 rounded-full blur-3xl" />

                    <div className="relative z-10 space-y-10">
                        <h2 className="text-4xl md:text-5xl font-serif text-[var(--honey-gold)]">{t('story.uncompromising') || conclusion?.title || "Excellence"}</h2>
                        <p className="text-xl md:text-2xl font-light leading-relaxed opacity-90 italic">
                            &quot;{t('story.philosophy') || conclusion?.content}&quot;
                        </p>
                        <div className="pt-8">
                            <span className="font-serif text-3xl opacity-50 block mb-2">{t('story.signature') || 'Yem Kaf'}</span>
                            <span className="text-xs uppercase tracking-[0.4em] opacity-40">Authentic Yemeni Heritage</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
