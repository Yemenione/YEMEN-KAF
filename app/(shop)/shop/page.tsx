"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Star, Filter } from "lucide-react";
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

    return (
        <main className="min-h-screen bg-white">
            {/* Elegant Hero Header */}
            <div className="relative h-[50vh] w-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src="/images/coffee-beans.jpg"
                        alt="Shop Collection"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 tracking-tight">
                        Notre Collection
                    </h1>
                    <p className="text-white/80 max-w-2xl text-lg font-light">
                        Découvrez nos produits yéménites authentiques, soigneusement sélectionnés
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Category Filter - Premium Design */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Filter size={20} className="text-gray-400" />
                        <h2 className="text-sm uppercase tracking-wider text-gray-500 font-bold">
                            Catégories
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.slug)}
                                className={`
                                    px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
                                    ${selectedCategory === cat.slug
                                        ? 'bg-black text-white shadow-lg scale-105'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                                    }
                                `}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Count */}
                {!isLoading && (
                    <div className="mb-8 pb-4 border-b border-gray-100">
                        <p className="text-sm text-gray-500">
                            {products.length} {products.length === 1 ? 'produit' : 'produits'}
                        </p>
                    </div>
                )}

                {/* Products Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">Chargement des produits...</p>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">Aucun produit trouvé dans cette catégorie</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="group relative bg-white rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500"
                            >
                                <Link href={`/shop/${product.slug}`}>
                                    {/* Product Image */}
                                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                                        <Image
                                            src={product.image_url || '/images/honey-jar.jpg'}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />

                                        {/* Category Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs uppercase tracking-wider text-gray-700 font-bold rounded-full">
                                                {product.category_name}
                                            </span>
                                        </div>

                                        {/* Quick Add Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(product);
                                                }}
                                                className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 rounded-full"
                                            >
                                                <ShoppingBag size={18} />
                                                Ajouter
                                            </button>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-5 space-y-3">
                                        <h3 className="font-serif text-lg text-black group-hover:text-gray-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                                            {product.name}
                                        </h3>

                                        {product.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-2">
                                            <p className="text-2xl font-bold text-black">
                                                {product.price.toFixed(2)}€
                                            </p>

                                            {/* Rating Stars */}
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className="fill-yellow-400 text-yellow-400"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
