"use client";

import Link from "next/link";
import Image from "next/image";
import { MoveLeft, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ShopNotFound() {
    const { t } = useLanguage();

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-20 bg-[var(--cream-white)]">
            <div className="max-w-2xl w-full text-center space-y-12">
                {/* Visual Element */}
                <div className="relative h-64 md:h-80 w-full group">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10rem] md:text-[15rem] font-serif text-[var(--coffee-brown)]/5 select-none italic">404</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700">
                        <Image
                            src="/images/logo-circle.png"
                            alt="Logo"
                            width={120}
                            height={120}
                            className="opacity-30 grayscale"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-3xl md:text-5xl font-serif text-[var(--coffee-brown)]">
                        {t('error.404.title') || "Trésor Introuvable"}
                    </h1>
                    <p className="text-[var(--coffee-brown)]/60 text-lg md:text-xl max-w-md mx-auto italic font-light leading-relaxed">
                        {t('error.404.message') || "Il semble que cette caravane ait pris un chemin inattendu à travers les vallées. L'article que vous cherchez n'est pas ici."}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full hover:bg-[var(--coffee-brown)] transition-all duration-300 font-bold uppercase tracking-widest text-[10px]"
                    >
                        <MoveLeft size={14} />
                        {t('error.backHome') || "Retour à l'Accueil"}
                    </Link>
                    <Link
                        href="/shop"
                        className="flex items-center gap-2 px-8 py-4 border border-black/10 text-black rounded-full hover:bg-black hover:text-white transition-all duration-300 font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ShoppingBag size={14} />
                        {t('error.exploreShop') || "Explorer la Boutique"}
                    </Link>
                </div>
            </div>
        </div>
    );
}
