"use client";

import { useEffect, useState } from "react";
import { Mail, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface Subscriber {
    id: number;
    email: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminNewsletterPage() {
    const { t, locale } = useLanguage();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 20;

    useEffect(() => {
        fetchSubscribers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm]);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString()
            });
            if (searchTerm) query.append('search', searchTerm);

            const res = await fetch(`/api/admin/newsletter?${query.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setSubscribers(data.subscribers || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Failed to fetch subscribers", error);
            toast.error("Failed to load subscribers");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(subscribers.map(s => ({
            Email: s.email,
            Status: s.isActive ? "Active" : "Inactive",
            "Subscribed At": new Date(s.createdAt).toLocaleDateString()
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Subscribers");
        XLSX.writeFile(wb, "newsletter_subscribers.xlsx");
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Mail className="w-7 h-7 text-[var(--coffee-brown)]" />
                        {t('admin.marketing.newsletter.title')}
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                        {t('admin.marketing.newsletter.subtitle')}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
                    >
                        <Download size={16} /> {t('admin.marketing.newsletter.export')}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/40 dark:shadow-none overflow-hidden">
                {/* Search & Filters */}
                <div className="p-4 border-b border-gray-50 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--coffee-brown)] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={t('admin.marketing.newsletter.searchPlaceholder')}
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
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.marketing.newsletter.email')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.marketing.newsletter.status')}</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.marketing.newsletter.joinedDate')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={3} className="px-6 py-6"><div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                                        {t('admin.marketing.newsletter.noSubscribers')}
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map((sub) => (
                                    <tr key={sub.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                            {sub.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sub.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                            >
                                                {sub.isActive ? t('admin.marketing.newsletter.active') : t('admin.marketing.newsletter.unsubscribed')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-[11px] font-medium">
                                            {new Date(sub.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
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
                        {t('admin.marketing.newsletter.page')} {page + 1}
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
                            disabled={subscribers.length < limit}
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
