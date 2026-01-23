"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Eye, Plus, ShoppingCart, Filter, Download, Calendar } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { hasPermission, Permission, AdminRole } from "@/lib/rbac";
import { toast } from "sonner";
import { clsx } from "clsx";

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email?: string;
    total_amount: number;
    status: string;
    created_at: string;
}

export default function AdminOrdersPage() {
    const { t, locale } = useLanguage();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const limit = 20;

    const role = (user?.role || 'EDITOR') as AdminRole;
    const canCreate = hasPermission(role, Permission.MANAGE_ORDERS);

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString()
            });
            if (searchTerm) query.append('search', searchTerm);

            const res = await fetch(`/api/orders?${query.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Failed to fetch orders", error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20';
            case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20';
            case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20';
            case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20';
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20';
            default: return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800';
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <ShoppingCart className="w-7 h-7 text-[var(--coffee-brown)]" />
                        {t('admin.orders.title')}
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                        {t('admin.orders.description') || "Manage and track your store's transactions."}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all text-[11px] font-black uppercase tracking-widest shadow-sm">
                        <Download size={16} /> {t('common.export') || 'Export'}
                    </button>
                    {canCreate && (
                        <Link
                            href="/admin-portal/orders/create"
                            className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-xl hover:opacity-90 transition-all text-[11px] font-black uppercase tracking-widest shadow-lg"
                        >
                            <Plus size={16} /> {t('admin.orders.createOrder')}
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/40 dark:shadow-none overflow-hidden">
                {/* Search & Filters */}
                <div className="p-4 border-b border-gray-50 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--coffee-brown)] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={t('admin.orders.searchPlaceholder')}
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 w-full sm:w-auto justify-center">
                        <Filter size={16} /> {t('common.filters') || 'Filters'}
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order Ref</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.customers.name')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                                        {t('admin.orders.noResults') || "No entries found in your orders history."}
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-900 dark:text-gray-100 group-hover:bg-[var(--coffee-brown)] group-hover:text-white transition-colors">
                                                    <ShoppingCart size={14} />
                                                </div>
                                                <span className="font-mono font-bold text-[13px] text-gray-900 dark:text-white">#{order.order_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-[var(--coffee-brown)] transition-colors">
                                                {order.customer_name || 'Guest Checkout'}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{order.customer_email || 'No email provided'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[12px] font-medium">
                                                <Calendar size={12} className="opacity-40" />
                                                {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black italic tracking-tighter text-[var(--coffee-brown)]">
                                                {new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'fr-FR', { style: 'currency', currency: 'EUR' }).format(order.total_amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={clsx(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                getStatusColor(order.status)
                                            )}>
                                                <span className={clsx(
                                                    "w-1 h-1 rounded-full",
                                                    order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered' ? 'bg-emerald-500' :
                                                        order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'processing' ? 'bg-amber-500' :
                                                            order.status.toLowerCase() === 'cancelled' ? 'bg-rose-500' : 'bg-gray-500'
                                                )} />
                                                {t(`admin.orders.statuses.${order.status.toLowerCase()}`) || order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin-portal/orders/${order.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--coffee-brown)] bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-all"
                                            >
                                                <Eye size={14} /> {t('common.view') || 'View'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 bg-gray-50/30 dark:bg-zinc-800/20 border-t border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest">
                        PAGE {page + 1}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 rounded-xl border border-gray-100 dark:border-zinc-800 disabled:opacity-30 hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={orders.length < limit}
                            className="p-2 rounded-xl border border-gray-100 dark:border-zinc-800 disabled:opacity-30 hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
