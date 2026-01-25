import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string | number;
    regular_price?: string;
    starting_price?: string;
    has_variants?: boolean;
    variant_count?: number;
    colors?: string[];
    images?: string | string[];
    slug: string;
    category_name?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category_translations?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
}

import ProductCard from "./ProductCard";

export default function BestSellers() {
    const [products, setProducts] = useState<Product[]>([]);
    const { t, locale, getLocalizedValue } = useLanguage();
    const { settings } = useSettings();

    // Helper to extract main image from JSON or Array
    const getMainImage = (product: Product): string => {
        try {
            if (!product.images) return '/images/honey-jar.jpg';

            if (Array.isArray(product.images)) {
                return product.images.length > 0 ? product.images[0] : '/images/honey-jar.jpg';
            }

            if (typeof product.images === 'string' && (product.images.startsWith('http') || product.images.startsWith('/'))) {
                return product.images;
            }

            return parsed[0] || '/images/honey-jar.jpg';
        } catch {
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
    }, [locale, settings, settings.homepage_best_sellers_ids]);

    if (products.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50/50 border-t border-black/5">
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-10">
                    {products.map((product) => (
                        <Link key={product.id} href={`/shop/${product.slug}`} className="block">
                            <ProductCard
                                id={product.id}
                                title={getLocalizedValue(product, 'name')}
                                price={`€${Number(product.price).toFixed(2)}`}
                                startingPrice={product.starting_price}
                                compareAtPrice={`€${Number(product.regular_price).toFixed(2)}`}
                                image={getMainImage(product)}
                                category={getLocalizedValue({ name: product.category_name, translations: product.category_translations }, 'name') || t('home.bestSellers.topSale')}
                                colors={product.colors}
                                hasVariants={product.has_variants}
                                variantCount={product.variant_count}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
