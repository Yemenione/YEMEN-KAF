
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
    ScrollText,
    User,
    Newspaper,
    Key
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUI } from '@/context/UIContext';
import { canAccessModule, AdminRole } from '@/lib/rbac';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { t, locale } = useLanguage();
    const role = (user?.role || 'EDITOR') as AdminRole;

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
                { name: t('admin.sidebar.items.customers'), href: '/admin-portal/customers', icon: Users, permission: 'CUSTOMERS' },
                { name: t('admin.sidebar.items.inventory'), href: '/admin-portal/inventory', icon: Package },
                { name: t('admin.sidebar.items.support'), href: '/admin-portal/support/tickets', icon: LifeBuoy, permission: 'SUPPORT' },
            ]
        },
        {
            title: t('admin.sidebar.groups.designMarketing'),
            module: 'CMS',
            items: [
                { name: t('admin.sidebar.items.homepage'), href: '/admin-portal/design/homepage', icon: Home },
                { name: t('admin.sidebar.items.navigation'), href: '/admin-portal/design/menus', icon: Menu },
                { name: t('admin.sidebar.items.contentCms'), href: '/admin-portal/cms/pages', icon: FileText },
                { name: t('admin.sidebar.items.blog'), href: '/admin-portal/cms/blog', icon: Newspaper },
                { name: t('admin.sidebar.items.coupons'), href: '/admin-portal/marketing/coupons', icon: TicketPercent, permission: 'MARKETING' },
                { name: 'Newsletter', href: '/admin-portal/marketing/newsletter', icon: Users, permission: 'MARKETING' },
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
                "fixed lg:sticky top-0 start-0 h-screen bg-[#1d2327] border-e border-zinc-800 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 w-64 shadow-2xl lg:shadow-none",
                isSidebarOpen ? "translate-x-0" : (locale === 'ar' ? "translate-x-full" : "-translate-x-full")
            )}>
                {/* Logo Area (WordPress style top bar segment) */}
                <div className="h-14 flex items-center px-4 border-b border-zinc-700/50 shrink-0 justify-between bg-[#1d2327]">
                    <Link href="/admin-portal/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded bg-zinc-700 flex items-center justify-center text-white font-black text-lg group-hover:bg-[#2271b1] transition-colors">
                            Y
                        </div>
                        <span className="text-sm font-bold text-zinc-100 tracking-tight group-hover:text-white transition-colors">
                            Yem Kaf <span className="text-zinc-500 font-normal ml-1 italic opacity-80">Admin</span>
                        </span>
                    </Link>
                    <button onClick={closeSidebar} className="lg:hidden text-zinc-400 hover:text-white">
                        <LogOut className={clsx("rotate-180", locale === 'ar' && "rotate-0")} size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {groups.map((group) => (
                        <div key={group.title} className="space-y-0.5">
                            <h4 className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-800/10 mb-1">
                                {group.title}
                            </h4>
                            <div className="space-y-0">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/admin-portal/dashboard' && pathname.startsWith(item.href));
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => closeSidebar()}
                                            className={clsx(
                                                "flex items-center gap-3 px-4 py-2 text-[13px] font-medium transition-all duration-150 relative group/link",
                                                isActive
                                                    ? "bg-[#2271b1] text-white"
                                                    : "text-zinc-400 hover:bg-[#2c3338] hover:text-[#72aee6]"
                                            )}
                                        >
                                            {/* WordPress Blue strip for active item */}
                                            {isActive && (
                                                <div className="absolute start-0 top-0 bottom-0 w-[4px] bg-[#72aee6]" />
                                            )}

                                            <Icon size={18} className={clsx(
                                                "shrink-0 transition-colors",
                                                isActive ? "text-white" : "text-zinc-500 group-hover/link:text-[#72aee6]"
                                            )} />
                                            <span className="truncate">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Section (Profile & Sign Out) */}
                <div className="mt-auto border-t border-zinc-800 bg-[#1d2327]/80 backdrop-blur-sm">
                    <Link
                        href="/admin-portal/profile"
                        onClick={() => closeSidebar()}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-all duration-150 relative group/profile",
                            pathname === '/admin-portal/profile'
                                ? "bg-[#2271b1] text-white"
                                : "text-zinc-400 hover:bg-[#2c3338] hover:text-[#72aee6]"
                        )}
                    >
                        {pathname === '/admin-portal/profile' && (
                            <div className="absolute start-0 top-0 bottom-0 w-[4px] bg-[#72aee6]" />
                        )}
                        <User size={18} className={clsx(
                            "shrink-0",
                            pathname === '/admin-portal/profile' ? "text-white" : "text-zinc-500 group-hover/profile:text-[#72aee6]"
                        )} />
                        {t('admin.sidebar.items.profile')}
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-[13px] font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all group/logout"
                    >
                        <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
                        {t('admin.sidebar.items.signOut')}
                    </button>
                </div>
            </aside>
        </>
    );
}
