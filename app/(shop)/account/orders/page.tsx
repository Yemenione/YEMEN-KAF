"use client";

import { ArrowRight } from "lucide-react";

const ORDERS = [
    { id: "#ORD-2024-001", date: "Jan 12, 2026", status: "Delivered", total: "$180.00", items: 2 },
    { id: "#ORD-2024-002", date: "Dec 25, 2025", status: "Processing", total: "$450.00", items: 5 },
    { id: "#ORD-2023-089", date: "Nov 10, 2025", status: "Cancelled", total: "$60.00", items: 1 },
    { id: "#ORD-2023-054", date: "Oct 05, 2025", status: "Delivered", total: "$220.00", items: 3 },
];

export default function OrdersPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-black mb-2">My Orders</h1>
                <p className="text-gray-500">Track and manage your recent purchases.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                        <tr>
                            <th className="px-6 py-4 font-medium">Order ID</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Items</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Total</th>
                            <th className="px-6 py-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ORDERS.map((order) => (
                            <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-black">{order.id}</td>
                                <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                <td className="px-6 py-4 text-gray-500">{order.items} Items</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-black font-medium">{order.total}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-black hover:text-[var(--honey-gold)] font-medium text-xs uppercase tracking-wider flex items-center justify-end gap-1 ml-auto">
                                        View Details <ArrowRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
