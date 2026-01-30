"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { History } from "lucide-react";
import { getMainImage } from "@/lib/image-utils";

interface Product {
    id: number;
    name: string;
    price: string | number;
    images?: string | string[];
    slug: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
}

export default function RecentlyViewed() {
    const [products, setProducts] = useState<Product[]>([]);
    const { t, locale, getLocalizedValue } = useLanguage();

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            try {
                const stored = localStorage.getItem('recentlyViewed');
                if (!stored) return;

                const slugs = JSON.parse(stored);
                if (!Array.isArray(slugs) || slugs.length === 0) return;

                // Fetch details for these slugs
                const res = await fetch(`/api/products/batch?slugs=${slugs.join(',')}&lang=${locale}`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch recently viewed:", error);
            }
        };

        fetchRecentlyViewed();
    }, [locale]);

    if (products.length === 0) return null;

    return (
        <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <History className="text-[var(--honey-gold)] w-6 h-6" />
                        <h2 className="text-2xl md:text-3xl font-serif text-[var(--coffee-brown)]">
                            {t('home.recentlyViewed.title') || "Vu récemment"}
                        </h2>
                    </div>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="flex-shrink-0 w-[140px] md:w-[200px] group"
                        >
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4 border border-gray-100 group-hover:border-[var(--honey-gold)] transition-all">
                                <Image
                                    src={getMainImage(product.images)}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="200px"
                                />
                            </div>
                            <h3 className="font-serif text-base text-[var(--coffee-brown)] line-clamp-1 group-hover:text-[var(--honey-gold)] transition-colors">
                                {getLocalizedValue(product, 'name')}
                            </h3>
                            <p className="text-sm font-bold text-gray-900 mt-1">{Number(product.price).toFixed(2)}€</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
