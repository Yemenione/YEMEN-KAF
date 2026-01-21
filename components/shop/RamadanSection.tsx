'use client';

import { useSettings } from "@/context/SettingsContext";
import { useEffect, useState } from "react";
import { Moon, Star } from "lucide-react";
// ProductCard removed as it was unused
import { getRamadanProducts } from "@/app/actions/ramadan";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: string;
    images: string[];
    slug: string;
    category?: {
        name: string;
    } | null;
}

export default function RamadanSection() {
    const { settings, loading: settingsLoading } = useSettings();
    const [products, setProducts] = useState<Product[]>([]);
    // loading state removed as it was unused in render
    const { t } = useLanguage();

    const isRamadanEnabled = settings.ramadan_mode_enabled === 'true';

    useEffect(() => {
        const fetchProducts = async () => {
            if (!isRamadanEnabled || !settings.ramadan_product_ids) return;

            try {
                const ids = JSON.parse(settings.ramadan_product_ids);
                if (Array.isArray(ids) && ids.length > 0) {
                    const data = await getRamadanProducts(ids);
                    setProducts(data);
                }
            } catch (e) {
                console.error("Error parsing ramadan product IDs or fetching:", e);
            }
        };

        if (!settingsLoading) {
            fetchProducts();
        }
    }, [settings.ramadan_product_ids, isRamadanEnabled, settingsLoading]);

    if (settingsLoading || !isRamadanEnabled) return null;
    if (!products || products.length === 0) return null;

    // Helper to get image (duplicated for safety)
    const getMainImage = (product: Product): string => {
        if (product.images && product.images.length > 0) {
            return product.images[0];
        }
        return '/images/placeholder.jpg';
    };

    return (
        <section className="relative w-full py-24 overflow-hidden bg-[#FCF9F5]">
            {/* Background Pattern - Arabian Geometric (Subtle) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>

            {/* Decorative Crescent Moon (Watermark) */}
            <div className="absolute -left-20 top-0 opacity-10 select-none pointer-events-none">
                <Moon size={400} className="text-[#cfb160] rotate-12" />
            </div>

            {/* Hanging Lanterns (CSS Animation potential) */}
            <div className="absolute top-0 right-10 md:right-32 flex gap-8 pointer-events-none z-10">
                {/* Lantern 1 */}
                <div className="flex flex-col items-center animate-bounce-slow" style={{ animationDuration: '4s' }}>
                    <div className="w-[1px] h-20 bg-[#cfb160]"></div>
                    <div className="w-12 h-16 bg-[url('/images/lantern-gold.png')] bg-contain bg-no-repeat drop-shadow-md relative">
                        {/* Fallback Lantern Shape if image missing */}
                        <div className="w-full h-full border-2 border-[#cfb160] rounded-b-xl rounded-t-sm flex items-center justify-center bg-[#FCF9F5]/80 backdrop-blur-sm">
                            <div className="w-2 h-4 bg-yellow-400 rounded-full blur-[2px] animate-pulse"></div>
                        </div>
                    </div>
                </div>
                {/* Lantern 2 (Smaller) */}
                <div className="flex flex-col items-center animate-bounce-slow mt-8" style={{ animationDuration: '6s' }}>
                    <div className="w-[1px] h-32 bg-[#cfb160]"></div>
                    <div className="w-8 h-12 bg-[url('/images/lantern-gold.png')] bg-contain bg-no-repeat drop-shadow-md relative">
                        <div className="w-full h-full border-2 border-[#cfb160] rounded-b-xl rounded-t-sm flex items-center justify-center bg-[#FCF9F5]/80 backdrop-blur-sm">
                            <div className="w-1.5 h-3 bg-yellow-400 rounded-full blur-[2px] animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 z-10">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center justify-center gap-3 text-[#cfb160] mb-2">
                        <span className="h-[1px] w-8 bg-[#cfb160]"></span>
                        <Star className="w-4 h-4 fill-current animate-spin-slow" />
                        <span className="h-[1px] w-8 bg-[#cfb160]"></span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-serif text-[#3e2723] leading-tight">
                        {settings.ramadan_title || t('ramadan.title')}
                    </h2>

                    <p className="text-[#5d4037] max-w-2xl mx-auto text-lg italic font-light tracking-wide">
                        {settings.ramadan_subtitle || t('ramadan.subtitle')}
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {products.map((product) => (
                        <div key={product.id} className="relative group">
                            <Link href={`/shop/${product.slug}`} className="block h-full">
                                <div className="relative h-full bg-white rounded-t-full rounded-b-2xl overflow-hidden border border-[#cfb160]/30 group-hover:border-[#cfb160] transition-all duration-500 shadow-sm group-hover:shadow-[0_10px_40px_-10px_rgba(207,177,96,0.3)] flex flex-col group-hover:-translate-y-2">
                                    {/* Image Container - Arch Shape */}
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#FCF9F5] to-white p-6">
                                        {/* Premium Badge */}
                                        <div className="absolute top-4 left-0 right-0 flex justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <span className="bg-[#cfb160] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-md">
                                                {t('ramadan.premium') || "Premium"}
                                            </span>
                                        </div>

                                        <div className="w-full h-full relative">
                                            <div className="relative w-full h-full">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={getMainImage(product)}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-xl transition-all duration-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 pt-2 flex-1 flex flex-col items-center text-center border-t border-[#cfb160]/10">
                                        <h3 className="text-[#3e2723] font-serif text-lg leading-snug mb-1 group-hover:text-[#cfb160] transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <div className="mt-auto pt-3 flex flex-col items-center gap-2 w-full">
                                            <span className="text-xl font-bold text-[#cfb160]">
                                                {Number(product.price).toFixed(2)}€
                                            </span>
                                            <div className="h-[2px] w-0 group-hover:w-16 bg-[#cfb160] transition-all duration-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
