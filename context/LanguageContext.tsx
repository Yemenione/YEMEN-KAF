"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TRANSLATIONS } from "@/utils/translations";

type Locale = "en" | "fr" | "ar";

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>("en");

    // Handle RTL Direction
    const isRTL = locale === "ar";

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }, [locale, isRTL]);

    // Translation Helper (Nested keys supported e.g. "hero.title")
    const t = (key: string) => {
        const keys = key.split(".");
        let value: any = TRANSLATIONS[locale];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k as keyof typeof value];
            } else {
                return key; // Fallback to key if not found
            }
        }

        return typeof value === "string" ? value : key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
    return context;
}
