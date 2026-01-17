"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Star, Filter, Grid, List, Heart, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import WishlistButton from "@/components/shop/WishlistButton";
import ProductSkeleton from "@/components/shop/ProductSkeleton";

interface Product {
    id: number;
    name: string;
    price: number;
    slug: string;
    images?: string; // JSON string
    category_name: string;
    category_slug: string;
    description?: string;
    stock_quantity?: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function ShopPage() {
    const { t } = useLanguage();
    const { addToCart } = useCart();
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
            if (!product.images) return '/images/honey-jar.jpg';

            // Check if it's already a clean URL (legacy/csv import support)
            if (product.images.startsWith('http') || product.images.startsWith('/uploads')) {
                return product.images;
            }

            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed[0];
            }
        } catch (e) {
            // Fallback for non-JSON strings
            if (product.images && (product.images.startsWith('http') || product.images.startsWith('/'))) {
                return product.images;
            }
        }
        return '/images/honey-jar.jpg';
    };

    // Read URL query params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('search');
        const cat = params.get('category');
        if (cat) setSelectedCategory(cat);
        // If there's a search term, we could perhaps set it back to a search state,
        // but for now relying on fetchProducts sending the current URL params or derived state
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Debounce price filter
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [selectedCategory, sortBy, minPrice, maxPrice]); // Re-fetch on any filter change

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

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams(window.location.search);
            // If explicit category state is different from 'all', use state, else check URL
            // Actually, simpler to just use the state:
            if (selectedCategory !== 'all') {
                params.set('category', selectedCategory);
            } else {
                params.delete('category');
            }

            // Add sort and filter params
            params.set('sort', sortBy);
            if (minPrice) params.set('minPrice', minPrice);
            if (maxPrice) params.set('maxPrice', maxPrice);

            const res = await fetch(`/api/products?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products);
            }
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived state for display - no longer client-side sorting!
    const displayProducts = products;

    const displayCategories = [
        { id: 0, name: t('shop.allProducts'), slug: 'all' },
        ...categories
    ];

    return (
        <main className="min-h-screen bg-gray-50 pt-24">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters Bar - Shein Style */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 sticky top-0 z-10">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Categories */}
                        <div className="flex-1 w-full md:w-auto">
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
                    <div className="text-center py-20 bg-white rounded-lg">
                        <p className="text-gray-500 text-lg">{t('shop.noProducts')}</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                        : 'flex flex-col gap-4'
                    }>
                        {displayProducts.map((product) => (
                            <div
                                key={product.id}
                                className={`group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'
                                    }`}
                            >
                                <Link href={`/shop/${product.slug}`} className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'w-full'}>
                                    <div className={`relative overflow-hidden bg-gray-100 ${viewMode === 'list' ? 'h-full' : 'aspect-square'}`}>
                                        <Image
                                            src={getMainImage(product)}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />


                                        {/* Wishlist & Quick View */}
                                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <WishlistButton
                                                productId={product.id}
                                                className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
                                            />
                                            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                                                <Eye size={16} className="text-gray-700" />
                                            </button>
                                        </div>

                                        {/* Stock Badge */}
                                        {product.stock_quantity !== undefined && product.stock_quantity < 5 && product.stock_quantity > 0 && (
                                            <div className="absolute top-2 left-2">
                                                <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                                                    {t('shop.stockLimited')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <div className={`p-4 flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                    <Link href={`/shop/${product.slug}`}>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">
                                            {product.category_name}
                                        </span>
                                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                                        ))}
                                        <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div>
                                            <p className="text-xl font-bold text-black">
                                                {Number(product.price).toFixed(2)}€
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => addToCart({
                                                id: product.id,
                                                title: product.name,
                                                price: product.price,
                                                image: getMainImage(product)
                                            })}
                                            className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                                        >
                                            <ShoppingBag size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
