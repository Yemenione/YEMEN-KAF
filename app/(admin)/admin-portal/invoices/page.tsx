'use client';

import { useState, useEffect } from 'react';
import { Download, Search, FileText, Calendar, DollarSign, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Invoice {
    id: number;
    created_at: string;
    total_amount: string;
    status: string;
    first_name: string;
    last_name: string;
    email: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/admin/invoices');
            if (res.ok) {
                const data = await res.json();
                setInvoices(data);
            }
        } catch (error) {
            console.error('Failed to load invoices', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (orderId: number) => {
        window.open(`/api/account/orders/${orderId}/invoice`, '_blank');
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.id.toString().includes(searchTerm) ||
        inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">{t('common.loading') || 'Chargement...'}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('admin.invoices.title') || 'Factures Client'}</h1>
                    <p className="text-gray-500 text-sm">{t('admin.invoices.subtitle') || 'Gérez et téléchargez les factures des commandes.'}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('admin.invoices.searchPlaceholder') || "Rechercher par N° ou Client..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--coffee-brown)] focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                <th className="px-6 py-3 font-medium">{t('admin.invoices.invoiceNumber') || 'N° Facture'}</th>
                                <th className="px-6 py-3 font-medium">{t('admin.invoices.customer') || 'Client'}</th>
                                <th className="px-6 py-3 font-medium">{t('admin.invoices.date') || 'Date'}</th>
                                <th className="px-6 py-3 font-medium">{t('admin.invoices.amount') || 'Montant'}</th>
                                <th className="px-6 py-3 font-medium text-right">{t('admin.invoices.actions') || 'Action'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-gray-600">
                                        INV-{new Date().getFullYear()}-{inv.id.toString().padStart(4, '0')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--honey-gold)]/10 text-[var(--coffee-brown)] flex items-center justify-center font-bold text-xs">
                                                {inv.first_name[0]}{inv.last_name[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{inv.first_name} {inv.last_name}</div>
                                                <div className="text-xs text-gray-500">{inv.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(inv.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {Number(inv.total_amount).toFixed(2)} €
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDownload(inv.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors"
                                        >
                                            <Download className="w-3 h-3" /> {t('admin.invoices.download') || 'Télécharger'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredInvoices.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t('admin.invoices.noInvoices') || 'Aucune facture trouvée.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
