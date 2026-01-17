import { useLanguage } from "@/context/LanguageContext";
import { Star, Quote } from "lucide-react";

interface Testimonial {
    name: string;
    location: string;
    text: string;
    rating: number;
    avatar?: string;
}

export default function Testimonials() {
    const { t, locale } = useLanguage();

    const testimonials: Testimonial[] = [
        {
            name: t('home.testimonials.customer1.name'),
            location: t('home.testimonials.customer1.location'),
            text: t('home.testimonials.customer1.text'),
            rating: 5
        },
        {
            name: t('home.testimonials.customer2.name'),
            location: t('home.testimonials.customer2.location'),
            text: t('home.testimonials.customer2.text'),
            rating: 5
        },
        {
            name: t('home.testimonials.customer3.name'),
            location: t('home.testimonials.customer3.location'),
            text: t('home.testimonials.customer3.text'),
            rating: 5
        }
    ];

    return (
        <section className="py-20 bg-[var(--coffee-brown)] text-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold">
                        {t('home.testimonials.badge')}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif mt-4">
                        {t('home.testimonials.title')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-500 group"
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-[var(--honey-gold)] text-[var(--honey-gold)]" />
                                ))}
                            </div>

                            <div className="relative mb-6">
                                <Quote className="absolute -top-2 -start-2 w-8 h-8 text-[var(--honey-gold)] opacity-50" />
                                <p className="text-sm leading-relaxed ps-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                                    {testimonial.text}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-[var(--honey-gold)]">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{testimonial.name}</p>
                                    <p className="text-xs text-white/70">{testimonial.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
