"use client";

import { useEffect, useState } from "react";
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { DollarSign, ShoppingBag, Users, AlertTriangle, Package, Ticket, ArrowUpRight, TrendingUp, Calendar, RefreshCw, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

interface DashboardData {
    kpi: {
        revenue: number;
        orders: number;
        customers: number;
        lowStock: number;
    };
    salesChart: { date: string; sales: number }[];
    recentOrders: {
        id: number;
        orderNumber: string;
        status: string;
        totalAmount: number;
        customerName: string;
    }[];
    recentTickets: {
        id: number;
        subject: string;
        status: string;
        customerName: string;
    }[];
    error?: string;
}

export default function AdminDashboard() {
    const { t } = useLanguage();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/analytics/dashboard');
            const json = await res.json();

            if (!res.ok) {
                console.error('API Error:', json.error);
                setData({ error: json.error || 'Failed to load dashboard data' } as DashboardData);
                return;
            }

            setData(json);
        } catch {
            console.error('Failed to load dashboard data');
            setData({ error: 'Failed to connect to analytics server' } as DashboardData);
            toast.error("Failed to sync dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <RefreshCw className="w-10 h-10 animate-spin text-[var(--coffee-brown)]" />
            <p className="text-gray-400 font-medium animate-pulse">Syncing real-time records...</p>
        </div>
    );

    if (!data || data.error) return (
        <div className="p-10 text-center animate-in zoom-in duration-300">
            <div className="bg-white dark:bg-zinc-900 shadow-2xl shadow-red-500/10 text-gray-900 dark:text-gray-100 p-8 rounded-[2rem] border border-red-100 dark:border-red-900/30 max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('admin.dashboard.dashboardError')}</h3>
                <p className="text-sm text-gray-500 mb-6">{data?.error || 'Unknown error occurred'}</p>
                <button
                    onClick={() => fetchDashboardData()}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all"
                >
                    {t('admin.common.tryAgain')}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <LayoutDashboard className="w-6 h-6 text-[var(--coffee-brown)]" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Control Panel</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                        {t('admin.dashboard.title')}
                    </h2>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-600 dark:text-zinc-400">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700 mx-1" />
                    <button
                        onClick={fetchDashboardData}
                        className="p-1 hover:text-[var(--coffee-brown)] transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Gross Revenue"
                    value={`€${Number(data.kpi?.revenue || 0).toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6" />}
                    trend="+12.5%"
                    color="brown"
                />
                <KPICard
                    title="Total Orders"
                    value={data.kpi?.orders || 0}
                    icon={<ShoppingBag className="w-6 h-6" />}
                    trend="+8.2%"
                    color="zinc"
                />
                <KPICard
                    title="New Customers"
                    value={data.kpi?.customers || 0}
                    icon={<Users className="w-6 h-6" />}
                    trend="+5.4%"
                    color="brown"
                />
                <KPICard
                    title="Low Stock"
                    value={data.kpi?.lowStock || 0}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    trend={data.kpi?.lowStock > 0 ? "Check now" : "All set"}
                    color={data.kpi?.lowStock > 0 ? "red" : "green"}
                    negative={data.kpi?.lowStock > 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-2xl shadow-gray-200/40 dark:shadow-none">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                Sales Performance
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Daily revenue overview for the last 30 days</p>
                        </div>
                        <select className="bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-[var(--coffee-brown)]/20">
                            <option>Last 30 Days</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>

                    <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
                        {data.salesChart && data.salesChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" key={data.salesChart.length}>
                                <AreaChart data={data.salesChart}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6F4E37" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6F4E37" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" strokeOpacity={0.5} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => {
                                            const d = new Date(str);
                                            return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                                        }}
                                        stroke="#94A3B8"
                                        fontSize={10}
                                        fontWeight={600}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#94A3B8"
                                        fontSize={10}
                                        fontWeight={600}
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                        tickFormatter={(val) => `€${val}`}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#6F4E37', strokeWidth: 2, strokeDasharray: '4 4' }}
                                        contentStyle={{
                                            borderRadius: '1.5rem',
                                            border: 'none',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                            padding: '1rem',
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(8px)'
                                        }}
                                        itemStyle={{ color: '#6F4E37', fontWeight: 800, fontSize: '14px' }}
                                        labelStyle={{ fontWeight: 600, color: '#64748B', marginBottom: '0.5rem' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#6F4E37"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorSales)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                No sales data available for this period
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Activity */}
                <div className="space-y-8">
                    {/* Recent Orders */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/30 dark:shadow-none">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Recent Orders</h3>
                            <button className="text-[10px] font-bold uppercase tracking-widest text-[var(--coffee-brown)] hover:opacity-70 transition-opacity">View All</button>
                        </div>
                        <div className="space-y-4">
                            {data.recentOrders?.length === 0 ? (
                                <div className="py-10 text-center opacity-40">
                                    <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-xs font-bold">No orders found</p>
                                </div>
                            ) : (
                                data.recentOrders?.map((order) => (
                                    <div key={order.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-zinc-700">
                                        <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-zinc-900/10">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-bold truncate">#{order.orderNumber}</p>
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(order.status)} shrink-0`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 truncate mt-0.5 font-medium">
                                                {order.customerName} • <span className="text-zinc-900 dark:text-gray-100 font-bold">€{Number(order.totalAmount).toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pending Tickets */}
                    <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">Support Queue</h3>
                                <Ticket className="w-5 h-5 text-[var(--honey-gold)] opacity-50" />
                            </div>
                            <div className="space-y-4">
                                {data.recentTickets?.length === 0 ? (
                                    <p className="text-xs text-zinc-500 font-medium">Clear inbox! All tickets resolved.</p>
                                ) : (
                                    data.recentTickets?.map((ticket) => (
                                        <div key={ticket.id} className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
                                            <div className="flex justify-between gap-3 mb-2">
                                                <p className="text-sm font-bold truncate leading-tight">{ticket.subject}</p>
                                                <span className="text-[8px] bg-honey-gold/20 text-[var(--honey-gold)] px-2 py-0.5 rounded-lg shrink-0 font-black uppercase tracking-widest">
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 font-medium">
                                                {ticket.customerName}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button className="w-full mt-6 py-3 bg-[var(--coffee-brown)] hover:bg-[var(--coffee-light)] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                                Go to Help Desk
                            </button>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--coffee-brown)]/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'brown' | 'zinc' | 'green' | 'red';
    trend: string;
    negative?: boolean;
}

function KPICard({ title, value, icon, color, trend, negative }: KPICardProps) {
    const configs = {
        brown: {
            bg: 'bg-[var(--coffee-brown)]',
            iconBg: 'bg-white/20',
            text: 'text-white'
        },
        zinc: {
            bg: 'bg-zinc-900',
            iconBg: 'bg-zinc-800',
            text: 'text-white'
        },
        green: {
            bg: 'bg-green-600',
            iconBg: 'bg-green-500/50',
            text: 'text-white'
        },
        red: {
            bg: 'bg-red-600',
            iconBg: 'bg-red-500/50',
            text: 'text-white'
        }
    };

    const config = configs[color];

    return (
        <div className={`${config.bg} p-6 rounded-[2.25rem] shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`${config.iconBg} p-4 rounded-2xl ${config.text}`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 ${config.text} bg-white/10 px-2 py-1 rounded-lg text-[10px] font-black`}>
                    {negative ? <ArrowUpRight className="w-3 h-3 rotate-180" /> : <ArrowUpRight className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div className="relative z-10">
                <p className={`text-xs font-bold uppercase tracking-widest ${config.text} opacity-60 mb-1`}>{title}</p>
                <p className={`text-3xl font-black ${config.text} tracking-tight`}>{value}</p>
            </div>
            {/* Decoration */}
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mb-12 -mr-12 group-hover:scale-125 transition-transform duration-700" />
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'Delivered':
        case 'Completed': return 'bg-green-500/10 text-green-500';
        case 'Processing':
        case 'Pending': return 'bg-blue-500/10 text-blue-500';
        case 'Cancelled': return 'bg-red-500/10 text-red-500';
        default: return 'bg-gray-500/10 text-gray-500';
    }
}
