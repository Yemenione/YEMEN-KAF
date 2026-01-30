"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    ShoppingBag,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Package,
    TicketPercent,
    FileText,
    LifeBuoy,
    Layers,
    Tag,
    Award,
    Languages,
    Home,
    Menu,
    Truck,
    CreditCard,
    ScrollText,
    User,
    Newspaper,
    Key,
    ChevronLeft,
    ChevronRight,
    Smartphone
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { canAccessModule, AdminRole } from '@/lib/rbac';
import { useSettings } from '@/context/SettingsContext';
import Image from 'next/image';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { t, locale } = useLanguage();
    const role = (user?.role || 'EDITOR') as AdminRole;
    const { isSidebarOpen, isSidebarCollapsed, closeSidebar, toggleSidebarCollapse } = useUI();
    const { settings } = useSettings();

    const groups = [
        {
            title: t('admin.sidebar.groups.overview'),
            module: 'ANALYTICS',
            items: [
                { name: t('admin.sidebar.items.dashboard'), href: '/admin-portal/dashboard', icon: LayoutDashboard },
            ]
        },
        {
            title: t('admin.sidebar.groups.catalog'),
            module: 'CATALOG',
            items: [
                { name: t('admin.sidebar.items.categories'), href: '/admin-portal/categories', icon: Layers },
                { name: t('admin.sidebar.items.attributes'), href: '/admin-portal/attributes', icon: Tag },
                { name: t('admin.sidebar.items.brands'), href: '/admin-portal/brands', icon: Award },
                { name: t('admin.sidebar.items.products'), href: '/admin-portal/products', icon: ShoppingBag },
            ]
        },
        {
            title: t('admin.sidebar.groups.operations'),
            module: 'ORDERS',
            items: [
                { name: t('admin.sidebar.items.orders'), href: '/admin-portal/orders', icon: ShoppingCart },
                { name: t('admin.sidebar.items.invoices') || 'Factures', href: '/admin-portal/invoices', icon: FileText },
                { name: t('admin.sidebar.items.customers'), href: '/admin-portal/customers', icon: Users },
                { name: t('admin.sidebar.items.inventory'), href: '/admin-portal/inventory', icon: Package },
                { name: t('admin.sidebar.items.support'), href: '/admin-portal/support/tickets', icon: LifeBuoy },
            ]
        },
        {
            title: t('admin.sidebar.groups.designMarketing'),
            module: 'CMS',
            items: [
                { name: t('admin.sidebar.items.homepage'), href: '/admin-portal/design/homepage', icon: Home },
                { name: t('admin.sidebar.items.navigation'), href: '/admin-portal/design/menus', icon: Menu },
                { name: t('admin.sidebar.items.headerNavigation'), href: '/admin-portal/settings/header', icon: LayoutDashboard },
                { name: t('admin.sidebar.items.contentCms'), href: '/admin-portal/cms/pages', icon: FileText },
                { name: t('admin.sidebar.items.blog'), href: '/admin-portal/cms/blog', icon: Newspaper },
                { name: t('admin.sidebar.items.coupons'), href: '/admin-portal/marketing/coupons', icon: TicketPercent },
                { name: 'Newsletter', href: '/admin-portal/marketing/newsletter', icon: Users },
                { name: 'App Mobile', href: '/admin-portal/mobile-app', icon: Smartphone },
            ]
        },
        {
            title: t('admin.sidebar.groups.configuration'),
            module: 'SETTINGS',
            items: [
                { name: t('admin.sidebar.items.generalSettings'), href: '/admin-portal/settings', icon: Settings },
                { name: t('admin.sidebar.items.translations'), href: '/admin-portal/translations', icon: Languages },
                { name: t('admin.sidebar.items.shipping'), href: '/admin-portal/settings/shipping', icon: Truck },
                { name: t('admin.sidebar.items.payments'), href: '/admin-portal/settings/payments', icon: CreditCard },
                { name: t('admin.sidebar.items.stripe'), href: '/admin-portal/settings/stripe', icon: Key },
                { name: t('admin.sidebar.items.team'), href: '/admin-portal/settings/admins', icon: Users },
                { name: t('admin.sidebar.items.systemLogs'), href: '/admin-portal/settings/logs', icon: ScrollText },
            ]
        }
    ];

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-md"
                        onClick={closeSidebar}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarCollapsed ? '80px' : '280px',
                    x: (!isSidebarOpen && isMobile)
                        ? (locale === 'ar' ? '100%' : '-100%')
                        : 0
                }}
                className={clsx(
                    "fixed lg:sticky top-0 start-0 h-screen bg-[#0f1115] border-e border-white/5 flex flex-col z-[70] transition-colors duration-500",
                    isSidebarOpen ? "translate-x-0" : ""
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0 justify-between">
                    <Link href="/admin-portal/dashboard" className="flex items-center gap-3 group overflow-hidden">
                        <div className="w-9 h-9 min-w-[36px] rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <Image
                                src="/images/logo-circle.png"
                                alt="Logo"
                                width={36}
                                height={36}
                                className="object-contain p-1"
                            />
                        </div>
                        {!isSidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col"
                            >
                                <span className="text-sm font-bold text-white tracking-tight">Yem Kaf</span>
                                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest opacity-80">Portal Admin</span>
                            </motion.div>
                        )}
                    </Link>
                    {!isSidebarCollapsed && (
                        <button onClick={closeSidebar} className="lg:hidden text-zinc-400 hover:text-white transition-colors">
                            <LogOut className={clsx("rotate-180", locale === 'ar' && "rotate-0")} size={18} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 space-y-8 scrollbar-none hover:scrollbar-thin scrollbar-thumb-zinc-800 transition-all">
                    {groups.map((group) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const hasAccess = canAccessModule(role, group.module as any);
                        if (!hasAccess) return null;

                        return (
                            <div key={group.title} className="space-y-1 px-3">
                                {!isSidebarCollapsed ? (
                                    <h4 className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500/80 mb-2">
                                        {group.title}
                                    </h4>
                                ) : (
                                    <div className="h-px bg-white/5 mx-2 mb-4" />
                                )}

                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href || (item.href !== '/admin-portal/dashboard' && pathname.startsWith(item.href));
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                title={isSidebarCollapsed ? item.name : ''}
                                                onClick={() => {
                                                    if (isMobile) closeSidebar();
                                                }}
                                                className={clsx(
                                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group/link",
                                                    isActive
                                                        ? "bg-white/10 text-white shadow-xl shadow-black/20"
                                                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "shrink-0 transition-all duration-300 p-1 rounded-lg",
                                                    isActive ? "bg-[var(--honey-gold)] text-white shadow-lg shadow-amber-500/20" : "group-hover/link:text-[var(--honey-gold)]"
                                                )}>
                                                    <Icon size={20} />
                                                </div>

                                                {!isSidebarCollapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="truncate"
                                                    >
                                                        {item.name}
                                                    </motion.span>
                                                )}

                                                {isActive && !isSidebarCollapsed && (
                                                    <motion.div
                                                        layoutId="active-indicator"
                                                        className="absolute start-0 w-1 h-6 bg-[var(--honey-gold)] rounded-e-full"
                                                    />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Desktop Collapse Toggle */}
                <div className="hidden lg:flex items-center justify-center p-4 border-t border-white/5">
                    <button
                        onClick={toggleSidebarCollapse}
                        className="w-full py-2 flex items-center justify-center gap-2 text-zinc-500 hover:text-white bg-white/5 rounded-xl transition-all hover:bg-white/10"
                    >
                        {isSidebarCollapsed ? (
                            <ChevronRight size={18} className={locale === 'ar' ? "rotate-180" : ""} />
                        ) : (
                            <>
                                <ChevronLeft size={18} className={locale === 'ar' ? "rotate-180" : ""} />
                                <span className="text-xs font-bold uppercase tracking-widest">Collapse View</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-white/5 bg-black/20 p-3 space-y-1">
                    <Link
                        href="/admin-portal/profile"
                        title={isSidebarCollapsed ? t('admin.sidebar.items.profile') : ''}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group/profile",
                            pathname === '/admin-portal/profile'
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-500 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <User size={20} className={clsx(
                            "shrink-0",
                            pathname === '/admin-portal/profile' ? "text-[var(--honey-gold)]" : "group-hover/profile:text-[var(--honey-gold)]"
                        )} />
                        {!isSidebarCollapsed && t('admin.sidebar.items.profile')}
                    </Link>
                    <button
                        onClick={logout}
                        title={isSidebarCollapsed ? t('admin.sidebar.items.signOut') : ''}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-400 transition-all group/logout"
                    >
                        <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
                        {!isSidebarCollapsed && t('admin.sidebar.items.signOut')}
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
