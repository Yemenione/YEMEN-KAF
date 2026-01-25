"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { canAccessModule, AdminRole } from "@/lib/rbac";
import { Lock, Menu, PanelLeft } from "lucide-react";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { useUI } from "@/context/UIContext";
import clsx from 'clsx';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { t, locale, setLocale } = useLanguage();
    const { toggleSidebar, toggleSidebarCollapse } = useUI();
    const { user, isLoading } = useAuth();
    const pathname = usePathname();

    // Map pathname to module
    const getModuleFromPath = (path: string) => {
        if (path.includes('/dashboard')) return 'ANALYTICS';
        if (path.includes('/categories') || path.includes('/products') || path.includes('/attributes') || path.includes('/brands')) return 'CATALOG';
        if (path.includes('/orders') || path.includes('/inventory')) return 'ORDERS';
        if (path.includes('/customers')) return 'CUSTOMERS';
        if (path.includes('/cms') || path.includes('/design') || path.includes('/mobile-app')) return 'CMS';
        if (path.includes('/marketing')) return 'MARKETING';
        if (path.includes('/support')) return 'SUPPORT';
        if (path.includes('/settings') || path.includes('/translations')) return 'SETTINGS';
        return null;
    };

    const currentModule = getModuleFromPath(pathname);
    const role = user?.role as AdminRole;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAuthorized = !currentModule || canAccessModule(role || 'EDITOR', currentModule as any);

    if (!isAuthorized && !isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-6">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-red-100 dark:border-red-900/20 shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Lock className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
                        <p className="text-gray-500 dark:text-zinc-400">
                            You don&apos;t have the required permissions to access the **{currentModule}** module.
                            Please contact your supervisor if you believe this is an error.
                        </p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full py-3 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-black overflow-hidden relative">
            {/* Background pattern/gradient for premium feel */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 dark:opacity-5 pointer-events-none" />

            {/* Header - Premium Glassmorphism */}
            <header className="h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/50 flex items-center justify-between px-8 sticky top-0 z-[40]">
                <div className="flex items-center gap-6">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-600 dark:text-gray-400 transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    {/* Desktop Toggle */}
                    <button
                        onClick={toggleSidebarCollapse}
                        className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-600 dark:text-gray-400 transition-all hover:scale-110 active:scale-95"
                        title="Toggle Sidebar"
                    >
                        <PanelLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{t('admin.dashboard.title')}</h1>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-none mt-1">
                            {pathname.split('/').slice(2).join(' / ').replace(/-/g, ' ')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {/* Language Switcher - Premium Style */}
                    <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-zinc-800/50 rounded-xl p-1 border border-gray-200/50 dark:border-white/5">
                        {['en', 'fr', 'ar'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setLocale(lang as 'en' | 'fr' | 'ar')}
                                className={clsx(
                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300",
                                    locale === lang
                                        ? "bg-white dark:bg-zinc-700 text-[var(--coffee-brown)] dark:text-white shadow-sm ring-1 ring-black/5"
                                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                )}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="h-10 w-px bg-gray-200 dark:bg-zinc-800 mx-2" />

                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user?.firstName || 'Admin'}</p>
                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{user?.role || 'Manager'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--coffee-brown)] to-zinc-900 flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-white dark:ring-zinc-900 group-hover:scale-105 transition-transform duration-300">
                            {user?.firstName?.[0] || 'A'}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-8 relative z-10 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <div className="max-w-[1600px] mx-auto">
                    {children}
                </div>
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

