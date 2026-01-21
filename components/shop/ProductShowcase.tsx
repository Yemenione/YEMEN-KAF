import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

interface Product {
    id: number;
    name: string;
    description: string;
    price: string | number;
    images?: string | string[]; // Can be JSON string or array of URLs
    slug: string;
    category_name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category_translations?: Record<string, any>;
}

export default function ProductShowcase() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
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

            const parsed = JSON.parse(product.images);
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
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products?limit=12');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div className="w-full py-32 bg-white text-center">{t('shop.loading')}</div>;
    }

    return (
        <section className="w-full py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="text-gray-400 uppercase tracking-[0.4em] text-xs font-semibold block mb-4">{t('home.showcase.curated')}</span>
                        <h2 className="text-4xl md:text-6xl font-serif text-black leading-tight">{t('home.showcase.title')}</h2>
                    </div>

                    <button className="hidden md:inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium border-b border-black pb-1 hover:text-gray-600 transition-colors">
                        {t('home.showcase.viewAll')}
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <Link key={product.id} href={`/shop/${product.slug}`} className="block">
                                <ProductCard
                                    id={product.id}
                                    title={getLocalizedValue(product, 'name')}
                                    price={`€${Number(product.price).toFixed(2)}`}
                                    image={getMainImage(product)}
                                    category={getLocalizedValue({ name: product.category_name, translations: product.category_translations }, 'name') || 'Collection'}
                                />
                            </Link>
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-400">{t('shop.noProducts')}</p>
                    )}
                </div>

                <div className="mt-16 text-center md:hidden">
                    <button className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium border-b border-black pb-1">
                        {t('home.showcase.viewAll')}
                    </button>
                </div>
            </div>
        </section>
    );
}
