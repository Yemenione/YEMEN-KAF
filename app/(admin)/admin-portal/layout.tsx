"use client";

import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, Globe } from "lucide-react";
import Link from "next/link";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { t, locale, setLocale } = useLanguage();

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-zinc-900">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6">
                <h1 className="text-lg font-medium">{t('admin.dashboard.title')}</h1>
                <div className="flex items-center gap-4">
                    {/* Language Switcher */}
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setLocale('en')}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${locale === 'en'
                                    ? 'bg-white dark:bg-zinc-700 text-[var(--coffee-brown)] dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLocale('fr')}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${locale === 'fr'
                                    ? 'bg-white dark:bg-zinc-700 text-[var(--coffee-brown)] dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            FR
                        </button>
                        <button
                            onClick={() => setLocale('ar')}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${locale === 'ar'
                                    ? 'bg-white dark:bg-zinc-700 text-[var(--coffee-brown)] dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            AR
                        </button>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[var(--honey-gold)] flex items-center justify-center text-xs font-bold text-white">
                        AD
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
                {children}
            </main>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </LanguageProvider>
    );
}

