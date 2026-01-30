"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

interface Settings {
    site_name: string;
    site_description: string;
    support_email: string;
    support_phone: string;
    social_facebook: string;
    social_instagram: string;
    logo_url: string;
    primary_color: string;
    [key: string]: string;
}

interface SettingsContextType {
    settings: Settings;
    loading: boolean;
}

const defaultSettings: Settings = {
    site_name: "Yemeni Market",
    site_description: "Premium Yemeni Products",
    support_email: "support@yemeni-market.com",
    support_phone: "+33 6 12 34 56 78",
    social_facebook: "https://facebook.com",
    social_instagram: "https://instagram.com",
    logo_url: "/images/logo-circle.png",
    primary_color: "#cfb160"
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    loading: true
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/config', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setSettings(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({ settings, loading }), [settings, loading]);

    return (
        <SettingsContext.Provider value={contextValue}>
            <style jsx global>{`
                :root {
                    --honey-gold: ${settings.primary_color};
                }
            `}</style>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
