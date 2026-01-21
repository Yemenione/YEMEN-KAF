"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, User, ChevronDown, Globe, Heart } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import TopMarquee from "./TopMarquee";
import SearchWithSuggestions from "../search/SearchWithSuggestions";
import { useSettings } from "@/context/SettingsContext";

function LanguageSelector() {
    const { locale, setLocale, isRTL } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const toggleLang = (l: "en" | "fr" | "ar") => {
        setLocale(l);
        setIsOpen(false);
    };

    return (
        <div className="relative group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 hover:text-[var(--honey-gold)] transition-colors uppercase text-[11px] font-bold tracking-widest py-2"
            >
                <Globe className="w-3.5 h-3.5" />
                <span>{locale}</span>
                <ChevronDown className={clsx("w-3 h-3 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
            </button>

            <div className={clsx(
                "absolute top-full mt-0 pt-2 min-w-[140px] z-50 transition-all duration-300 transform origin-top",
                isOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible",
                isRTL ? "start-0" : "end-0" // Align based on direction
            )}>
                <div className="bg-white border border-black/5 shadow-xl rounded-sm overflow-hidden py-1">
                    <button onClick={() => toggleLang("en")} className={clsx("w-full text-start px-4 py-2.5 text-xs hover:bg-gray-50 flex items-center justify-between group/item", locale === 'en' ? "font-bold text-[var(--coffee-brown)]" : "text-gray-500")}>
                        <span>English</span>
                        {locale === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--honey-gold)]"></span>}
                    </button>
                    <button onClick={() => toggleLang("fr")} className={clsx("w-full text-start px-4 py-2.5 text-xs hover:bg-gray-50 flex items-center justify-between group/item", locale === 'fr' ? "font-bold text-[var(--coffee-brown)]" : "text-gray-500")}>
                        <span>Français</span>
                        {locale === 'fr' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--honey-gold)]"></span>}
                    </button>
                    <button onClick={() => toggleLang("ar")} className={clsx("w-full text-end px-4 py-2.5 text-xs hover:bg-gray-50 flex items-center justify-between group/item font-serif", locale === 'ar' ? "font-bold text-[var(--coffee-brown)]" : "text-gray-500")}>
                        <span>العربية</span>
                        {locale === 'ar' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--honey-gold)]"></span>}
                    </button>
                </div>
            </div>
        </div>
    );
}

const NavLink = ({ href, children, isScrolled, isRTL }: { href: string; children: React.ReactNode; isScrolled: boolean; isRTL: boolean }) => (
    <Link href={href} className={clsx(
        "group relative text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium transition-colors py-2",
        isScrolled ? "text-[var(--coffee-brown)] hover:text-[var(--honey-gold)]" : "text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] md:text-black md:hover:text-[var(--honey-gold)]"
    )}>
        {children}
        <span className={clsx(
            "absolute bottom-2 h-[2px] bg-[var(--honey-gold)] transition-all duration-300 opacity-0 group-hover:opacity-100",
            isRTL ? "end-0 w-0 group-hover:w-full" : "start-0 w-0 group-hover:w-full"
        )}></span>
    </Link>
);

