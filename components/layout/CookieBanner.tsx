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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 p-6 animate-slide-up">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 pr-8">
                    <h3 className="text-lg font-serif text-black mb-2">We value your privacy</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Nous utilisons des cookies pour am&eacute;liorer votre exp&eacute;rience. En continuant, vous acceptez notre utilisation des cookies. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                        <Link href="/privacy" className="underline ml-1 text-black hover:text-gray-600">Read our Privacy Policy</Link>.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={acceptCookies}
                        className="flex-1 md:flex-none px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-lg whitespace-nowrap"
                    >
                        Accept All
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
