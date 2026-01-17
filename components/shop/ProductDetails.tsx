"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Heart, Share2, Star, Check, Truck, Shield, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    images?: string;
    category_name: string;
    stock_quantity: number;
}

export default function ProductDetails({ product }: { product: Product }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addToCart } = useCart();
    const { t } = useLanguage();

    // Parse images from JSON string or use legacy/fallback
    const getImages = () => {
        if (!product.images) return ['/images/honey-jar.jpg'];
        try {
            // If raw URL (legacy or csv import)
            if (product.images.startsWith('http') || product.images.startsWith('/')) {
                return [product.images];
            }
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            // Failed to parse, maybe it's just a raw string?
            if (product.images.length > 0) return [product.images];
        }
        return ['/images/honey-jar.jpg'];
    };

    const images = getImages();

    return (
        <main className="min-h-screen bg-gray-50 pt-24">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-black transition-colors">{t('nav.home')}</Link>
                        <span>/</span>
                        <Link href="/shop" className="hover:text-black transition-colors">{t('nav.shop')}</Link>
                        <span>/</span>
                        <span className="text-black">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
                            <Image
                                src={images[selectedImage]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />

                            {/* Wishlist & Share */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                                    <Heart size={20} className="text-gray-700" />
                                </button>
                                <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                                    <Share2 size={20} className="text-gray-700" />
                                </button>
                            </div>

                            {/* Stock Badge */}
                            {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                                <div className="absolute top-4 left-4">
                                    <span className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                                        {t('shop.stockLimited')} - {product.stock_quantity} {t('product.stockRemaining')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        <div className="grid grid-cols-3 gap-4">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${selectedImage === idx
                                        ? 'ring-2 ring-black shadow-lg'
                                        : 'opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 25vw, 10vw" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        {/* Category */}
                        <div>
                            <Link href={`/shop?category=${product.category_name}`} className="inline-block px-4 py-1 bg-gray-100 text-gray-700 text-xs uppercase tracking-wider font-bold rounded-full hover:bg-gray-200 transition-colors">
                                {product.category_name}
                            </Link>
                        </div>

                        {/* Title & Rating */}
                        <div>
                            <h1 className="text-4xl md:text-5xl font-serif text-black mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">(4.8) • 127 {t('product.reviews')}</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="border-y border-gray-200 py-6">
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-bold text-black">
                                    {Number(product.price).toFixed(2)}€
                                </span>
                                <span className="text-gray-400 line-through text-xl">
                                    {(Number(product.price) * 1.3).toFixed(2)}€
                                </span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                                    -23%
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-sm max-w-none">
                            <p className="text-gray-600 leading-relaxed">
                                {product.description || t('product.defaultDescription')}
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                                    <Check size={20} className="text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t('product.authentic')}</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                    <Truck size={20} className="text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t('product.fastShipping')}</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                                    <Shield size={20} className="text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t('product.qualityGuaranteed')}</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
                                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                                    <Star size={20} className="text-orange-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t('product.premium')}</span>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 uppercase tracking-wider">{t('product.quantity')}</label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-6 py-3 hover:bg-gray-50 transition-colors font-bold text-lg"
                                    >
                                        −
                                    </button>
                                    <span className="px-8 py-3 font-bold text-lg border-x-2 border-gray-200">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-6 py-3 hover:bg-gray-50 transition-colors font-bold text-lg"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {product.stock_quantity} {t('product.inStock')}
                                </span>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={() => addToCart({
                                id: product.id,
                                title: product.name,
                                price: product.price,
                                image: images[0]
                            })}
                            className="w-full bg-black text-white py-5 rounded-lg uppercase tracking-wider font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                        >
                            <ShoppingBag size={24} />
                            {t('product.addToCart')}
                        </button>

                        {/* Back to Shop */}
                        <Link href="/shop" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">{t('shop.returnToShop')}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
