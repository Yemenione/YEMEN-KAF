"use client";

import { Menu } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { useUI } from "@/context/UIContext";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { t, locale, setLocale } = useLanguage();
    const { toggleSidebar } = useUI();

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-zinc-900">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                        <Menu size={20} />
                    </button>
                    <h1 className="text-lg font-medium">{t('admin.dashboard.title')}</h1>
                </div>
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

            <main className="flex-1 overflow-auto p-3 md:p-6 pb-24 md:pb-6"> {/* p-3 for mobile, extra bottom padding for bottom nav if exists */}
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

