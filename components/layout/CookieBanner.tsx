"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            // Small delay to not annoy immediately
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie_consent", "accepted");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl bg-white border border-gray-100 shadow-2xl z-[10000] p-6 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                    <h3 className="text-lg font-serif text-black mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[var(--honey-gold)] rounded-full animate-pulse"></span>
                        Privacy Policy
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        We use cookies to improve your experience and show you relevant content.
                        By continuing, you accept our use of cookies.
                        <Link href="/privacy" className="underline ml-1 text-black hover:text-[var(--honey-gold)] transition-colors">Read Policy</Link>.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                    <button
                        onClick={acceptCookies}
                        className="flex-1 md:flex-none px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--coffee-brown)] transition-all rounded-full whitespace-nowrap shadow-lg active:scale-95"
                    >
                        Accept All
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-gray-400 hover:text-black transition-colors bg-gray-50 rounded-full"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
