"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Locale } from "@/lib/translations";

interface LanguageContextType {
    locale: Locale;
    language: Locale; // Alias for locale
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("fr");
    const [dynamicTranslations, setDynamicTranslations] = useState<any>(translations);

    useEffect(() => {
        const fetchDynamicTranslations = async () => {
            try {
                const res = await fetch('/api/translations');
                if (res.ok) {
                    const data = await res.json();
                    setDynamicTranslations(data);
                }
            } catch (error) {
                console.error('Failed to load dynamic translations:', error);
            }
        };

        fetchDynamicTranslations();

        const stored = localStorage.getItem("locale") as Locale;
        if (stored) {
            setLocale(stored);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        if (typeof window !== "undefined") {
            localStorage.setItem("locale", newLocale);
            document.documentElement.lang = newLocale;
            document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
        }
    };

    const t = (key: string): string => {
        const keys = key.split(".");
        let value: any = dynamicTranslations[locale];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    };

    const isRTL = locale === 'ar';

    return (
        <LanguageContext.Provider value={{ locale, language: locale, setLocale, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
}
