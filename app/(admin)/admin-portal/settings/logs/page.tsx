
"use client";

import { useState, useEffect } from 'react';
import { ScrollText, Loader2, Search, Filter, Clock, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

interface Log {
    id: number;
    action: string;
    entityType: string;
    entityId: string | null;
    details: Record<string, unknown>;
    ipAddress: string | null;
    createdAt: string;
    admin: {
        name: string;
        email: string;
    };
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/logs?limit=100');
            const data = await res.json();
            setLogs(data.logs || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'UPDATE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'LOGIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.admin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ScrollText className="w-8 h-8 text-[var(--coffee-brown)]" />
                        System Logs & Audits
                    </h1>
                    <p className="text-gray-500 text-sm">Detailed history of all administrative actions in the system.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-sm w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 transition-colors text-sm">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-gray-400">Timestamp</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-gray-400">Admin</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-gray-400">Action</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-gray-400">Entity</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-gray-400">Details</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-gray-400">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(log.createdAt), 'MMM d, p')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[var(--honey-gold)]/20 text-[var(--honey-gold)] flex items-center justify-center text-[10px] font-bold">
                                                {log.admin.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium">{log.admin.name}</div>
                                                <div className="text-[10px] text-gray-400">{log.admin.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 font-medium capitalize">
                                            {log.entityType}
                                            {log.entityId && <span className="text-gray-400 font-normal">#{log.entityId}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate text-gray-500">
                                        {log.details ? JSON.stringify(log.details) : <span className="text-gray-300 italic">No details</span>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                        {log.ipAddress || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="p-12 text-center text-gray-400 space-y-4">
                        <div className="flex justify-center"><ShieldAlert className="w-12 h-12 opacity-20" /></div>
                        <p>No activity logs found matches your criteria.</p>
                    </div>
                )}

                <div className="bg-gray-50 dark:bg-zinc-800/50 px-6 py-4 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center text-xs text-gray-500">
                    <span>Showing {filteredLogs.length} of {total} entries</span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 bg-white dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-700 disabled:opacity-50">Previous</button>
                        <button disabled className="px-3 py-1 bg-white dark:bg-zinc-800 rounded border border-gray-200 dark:border-zinc-700 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
