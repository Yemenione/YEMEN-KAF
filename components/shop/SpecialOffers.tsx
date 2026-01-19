import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string | number;
    images?: string; // JSON string
    slug: string;
}

export default function SpecialOffers() {
    const [offers, setOffers] = useState<Product[]>([]);
    const { t } = useLanguage();

    // Helper to extract main image from JSON
    const getMainImage = (product: Product): string => {
        try {
            if (!product.images) return '/images/honey-jar.jpg';

            // Check if it's already a clean URL (legacy/csv import support)
            if (product.images.startsWith('http') || product.images.startsWith('/')) {
                return product.images;
            }

            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
            }
        } catch {
            // Fallback for non-JSON strings
            if (product.images && (product.images.startsWith('http') || product.images.startsWith('/'))) {
                return product.images;
            }
        }
        return '/images/honey-jar.jpg';
    };

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                // Fetch 2 products to display as offers (offset 3 to avoid duplicates with Showcase)
                const res = await fetch('/api/products?limit=2&offset=3');
                if (res.ok) {
                    const data = await res.json();
                    setOffers(data.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch special offers:", error);
            }
        };

        fetchOffers();
    }, []);

    if (offers.length === 0) return null;

    return (
        <section className="py-24 bg-white border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="space-y-4">
                        <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold block">{t('home.offers.exclusive')}</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)]">{t('home.offers.title')}</h2>
                    </div>
                    <Link href="/shop" className="group flex items-center gap-2 text-[var(--coffee-brown)] border-b border-[var(--coffee-brown)] pb-1 hover:text-[var(--honey-gold)] transition-colors uppercase tracking-widest text-xs font-bold">
                        {t('home.offers.viewAll')} <ArrowRight size={16} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {offers.map((offer) => (
                        <Link key={offer.id} href={`/shop/${offer.slug}`} className="group relative block">
                            {/* Image Part */}
                            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 mb-8">
                                <Image
                                    src={getMainImage(offer)}
                                    alt={offer.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    loading="eager"
                                    priority
                                />
                                <div className="absolute top-0 start-0 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--coffee-brown)] z-10">
                                    {t('home.offers.limited')}
                                </div>
                            </div>

                            {/* Text Part */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="space-y-2">
                                    <h3 className="font-serif text-3xl text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors">{offer.name}</h3>
                                    <p className="text-[var(--coffee-brown)]/60 text-sm leading-relaxed line-clamp-2">{offer.description}</p>
                                </div>
                                <div className="text-end">
                                    <span className="block text-xl font-serif text-[var(--coffee-brown)]">€{Number(offer.price).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-6 w-full md:w-auto px-8 py-3 bg-[var(--coffee-brown)] text-white text-xs font-bold uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 hover:bg-[var(--coffee-brown)]/90">
                                {t('home.offers.shopBundle')}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
