"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Eye, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
}

export default function AdminOrdersPage() {
    const { t } = useLanguage();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const limit = 20;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    limit: limit.toString(),
                    offset: (page * limit).toString()
                });
                if (searchTerm) query.append('search', searchTerm);

                const res = await fetch(`/api/orders?${query.toString()}`);
                const data = await res.json();
                setOrders(data.orders || []);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('admin.orders.title')}</h2>
                <Link href="/admin-portal/orders/create" className="px-4 py-2 bg-[var(--coffee-brown)] text-white rounded-md text-sm font-medium hover:bg-[#5a4635] flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {t('admin.orders.createOrder')}
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('admin.orders.searchPlaceholder')}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--honey-gold)]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500 uppercase tracking-wider font-medium">
                            <tr>
                                <th className="px-6 py-3">{t('admin.orders.orderNumber')}</th>
                                <th className="px-6 py-3">{t('admin.orders.customer')}</th>
                                <th className="px-6 py-3">{t('admin.orders.date')}</th>
                                <th className="px-6 py-3">{t('admin.orders.total')}</th>
                                <th className="px-6 py-3">{t('admin.orders.status')}</th>
                                <th className="px-6 py-3 text-right">{t('admin.orders.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{order.order_number}</td>
                                        <td className="px-6 py-4">{order.customer_name || 'Guest'}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold">{Number(order.total_amount).toFixed(2)}€</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                                                ${order.status === 'completed' || order.status === 'shipped' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin-portal/orders/${order.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                                                <Eye size={16} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        className="px-3 py-1 border rounded disabled:opacity-50 text-sm flex items-center gap-1"
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <span className="text-sm text-gray-500">Page {page + 1}</span>
                    <button
                        disabled={orders.length < limit}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50 text-sm flex items-center gap-1"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
