"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Package, ShoppingBag, MapPin } from "lucide-react";

interface DashboardStats {
    totalOrders: number;
    totalSpent: number;
}

interface RecentOrder {
    id: number;
    totalAmount: number;
    status: string;
    createdAt: string;
}

export default function AccountDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({ totalOrders: 0, totalSpent: 0 });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await fetch('/api/account/dashboard');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats);
                setRecentOrders(data.recentOrders);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'pending': 'قيد الانتظار',
            'processing': 'قيد المعالجة',
            'shipped': 'تم الشحن',
            'delivered': 'تم التسليم',
            'cancelled': 'ملغي'
        };
        return statusMap[status.toLowerCase()] || status;
    };

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-serif text-black mb-2">My Account / حسابي</h1>
                <p className="text-gray-500">
                    مرحباً {user?.firstName}! هذا ملخص حسابك
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                            <Package size={20} />
                        </div>
                        <span className="text-sm uppercase tracking-wider text-gray-500">Total Orders / إجمالي الطلبات</span>
                    </div>
                    <p className="text-3xl font-serif text-black">
                        {isLoading ? '...' : stats.totalOrders}
                    </p>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center">
                            <ShoppingBag size={20} />
                        </div>
                        <span className="text-sm uppercase tracking-wider text-gray-500">Total Spent / المبلغ الإجمالي</span>
                    </div>
                    <p className="text-3xl font-serif text-black">
                        {isLoading ? '...' : `${Number(stats.totalSpent).toFixed(2)}€`}
                    </p>
                </div>

                <Link href="/account/addresses" className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-black flex items-center justify-center">
                            <MapPin size={20} />
                        </div>
                        <span className="text-sm uppercase tracking-wider text-gray-500">Addresses / العناوين</span>
                    </div>
                    <p className="text-lg font-serif text-black">Manage Addresses →</p>
                </Link>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/account/profile" className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-serif text-xl text-black mb-2">Profile / الملف الشخصي</h3>
                    <p className="text-sm text-gray-500">Update your personal information</p>
                </Link>
                <Link href="/account/orders" className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-serif text-xl text-black mb-2">Orders / الطلبات</h3>
                    <p className="text-sm text-gray-500">View your order history</p>
                </Link>
                <Link href="/account/addresses" className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-serif text-xl text-black mb-2">Addresses / العناوين</h3>
                    <p className="text-sm text-gray-500">Manage shipping addresses</p>
                </Link>
            </div>

            {/* Recent Orders Preview */}
            {recentOrders.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-serif text-black">Recent Orders / آخر الطلبات</h2>
                        <Link href="/account/orders" className="text-sm uppercase tracking-wider font-bold border-b border-black pb-0.5 hover:text-gray-600 transition-colors">
                            View All / عرض الكل
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="font-medium text-black">Order #{order.id}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString('ar-YE')}
                                    </p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                    <p className="font-serif text-lg text-black">{Number(order.totalAmount).toFixed(2)}€</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
