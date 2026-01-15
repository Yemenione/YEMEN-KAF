"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, Search, User, ChevronDown, Globe } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import TopMarquee from "./TopMarquee";

const MEGA_MENU_ITEMS = [
    { title: "Royal Sidr Honey", price: "$180.00", image: "/images/honey-jar.jpg", slug: "royal-sidr-honey" },
    { title: "Haraz Mocha Beans", price: "$45.00", image: "/images/coffee-beans.jpg", slug: "haraz-mocha-beans" },
    { title: "Wild Mountain Comb", price: "$220.00", image: "/images/honey-comb.jpg", slug: "wild-mountain-comb" },
];

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
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 shadow-xl rounded-none py-1 min-w-[100px] z-50 animate-fade-in">
                    <button onClick={() => toggleLang("en")} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-black">English</button>
                    <button onClick={() => toggleLang("fr")} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-black">Français</button>
                    <button onClick={() => toggleLang("ar")} className="block w-full text-right px-4 py-2 text-xs hover:bg-gray-50 text-black font-serif">العربية</button>
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const { openCart, items } = useCart();
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    // Dynamic Text Color based on Scroll Key
    // Unscrolled (Transparent on Light Hero) -> Text Black
    // Scrolled (White Background) -> Text Black
    // So distinct from previous dark theme, we want ALWAYS BLACK text for that high-contrast magazine look.
    const textColorClass = "text-[var(--coffee-brown)]"; // Black
    const logoSrc = "/images/logo.png"; // Assuming we want the dark logo

    const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
        <Link href={href} className={clsx("group relative text-xs uppercase tracking-[0.2em] font-bold transition-colors hover:text-[var(--honey-gold)]", textColorClass)}>
            {children}
            <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[var(--coffee-brown)] transition-all duration-300 group-hover:w-full"></span>
        </Link>
    );

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 flex flex-col transition-all duration-500">
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
                        <div className="hidden md:flex items-center space-x-8">
                            <NavLink href="/our-story">Our Story</NavLink>
                            <NavLink href="/the-farms">The Farms</NavLink>
                        </div>

                        {/* Center: Brand Logo */}
                        <Link href="/" className="relative z-50 group flex flex-col items-center">
                            <div className="relative w-8 h-8 mb-1">
                                <Image
                                    src="/images/logo.png"
                                    alt="Yemeni Market Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className={clsx("text-base font-serif tracking-widest uppercase transition-colors duration-300", textColorClass)}>Yemeni Market</span>
                        </Link>

                        {/* Right: Actions */}
                        <div className={clsx("flex items-center space-x-6", textColorClass)}>
                            {/* Mega Menu Trigger */}
                            <div
                                className="hidden md:block group relative h-full flex items-center cursor-pointer"
                                onMouseEnter={() => setIsMegaMenuOpen(true)}
                            >
                                <Link href="/shop" className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] font-bold hover:text-[var(--honey-gold)] transition-colors">
                                    Shop <ChevronDown className={clsx("w-3 h-3 transition-transform duration-300", isMegaMenuOpen ? "rotate-180" : "")} />
                                </Link>
                            </div>

                            <div className="flex items-center space-x-4 pl-6 border-l border-black/10">
                                <LanguageSelector />

                                <button className="hover:text-[var(--honey-gold)] transition-transform hover:scale-110 duration-300">
                                    <Search className="w-5 h-5" />
                                </button>

                                <Link href="/account" className="hover:text-[var(--honey-gold)] transition-transform hover:scale-110 duration-300" title="Account">
                                    <User className="w-5 h-5" />
                                </Link>

                                <button onClick={openCart} className="relative hover:text-[var(--honey-gold)] transition-transform hover:scale-110 duration-300">
                                    <ShoppingBag className="w-5 h-5" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--coffee-brown)] text-[10px] text-white font-bold">
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
                            "absolute top-full left-0 w-full bg-white border-b border-black/5 shadow-xl overflow-hidden transition-all duration-500 ease-in-out z-40",
                            isMegaMenuOpen ? "max-h-[500px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
                        )}
                        onMouseEnter={() => setIsMegaMenuOpen(true)}
                        onMouseLeave={() => setIsMegaMenuOpen(false)}
                    >
                        <div className="max-w-7xl mx-auto px-12 py-12 grid grid-cols-4 gap-12">
                            {/* Collection Info */}
                            <div className="col-span-1 space-y-6 border-r border-black/5">
                                <h3 className="text-[var(--coffee-brown)] uppercase tracking-widest text-sm font-bold">Collections</h3>
                                <ul className="space-y-4 text-[var(--coffee-brown)]/80 text-sm">
                                    <li><Link href="/shop?category=honey" className="hover:text-[var(--honey-gold)] transition-colors hover:pl-2 duration-300">Rare Sidr Honey</Link></li>
                                    <li><Link href="/shop?category=coffee" className="hover:text-[var(--honey-gold)] transition-colors hover:pl-2 duration-300">Haraz Mocha Coffee</Link></li>
                                    <li><Link href="/shop?category=gifts" className="hover:text-[var(--honey-gold)] transition-colors hover:pl-2 duration-300">Luxury Gift Sets</Link></li>
                                    <li><Link href="/shop?category=wholesale" className="hover:text-[var(--honey-gold)] transition-colors hover:pl-2 duration-300">Wholesale</Link></li>
                                </ul>
                            </div>

                            {/* Products Grid */}
                            {MEGA_MENU_ITEMS.map((item) => (
                                <Link key={item.slug} href={`/shop/${item.slug}`} className="group col-span-1 block" onClick={() => setIsMegaMenuOpen(false)}>
                                    <div className="relative aspect-square overflow-hidden bg-gray-50 mb-4">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <h4 className="font-serif text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors">{item.title}</h4>
                                        <span className="text-xs font-bold text-[var(--honey-gold)] uppercase tracking-widest">{item.price}</span>
                                    </div>
                                </Link>
                            ))}
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
                    className="absolute top-8 right-8 text-black hover:rotate-90 transition-transform duration-300"
                >
                    <X size={32} />
                </button>

                <nav className="flex flex-col items-center space-y-6 text-center">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif text-black hover:text-[var(--honey-gold)]">Home</Link>
                    <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif text-black hover:text-[var(--honey-gold)]">Shop</Link>
                    <Link href="/our-story" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif text-black hover:text-[var(--honey-gold)]">Our Story</Link>
                    <Link href="/the-farms" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-serif text-black hover:text-[var(--honey-gold)]">The Farms</Link>

                    <div className="w-12 h-[1px] bg-black/10 my-4" />

                    <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest font-bold text-black hover:text-[var(--honey-gold)]">My Account</Link>
                </nav>
            </div>
        </>
    );
}
