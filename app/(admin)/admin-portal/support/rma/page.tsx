"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RMA {
    id: number;
    orderId: number;
    status: string;
    reason: string;
    resolution: string;
    createdAt: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    };
    order: {
        orderNumber: string;
        totalAmount: string;
    };
}

export default function RMAPage() {
    const [rmas, setRMAs] = useState<RMA[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRMAs();
    }, []);

    const fetchRMAs = async () => {
        try {
            const res = await fetch('/api/admin/rma');
            const data = await res.json();
            setRMAs(data);
        } catch {
            console.error('Failed to fetch RMAs');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        let color = 'bg-gray-100 text-gray-800';
        if (status === 'Approved') color = 'bg-green-100 text-green-800';
        if (status === 'Rejected') color = 'bg-red-100 text-red-800';
        if (status === 'Pending') color = 'bg-yellow-100 text-yellow-800';

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Returns (RMA)</h1>
                    <p className="text-gray-500 text-sm">Manage product returns and refunds.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RMA #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason / Resolution</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading returns...</td></tr>
                        ) : rmas.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No active returns.</td></tr>
                        ) : (
                            rmas.map((rma) => (
                                <tr key={rma.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-sm">#{rma.id}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium">#{rma.order.orderNumber}</div>
                                        <div className="text-xs text-gray-500">{rma.order.totalAmount} €</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium">{rma.customer.firstName} {rma.customer.lastName}</div>
                                        <div className="text-xs text-gray-500">{rma.customer.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{rma.reason}</div>
                                        <div className="text-xs text-blue-600">{rma.resolution}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(rma.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Link
                                            href={`/admin-portal/support/rma/${rma.id}`}
                                            className="text-[var(--coffee-brown)] hover:underline text-sm font-medium"
                                        >
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
