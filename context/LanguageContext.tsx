"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { translations, Locale } from "@/lib/translations";

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("fr");

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
        let value: any = translations[locale];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
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
