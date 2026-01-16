"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface WishlistItem {
    id: number;
    name: string;
    description: string;
    price: string | number;
    image_url: string;
    slug: string;
}

export default function WishlistPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        async function fetchWishlist() {
            if (!isAuthenticated) return;
            try {
                const res = await fetch('/api/wishlist');
                if (res.ok) {
                    const data = await res.json();
                    setWishlist(data.wishlist || []);
                }
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            } finally {
                setFetching(false);
            }
        }
        fetchWishlist();
    }, [isAuthenticated]);

    const removeFromWishlist = async (productId: number) => {
        try {
            const res = await fetch(`/api/wishlist?productId=${productId}`, { method: 'DELETE' });
            if (res.ok) {
                setWishlist((prev) => prev.filter((item) => item.id !== productId));
            }
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    if (isLoading || fetching) {
        return (
            <div className="min-h-screen bg-[var(--cream-white)] pt-32 pb-20 px-6 flex items-center justify-center">
                <p>{t('wishlist.loading')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--cream-white)] pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-serif text-[var(--coffee-brown)] mb-2">{t('wishlist.title')}</h1>
                <p className="text-gray-500 mb-12">{t('wishlist.subtitle')}</p>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-400 mb-6">{t('wishlist.empty')}</p>
                        <Link href="/shop" className="px-8 py-3 bg-[var(--coffee-brown)] text-white text-sm uppercase tracking-widest hover:bg-[var(--coffee-brown)]/90 transition-colors">
                            {t('cart.continueShopping')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {wishlist.map((item) => (
                            <div key={item.id} className="group relative bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <Link href={`/shop/${item.slug}`} className="block relative aspect-square w-full mb-4 overflow-hidden bg-gray-100 rounded-md">
                                    <Image
                                        src={item.image_url || '/images/honey-jar.jpg'}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </Link>

                                <div className="flex justify-between items-start">
                                    <div>
                                        <Link href={`/shop/${item.slug}`}>
                                            <h3 className="font-serif text-lg text-[var(--coffee-brown)] hover:underline decoration-1 underline-offset-4 mb-1">
                                                {item.name}
                                            </h3>
                                        </Link>
                                        <p className="text-sm font-medium bg-[var(--honey-gold)]/10 text-[var(--honey-gold)] inline-block px-2 py-0.5 rounded">
                                            {Number(item.price).toFixed(2)}€
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title={t('account.form.delete')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
