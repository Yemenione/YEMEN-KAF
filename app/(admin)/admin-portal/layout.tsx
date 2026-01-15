import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-zinc-900 font-sans text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-zinc-800 flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                    <span className="text-xl font-bold tracking-tight text-[var(--coffee-brown)] dark:text-[var(--honey-gold)]">
                        YEM KAF <span className="text-xs opacity-50 block uppercase tracking-wide text-gray-500">Command Center</span>
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem href="/admin-portal/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active />
                    <NavItem href="/admin-portal/orders" icon={<ShoppingCart size={20} />} label="Orders" />
                    <NavItem href="/admin-portal/products" icon={<Package size={20} />} label="Products & Inventory" />
                    <NavItem href="/admin-portal/customers" icon={<Users size={20} />} label="VIP Clients" />
                    <NavItem href="/admin-portal/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                    <button className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors">
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6">
                    <h1 className="text-lg font-medium">Dashboard Overview</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[var(--honey-gold)] flex items-center justify-center text-xs font-bold text-white">
                            AD
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-[var(--coffee-brown)] text-white dark:bg-[var(--honey-gold)] dark:text-black' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
            {icon}
            {label}
        </Link>
    )
}
