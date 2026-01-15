"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Product {
    id: number;
    name: string;
    price: number;
    slug: string;
    image_url: string;
    category_name: string;
    category_slug: string;
    description?: string;
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
                setCategories([{ id: 0, name: 'All', slug: 'all' }, ...data.categories]);
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

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Header */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <Image
                    src="/images/coffee-beans.jpg"
                    alt="Shop Collection"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-20">
                    <span className="text-gray-300 text-sm font-bold uppercase tracking-[0.4em] mb-4">
                        Est. 2024
                    </span>
                    <h1 className="text-6xl md:text-8xl font-serif text-white mb-6">
                        The Atelier
                    </h1>
                    <p className="text-white/80 max-w-xl text-lg">
                        Curated Yemeni honey and coffee, sourced from heritage farms
                    </p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-wrap gap-4 justify-center mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`px-6 py-2 uppercase tracking-wider text-sm font-bold transition-all ${selectedCategory === cat.slug
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/shop/${product.slug}`}
                                className="group"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
                                    <Image
                                        src={product.image_url || '/images/honey-jar.jpg'}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-wider text-gray-500">
                                        {product.category_name}
                                    </p>
                                    <h3 className="font-serif text-xl text-black group-hover:text-gray-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-bold text-black">
                                            ${product.price}
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToCart(product);
                                            }}
                                            className="p-2 bg-black text-white hover:bg-gray-800 transition-colors"
                                        >
                                            <ShoppingBag size={18} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
