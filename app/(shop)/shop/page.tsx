"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Filter, Grid, List } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductSkeleton from "@/components/shop/ProductSkeleton";
import CategoryRail from "@/components/shop/CategoryRail";
import ProductCard from "@/components/shop/ProductCard";
import { useSearchParams } from "next/navigation";

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

// ... (imports remain)
import { Suspense } from "react";

// ... (interfaces remain)

function ShopContent() {
    const { t, locale, getLocalizedValue } = useLanguage();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { addToCart } = useCart();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // Helper to extract main image from JSON
    const getMainImage = (product: Product): string => {
        try {
            const images = product.images;
            if (!images) return '/images/honey-jar.jpg';

            // If it's already an array
            if (Array.isArray(images)) {
                return images[0] || '/images/honey-jar.jpg';
            }

            // If it's not a string, we can't do much
            if (typeof images !== 'string') return '/images/honey-jar.jpg';

            // Check if it's already a clean URL (legacy/csv import support)
            if (images.startsWith('http') || images.startsWith('/uploads') || images.startsWith('/')) {
                return images;
            }

            const parsed = JSON.parse(images);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
            }
            if (typeof parsed === 'string') return parsed;
        } catch {
            if (typeof product.images === 'string') {
                if (product.images.startsWith('http') || product.images.startsWith('/')) {
                    return product.images;
                }
            }
        }
        return '/images/honey-jar.jpg';
    };

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            // const currentParams = new URLSearchParams(searchParams.toString());

            const params: Record<string, string | number> = {
                per_page: 20,
                // locale needs to be accessed from hook
                lang: locale || 'en'
            };

            if (selectedCategory !== 'all') {
                params.category = selectedCategory; // Woo uses ID or slug depending on setup, usually ID
            }

            // Maps sort options
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

            // Call internal API which wraps Woo Client
            const res = await fetch(`/api/products?${new URLSearchParams(params as Record<string, string>).toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, sortBy, minPrice, maxPrice, locale]);

    // Read URL query params on mount or change
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);
        else setSelectedCategory('all');
    }, [searchParams]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.categories || []);
                }
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        };

        fetchCategories();
    }, []);

    // Debounce price filter
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchProducts]); // Re-fetch on any filter change

    // Derived state for display - no longer client-side sorting!
    const displayProducts = products;

    const displayCategories = [
        { id: 0, name: t('shop.allProducts'), slug: 'all' },
        ...categories
    ];

    return (
        <main className="min-h-screen bg-gray-50 pt-32 lg:pt-40 pb-20 lg:pb-0"> {/* Increased padding for header separation */}
            <CategoryRail />
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters Bar - Shein Style */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-0 z-10"> {/* Removed hidden lg:block to allow Sort/Price on mobile */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Categories - Hidden as we now use CategoryRail */}
                        <div className="hidden">
                            <div className="flex items-center gap-2 mb-2">
                                <Filter size={16} className="text-gray-400" />
                                <span className="text-xs font-semibold text-gray-500 uppercase">{t('shop.categories')}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {displayCategories.slice(0, 6).map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.slug)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.slug
                                            ? 'bg-black text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort & View */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            {/* Price Inputs */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder={t('shop.minPrice')}
                                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="number"
                                    placeholder={t('shop.maxPrice')}
                                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="newest">{t('shop.newest')}</option>
                                    <option value="price-low">{t('shop.priceLow')}</option>
                                    <option value="price-high">{t('shop.priceHigh')}</option>
                                    <option value="name-asc">{t('shop.nameAZ')}</option>
                                    <option value="name-desc">{t('shop.nameZA')}</option>
                                </select>

                                <div className="flex gap-2 border border-gray-200 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400'}`}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-400'}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                {!isLoading && (
                    <div className="mb-6">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">{displayProducts.length}</span> {t('shop.productsFound')}
                        </p>
                    </div>
                )}

                {/* Products Grid/List */}
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
                                    image={getMainImage(product)}
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

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-40 flex justify-center"><p>Loading...</p></div>}>
            <ShopContent />
        </Suspense>
    );
}
