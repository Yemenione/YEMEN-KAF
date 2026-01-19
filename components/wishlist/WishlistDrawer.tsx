"use client";

import { X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";

interface WishlistItem {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: string[];
}

export default function WishlistDrawer() {
    const { wishlistIds, isOpen, closeWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && wishlistIds.length > 0) {
            fetchWishlistItems();
        } else if (wishlistIds.length === 0) {
            setItems([]);
        }
    }, [isOpen, wishlistIds]);

    const fetchWishlistItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/wishlist');
            if (res.ok) {
                const data = await res.json();
                // Parse images for each product
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const parsedItems = (data.wishlist || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    price: parseFloat(item.price),
                    images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : []
                }));
                setItems(parsedItems);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (item: WishlistItem) => {
        addToCart({
            id: item.id,
            title: item.name,
            price: item.price,
            image: item.images[0] || "/images/placeholder.jpg"
        });
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={closeWishlist}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-serif text-black">My Wishlist</h2>
                    <button
                        onClick={closeWishlist}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <ShoppingBag className="text-gray-400" size={32} />
                            </div>
                            <p className="text-gray-500 mb-2">Your wishlist is empty</p>
                            <p className="text-sm text-gray-400 mb-6">Add items you love to save them for later</p>
                            <Link
                                href="/shop"
                                onClick={closeWishlist}
                                className="inline-block px-6 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-900 transition-all rounded-xl"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <Link
                                        href={`/shop/${item.slug}`}
                                        onClick={closeWishlist}
                                        className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0"
                                    >
                                        {item.images && item.images.length > 0 ? (
                                            <Image
                                                src={item.images[0]}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200" />
                                        )}
                                    </Link>

                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/shop/${item.slug}`}
                                            onClick={closeWishlist}
                                            className="font-semibold text-black hover:text-[var(--honey-gold)] transition-colors line-clamp-2"
                                        >
                                            {item.name}
                                        </Link>
                                        <p className="text-lg font-bold text-[var(--honey-gold)] mt-1">
                                            €{item.price.toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className="mt-2 text-xs font-bold uppercase tracking-wider text-black hover:text-[var(--honey-gold)] transition-colors flex items-center gap-1"
                                        >
                                            <ShoppingBag size={14} />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-gray-200 p-6 space-y-4">
                        <Link
                            href="/account/wishlist"
                            onClick={closeWishlist}
                            className="block w-full py-4 bg-black text-white text-center font-bold uppercase tracking-widest hover:bg-gray-900 transition-all rounded-xl"
                        >
                            View Full Wishlist
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
