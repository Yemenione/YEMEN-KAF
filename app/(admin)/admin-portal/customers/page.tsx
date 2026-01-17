"use client";

import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, User } from "lucide-react";

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    created_at: string;
    order_count: number;
    group_name: string | null;
    group_color: string | null;
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const limit = 20;

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString()
            });
            if (searchTerm) query.append('search', searchTerm);

            const res = await fetch(`/api/customers?${query.toString()}`);
            const data = await res.json();
            setCustomers(data.customers || []);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [page, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">VIP Clients</h2>
                <a
                    href="/admin-portal/customers/groups"
                    className="px-4 py-2 text-sm font-medium text-[var(--coffee-brown)] bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
                >
                    Manage Groups
                </a>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search name, email, phone..."
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
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3">Orders</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading customers...</td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No customers found.</td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                                                    {customer.group_name && (
                                                        <span
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1"
                                                            style={{
                                                                backgroundColor: customer.group_color ? `${customer.group_color}20` : '#eee',
                                                                color: customer.group_color || '#666'
                                                            }}
                                                        >
                                                            {customer.group_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900">{customer.email}</div>
                                            <div className="text-gray-500 text-xs">{customer.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(customer.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium">{customer.order_count}</td>
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
                        disabled={customers.length < limit}
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
