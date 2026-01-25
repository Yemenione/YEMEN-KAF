"use client";

import { useState, useEffect } from "react";
import { Mail, Calendar, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Subscriber {
    id: number;
    email: string;
    is_active: boolean;
    created_at: string;
}

export default function NewsletterPage() {
    const { t } = useLanguage();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/newsletter')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSubscribers(data);
                } else {
                    console.error("Expected array but got:", data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch subscribers", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8">{t('admin.marketing.newsletter.loading')}</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{t('admin.marketing.newsletter.title')}</h1>
                    <p className="text-gray-500">{t('admin.marketing.newsletter.subtitle')}</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold">
                    {t('admin.marketing.newsletter.total')}: {subscribers.length}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">{t('admin.marketing.newsletter.email')}</th>
                            <th className="px-6 py-4">{t('admin.marketing.newsletter.status')}</th>
                            <th className="px-6 py-4">{t('admin.marketing.newsletter.joinedDate')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {subscribers.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <Mail size={14} />
                                        </div>
                                        <span className="font-medium text-gray-900">{sub.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {sub.is_active ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            <CheckCircle size={10} /> {t('admin.marketing.newsletter.active')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                            <XCircle size={10} /> {t('admin.marketing.newsletter.unsubscribed')}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} />
                                        {new Date(sub.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subscribers.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        {t('admin.marketing.newsletter.noSubscribers')}
                    </div>
                )}
            </div>
        </div>
    );
}
