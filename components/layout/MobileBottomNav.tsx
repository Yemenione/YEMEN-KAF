"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, User, Search, Menu } from "lucide-react";
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
            icon: Search // Using Search icon for Shop/Discover as is common
        },
        {
            name: t('nav.wishlist') || 'Wishlist',
            href: '/account/wishlist',
            icon: Heart,
            count: wishlistCount
        },
        {
            name: t('nav.cart') || 'Cart',
            action: openCart, // Custom action for cart
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-[9999] lg:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item, idx) => {
                    const isActive = item.href ? pathname === item.href : false;
                    const Icon = item.icon;

                    return (
                        <button
                            key={idx}
                            onClick={item.action ? item.action : undefined}
                            className="relative flex-1 h-full flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                        >
                            {/* Link Wrapper if it's a link */}
                            {item.href ? (
                                <Link href={item.href} className="flex flex-col items-center w-full h-full justify-center">
                                    <div className="relative">
                                        <Icon
                                            size={20}
                                            className={clsx(
                                                "transition-colors",
                                                isActive ? "text-[var(--honey-gold)] fill-current" : "text-gray-400"
                                            )}
                                        />
                                        {item.count ? (
                                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">
                                                {item.count}
                                            </span>
                                        ) : null}
                                    </div>
                                    <span className={clsx(
                                        "text-[9px] font-medium tracking-wide uppercase transition-colors",
                                        isActive ? "text-[var(--honey-gold)]" : "text-gray-500"
                                    )}>
                                        {item.name}
                                    </span>
                                </Link>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Icon
                                            size={20}
                                            className={clsx(
                                                "transition-colors",
                                                isActive ? "text-[var(--honey-gold)]" : "text-gray-400"
                                            )}
                                        />
                                        {item.count ? (
                                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">
                                                {item.count}
                                            </span>
                                        ) : null}
                                    </div>
                                    <span className={clsx(
                                        "text-[9px] font-medium tracking-wide uppercase transition-colors",
                                        isActive ? "text-[var(--honey-gold)]" : "text-gray-500"
                                    )}>
                                        {item.name}
                                    </span>
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
