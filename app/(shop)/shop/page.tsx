"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Star, Filter, Grid, List, Heart, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import WishlistButton from "@/components/shop/WishlistButton";

interface Product {
    id: number;
    name: string;
    price: number;
    slug: string;
    image_url: string;
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

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories([{ id: 0, name: 'Tous les produits', slug: 'all' }, ...data.categories]);
            }
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const url = selectedCategory === 'all'
                ? '/api/products'
                : `/api/products?category=${selectedCategory}`;
            const res = await fetch(url);
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

    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return Number(a.price) - Number(b.price);
            case 'price-high':
                return Number(b.price) - Number(a.price);
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

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
                                {categories.slice(0, 6).map((cat) => (
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
                        <div className="flex items-center gap-4">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="newest">{t('shop.newest')}</option>
                                <option value="price-low">{t('shop.priceLow')}</option>
                                <option value="price-high">{t('shop.priceHigh')}</option>
                                <option value="name">{t('shop.nameAZ')}</option>
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

                {/* Results Count */}
                {!isLoading && (
                    <div className="mb-6">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">{sortedProducts.length}</span> {t('shop.productsFound')}
                        </p>
                    </div>
                )}

                {/* Products Grid/List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">{t('shop.loading')}</p>
                        </div>
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg">
                        <p className="text-gray-500 text-lg">{t('shop.noProducts')}</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                        : 'flex flex-col gap-4'
                    }>
                        {sortedProducts.map((product) => (
                            <div
                                key={product.id}
                                className={`group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'
                                    }`}
                            >
                                <Link href={`/shop/${product.slug}`} className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'w-full'}>
                                    <div className={`relative overflow-hidden bg-gray-100 ${viewMode === 'list' ? 'h-full' : 'aspect-square'}`}>
                                        <Image
                                            src={product.image_url || '/images/honey-jar.jpg'}
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
                                                image: product.image_url || '/images/honey-jar.jpg'
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
