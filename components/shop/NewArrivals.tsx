import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string | number;
    images?: string | string[]; // Can be JSON string or array of URLs
    slug: string;
    created_at?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
}

export default function NewArrivals() {
    const [products, setProducts] = useState<Product[]>([]);
    const { t, getLocalizedValue } = useLanguage();

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
        const fetchNewArrivals = async () => {
            try {
                const res = await fetch('/api/products?limit=6&sort=newest');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch new arrivals:", error);
            }
        };

        fetchNewArrivals();
    }, []);

    if (products.length === 0) return null;

    return (
        <section className="py-20 bg-white border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {t('home.newArrivals.badge')}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)] mt-4">
                        {t('home.newArrivals.title')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="group bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-[var(--honey-gold)] transition-all duration-500 hover:shadow-xl"
                        >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                <Image
                                    src={getMainImage(product)}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute top-3 start-3 bg-green-500 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md shadow-lg">
                                    {t('home.newArrivals.newBadge')}
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                <h3 className="font-serif text-2xl text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors line-clamp-2">
                                    {getLocalizedValue(product, 'name')}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {getLocalizedValue(product, 'description')}
                                </p>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <span className="text-2xl font-bold text-[var(--coffee-brown)]">
                                        €{Number(product.price).toFixed(2)}
                                    </span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                                        {t('home.newArrivals.shopNow')}
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
