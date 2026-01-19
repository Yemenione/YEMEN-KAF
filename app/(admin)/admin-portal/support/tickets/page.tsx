"use client";

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    };
    _count: {
        messages: number;
    };
}

export default function SupportTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const query = filter !== 'All' ? `?status=${filter}` : '';
                const res = await fetch(`/api/admin/tickets${query}`);
                const data = await res.json();
                setTickets(data);
            } catch {
                console.error('Failed to fetch tickets');
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [filter]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
            case 'urgent':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
                    <p className="text-gray-500 text-sm">Manage customer inquiries and issues.</p>
                </div>

                {/* 
                <button className="bg-[var(--coffee-brown)] text-white px-4 py-2 rounded-md hover:bg-[#5a4635] flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Create Ticket
                </button>
                */}
            </div>

            {/* Filters */}
            <div className="flex gap-2 pb-2">
                {['All', 'Open', 'Pending', 'Resolved', 'Closed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === status
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                            : 'bg-white dark:bg-zinc-800 text-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading tickets...</td></tr>
                        ) : tickets.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No tickets found.</td></tr>
                        ) : (
                            tickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                {getPriorityIcon(ticket.priority)}
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{ticket.subject}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">#{ticket.id} • {ticket._count.messages} messages</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium">{ticket.customer.firstName} {ticket.customer.lastName}</div>
                                        <div className="text-xs text-gray-500">{ticket.customer.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Link
                                            href={`/admin-portal/support/tickets/${ticket.id}`}
                                            className="text-[var(--coffee-brown)] hover:underline text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            View Details
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
