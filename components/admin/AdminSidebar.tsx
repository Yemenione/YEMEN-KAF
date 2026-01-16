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
    Package
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
    { name: 'Dashboard', href: '/admin-portal/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin-portal/products', icon: ShoppingBag },
    { name: 'Orders', href: '/admin-portal/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin-portal/customers', icon: Users },
    { name: 'Inventory', href: '/admin-portal/inventory', icon: Package },
    { name: 'Settings', href: '/admin-portal/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col h-screen sticky top-0">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-zinc-800">
                <span className="text-xl font-serif font-bold text-[var(--coffee-brown)] dark:text-white">
                    Yem Kaf <span className="text-[var(--honey-gold)]">Admin</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                isActive
                                    ? "bg-[var(--coffee-brown)] text-white shadow-md"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <Icon size={20} className={isActive ? "text-[var(--honey-gold)]" : "text-gray-400"} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
