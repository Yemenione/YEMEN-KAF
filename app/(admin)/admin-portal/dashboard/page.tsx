"use client";

import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { DollarSign, ShoppingBag, Users, AlertTriangle, Package, Ticket } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminDashboard() {
    const { t } = useLanguage();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/admin/analytics/dashboard');
            const json = await res.json();

            if (!res.ok) {
                console.error('API Error:', json.error);
                setData({ error: json.error || 'Failed to load dashboard data' });
                return;
            }

            setData(json);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
            setData({ error: 'Failed to connect to analytics server' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">{t('admin.common.loading')}</div>;

    if (!data || data.error) return (
        <div className="p-10 text-center">
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md mx-auto">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">{t('admin.dashboard.dashboardError')}</h3>
                <p className="text-sm opacity-80 mb-4">{data?.error || 'Unknown error occurred'}</p>
                <button onClick={() => { setLoading(true); fetchDashboardData(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
                    {t('admin.common.tryAgain')}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('admin.dashboard.title')}</h2>
                <div className="text-sm text-gray-500">{t('admin.dashboard.lastUpdated')}: {new Date().toLocaleTimeString()}</div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard
                    title={t('admin.dashboard.kpi.totalRevenue')}
                    value={`€${Number(data.kpi?.revenue || 0).toLocaleString()}`}
                    icon={<DollarSign className="w-5 h-5" />}
                    color="green"
                />
                <KPICard
                    title={t('admin.dashboard.kpi.totalOrders')}
                    value={data.kpi?.orders || 0}
                    icon={<ShoppingBag className="w-5 h-5" />}
                    color="blue"
                />
                <KPICard
                    title={t('admin.dashboard.kpi.totalCustomers')}
                    value={data.kpi?.customers || 0}
                    icon={<Users className="w-5 h-5" />}
                    color="purple"
                />
                <KPICard
                    title={t('admin.dashboard.kpi.lowStockItems')}
                    value={data.kpi?.lowStock || 0}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    color="red"
                    negative={(data.kpi?.lowStock || 0) > 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm min-h-[400px]">
                    <h3 className="font-semibold mb-6">Sales Overview (Last 30 Days)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.salesChart}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => str.slice(5)} // Show MM-DD
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    {/* Recent Orders */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-semibold mb-4">Recent Orders</h3>
                        <div className="space-y-4">
                            {data.recentOrders.length === 0 ? (
                                <p className="text-gray-500 text-sm">No orders yet.</p>
                            ) : (
                                data.recentOrders.map((order: any) => (
                                    <div key={order.id} className="flex items-center gap-3 border-b border-gray-50 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">Order #{order.orderNumber}</p>
                                            <p className="text-xs text-gray-500">
                                                {order.customer?.firstName} {order.customer?.lastName} • €{Number(order.totalAmount).toFixed(2)}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="font-semibold mb-4">Latest Support Tickets</h3>
                    <div className="space-y-4">
                        {data.recentTickets.length === 0 ? (
                            <p className="text-gray-500 text-sm">No active tickets.</p>
                        ) : (
                            data.recentTickets.map((ticket: any) => (
                                <div key={ticket.id} className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                        <Ticket className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{ticket.subject}</p>
                                        <p className="text-xs text-gray-500">
                                            {ticket.customer?.firstName} {ticket.customer?.lastName}
                                        </p>
                                    </div>
                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">
                                        {ticket.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon, color, negative }: any) {
    const colorClasses = {
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className={`bg-white dark:bg-zinc-900 p-5 rounded-xl border ${negative ? 'border-red-200 bg-red-50/50' : 'border-gray-200 dark:border-zinc-800'} shadow-sm flex items-center gap-4`}>
            <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || 'bg-gray-100'}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'Delivered': return 'bg-green-100 text-green-700';
        case 'Processing': return 'bg-blue-100 text-blue-700';
        case 'Cancelled': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-600';
    }
}