interface MegaMenuProduct {
    id: number;
    name: string;
    slug: string;
    price: number | string;
    images?: string | string[]; // Can be JSON string or array of URLs
}

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [megaMenuItems, setMegaMenuItems] = useState<MegaMenuProduct[]>([]);

    const { openCart, items } = useCart();
    const { user, logout } = useAuth();
    const { wishlistCount, openWishlist } = useWishlist();
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const { settings } = useSettings();
    const { t, isRTL, locale } = useLanguage();

    const [categories, setCategories] = useState<{ id: number; name: string; slug: string; }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products
                const resProducts = await fetch(`/api/products?limit=3&lang=${locale}`);
                if (resProducts.ok) {
                    const data = await resProducts.json();
                    setMegaMenuItems(data.products || []);
                }

                // Fetch Categories
                const resCats = await fetch(`/api/categories?lang=${locale}`);
                if (resCats.ok) {
                    const data = await resCats.json();
                    setCategories(data.categories || []);
                }
            } catch {
                console.error("Failed to fetch nav data");
            }
        };
        fetchData();
    }, [locale]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const logoSrc = settings.logo_url || "/images/logo.png";

    // NavLink definition moved outside


    return (
        <>
            <header className={clsx(
                "fixed top-0 start-0 end-0 z-50 flex flex-col transition-all duration-300",
                isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-0 border-b border-black/5" : "bg-transparent py-2"
            )}>
                {/* Top Level: Marquee - Only show at top? Or always? Let's hide on scroll to save space if requested compact */}
                <div className={clsx("transition-all duration-300", isScrolled ? "h-0 opacity-0 overflow-hidden" : "h-auto opacity-100")}>
                    <TopMarquee />
                </div>

                {/* Main Navbar */}
                <nav className="relative z-50 w-full">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
                        <div className={clsx(
                            "flex items-center justify-between transition-all duration-300",
                            isScrolled ? "h-16" : "h-20"
                        )}>

                            {/* LEFT: Logo */}
                            <div className="flex-shrink-0 flex items-center gap-8">
                                <Link href="/" className="relative block">
                                    <div className="relative w-10 h-10 md:w-12 md:h-12 transition-all duration-300">
                                        <Image
                                            src={logoSrc}
                                            alt={`${settings.site_name} Logo`}
                                            fill
                                            className="object-contain"
                                            priority
                                            sizes="48px"
                                        />
                                    </div>
                                </Link>

                                {/* DESKTOP NAV LINKS (Moved next to Logo) */}
                                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                                    <NavLink href="/" isScrolled={isScrolled} isRTL={isRTL}>{t("nav.home") || "Home"}</NavLink>

                                    <div
                                        className="group relative h-full flex items-center"
                                        onMouseEnter={() => setIsMegaMenuOpen(true)}
                                        onMouseLeave={() => setIsMegaMenuOpen(false)}
                                    >
                                        <Link
                                            href="/shop"
                                            className={clsx(
                                                "flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors py-2",
                                                isScrolled ? "text-[var(--coffee-brown)] hover:text-[var(--honey-gold)]" : "text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] md:text-black md:hover:text-[var(--honey-gold)]"
                                            )}
                                        >
                                            {t("nav.shop")}
                                            <ChevronDown className={clsx("w-3 h-3 transition-transform duration-300", isMegaMenuOpen ? "rotate-180" : "")} />
                                        </Link>
                                    </div>

                                    <NavLink href="/our-story" isScrolled={isScrolled} isRTL={isRTL}>{t("nav.ourStory")}</NavLink>
                                    <NavLink href="/the-farms" isScrolled={isScrolled} isRTL={isRTL}>{t("nav.farms")}</NavLink>
                                    <NavLink href="/contact" isScrolled={isScrolled} isRTL={isRTL}>Contact</NavLink>
                                </div>
                            </div>

                            {/* RIGHT: Actions */}
                            <div className="flex items-center justify-end gap-3 md:gap-5 text-[var(--coffee-brown)]">
                                <div className="hidden md:block">
                                    <LanguageSelector />
                                </div>
                                <div className="hidden md:block w-px h-3 bg-gray-300 mx-1"></div>
                                <div className="hidden md:block">
                                    <SearchWithSuggestions />
                                </div>

                                <Link
                                    href={user ? "/account" : "/login"}
                                    className="hidden md:flex hover:text-[var(--honey-gold)] transition-transform hover:scale-105 duration-300"
                                >
                                    <User className="w-5 h-5 stroke-1.5" />
                                </Link>

                                <button
                                    onClick={openWishlist}
                                    className="hidden md:block hover:text-[var(--honey-gold)] transition-transform hover:scale-110 duration-300 relative"
                                    title="Wishlist"
                                >
                                    <Heart className="w-5 h-5 stroke-1.5" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1.5 -end-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--honey-gold)] text-[9px] text-white font-bold animate-zoom-in">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={openCart}
                                    className="hover:text-[var(--honey-gold)] transition-transform hover:scale-110 duration-300 relative"
                                    title="Cart"
                                >
                                    <ShoppingBag className="w-5 h-5 stroke-1.5" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-1.5 -end-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--coffee-brown)] text-[9px] text-white font-bold animate-zoom-in">
                                            {itemCount}
                                        </span>
                                    )}
                                </button>

                                {/* Mobile Menu Trigger (Right side on mobile) */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="md:hidden p-1 text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors"
                                >
                                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* MEGA MENU DROPDOWN */}
                    <div
                        className={clsx(
                            "absolute top-full start-0 w-full bg-white border-b border-black/5 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out z-40",
                            isMegaMenuOpen ? "max-h-[500px] opacity-100 visible translate-y-0" : "max-h-0 opacity-0 invisible -translate-y-2"
                        )}
                        onMouseEnter={() => setIsMegaMenuOpen(true)}
                        onMouseLeave={() => setIsMegaMenuOpen(false)}
                    >
                        <div className="max-w-7xl mx-auto px-12 py-12 grid grid-cols-4 gap-12">
                            {/* Column 1: Categories */}
                            <div className="col-span-1 space-y-6 md:border-e border-black/5 pe-8">
                                <h3 className="font-serif text-lg text-[var(--coffee-brown)]">{t('footer.collections')}</h3>
                                <div className="w-10 h-0.5 bg-[var(--honey-gold)]"></div>
                                <ul className="space-y-3.5 text-sm">
                                    <li><Link href="/shop" className="block text-gray-500 hover:text-[var(--coffee-brown)] hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-300">{t("nav.shopAll") || "Shop All"}</Link></li>
                                    {categories.map((cat) => (
                                        <li key={cat.id}>
                                            <Link href={`/shop?category=${cat.id}`} className="block text-gray-500 hover:text-[var(--coffee-brown)] hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-300">
                                                {cat.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Columns 2-4: Products Feature */}
                            {megaMenuItems.length > 0 ? (
                                megaMenuItems.map((item) => {
                                    let displayImage = '/images/honey-jar.jpg';
                                    try {
                                        if (item.images) {
                                            if (Array.isArray(item.images)) {
                                                displayImage = item.images.length > 0 ? item.images[0] : '/images/honey-jar.jpg';
                                            } else if (typeof item.images === 'string') {
                                                if (item.images.startsWith('http') || item.images.startsWith('/')) {
                                                    displayImage = item.images;
                                                } else {
                                                    const parsed = JSON.parse(item.images);
                                                    if (Array.isArray(parsed) && parsed.length > 0) displayImage = parsed[0];
                                                }
                                            }
                                        }
                                    } catch {
                                        if (typeof item.images === 'string' && item.images.length > 0) displayImage = item.images;
                                    }

                                    // Final safety check to avoid passing empty string to Next Image
                                    if (!displayImage) displayImage = '/images/honey-jar.jpg';

                                    return (
                                        <Link key={item.id} href={`/shop/${item.slug}`} className="group col-span-1 block text-center" onClick={() => setIsMegaMenuOpen(false)}>
                                            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50 mb-4 rounded-sm">
                                                <Image
                                                    src={displayImage}
                                                    alt={item.name}
                                                    fill
                                                    sizes="(max-width: 1200px) 25vw, 20vw"
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <h4 className="font-serif text-[var(--coffee-brown)] text-lg leading-tight group-hover:text-[var(--honey-gold)] transition-colors line-clamp-1">{item.name}</h4>
                                                <div className="w-6 h-px bg-gray-200 mx-auto group-hover:w-16 group-hover:bg-[var(--honey-gold)] transition-all duration-500"></div>
                                                <span className="block text-xs font-bold text-[var(--coffee-brown)] uppercase tracking-widest">{Number(item.price).toFixed(2)}€</span>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="col-span-3 text-center text-gray-400 py-10 flex items-center justify-center">
                                    <p>{t('shop.loading')}</p>
                                </div>
                            )}                        </div>

                        {/* MOBILE SEARCH BAR - Persistent (Amazon/Shein Style) */}
                        <div className="md:hidden pb-4 px-6 scale-95 origin-top transition-all duration-300">
                            <SearchWithSuggestions isFullWidth />
                        </div>
                    </div>
                </nav>
            </header>

            {/* MOBILE MENU OVERLAY */}
            <div className={clsx(
                "fixed inset-0 bg-white z-[60] flex flex-col transition-all duration-500",
                isMobileMenuOpen ? "opacity-100 translate-x-0" : clsx("opacity-0 pointer-events-none", isRTL ? "translate-x-full" : "-translate-x-full")
            )}>
                <div className="flex items-center justify-between p-6 border-b border-black/5">
                    <span className="font-serif text-2xl text-[var(--coffee-brown)]">{t("nav.menu") || "Menu"}</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-black hover:bg-gray-100 hover:rotate-90 transition-all duration-300"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                    <LanguageSelector />

                    <nav className="flex flex-col space-y-4">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">{t("nav.home")}</Link>
                        <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">{t("nav.shop")}</Link>
                        <Link href="/our-story" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">{t("nav.ourStory")}</Link>
                        <Link href="/the-farms" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">{t("nav.farms")}</Link>
                        <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-serif text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">Contact</Link>
                    </nav>

                    <div className="w-full h-px bg-gray-100 my-2" />

                    <div className="space-y-4">
                        {user ? (
                            <>
                                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-sm uppercase tracking-widest font-bold text-[var(--coffee-brown)]">
                                    <User size={16} /> {t('nav.account')}
                                </Link>
                                <button
                                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                    className="flex items-center gap-3 text-sm uppercase tracking-widest font-bold text-red-500"
                                >
                                    {t('nav.logout')}
                                </button>
                            </>
                        ) : (
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-sm uppercase tracking-widest font-bold text-[var(--coffee-brown)]">
                                <User size={16} /> {t('nav.login')}
                            </Link>
                        )}
                        <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-sm uppercase tracking-widest font-bold text-[var(--coffee-brown)]">
                            <Heart size={16} /> Wishlist
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
