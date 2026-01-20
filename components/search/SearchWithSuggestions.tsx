"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function SearchWithSuggestions() {
    const { t } = useLanguage();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<{ id: number; name: string; slug: string; price: string | number; images?: string | string[]; image_url?: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                setIsLoading(true);
                fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => {
                        setSuggestions(data.suggestions || []);
                        setIsOpen(true);
                    })
                    .catch(e => console.error(e))
                    .finally(() => setIsLoading(false));
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (!query) setShowInput(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/shop?search=${encodeURIComponent(query)}`);
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative group">
            <div className={`flex items-center border border-black/10 rounded-full px-3 py-1 transition-all duration-300 ${showInput ? 'w-48 bg-white opacity-100' : 'w-8 border-transparent bg-transparent'}`}>
                <button
                    onClick={() => setShowInput(!showInput)}
                    className="hover:text-[var(--honey-gold)] transition-colors"
                >
                    <Search className="w-5 h-5" />
                </button>
                <form onSubmit={handleSearch} className={`flex-1 ${showInput ? 'block' : 'hidden'}`}>
                    <input
                        type="text"
                        placeholder={t('nav.search') || "Search..."}
                        className="ml-2 outline-none text-sm bg-transparent w-full"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus={showInput}
                    />
                </form>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && query.length >= 2 && (
                <div className="absolute top-full right-0 mt-3 w-[300px] bg-white shadow-2xl rounded-xl overflow-hidden border border-black/5 z-50 animate-fade-in">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul>
                            {suggestions.map((item) => {
                                // Helper logic for image
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
                                    } else if (item.image_url) {
                                        displayImage = item.image_url;
                                    }
                                } catch {
                                    if (typeof item.images === 'string' && item.images.length > 0) displayImage = item.images;
                                }

                                // Final safety check
                                if (!displayImage || displayImage === "") displayImage = '/images/honey-jar.jpg';

                                return (
                                    <li key={item.id} className="border-b border-gray-50 last:border-0">
                                        <Link
                                            href={`/shop/${item.slug}`}
                                            className="flex gap-4 p-3 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={displayImage}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-[var(--coffee-brown)] truncate">{item.name}</h4>
                                                <p className="text-xs text-[var(--honey-gold)] font-bold">{Number(item.price).toFixed(2)}€</p>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                            <li className="bg-gray-50 p-2 text-center">
                                <Link
                                    href={`/shop?search=${encodeURIComponent(query)}`}
                                    className="text-xs font-bold text-[var(--coffee-brown)] hover:underline uppercase tracking-wider"
                                    onClick={() => setIsOpen(false)}
                                >
                                    View all results
                                </Link>
                            </li>
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm italic">
                            No products found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
