"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie_consent", "accepted");
        setIsVisible(false);
    };

    const declineCookies = () => {
        localStorage.setItem("cookie_consent", "declined");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-6 md:right-auto md:w-[480px] z-[10000] p-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-[rgba(20,20,20,0.95)] backdrop-blur-md border border-[var(--honey-gold)]/20 shadow-2xl p-6 rounded-t-2xl md:rounded-2xl">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--honey-gold)]/10 rounded-full">
                                <Cookie className="w-5 h-5 text-[var(--honey-gold)]" />
                            </div>
                            <h3 className="text-lg font-playfair text-[var(--cream-white)] font-medium">
                                Paramètres des cookies
                            </h3>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-[var(--cream-white)] transition-colors"
                            aria-label="Fermer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-sm text-gray-300 font-light leading-relaxed">
                        Nous utilisons des cookies pour optimiser votre expérience et mesurer l&apos;audience.
                        Conformément au RGPD, vous pouvez choisir d&apos;accepter ou de refuser ces traceurs.
                        <Link href="/privacy" className="block mt-2 text-[var(--honey-gold)] hover:underline text-xs tracking-wide uppercase">
                            Politique de confidentialité
                        </Link>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <button
                            onClick={acceptCookies}
                            className="flex-1 px-6 py-3 bg-[var(--honey-gold)] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all rounded-md shadow-[0_0_15px_rgba(197,160,89,0.2)]"
                        >
                            Accepter
                        </button>
                        <button
                            onClick={declineCookies}
                            className="flex-1 px-6 py-3 bg-transparent border border-gray-600 text-gray-300 text-xs font-bold uppercase tracking-widest hover:border-[var(--cream-white)] hover:text-[var(--cream-white)] transition-all rounded-md"
                        >
                            Refuser
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
