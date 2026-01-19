import { useLanguage } from "@/context/LanguageContext";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

interface Testimonial {
    name: string;
    location: string;
    text: string;
    rating: number;
    avatar?: string;
}

// interface TestimonialData removed (unused)

interface Review {
    patient?: {
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
    };
    isVerified?: boolean;
    comment: string | null;
    rating: number;
}

export default function Testimonials({ reviews = [] }: { reviews?: Review[] }) {
    const { t, locale } = useLanguage();

    const fallbackTestimonials = [
        {
            name: t('home.testimonials.customer1.name') || "Fatima Ahmed",
            location: t('home.testimonials.customer1.location') || "Paris, France",
            text: t('home.testimonials.customer1.text') || "Le meilleur miel yéménite que j'ai essayé ! Excellente qualité.",
            rating: 5
        },
        {
            name: t('home.testimonials.customer2.name') || "Mohamed Ali",
            location: t('home.testimonials.customer2.location') || "Lyon, France",
            text: t('home.testimonials.customer2.text') || "Produits 100% authentiques. Goût excellent et prix très raisonnable.",
            rating: 5
        },
        {
            name: t('home.testimonials.customer3.name') || "Sarah Hassan",
            location: t('home.testimonials.customer3.location') || "Marseille, France",
            text: t('home.testimonials.customer3.text') || "Service client excellent et produits traditionnels de haute qualité.",
            rating: 5
        }
    ];

    const displayReviews: Testimonial[] = reviews.length > 0 ? reviews.map(r => ({
        name: `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.trim() || 'Client',
        location: r.isVerified ? 'Achat vérifié' : 'Client Vérifié',
        text: r.comment || '',
        rating: r.rating,
        avatar: r.patient?.avatar || undefined
    })) : fallbackTestimonials;

    return (
        <section className="py-20 bg-[var(--coffee-brown)] text-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold">
                        {t('home.testimonials.badge') || "TÉMOIGNAGES"}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif mt-4">
                        {t('home.testimonials.title') || "Ce Que Disent Nos Clients"}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayReviews.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-500 group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-[var(--honey-gold)] text-[var(--honey-gold)]' : 'text-white/20'}`} />
                                    ))}
                                </div>

                                <div className="relative mb-6">
                                    <Quote className="absolute -top-2 -start-2 w-8 h-8 text-[var(--honey-gold)] opacity-50" />
                                    <p className="text-sm leading-relaxed ps-6 italic" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                                        &quot;{testimonial.text}&quot;
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                                <div className="w-12 h-12 rounded-full border-2 border-[var(--honey-gold)] overflow-hidden bg-white/20 flex items-center justify-center text-xl font-bold text-[var(--honey-gold)] relative">
                                    {testimonial.avatar ? (
                                        <Image src={testimonial.avatar} alt={testimonial.name} fill className="object-cover" />
                                    ) : (
                                        testimonial.name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{testimonial.name}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-[var(--honey-gold)] font-bold">{testimonial.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
