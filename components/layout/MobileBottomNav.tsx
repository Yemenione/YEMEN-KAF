"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, User, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import clsx from "clsx";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { items, openCart } = useCart();
    const { wishlistCount } = useWishlist();
    const { t } = useLanguage();

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const navItems = [
        {
            name: t('nav.home') || 'Home',
            href: '/',
            icon: Home
        },
        {
            name: t('nav.shop') || 'Shop',
            href: '/shop',
            icon: Search
        },
        {
            name: t('nav.wishlist') || 'Wishlist',
            href: '/account/wishlist',
            icon: Heart,
            count: wishlistCount
        },
        {
            name: t('nav.cart') || 'Cart',
            action: openCart,
            icon: ShoppingBag,
            count: itemCount
        },
        {
            name: t('nav.account') || 'Account',
            href: '/account',
            icon: User
        }
    ];

    return (
        <div className="fixed bottom-6 left-4 right-4 z-[99999] lg:hidden animate-in slide-in-from-bottom-4 duration-700">
            <div className="bg-[#1A1A1A] backdrop-blur-md rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 px-6 h-[72px] flex items-center justify-between">
                {navItems.map((item, idx) => {
                    const isActive = item.href ? pathname === item.href : false;
                    const Icon = item.icon;

                    return (
                        <button
                            key={idx}
                            onClick={item.action ? item.action : undefined}
                            className="relative flex flex-col items-center justify-center group"
                        >
                            {/* Glow Effect for Active */}
                            {isActive && (
                                <div className="absolute inset-0 bg-[var(--honey-gold)] opacity-20 blur-xl rounded-full" />
                            )}

                            {item.href ? (
                                <Link href={item.href} className="flex flex-col items-center justify-center w-12 h-12">
                                    <Icon
                                        size={24}
                                        fill={isActive ? "currentColor" : "none"}
                                        className={clsx(
                                            "transition-all duration-300",
                                            isActive ? "text-[var(--honey-gold)] scale-110" : "text-gray-400 group-hover:text-white"
                                        )}
                                    />
                                    {item.count ? (
                                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-[#1A1A1A]">
                                            {item.count}
                                        </span>
                                    ) : null}
                                </Link>
                            ) : (
                                <div className="flex flex-col items-center justify-center w-12 h-12">
                                    <Icon
                                        size={24}
                                        fill={isActive ? "currentColor" : "none"}
                                        className={clsx(
                                            "transition-all duration-300",
                                            isActive ? "text-[var(--honey-gold)] scale-110" : "text-gray-400 group-hover:text-white"
                                        )}
                                    />
                                    {item.count ? (
                                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-[#1A1A1A]">
                                            {item.count}
                                        </span>
                                    ) : null}
                                </div>
                            )}

                            {/* Small dot below active item */}
                            {isActive && (
                                <span className="absolute -bottom-1 w-1 h-1 bg-[var(--honey-gold)] rounded-full"></span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
