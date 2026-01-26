"use client";

import React, { useEffect, useState } from 'react';
import { useCompare } from '@/context/CompareContext';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, ArrowLeft, Check, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductDetails {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category_name: string;
    slug: string;
    average_rating: number;
    rating_count: number;
    stock_quantity: number;
    // Add other fields you want to compare
}

export default function ComparePage() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { t, locale, getLocalizedValue } = useLanguage();
    const { addToCart } = useCart();
    const [products, setProducts] = useState<ProductDetails[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (compareItems.length === 0) return;
            setIsLoading(true);
            try {
                const details = await Promise.all(
                    compareItems.map(async (item) => {
                        const res = await fetch(`/api/products/${item.id}`);
                        if (res.ok) {
                            const data = await res.json();
                            return data.product;
                        }
                        return null;
                    })
                );
                setProducts(details.filter(p => p !== null));
            } catch (error) {
                console.error("Failed to fetch products for comparison", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [compareItems]);

    if (compareItems.length === 0) {
        return (
            <div className="min-h-screen pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={32} className="text-gray-400" />
                </div>
                <h1 className="text-3xl font-bold mb-4">{t('shop.compareEmpty') || 'Your comparison is empty'}</h1>
                <p className="text-gray-500 mb-8 max-w-md">{t('shop.compareEmptyDesc') || 'Add at least two products to compare their features and find the perfect one for you.'}</p>
                <Link href="/shop" className="px-8 py-3 bg-black text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all">
                    {t('shop.returnToShop') || 'Back to Shop'}
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-32 lg:pt-40 pb-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                    <div>
                        <Link href="/shop" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-4 transition-colors">
                            <ArrowLeft size={16} className={locale === 'ar' ? 'rotate-180' : ''} />
                            {t('shop.returnToShop') || 'Back to Shop'}
                        </Link>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">{t('shop.compareProducts') || 'Compare Products'}</h1>
                    </div>
                    <button
                        onClick={clearCompare}
                        className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
                    >
                        {t('admin.common.delete') || 'Clear All'}
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className={`p-8 bg-gray-50/50 min-w-[200px] border-b border-gray-100 italic font-serif text-gray-400 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('product.features') || 'Features'}
                                    </th>
                                    {products.map((product) => (
                                        <th key={product.id} className="p-8 min-w-[250px] border-b border-l border-gray-100 relative group">
                                            <button
                                                onClick={() => removeFromCompare(product.id)}
                                                className={`absolute top-4 ${locale === 'ar' ? 'left-4' : 'right-4'} text-gray-400 hover:text-red-500 transition-colors`}
                                            >
                                                <X size={20} />
                                            </button>
                                            <div className="flex flex-col items-center text-center">
                                                <div className="relative w-32 h-32 mb-6 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm transition-transform group-hover:scale-105 duration-500">
                                                    <Image
                                                        src={product.image_url || '/images/honey-jar.jpg'}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <h3 className="text-lg font-bold line-clamp-2 mb-2">{getLocalizedValue(product, 'name')}</h3>
                                                <p className="text-[#E3C069] font-black text-xl mb-6">€{Number(product.price).toFixed(2)}</p>
                                                <button
                                                    onClick={() => addToCart({
                                                        id: product.id,
                                                        title: getLocalizedValue(product, 'name'),
                                                        price: Number(product.price),
                                                        image: product.image_url || '/images/honey-jar.jpg'
                                                    })}
                                                    className="w-full py-3 bg-black text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all shadow-md"
                                                >
                                                    {t('shop.addToCart') || 'Add to Cart'}
                                                </button>
                                            </div>
                                        </th>
                                    ))}
                                    {/* Empty slots */}
                                    {[...Array(Math.max(0, 3 - products.length))].map((_, i) => (
                                        <th key={`empty-th-${i}`} className="p-8 min-w-[250px] border-b border-l border-gray-100 bg-gray-50/30">
                                            <div className="flex flex-col items-center justify-center h-full opacity-20">
                                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                                                    <Check size={24} />
                                                </div>
                                                <p className="text-sm font-medium">Slot Empty</p>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Rating Row */}
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className={`p-6 font-bold text-sm text-gray-900 border-b border-gray-100 bg-gray-50/50 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('product.rating') || 'Rating'}
                                    </td>
                                    {products.map(product => (
                                        <td key={product.id} className="p-6 text-center border-b border-l border-gray-100">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-1 text-[#E3C069]">
                                                    <Star size={14} fill="currentColor" />
                                                    <span className="font-black text-black">{(product.average_rating || 0).toFixed(1)}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">({product.rating_count} {t('product.reviews')})</span>
                                            </div>
                                        </td>
                                    ))}
                                    {[...Array(Math.max(0, 3 - products.length))].map((_, i) => <td key={i} className="border-b border-l border-gray-100"></td>)}
                                </tr>

                                {/* Category Row */}
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className={`p-6 font-bold text-sm text-gray-900 border-b border-gray-100 bg-gray-50/50 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('shop.categories') || 'Category'}
                                    </td>
                                    {products.map(product => (
                                        <td key={product.id} className="p-6 text-center border-b border-l border-gray-100 font-medium text-gray-600">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] uppercase font-bold tracking-widest">
                                                {product.category_name}
                                            </span>
                                        </td>
                                    ))}
                                    {[...Array(Math.max(0, 3 - products.length))].map((_, i) => <td key={i} className="border-b border-l border-gray-100"></td>)}
                                </tr>

                                {/* Availability Row */}
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className={`p-6 font-bold text-sm text-gray-900 border-b border-gray-100 bg-gray-50/50 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('admin.common.status') || 'Availability'}
                                    </td>
                                    {products.map(product => (
                                        <td key={product.id} className="p-6 text-center border-b border-l border-gray-100">
                                            {product.stock_quantity > 0 ? (
                                                <span className="text-green-600 flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-widest">
                                                    <Check size={14} /> {t('product.inStock') || 'In Stock'}
                                                </span>
                                            ) : (
                                                <span className="text-red-500 text-xs font-bold uppercase tracking-widest">{t('product.outOfStock') || 'Out of Stock'}</span>
                                            )}
                                        </td>
                                    ))}
                                    {[...Array(Math.max(0, 3 - products.length))].map((_, i) => <td key={i} className="border-b border-l border-gray-100"></td>)}
                                </tr>

                                {/* Description Row */}
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className={`p-6 font-bold text-sm text-gray-900 border-b border-gray-100 bg-gray-50/50 align-top ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                        {t('product.description') || 'Description'}
                                    </td>
                                    {products.map(product => (
                                        <td key={product.id} className={`p-6 text-sm text-gray-500 border-b border-l border-gray-100 align-top leading-relaxed ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                            {getLocalizedValue(product, 'description') ? (
                                                <p className="line-clamp-6">{getLocalizedValue(product, 'description')}</p>
                                            ) : (
                                                <span className="italic">No description available.</span>
                                            )}
                                        </td>
                                    ))}
                                    {[...Array(Math.max(0, 3 - products.length))].map((_, i) => <td key={i} className="border-b border-l border-gray-100"></td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
