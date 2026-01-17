"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, Search, User, ChevronDown, Globe, Heart } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import TopMarquee from "./TopMarquee";
import SearchWithSuggestions from "../search/SearchWithSuggestions";
import { useSettings } from "@/context/SettingsContext";

function LanguageSelector() {
    const { locale, setLocale } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const toggleLang = (l: "en" | "fr" | "ar") => {
        setLocale(l);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 hover:text-[var(--honey-gold)] transition-colors uppercase text-xs font-bold tracking-widest"
            >
                <Globe className="w-4 h-4" />
                <span>{locale}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full end-0 mt-2 bg-white border border-gray-100 shadow-xl rounded-none py-1 min-w-[100px] z-50 animate-fade-in">
                    <button onClick={() => toggleLang("en")} className="block w-full text-start px-4 py-2 text-xs hover:bg-gray-50 text-black">English</button>
                    <button onClick={() => toggleLang("fr")} className="block w-full text-start px-4 py-2 text-xs hover:bg-gray-50 text-black">Français</button>
                    <button onClick={() => toggleLang("ar")} className="block w-full text-end px-4 py-2 text-xs hover:bg-gray-50 text-black font-serif">العربية</button>
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [megaMenuItems, setMegaMenuItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchMegaMenuProducts = async () => {
            try {
                const res = await fetch('/api/products?limit=3');
                if (res.ok) {
                    const data = await res.json();
                    setMegaMenuItems(data.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch mega menu products:", error);
            }
        };
        fetchMegaMenuProducts();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const { openCart, items } = useCart();
    const { user, logout } = useAuth();
    const { wishlistCount, openWishlist } = useWishlist();
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const { settings } = useSettings();

    // Dynamic Text Color based on Scroll Key
    const textColorClass = "text-[var(--coffee-brown)]"; // Black
    const logoSrc = settings.logo_url || "/images/logo.png";

    const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
        <Link href={href} className={clsx("group relative text-xs uppercase tracking-[0.2em] font-bold transition-colors hover:text-[var(--honey-gold)]", textColorClass)}>
            {children}
            <span className="absolute -bottom-2 start-0 w-0 h-[2px] bg-[var(--coffee-brown)] transition-all duration-300 group-hover:w-full"></span>
        </Link>
    );

    // Search Logic (Handled by SearchWithSuggestions component now)
    const { t } = useLanguage();


    return (
        <>
            <header className="fixed top-0 start-0 end-0 z-50 flex flex-col transition-all duration-500">
                {/* Marquee sits on top */}
                <TopMarquee />

                <nav
                    className={clsx(
                        "w-full px-6 md:px-12 transition-all duration-500 ease-out border-b",
                        isScrolled
                            ? "bg-white/40 backdrop-blur-md py-2 shadow-sm border-black/5"
                            : "bg-transparent py-4 border-transparent"
                    )}
                    onMouseLeave={() => setIsMegaMenuOpen(false)}
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        {/* Left: Navigation (Desktop) */}
                        <div className="hidden md:flex items-center gap-8">
                            {settings.menu_main_nav ? (
                                JSON.parse(settings.menu_main_nav).map((item: any, idx: number) => (
                                    <NavLink key={idx} href={item.href}>{item.label}</NavLink>
                                ))
                            ) : (
                                <>
                                    <NavLink href="/our-story">{t("nav.ourStory")}</NavLink>
                                    <NavLink href="/the-farms">{t("nav.farms")}</NavLink>
                                </>
                            )}
                        </div>

                        {/* Center: Brand Logo */}
                        <Link href="/" className="relative z-50 group flex flex-col items-center">
                            <div className="relative w-8 h-8 mb-1">
                                <Image
                                    src={logoSrc}
                                    alt={`${settings.site_name} Logo`}
                                    fill
                                    className="object-contain"
                                    priority
                                    sizes="150px"
                                />
                            </div>
                            <span className={clsx("text-base font-serif tracking-widest uppercase transition-colors duration-300", textColorClass)}>
                                {settings.site_name}
                            </span>
                        </Link>

                        {/* Right: Actions */}
                        <div className={clsx("flex items-center gap-6", textColorClass)}>
                            {/* Mega Menu Trigger */}
                            <div
                                className="hidden md:block group relative h-full flex items-center cursor-pointer"
                                onMouseEnter={() => setIsMegaMenuOpen(true)}
                            >
                                <Link href="/shop" className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] font-bold hover:text-[var(--honey-gold)] transition-colors">
                                    {t("nav.shop")} <ChevronDown className={clsx("w-3 h-3 transition-transform duration-300", isMegaMenuOpen ? "rotate-180" : "")} />
                                </Link>
                            </div>

                            <div className="flex items-center gap-4 ps-6 border-s border-black/10">
                                <LanguageSelector />

                                {/* Search Input */}
                                <SearchWithSuggestions />

                                <Link
                                    href={user ? "/account" : "/login"}
                                    className="hover:text-[var(--honey-gold)] transition-transform hover:scale-110 duration-300 flex items-center justify-center"
                                    title={user ? `Account (${user.firstName})` : "Login"}
                                >
                                    {user ? (
                                        <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold uppercase">
                                            {user.firstName[0]}{user.lastName ? user.lastName[0] : ''}
                                        </div>
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                </Link>

                                <button
                                    onClick={openWishlist}
                                    className="hover:text-[var(--honey-gold)] transition-transform hover:scale-110 duration-300 relative"
                                    title="My Wishlist"
                                >
                                    <Heart className="w-5 h-5" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-2 -end-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--coffee-brown)] text-[10px] text-white font-bold">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </button>

                                <button onClick={openCart} className="relative hover:text-[var(--honey-gold)] transition-transform hover:scale-110 duration-300">
                                    <ShoppingBag className="w-5 h-5" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-2 -end-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--coffee-brown)] text-[10px] text-white font-bold">
                                            {itemCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mega Menu Dropdown */}
                    <div
                        className={clsx(
                            "absolute top-full start-0 w-full bg-white border-b border-black/5 shadow-xl overflow-hidden transition-all duration-500 ease-in-out z-40",
                            isMegaMenuOpen ? "max-h-[500px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
                        )}
                        onMouseEnter={() => setIsMegaMenuOpen(true)}
                        onMouseLeave={() => setIsMegaMenuOpen(false)}
                    >
                        <div className="max-w-7xl mx-auto px-12 py-12 grid grid-cols-4 gap-12">
                            {/* Collection Info */}
                            <div className="col-span-1 space-y-6 border-e border-black/5">
                                <h3 className="text-[var(--coffee-brown)] uppercase tracking-widest text-sm font-bold">{t('footer.collections')}</h3>
                                <ul className="space-y-4 text-[var(--coffee-brown)]/80 text-sm">
                                    <li><Link href="/shop?category=honey" className="hover:text-[var(--honey-gold)] transition-colors hover:ps-2 duration-300">{t('footer.honey')}</Link></li>
                                    <li><Link href="/shop?category=coffee" className="hover:text-[var(--honey-gold)] transition-colors hover:ps-2 duration-300">{t('footer.coffee')}</Link></li>
                                    <li><Link href="/shop?category=gifts" className="hover:text-[var(--honey-gold)] transition-colors hover:ps-2 duration-300">{t('footer.gifts')}</Link></li>
                                    <li><Link href="/shop?category=wholesale" className="hover:text-[var(--honey-gold)] transition-colors hover:ps-2 duration-300">{t('footer.wholesale')}</Link></li>
                                </ul>
                            </div>

                            {/* Products Grid */}
                            {megaMenuItems.length > 0 ? (
                                megaMenuItems.map((item) => {
                                    // Helper to extract main image
                                    let displayImage = '/images/honey-jar.jpg';
                                    try {
                                        if (item.images) {
                                            if (item.images.startsWith('http') || item.images.startsWith('/')) {
                                                displayImage = item.images;
                                            } else {
                                                const parsed = JSON.parse(item.images);
                                                if (Array.isArray(parsed) && parsed.length > 0) displayImage = parsed[0];
                                            }
                                        }
                                    } catch (e) {
                                        if (item.images) displayImage = item.images;
                                    }

                                    return (
                                        <Link key={item.id} href={`/shop/${item.slug}`} className="group col-span-1 block" onClick={() => setIsMegaMenuOpen(false)}>
                                            <div className="relative aspect-square overflow-hidden bg-gray-50 mb-4">
                                                <Image
                                                    src={displayImage}
                                                    alt={item.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="space-y-1 text-center">
                                                <h4 className="font-serif text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors line-clamp-1">{item.name}</h4>
                                                <span className="text-xs font-bold text-[var(--honey-gold)] uppercase tracking-widest">{Number(item.price).toFixed(2)}€</span>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="col-span-3 text-center text-gray-400 py-10">
                                    <p>{t('shop.loading')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={clsx(
                "fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center space-y-8 transition-all duration-500",
                isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
            )}>
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-8 end-8 text-black hover:rotate-90 transition-transform duration-300"
                >
                    <X size={32} />
                </button>

                <nav className="flex flex-col items-center space-y-6 text-center">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif text-black hover:text-[var(--honey-gold)]">{t("home.hero.title")}</Link>
                    <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif text-black hover:text-[var(--honey-gold)]">{t("nav.shop")}</Link>
                    <Link href="/our-story" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif text-black hover:text-[var(--honey-gold)]">{t("nav.ourStory")}</Link>
                    <Link href="/the-farms" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif text-black hover:text-[var(--honey-gold)]">{t("nav.farms")}</Link>

                    <div className="w-12 h-[1px] bg-black/10 my-4" />

                    {user ? (
                        <>
                            <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest font-bold text-black hover:text-[var(--honey-gold)]">{t('nav.account')}</Link>
                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="text-sm uppercase tracking-widest font-bold text-red-500 hover:text-red-700 pt-4"
                            >
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest font-bold text-black hover:text-[var(--honey-gold)]">{t('nav.login')}</Link>
                    )}
                </nav>
            </div>
        </>
    );
}
