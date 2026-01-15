"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, LogOut, LayoutDashboard } from "lucide-react";

const MENU_ITEMS = [
    { label: "Overview", href: "/account", icon: LayoutDashboard },
    { label: "My Orders", href: "/account/orders", icon: Package },
    { label: "Profile Details", href: "/account/profile", icon: User },
    { label: "Addresses", href: "/account/addresses", icon: MapPin },
];

export default function AccountSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full lg:w-64 space-y-8">
            {/* User Brief */}
            <div className="flex items-center gap-4 pb-8 border-b border-black/5">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-serif text-xl">
                    AL
                </div>
                <div>
                    <h3 className="font-serif text-lg leading-none">Ali Latif</h3>
                    <p className="text-xs text-gray-500 mt-1">ali@example.com</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 rounded-lg ${isActive
                                    ? "bg-black text-white shadow-lg"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-black"
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}

                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all duration-300 rounded-lg mt-8">
                    <LogOut size={18} />
                    Sign Out
                </button>
            </nav>
        </aside>
    );
}
