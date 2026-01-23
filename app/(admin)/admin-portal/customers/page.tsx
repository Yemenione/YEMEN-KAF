"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { User, ChevronLeft, ChevronRight, Search, Users, Download, ShieldCheck } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { hasPermission, Permission, AdminRole, canAccessModule } from "@/lib/rbac";
import { toast } from "sonner";


interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at: string;
    order_count: number;
    group_name: string | null;
    group_color: string | null;
}

export default function AdminCustomersPage() {
    const { t, locale } = useLanguage();
    const { user } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const limit = 20;

    const role = (user?.role || 'EDITOR') as AdminRole;
    const canManageGroups = canAccessModule(role, 'SETTINGS') || hasPermission(role, Permission.MANAGE_CUSTOMERS);

    useEffect(() => {
        fetchCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString()
            });
            if (searchTerm) query.append('search', searchTerm);

            const res = await fetch(`/api/customers?${query.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setCustomers(data.customers || []);
        } catch (error) {
            console.error("Failed to fetch customers", error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="w-7 h-7 text-[var(--coffee-brown)]" />
                        {t('admin.customers.title')}
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                        {t('admin.customers.description') || "Manage your customer base, groups, and purchasing history."}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all text-[11px] font-black uppercase tracking-widest shadow-sm">
                        <Download size={16} /> {t('common.export') || 'Export'}
                    </button>
                    {canManageGroups && (
                        <Link
                            href="/admin-portal/customers/groups"
                            className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-xl hover:opacity-90 transition-all text-[11px] font-black uppercase tracking-widest shadow-lg"
                        >
                            <ShieldCheck size={16} /> {t('admin.customers.groups')}
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
                            placeholder={t('admin.customers.searchPlaceholder')}
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.customers.name')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.customers.phone')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.customers.groups')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.customers.orders')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.customers.registered')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">{t('admin.inventory.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                                        {t('common.noResults') || "No customers found."}
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-900 dark:text-gray-100 group-hover:bg-[var(--coffee-brown)] group-hover:text-white transition-colors">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-[var(--coffee-brown)] transition-colors">
                                                        {customer.first_name} {customer.last_name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{customer.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-[12px] font-medium">
                                            {customer.phone || '---'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.group_name ? (
                                                <span
                                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                                    style={{ backgroundColor: `${customer.group_color}15`, color: customer.group_color || '#666' }}
                                                >
                                                    {customer.group_name}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic">No Group</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black italic tracking-tighter text-[var(--coffee-brown)]">
                                                {customer.order_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-[11px] font-medium">
                                            {new Date(customer.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin-portal/customers/${customer.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[var(--coffee-brown)] bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-all"
                                            >
                                                {t('common.view') || 'View'}
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
                            disabled={customers.length < limit}
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
