import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function OurStoryBrief() {
    const { t, locale } = useLanguage();



    return (
        <section className="py-20 bg-white border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1">
                        <Image
                            src="/images/yemen-heritage.jpg"
                            alt={t('home.ourStory.title')}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>

                    <div className="space-y-6 order-1 md:order-2" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                        <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold block">
                            {t('home.ourStory.badge')}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)] leading-tight">
                            {t('home.ourStory.title')}
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {t('home.ourStory.description')}
                        </p>
                        <Link
                            href="/our-story"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--coffee-brown)] text-white text-sm font-bold uppercase tracking-widest hover:bg-[var(--coffee-brown)]/90 transition-all duration-300 group"
                        >
                            {t('home.ourStory.button')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
