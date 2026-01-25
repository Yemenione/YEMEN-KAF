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
        name: `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.trim() || t('home.testimonials.client'),
        location: r.isVerified ? t('home.testimonials.verifiedPurchase') : t('home.testimonials.verifiedClient'),
        text: r.comment || '',
        rating: r.rating,
        avatar: r.patient?.avatar || undefined
    })) : fallbackTestimonials;

    // Mock distribution data
    const distribution = { 5: 90, 4: 6, 3: 2, 2: 1, 1: 1 };

    return (
        <section className="py-12 bg-gray-50 text-[var(--coffee-brown)]">
            <div className="max-w-md mx-auto md:max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

                {/* Header / Summary */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {/* Score */}
                            <div className="text-center">
                                <span className="block text-5xl font-black text-[var(--coffee-brown)]">4.9</span>
                                <div className="flex text-[var(--honey-gold)] text-xs mt-1 justify-center">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">124 {t('reviews.count') || 'avis'}</span>
                            </div>
                        </div>

                        {/* Progress Bars */}
                        <div className="flex-1 max-w-[200px] space-y-1">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-2 text-[10px] text-gray-400">
                                    <span className="w-2">{star}</span>
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#D4AF37] rounded-full"
                                            style={{ width: `${distribution[star as keyof typeof distribution]}%` }}
                                        />
                                    </div>
                                    <span className="w-6 text-right">{distribution[star as keyof typeof distribution]}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full bg-black hover:bg-[var(--coffee-brown)] text-white font-bold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mb-6 uppercase tracking-widest text-xs">
                        <Quote size={16} />
                        {t('reviews.write') || "ÉCRIRE UN AVIS"}
                    </button>

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['Tous', 'Avec photos', 'Plus récents'].map((filter, i) => (
                            <button
                                key={i}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-colors ${i === 0
                                    ? 'bg-black border-black text-white'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="divide-y divide-gray-100 bg-white">
                    {displayReviews.map((review, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                            {/* User Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 text-[var(--coffee-brown)] flex items-center justify-center font-bold text-sm">
                                        {review.avatar ? (
                                            <Image src={review.avatar} alt={review.name} fill className="object-cover rounded-full" />
                                        ) : (
                                            review.name.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-sm text-[var(--coffee-brown)]">{review.name}</h4>
                                            <span className="text-[10px] text-gray-400">Il y a 2 jours</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-[#D4AF37] font-bold mt-0.5">
                                            <span className="w-3 h-3 rounded-full bg-[#F9F6F1] flex items-center justify-center">✓</span>
                                            {review.location} {/* Using location as verified status text from fallback */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stars */}
                            <div className="flex text-[var(--honey-gold)] mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-200"} />
                                ))}
                            </div>

                            {/* Comment */}
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                {review.text}
                            </p>

                            {/* Images (Mockup style - assuming review might have images later, hardcoding placeholder for visual match) */}
                            {index === 0 && ( /* Only for first review to match mockup example */
                                <div className="flex gap-2 mt-4">
                                    {['honey-jar.jpg', 'coffee-beans.jpg', 'yemen-heritage.jpg'].map((img, i) => (
                                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <Image
                                                src={`/images/${img}`}
                                                alt="Review"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer Link */}
                <div className="p-4 border-t border-gray-100 text-center">
                    <button className="text-[var(--coffee-brown)] text-sm font-bold uppercase tracking-wider hover:text-black hover:underline transition-colors">
                        {t('reviews.viewAll') || "Voir tous les avis"}
                    </button>
                </div>
            </div>
        </section>
    );
}
