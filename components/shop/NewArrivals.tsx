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
    regular_price?: string;
    starting_price?: string;
    has_variants?: boolean;
    variant_count?: number;
    colors?: string[];
    images?: string | string[];
    slug: string;
    category_name?: string;
    category_translations?: any;
    created_at?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
}

import ProductCard from "./ProductCard";

export default function NewArrivals() {
    const [products, setProducts] = useState<Product[]>([]);
    const { t, getLocalizedValue } = useLanguage();

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

            const parsed = JSON.parse(product.images as string);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
            }
        } catch {
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

                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                    {products.map((product) => (
                        <Link key={product.id} href={`/shop/${product.slug}`} className="block">
                            <ProductCard
                                id={product.id}
                                title={getLocalizedValue(product, 'name')}
                                price={`€${Number(product.price).toFixed(2)}`}
                                startingPrice={product.starting_price}
                                compareAtPrice={`€${Number(product.regular_price).toFixed(2)}`}
                                image={getMainImage(product)}
                                category={getLocalizedValue({ name: product.category_name, translations: product.category_translations }, 'name') || t('home.newArrivals.newBadge')}
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
