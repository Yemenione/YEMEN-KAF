import { useLanguage } from "@/context/LanguageContext";
import { Star, Quote, ChevronLeft, ChevronRight, Check } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

interface Testimonial {
    name: string;
    location: string;
    text: string;
    rating: number;
    avatar?: string;
}

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
    const { t } = useLanguage();
    const scrollRef = useRef<HTMLDivElement>(null);

    const fallbackTestimonials = [
        {
            name: "Fatima Ahmed",
            location: "Paris, France",
            text: "Le meilleur miel yéménite que j'ai essayé ! Excellente qualité et service irréprochable. On sent vraiment l'authenticité.",
            rating: 5
        },
        {
            name: "Mohamed Ali",
            location: "Lyon, France",
            text: "Produits 100% authentiques. Le café Mocha est une révélation. Livraison rapide et emballage soigné.",
            rating: 5
        },
        {
            name: "Sarah Hassan",
            location: "Marseille, France",
            text: "Service client excellent et produits traditionnels de haute qualité. Le miel de Sidr est incroyable pour la santé.",
            rating: 5
        },
        {
            name: "Jean-Pierre B.",
            location: "Geneva, CH",
            text: "Une expérience gustative unique. On voyage à travers les saveurs. Je recommande vivement le pack découverte.",
            rating: 5
        }
    ];

    const displayReviews: Testimonial[] = reviews.length > 0 ? reviews.map(r => ({
        name: `${r.patient?.firstName || r.patient?.lastName ? `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.trim() : t('home.testimonials.client')}`,
        location: r.isVerified ? t('product.verified') : t('home.testimonials.verifiedClient'),
        text: r.comment || '',
        rating: r.rating,
        avatar: r.patient?.avatar || undefined
    })) : fallbackTestimonials;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-16 bg-white overflow-hidden relative group/section">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-4">
                        <span className="text-[var(--honey-gold)] uppercase tracking-[0.4em] text-xs font-bold block">
                            {t('home.testimonials.badge')}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)] leading-tight">
                            {t('home.testimonials.title')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-8 bg-gray-50/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100">
                        <div className="flex flex-col items-center border-e border-gray-200 pe-8">
                            <span className="text-4xl font-serif font-bold text-[var(--coffee-brown)]">4.9</span>
                            <div className="flex text-[var(--honey-gold)] mt-1">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-[var(--coffee-brown)]">124 {t('product.reviews')}</p>
                            <p className="text-xs text-gray-500 mt-1">{t('home.testimonials.verifiedPurchase')}</p>
                        </div>
                        <button className="px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[var(--coffee-brown)] transition-colors shadow-lg">
                            {t('product.write')}
                        </button>
                    </div>
                </div>

                {/* Slider Navigation */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 pointer-events-none hidden lg:block px-4">
                    <div className="max-w-[1400px] mx-auto flex justify-between">
                        <button
                            onClick={() => scroll('left')}
                            className="w-12 h-12 bg-white rounded-full shadow-2xl border border-gray-100 flex items-center justify-center text-[var(--coffee-brown)] hover:bg-[var(--coffee-brown)] hover:text-white transition-all pointer-events-auto -translate-x-1/2 opacity-0 group-hover/section:opacity-100"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-12 h-12 bg-white rounded-full shadow-2xl border border-gray-100 flex items-center justify-center text-[var(--coffee-brown)] hover:bg-[var(--coffee-brown)] hover:text-white transition-all pointer-events-auto translate-x-1/2 opacity-0 group-hover/section:opacity-100"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Testimonials List */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
                >
                    {displayReviews.map((testimonial, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 w-[300px] md:w-[400px] snap-center p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 flex flex-col justify-between group hover:bg-white hover:shadow-2xl hover:shadow-[var(--honey-gold)]/5 transition-all duration-500"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex text-[var(--honey-gold)] gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < testimonial.rating ? "currentColor" : "none"} className={i < testimonial.rating ? "" : "text-gray-200"} />
                                        ))}
                                    </div>
                                    <Quote size={32} className="text-gray-200 group-hover:text-[var(--honey-gold)]/20 transition-colors" />
                                </div>
                                <p className="text-lg md:text-xl font-serif text-[var(--coffee-brown)]/80 leading-relaxed italic mb-8 line-clamp-4">
                                    "{testimonial.text}"
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white shadow-inner flex items-center justify-center text-[var(--honey-gold)] border border-gray-100 font-bold overflow-hidden relative">
                                    {testimonial.avatar ? (
                                        <Image src={testimonial.avatar} alt={testimonial.name} fill className="object-cover" />
                                    ) : (
                                        testimonial.name.substring(0, 2).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[var(--coffee-brown)] text-sm mb-0.5">{testimonial.name}</h4>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                                        <span className="w-4 h-4 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                                            <Check size={10} strokeWidth={4} />
                                        </span>
                                        {testimonial.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Drag Indicator */}
                <div className="mt-4 flex justify-center lg:hidden">
                    <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--honey-gold)] w-1/3 animate-shimmer-pan"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

