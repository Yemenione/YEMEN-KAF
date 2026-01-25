"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Zap, ArrowRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface Product {
    id: number;
    name: string;
    price: string | number;
    regular_price?: string | number;
    starting_price?: string | number;
    has_variants?: boolean;
    variant_count?: number;
    colors?: string[];
    compare_at_price?: string | number;
    images?: string | string[];
    slug: string;
    category_name?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category_translations?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
}

import ProductCard from "./ProductCard";

export default function FlashSale() {
    const [products, setProducts] = useState<Product[]>([]);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const { t, locale, getLocalizedValue } = useLanguage();
    const { settings } = useSettings();

    // Helper for main image (reusing logic for safety)
    const getMainImage = (product: Product): string => {
        try {
            if (!product.images) return '/images/honey-jar.jpg';
            if (Array.isArray(product.images)) return product.images[0] || '/images/honey-jar.jpg';
            if (typeof product.images === 'string' && (product.images.startsWith('http') || product.images.startsWith('/'))) return product.images;
            const parsed = JSON.parse(product.images as string);
            return (Array.isArray(parsed) && parsed.length > 0) ? parsed[0] : '/images/honey-jar.jpg';
        } catch {
            return '/images/honey-jar.jpg';
        }
    };

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            let endOfPeriod = new Date();

            if (settings.homepage_flash_sale_end_date) {
                endOfPeriod = new Date(settings.homepage_flash_sale_end_date);
            } else {
                endOfPeriod.setHours(23, 59, 59, 999);
            }

            const diff = endOfPeriod.getTime() - now.getTime();
            if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

            return {
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / 1000 / 60) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            };
        };

        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [settings.homepage_flash_sale_end_date]);

    useEffect(() => {
        const fetchFlashSales = async () => {
            try {
                let url = `/api/products?limit=4&sort=discounted&lang=${locale}`;

                if (settings.homepage_flash_sale_product_ids) {
                    const ids = JSON.parse(settings.homepage_flash_sale_product_ids);
                    if (Array.isArray(ids) && ids.length > 0) {
                        url = `/api/products?ids=${ids.join(',')}&lang=${locale}`;
                    }
                }

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch flash sales:", error);
            }
        };
        fetchFlashSales();
    }, [locale, settings.homepage_flash_sale_product_ids]);

    if (products.length === 0) return null;

    return (
        <section className="py-16 bg-red-50/30 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 end-0 w-64 h-64 bg-red-100/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-full text-white animate-pulse">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-tight">
                                {t('home.flashSale.title') || "Offre Flash du Jour"}
                            </h2>
                            <p className="text-sm text-red-600 font-bold uppercase tracking-widest animate-pulse">
                                {settings.homepage_flash_sale_ends_soon_text || t('home.flashSale.endsSoon') || "Dépêchez-vous, le temps presse !"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-red-100">
                        <Clock size={20} className="text-red-600" />
                        <div className="flex gap-2 text-2xl font-mono font-black text-red-700">
                            <div className="bg-red-50 px-2 py-1 rounded-lg">{String(timeLeft.hours).padStart(2, '0')}</div>
                            <span className="self-center">:</span>
                            <div className="bg-red-50 px-2 py-1 rounded-lg">{String(timeLeft.minutes).padStart(2, '0')}</div>
                            <span className="self-center">:</span>
                            <div className="bg-red-50 px-2 py-1 rounded-lg">{String(timeLeft.seconds).padStart(2, '0')}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="space-y-4">
                            <Link href={`/shop/${product.slug}`} className="block">
                                <ProductCard
                                    id={product.id}
                                    title={getLocalizedValue(product, 'name')}
                                    price={`€${Number(product.price).toFixed(2)}`}
                                    startingPrice={product.starting_price?.toString()}
                                    compareAtPrice={`€${Number(product.compare_at_price || product.regular_price).toFixed(2)}`}
                                    image={getMainImage(product)}
                                    category={getLocalizedValue({ name: product.category_name, translations: product.category_translations }, 'name') || "Flash Sale"}
                                    colors={product.colors}
                                    hasVariants={product.has_variants}
                                    variantCount={product.variant_count}
                                />
                            </Link>
                            {/* Flash Sale Progress Bar */}
                            <div className="px-1">
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-red-600 h-full w-[70%] animate-pulse" />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-tighter">
                                    70% {t('home.flashSale.sold') || "VENDU"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-full font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200">
                        {t('home.offers.viewAll')} <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
