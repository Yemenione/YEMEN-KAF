import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string | number;
    images?: string | string[]; // Can be JSON string or array of URLs
    slug: string;
}

export default function BestSellers() {
    const [products, setProducts] = useState<Product[]>([]);
    const { t, locale } = useLanguage();
    const { settings } = useSettings();

    // Helper to extract main image from JSON or Array
    const getMainImage = (product: Product): string => {
        try {
            if (!product.images) return '/images/honey-jar.jpg';

            // If it's already an array, return the first item
            if (Array.isArray(product.images)) {
                return product.images.length > 0 ? product.images[0] : '/images/honey-jar.jpg';
            }

            // Check if it's already a clean URL (legacy/csv import support)
            if (typeof product.images === 'string' && (product.images.startsWith('http') || product.images.startsWith('/'))) {
                return product.images;
            }

            const parsed = JSON.parse(product.images as string);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
            }
        } catch {
            // Fallback for non-JSON strings
            if (typeof product.images === 'string' && (product.images.startsWith('http') || product.images.startsWith('/'))) {
                return product.images;
            }
        }
        return '/images/honey-jar.jpg';
    };

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                let url = `/api/products?limit=4&sort=featured&lang=${locale}`;

                if (settings && settings.homepage_best_sellers_ids) {
                    try {
                        const ids = JSON.parse(settings.homepage_best_sellers_ids);
                        if (Array.isArray(ids) && ids.length > 0) {
                            url = `/api/products?ids=${ids.join(',')}&lang=${locale}`;
                        }
                    } catch (e) {
                        console.error("Error parsing best sellers ids", e);
                    }
                }

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch best sellers:", error);
            }
        };

        fetchBestSellers();
    }, [locale, settings.homepage_best_sellers_ids]);

    if (products.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50 border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold flex items-center justify-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {t('home.bestSellers.badge')}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)] mt-4">
                        {t('home.bestSellers.title')}
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                        >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                <Image
                                    src={getMainImage(product)}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                                <div className="absolute top-2 start-2 flex flex-col gap-2">
                                    <div className="bg-[var(--honey-gold)] text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                                        <TrendingUp size={10} />
                                        {t('home.bestSellers.topSale')}
                                    </div>
                                    <div className="bg-orange-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                                        <span>🔥</span>
                                        TRENDING
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                <h3 className="font-serif text-lg text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors line-clamp-2">
                                    {product.name}
                                </h3>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                                    <span className="text-xl font-bold text-[var(--coffee-brown)]">
                                        €{Number(product.price).toFixed(2)}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {Math.floor(Math.random() * 50) + 10} SOLD THIS WEEK
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
