"use client";

import Link from "next/link";
import { ArrowRight, Package, CreditCard, Clock } from "lucide-react";

export default function AccountDashboard() {
    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-serif text-black mb-2">My Account</h1>
                <p className="text-gray-500">Welcome back, Ali. Here's what's happening with your account today.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                            <Package size={20} />
                        </div>
                        <span className="text-sm uppercase tracking-wider text-gray-500">Total Orders</span>
                    </div>
                    <p className="text-3xl font-serif text-black">12</p>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--honey-gold)] text-black flex items-center justify-center">
                            <CreditCard size={20} />
                        </div>
                        <span className="text-sm uppercase tracking-wider text-gray-500">Total Spent</span>
                    </div>
                    <p className="text-3xl font-serif text-black">$1,240</p>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-black flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        <span className="text-sm uppercase tracking-wider text-gray-500">Last Active</span>
                    </div>
                    <p className="text-3xl font-serif text-black">2h ago</p>
                </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-serif text-black">Recent Orders</h2>
                    <Link href="/account/orders" className="text-sm uppercase tracking-wider font-bold border-b border-black pb-0.5 hover:text-gray-600 transition-colors">
                        View All
                    </Link>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-black">#ORD-2024-001</td>
                                <td className="px-6 py-4 text-gray-500">Jan 12, 2026</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Delivered
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-black font-medium">$180.00</td>
                                <td className="px-6 py-4 text-right">
                                    <Link href="/account/orders/1" className="text-black hover:underline">View</Link>
                                </td>
                            </tr>
                            <tr className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-black">#ORD-2024-002</td>
                                <td className="px-6 py-4 text-gray-500">Dec 24, 2025</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Processing
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-black font-medium">$450.00</td>
                                <td className="px-6 py-4 text-right">
                                    <Link href="/account/orders/2" className="text-black hover:underline">View</Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
