
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    ShieldCheck,
    ScrollText,
    Globe,
    User,
    Newspaper,
    Key
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const { t } = useLanguage();

    const groups = [
        {
            title: t('admin.sidebar.groups.overview'),
            items: [
                { name: t('admin.sidebar.items.dashboard'), href: '/admin-portal/dashboard', icon: LayoutDashboard },
            ]
        },
        {
            title: t('admin.sidebar.groups.catalog'),
            items: [
                { name: t('admin.sidebar.items.categories'), href: '/admin-portal/categories', icon: Layers },
                { name: t('admin.sidebar.items.attributes'), href: '/admin-portal/attributes', icon: Tag },
                { name: t('admin.sidebar.items.brands'), href: '/admin-portal/brands', icon: Award },
                { name: t('admin.sidebar.items.products'), href: '/admin-portal/products', icon: ShoppingBag },
            ]
        },
        {
            title: t('admin.sidebar.groups.operations'),
            items: [
                { name: t('admin.sidebar.items.orders'), href: '/admin-portal/orders', icon: ShoppingCart },
                { name: t('admin.sidebar.items.customers'), href: '/admin-portal/customers', icon: Users },
                { name: t('admin.sidebar.items.inventory'), href: '/admin-portal/inventory', icon: Package },
                { name: t('admin.sidebar.items.support'), href: '/admin-portal/support/tickets', icon: LifeBuoy },
            ]
        },
        {
            title: t('admin.sidebar.groups.designMarketing'),
            items: [
                { name: t('admin.sidebar.items.homepage'), href: '/admin-portal/design/homepage', icon: Home },
                { name: t('admin.sidebar.items.navigation') || 'Navigation', href: '/admin-portal/design/menus', icon: Menu },
                { name: t('admin.sidebar.items.contentCms') || 'Pages CMS', href: '/admin-portal/cms/pages', icon: FileText },
                { name: t('admin.sidebar.items.blog') || 'Gestion du Blog', href: '/admin-portal/cms/blog', icon: Newspaper },
                { name: t('admin.sidebar.items.coupons') || 'Coupons & Promos', href: '/admin-portal/marketing/coupons', icon: TicketPercent },
            ]
        },
        {
            title: t('admin.sidebar.groups.configuration'),
            items: [
                { name: t('admin.sidebar.items.generalSettings'), href: '/admin-portal/settings', icon: Settings },
                { name: t('admin.sidebar.items.translations'), href: '/admin-portal/translations', icon: Languages },
                { name: t('admin.sidebar.items.shipping') || 'Expédition', href: '/admin-portal/settings/shipping', icon: Truck },
                { name: t('admin.sidebar.items.payments') || 'Paiements', href: '/admin-portal/settings/payments', icon: CreditCard },
                { name: 'Configuration Stripe', href: '/admin-portal/settings/stripe', icon: Key },
                { name: 'Configuration Firebase', href: '/admin-portal/settings/firebase', icon: ShieldCheck },
                { name: t('admin.sidebar.items.team') || 'Équipe', href: '/admin-portal/settings/admins', icon: Users },
                { name: t('admin.sidebar.items.systemLogs') || 'Logs Système', href: '/admin-portal/settings/logs', icon: ScrollText },
            ]
        }
    ];

    const { isSidebarOpen, closeSidebar } = useUI();

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={closeSidebar}
                />
            )}

            <aside className={clsx(
                "fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 w-64 shadow-xl lg:shadow-none",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-zinc-800 shrink-0 justify-between">
                    <span className="text-xl font-serif font-bold text-[var(--coffee-brown)] dark:text-white">
                        Yem Kaf <span className="text-[var(--honey-gold)]">Admin</span>
                    </span>
                    <button onClick={closeSidebar} className="lg:hidden text-gray-500">
                        <LogOut className="rotate-180" size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
                    {groups.map((group) => (
                        <div key={group.title} className="space-y-2">
                            <h4 className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500">
                                {group.title}
                            </h4>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/admin-portal/dashboard' && pathname.startsWith(item.href));
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => closeSidebar()}
                                            className={clsx(
                                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                                isActive
                                                    ? "bg-[var(--coffee-brown)] text-white shadow-sm translate-x-1"
                                                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-[var(--coffee-brown)] dark:hover:text-white"
                                            )}
                                        >
                                            <Icon size={18} className={clsx(
                                                "shrink-0",
                                                isActive ? "text-[var(--honey-gold)]" : "text-gray-400 group-hover:text-[var(--coffee-brown)]"
                                            )} />
                                            <span className="truncate">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Profile / Logout */}
                <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 shrink-0 space-y-2">
                    <Link
                        href="/admin-portal/profile"
                        onClick={() => closeSidebar()}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors group",
                            pathname === '/admin-portal/profile'
                                ? "bg-[var(--coffee-brown)] text-white"
                                : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                        )}
                    >
                        <User size={18} />
                        {t('admin.sidebar.items.profile') || 'Mon Profil'}
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        {t('admin.sidebar.items.signOut')}
                    </button>
                </div>
            </aside>
        </>
    );
}
