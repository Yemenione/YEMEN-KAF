
"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    ScrollText,
    Loader2,
    Search,
    Filter,
    Clock,
    ShieldAlert,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Eye,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface Log {
    id: number;
    action: string;
    entityType: string;
    entityId: string | null;
    details: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: string;
    admin: {
        name: string;
        email: string;
    };
}

export default function LogsPage() {
    const { t, isRTL } = useLanguage();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [page, setPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const limit = 20;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const offset = (page - 1) * limit;
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
                search: searchTerm,
                action: filterAction
            });

            const res = await fetch(`/api/admin/logs?${params.toString()}`);
            const data = await res.json();
            setLogs(data.logs || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, filterAction]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-500/20';
            case 'UPDATE': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-500/20';
            case 'DELETE': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 ring-1 ring-rose-500/20';
            case 'LOGIN': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 ring-1 ring-indigo-500/20';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-slate-500/20';
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-8 p-4 lg:p-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-[var(--honey-gold)]/10 rounded-2xl">
                            <ScrollText className="w-8 h-8 text-[var(--honey-gold)]" />
                        </div>
                        {t('admin.logs.title')}
                    </h1>
                    <p className="text-gray-500 text-sm max-w-xl">{t('admin.logs.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                    <button
                        onClick={() => fetchLogs()}
                        className="p-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg">
                        <Clock size={14} />
                        Live Feed
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--honey-gold)] transition-colors" />
                    <input
                        type="text"
                        placeholder={t('admin.logs.searchPlaceholder')}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-[var(--honey-gold)]/20 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        value={filterAction}
                        onChange={(e) => {
                            setFilterAction(e.target.value);
                            setPage(1);
                        }}
                        className="px-6 py-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl text-sm shadow-sm outline-none focus:ring-2 focus:ring-[var(--honey-gold)]/20 min-w-[160px] appearance-none"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: isRTL ? 'left 1rem center' : 'right 1rem center', backgroundSize: '1.5em' }}
                    >
                        <option value="">{t('admin.common.filter')}: {t('admin.logs.action')}</option>
                        <option value="CREATE">{t('admin.logs.actions.create')}</option>
                        <option value="UPDATE">{t('admin.logs.actions.update')}</option>
                        <option value="DELETE">{t('admin.logs.actions.delete')}</option>
                        <option value="LOGIN">{t('admin.logs.actions.login')}</option>
                    </select>
                </div>
            </div>

            {/* Logs Table Area */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-xl shadow-gray-200/20 dark:shadow-none relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100 dark:border-zinc-700">
                            <Loader2 className="animate-spin text-[var(--honey-gold)]" />
                            <span className="text-sm font-bold uppercase tracking-widest">{t('admin.common.loading')}</span>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-zinc-800/30 border-b border-gray-100 dark:border-zinc-800">
                                <th className="px-8 py-5 font-bold uppercase tracking-[0.15em] text-[10px] text-gray-400">{t('admin.logs.timestamp')}</th>
                                <th className="px-8 py-5 font-bold uppercase tracking-[0.15em] text-[10px] text-gray-400">{t('admin.logs.admin')}</th>
                                <th className="px-8 py-5 font-bold uppercase tracking-[0.15em] text-[10px] text-gray-400">{t('admin.logs.action')}</th>
                                <th className="px-8 py-5 font-bold uppercase tracking-[0.15em] text-[10px] text-gray-400">{t('admin.logs.entity')}</th>
                                <th className="px-8 py-5 font-bold uppercase tracking-[0.15em] text-[10px] text-gray-400">{t('admin.logs.ip')}</th>
                                <th className="px-8 py-5 font-bold uppercase tracking-[0.15em] text-[10px] text-gray-400 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                            {logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all duration-300">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                                {format(new Date(log.createdAt), 'dd MMM yyyy')}
                                            </span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <Clock size={10} />
                                                {format(new Date(log.createdAt), 'HH:mm:ss')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--honey-gold)] to-amber-600/30 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-amber-500/10">
                                                {log.admin.name[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-gray-100">{log.admin.name}</span>
                                                <span className="text-[10px] text-gray-400 font-mono italic">{log.admin.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={clsx(
                                            "inline-flex px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase",
                                            getActionColor(log.action)
                                        )}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">{log.entityType}</span>
                                            {log.entityId && (
                                                <span className="text-[10px] font-mono text-gray-400">ID: {log.entityId}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[10px] text-gray-400 font-mono">
                                        {log.ipAddress || '—'}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="p-2 text-gray-400 hover:text-[var(--honey-gold)] hover:bg-[var(--honey-gold)]/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {!loading && logs.length === 0 && (
                    <div className="p-24 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="relative">
                                <ShieldAlert size={64} className="text-gray-200 dark:text-zinc-800" />
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    className="absolute -top-2 -right-2 p-2 bg-amber-500 text-white rounded-full shadow-lg"
                                >
                                    <Filter size={16} />
                                </motion.div>
                            </div>
                        </div>
                        <div className="max-w-xs mx-auto">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{t('admin.logs.empty')}</p>
                            <p className="text-sm text-gray-500 mt-2">{t('admin.common.noResults')}</p>
                        </div>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterAction('');
                            }}
                            className="text-[var(--honey-gold)] text-xs font-black uppercase tracking-widest hover:underline"
                        >
                            {t('admin.common.tryAgain')}
                        </button>
                    </div>
                )}

                {/* Pagination & Stats Footer */}
                <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/30 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {t('admin.logs.showing', { count: logs.length, total: total })}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1 || loading}
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            className="p-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl disabled:opacity-30 hover:shadow-md transition-all rtl:rotate-180"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl text-xs font-bold">
                            <span className="text-[var(--honey-gold)]">{page}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-500">{totalPages || 1}</span>
                        </div>

                        <button
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage(prev => prev + 1)}
                            className="p-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl disabled:opacity-30 hover:shadow-md transition-all rtl:rotate-180"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Details Slide-over / Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLog(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: isRTL ? '-100%' : '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: isRTL ? '-100%' : '100%' }}
                            className={clsx(
                                "fixed top-0 bottom-0 w-full max-w-xl bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 z-[101] p-8 shadow-2xl flex flex-col",
                                isRTL ? "left-0 border-r" : "right-0 border-l"
                            )}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-zinc-900 text-white dark:bg-zinc-800 rounded-2xl">
                                        <Eye size={20} />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter">{t('admin.logs.details')}</h3>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-10 pr-2">
                                {/* Metadata Group */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Action Type</label>
                                        <div className="pt-1">
                                            <span className={clsx(
                                                "px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-sm",
                                                getActionColor(selectedLog.action)
                                            )}>
                                                {selectedLog.action}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Performed At</label>
                                        <div className="flex flex-col pt-1">
                                            <span className="font-bold text-sm">
                                                {format(new Date(selectedLog.createdAt), 'MMMM d, yyyy')}
                                            </span>
                                            <span className="text-xs text-[var(--honey-gold)] font-mono">
                                                {format(new Date(selectedLog.createdAt), 'HH:mm:ss (O)')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Subject Group */}
                                <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-[2rem] border border-gray-100 dark:border-zinc-800 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-[1.5rem] bg-zinc-900 text-white flex items-center justify-center text-xl font-black italic">
                                            {selectedLog.admin.name[0]}
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Responsible Administrator</label>
                                            <p className="text-lg font-black text-zinc-900 dark:text-white leading-tight">{selectedLog.admin.name}</p>
                                            <p className="text-xs text-gray-500 font-mono italic">{selectedLog.admin.email}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200/50 dark:border-zinc-700/50 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Target Entity</label>
                                            <p className="text-sm font-bold uppercase tracking-wider">{selectedLog.entityType || '—'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Entity ID Reference</label>
                                            <p className="text-sm font-mono text-amber-600">#{selectedLog.entityId || 'NA'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Raw JSON Data */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Audit Log Payload (JSON)</label>
                                        <div className="text-[9px] font-bold text-gray-300">READ-ONLY DATA SET</div>
                                    </div>
                                    <div className="p-6 bg-zinc-950 rounded-[2rem] font-mono text-xs text-emerald-400/90 leading-relaxed shadow-inner border border-white/5 overflow-x-auto">
                                        {selectedLog.details ? (
                                            <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                                        ) : (
                                            <span className="text-zinc-600 italic">{"{ \"message\": \"No additional payload captured for this event\" }"}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedLog(null)}
                                className="mt-8 w-full py-5 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:scale-[0.98] transition-transform shadow-xl"
                            >
                                Close Audit Trail
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
