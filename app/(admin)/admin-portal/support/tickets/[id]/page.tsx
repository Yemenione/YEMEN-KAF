"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Send, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
    id: number;
    senderType: 'ADMIN' | 'CUSTOMER';
    message: string;
    isInternal: boolean;
    createdAt: string;
}

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    };
    order?: {
        id: number;
        orderNumber: string;
        totalAmount: number;
    };
    messages: Message[];
}

export default function TicketDetailPage() {
    const { t } = useLanguage();
    const params = useParams();
    const id = params.id;
    const scrollRef = useRef<HTMLDivElement>(null);

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [isInternal, setIsInternal] = useState(false);

    const fetchTicket = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/tickets/${id}`);
            const data = await res.json();
            setTicket(data);
        } catch {
            console.error(t('admin.support.loadFailed') || 'Failed to fetch ticket');
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        if (id) fetchTicket();
    }, [id, fetchTicket]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`/api/admin/tickets/${id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: reply,
                    isInternal
                })
            });

            if (res.ok) {
                setReply('');
                fetchTicket(); // Refresh to see new message
            }
        } catch {
            console.error(t('admin.support.sendFailed') || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchTicket();
        } catch {
            console.error('Failed to update status');
        }
    };

    useEffect(() => {
        // Scroll to bottom on new messages
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket?.messages]);

    if (loading) return <div className="p-8 text-center text-gray-500">{t('admin.support.loading')}</div>;
    if (!ticket) return <div className="p-8 text-center text-gray-500">{t('admin.support.ticketNotFound')}</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <Link href="/admin-portal/support/tickets" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            #{ticket.id} {ticket.subject}
                            <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 font-normal`}>
                                {t('admin.support.priorityLabel', { priority: ticket.priority })}
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500">
                            Customer: {ticket.customer.firstName} {ticket.customer.lastName} ({ticket.customer.email})
                            {ticket.order && (
                                <span className="ml-2 text-blue-600">
                                    • Order: #{ticket.order.orderNumber}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <select
                    value={ticket.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-sm font-medium"
                >
                    <option value="Open">{t('admin.support.statuses.open')}</option>
                    <option value="Pending">{t('admin.support.statuses.pending')}</option>
                    <option value="Resolved">{t('admin.support.statuses.resolved')}</option>
                    <option value="Closed">{t('admin.support.statuses.closed')}</option>
                </select>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-zinc-950" ref={scrollRef}>
                    {ticket.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] rounded-lg p-4 shadow-sm ${msg.senderType === 'ADMIN'
                                ? msg.isInternal
                                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-900' // Internal Note style
                                    : 'bg-[var(--coffee-brown)] text-white' // Admin Reply style
                                : 'bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700' // Customer style
                                }`}>
                                <div className="text-xs opacity-70 mb-1 flex justify-between gap-4">
                                    <span className="font-bold">
                                        {msg.senderType === 'ADMIN'
                                            ? (msg.isInternal ? t('admin.support.internalNote') : t('admin.support.you'))
                                            : t('admin.support.customer')}
                                    </span>
                                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                            </div>
                        </div>
                    ))}
                    {ticket.messages.length === 0 && (
                        <div className="text-center text-gray-400 py-10">{t('admin.support.noMessages')}</div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
                    <form onSubmit={handleSend} className="flex gap-4">
                        <textarea
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder={t('admin.support.replyPlaceholder')}
                            className="flex-1 px-4 py-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[var(--coffee-brown)] resize-none h-24"
                        />
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded">
                                <input
                                    type="checkbox"
                                    checked={isInternal}
                                    onChange={(e) => setIsInternal(e.target.checked)}
                                    className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500"
                                />
                                {t('admin.support.internalNote')}
                            </label>
                            <button
                                type="submit"
                                disabled={sending || !reply.trim()}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-colors ${isInternal
                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                    : 'bg-[var(--coffee-brown)] hover:bg-[#5a4635]'
                                    } disabled:opacity-50`}
                            >
                                <Send className="w-4 h-4" /> {sending ? t('admin.support.sending') : t('admin.support.send')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
