"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AccountSidebar() {
    const pathname = usePathname();
    const { user, logout, isLoading } = useAuth();
    const { t } = useLanguage();

    const menuItems = [
        { label: t('account.menu.overview') || 'Aperçu', href: "/account", icon: LayoutDashboard },
        { label: t('account.menu.orders') || 'Mes Commandes', href: "/account/orders", icon: Package },
        { label: t('account.menu.profile') || 'Mon Profil', href: "/account/profile", icon: User },
        { label: t('account.menu.addresses') || 'Mes Adresses', href: "/account/addresses", icon: MapPin },
    ];

    if (isLoading) return <aside className="w-full lg:w-64 animate-pulse bg-gray-50 h-96" />;
    if (!user) return null;

    return (
        <aside className="w-full lg:w-64 space-y-6 lg:space-y-8">
            {/* User Brief */}
            <div className="flex items-center gap-4 pb-6 lg:pb-8 border-b border-black/5">
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-black text-white flex items-center justify-center font-serif text-xl uppercase">
                    {user.firstName[0]}{user.lastName ? user.lastName[0] : ''}
                </div>
                <div className="overflow-hidden">
                    <h3 className="font-serif text-lg leading-none uppercase truncate">{user.firstName} {user.lastName}</h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 rounded-lg whitespace-nowrap ${isActive
                                ? "bg-black text-white shadow-md"
                                : "text-gray-500 hover:bg-gray-50 hover:text-black bg-gray-50/50 lg:bg-transparent"
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}

                <button
                    onClick={logout}
                    className="flex lg:w-full items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all duration-300 rounded-lg whitespace-nowrap border lg:border-none border-red-100 lg:mt-6"
                >
                    <LogOut size={18} />
                    {t('account.menu.logout') || 'Déconnexion'}
                </button>
            </nav>
        </aside>
    );
}
