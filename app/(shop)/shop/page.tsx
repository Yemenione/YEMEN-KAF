"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ArrowRight, ShoppingBag, Star } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";

// Mock Data
const PRODUCTS = [
    { id: 1, title: "Royal Sidr Honey", price: 180, category: "honey", image: "/images/honey-jar.jpg", slug: "royal-sidr-honey", rating: 5, reviews: 124 },
    { id: 2, title: "Haraz Mocha Beans", price: 45, category: "coffee", image: "/images/coffee-beans.jpg", slug: "haraz-mocha-beans", rating: 4.8, reviews: 89 },
    { id: 3, title: "Wild Mountain Comb", price: 220, category: "honey", image: "/images/honey-comb.jpg", slug: "wild-mountain-comb", rating: 5, reviews: 56 },
    { id: 4, title: "Do'an White Honey", price: 160, category: "honey", image: "/images/honey-jar.jpg", slug: "doan-white-honey", rating: 4.9, reviews: 42 },
    { id: 5, title: "Qishr (Coffee Cherry)", price: 35, category: "coffee", image: "/images/coffee-beans.jpg", slug: "qishr-cherry", rating: 4.7, reviews: 31 },
    { id: 6, title: "Heritage Gift Box", price: 250, category: "gifts", image: "/images/honey-comb.jpg", slug: "heritage-box", rating: 5, reviews: 15 },
];

const CATEGORIES = ["All", "Honey", "Coffee", "Gifts"];

export default function ShopPage() {
    const { t } = useLanguage();
    const { addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredProducts = selectedCategory === "All"
        ? PRODUCTS
        : PRODUCTS.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

    return (
        <main className="min-h-screen bg-white">

            {/* Cinematic Hero Header - Matches Navbar Aesthetic */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <Image
                    src="/images/coffee-beans.jpg" // Using an existing image as hero logic
                    alt="Shop Collection"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" /> {/* Dark Overlay for text contrast */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-20">
                    <span className="text-[var(--honey-gold)] text-sm font-bold uppercase tracking-[0.4em] mb-4 animate-fade-in">
                        Est. 2024
                    </span>
                    <h1 className="text-6xl md:text-8xl font-serif text-white mb-6 animate-fade-in-up">
                        The Atelier
                    </h1>
                    <p className="text-white/80 text-lg font-light max-w-xl mx-auto leading-relaxed animate-fade-in-up delay-100">
                        A curated selection of the world's rarest natural luxuries, harvested with reverence and packaged with elegance.
                    </p>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="sticky top-[80px] z-30 bg-white/95 backdrop-blur-md border-b border-black/5 py-4 px-6 md:px-12 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Minimal Text Filters */}
                    <div className="flex items-center gap-8 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 justify-center md:justify-start no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={clsx(
                                    "text-xs uppercase tracking-[0.2em] transition-all relative py-2 whitespace-nowrap",
                                    selectedCategory === cat
                                        ? "text-[var(--coffee-brown)] font-bold"
                                        : "text-[var(--coffee-brown)]/40 hover:text-[var(--coffee-brown)]"
                                )}
                            >
                                {cat}
                                {/* Active Indicator Dot */}
                                {selectedCategory === cat && (
                                    <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--coffee-brown)] rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Count */}
                    <div className="hidden md:block text-[10px] uppercase tracking-widest text-[var(--coffee-brown)]/40">
                        {filteredProducts.length} Products Found
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                {/* Product Grid - "Gallery Style" */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="group flex flex-col gap-4">

                            {/* Image Card */}
                            <Link href={`/shop/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-gray-100 block">
                                <Image
                                    src={product.image}
                                    alt={product.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                />
                                {/* Status Badge */}
                                {product.category === 'honey' && (
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-[var(--coffee-brown)]">
                                        Rare
                                    </div>
                                )}

                                {/* Quick Add Button Floating */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addToCart({
                                            id: product.id,
                                            title: product.title,
                                            price: product.price,
                                            image: product.image
                                        });
                                    }}
                                    className="absolute bottom-6 right-6 w-12 h-12 bg-white flex items-center justify-center text-[var(--coffee-brown)] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[var(--coffee-brown)] hover:text-white shadow-xl rounded-full z-10"
                                    title="Add to Cart"
                                >
                                    <ShoppingBag size={18} />
                                </button>
                            </Link>

                            {/* Product Info */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-start">
                                    <Link href={`/shop/${product.slug}`}>
                                        <h3 className="font-serif text-2xl text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors cursor-pointer">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <span className="text-lg font-medium text-[var(--coffee-brown)]">${product.price}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <div className="flex text-[var(--honey-gold)]">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "" : "text-gray-300"} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider ml-2">({product.reviews} Reviews)</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center text-[var(--coffee-brown)]/40">
                        <p className="text-2xl font-serif italic mb-4">Collection empty.</p>
                        <button onClick={() => setSelectedCategory("All")} className="text-xs uppercase tracking-widest border-b border-[var(--coffee-brown)]/20 pb-1 hover:text-[var(--coffee-brown)]">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
