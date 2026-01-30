"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Grid, List } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductSkeleton from "@/components/shop/ProductSkeleton";
import CategoryRail from "@/components/shop/CategoryRail";
import ProductCard from "@/components/shop/ProductCard";
import { useSearchParams } from "next/navigation";
import { getMainImage } from "@/lib/image-utils";
import { Suspense } from "react";

interface Product {
    id: number;
    name: string;
    price: number;
    regular_price?: number;
    starting_price?: number;
    has_variants?: boolean;
    variant_count?: number;
    colors?: string[];
    slug: string;
    images?: string; // JSON string
    category_name: string;
    category_slug: string;
    description?: string;
    stock_quantity?: number;
    compare_at_price?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category_translations?: any;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
}

function ShopContent({ initialProducts, initialCategories }: { initialProducts: Product[], initialCategories: Category[] }) {
    const { t, locale, getLocalizedValue } = useLanguage();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { addToCart } = useCart();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [categories] = useState<Category[]>(initialCategories);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const fetchProducts = useCallback(async () => {
        // Skip first load if we have initial products and no active filters
        if (isFirstLoad && selectedCategory === 'all' && sortBy === 'newest' && !minPrice && !maxPrice) {
            setIsFirstLoad(false);
            return;
        }

        setIsLoading(true);
        try {
            const params: Record<string, string | number> = {
                per_page: 20,
                lang: locale || 'en'
            };

            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }

            if (sortBy === 'price-low') {
                params.orderby = 'price';
                params.order = 'asc';
            } else if (sortBy === 'price-high') {
                params.orderby = 'price';
                params.order = 'desc';
            } else if (sortBy === 'name-asc') {
                params.orderby = 'title';
                params.order = 'asc';
            } else if (sortBy === 'name-desc') {
                params.orderby = 'title';
                params.order = 'desc';
            } else {
                params.orderby = 'date';
                params.order = 'desc';
            }

            if (minPrice) params.min_price = minPrice;
            if (maxPrice) params.max_price = maxPrice;

            const res = await fetch(`/api/products?${new URLSearchParams(params as Record<string, string>).toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setIsLoading(false);
            setIsFirstLoad(false);
        }
    }, [selectedCategory, sortBy, minPrice, maxPrice, locale, isFirstLoad]);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);
        else setSelectedCategory('all');
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const displayProducts = products;

    return (
        <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-20 lg:pb-0">
            <CategoryRail />
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white/80 backdrop-blur-md border border-black/5 rounded-2xl p-4 mb-8 sticky top-[120px] lg:top-[160px] z-30 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            {/* Price Range */}
                            <div className="flex items-center bg-gray-50/50 rounded-xl p-1 border border-gray-100">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Min</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-24 pl-10 pr-3 py-2 bg-transparent text-sm font-medium focus:outline-none"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                </div>
                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Max</span>
                                    <input
                                        type="number"
                                        placeholder="500"
                                        className="w-24 pl-10 pr-3 py-2 bg-transparent text-sm font-medium focus:outline-none"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Sort & View */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none transition-all hover:bg-white hover:border-black/10"
                                    >
                                        <option value="newest">{t('shop.newest')}</option>
                                        <option value="price-low">{t('shop.priceLow')}</option>
                                        <option value="price-high">{t('shop.priceHigh')}</option>
                                        <option value="name-asc">{t('shop.nameAZ')}</option>
                                        <option value="name-desc">{t('shop.nameZA')}</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </div>
                                </div>

                                <div className="flex bg-gray-50/50 border border-gray-100 rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-black text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-black text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {!isLoading && (
                    <div className="mb-6">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">{displayProducts.length}</span> {t('shop.productsFound')}
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : displayProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg flex flex-col items-center justify-center">
                        <ShoppingBag size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{t('shop.noProducts') || 'No products found'}</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">We couldn&apos;t find any products matching your filters. Try adjusting your search or category.</p>
                        <button
                            onClick={() => {
                                setSelectedCategory('all');
                                setMinPrice("");
                                setMaxPrice("");
                                setSortBy('newest');
                            }}
                            className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'
                        : 'flex flex-col gap-4'
                    }>
                        {displayProducts.map((product) => (
                            <Link key={product.id} href={`/shop/${product.slug}`} className="block">
                                <ProductCard
                                    id={product.id}
                                    title={getLocalizedValue(product, 'name')}
                                    price={`€${Number(product.price).toFixed(2)}`}
                                    startingPrice={product.starting_price?.toString()}
                                    compareAtPrice={`€${Number(product.regular_price || product.compare_at_price).toFixed(2)}`}
                                    image={getMainImage(product.images)}
                                    category={getLocalizedValue({ name: product.category_name, translations: product.category_translations }, 'name') || 'Collection'}
                                    colors={product.colors}
                                    hasVariants={product.has_variants}
                                    variantCount={product.variant_count}
                                    layout={viewMode}
                                />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default function ShopClient({ initialProducts, initialCategories }: { initialProducts: Product[], initialCategories: Category[] }) {
    return (
        <Suspense fallback={<div className="min-h-screen pt-40 flex justify-center"><p>Loading...</p></div>}>
            <ShopContent initialProducts={initialProducts} initialCategories={initialCategories} />
        </Suspense>
    );
}
