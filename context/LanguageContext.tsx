"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Locale } from "@/lib/translations";

interface LanguageContextType {
    locale: Locale;
    language: Locale; // Alias for locale
    setLocale: (locale: Locale) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: (key: string, options?: { returnObjects?: boolean } & Record<string, any>) => any;
    isRTL: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLocalizedValue: (obj: any, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type TranslationValue = string | TranslationValue[] | { [key: string]: TranslationValue };

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("fr");
    // Use TranslationValue type instead of any, wrapped in a Record for the root object
    const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, TranslationValue>>(translations);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        if (typeof window !== "undefined") {
            localStorage.setItem("locale", newLocale);
            document.documentElement.lang = newLocale;
            document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
        }
    };

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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocale(stored);
        }
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = (key: string, options?: { returnObjects?: boolean } & Record<string, any>): any => {
        const keys = key.split(".");
        let value: TranslationValue | undefined = dynamicTranslations[locale];

        for (const k of keys) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                value = (value as { [key: string]: TranslationValue })[k];
            } else {
                value = undefined;
                break;
            }
        }

        if (options?.returnObjects) {
            return value;
        }

        if (typeof value === 'string' && options) {
            let interpolated = value;
            Object.keys(options).forEach(optKey => {
                if (optKey !== 'returnObjects') {
                    interpolated = interpolated.replace(`{${optKey}}`, String(options[optKey]));
                }
            });
            return interpolated;
        }

        return (typeof value === 'string' ? value : key) || key;
    };

    const isRTL = locale === 'ar';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getLocalizedValue = (obj: any, key: string): string => {
        if (!obj) return '';
        if (locale === 'en') return obj[key] || '';

        // Try to get translation
        let translations = obj.translations;
        // Handle common cases where translations might be a string (JSON string from DB)
        if (typeof translations === 'string') {
            try {
                translations = JSON.parse(translations);
            } catch {
                translations = {};
            }
        }

        return translations?.[locale]?.[key] || obj[key] || '';
    };

    return (
        <LanguageContext.Provider value={{ locale, language: locale, setLocale, t, isRTL, getLocalizedValue }}>
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
