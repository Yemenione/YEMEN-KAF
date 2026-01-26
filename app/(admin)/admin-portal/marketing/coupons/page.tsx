"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Tag, Edit2, Calendar, DollarSign, Percent, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

interface CartRule {
    id: number;
    name: string;
    description: string;
    code: string;
    priority: number;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
    minAmount: number;
    totalAvailable: number;
    totalPerUser: number;
    freeShipping: boolean;
    reductionPercent: number;
    reductionAmount: number;
}

export default function CouponsPage() {
    const { t } = useLanguage();
    const [coupons, setCoupons] = useState<CartRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'conditions' | 'actions'>('info');

    // Form State
    const [formData, setFormData] = useState<Partial<CartRule>>({
        name: '', description: '', code: '', priority: 1, isActive: true,
        startsAt: '', endsAt: '', minAmount: 0, totalAvailable: 1000, totalPerUser: 1,
        freeShipping: false, reductionPercent: 0, reductionAmount: 0
    });
    const [editId, setEditId] = useState<number | null>(null);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/marketing/coupons');
            const data = await res.json();
            setCoupons(data.length ? data : []);
        } catch {
            toast.error(t('admin.marketing.coupons.messages.loadFailed'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditing && editId
                ? `/api/admin/marketing/coupons/${editId}`
                : '/api/admin/marketing/coupons';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(isEditing ? t('admin.marketing.coupons.messages.updated') : t('admin.marketing.coupons.messages.created'));
                fetchCoupons();
                resetForm();
            } else {
                const err = await res.json();
                toast.error(err.error || t('admin.marketing.coupons.messages.operationFailed'));
            }
        } catch {
            toast.error(t('admin.marketing.coupons.messages.operationFailed'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.marketing.coupons.list.confirmDelete'))) return;
        try {
            const res = await fetch(`/api/admin/marketing/coupons/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success(t('admin.marketing.coupons.messages.deleted'));
                fetchCoupons();
            }
        } catch {
            toast.error(t('admin.marketing.coupons.messages.deleteFailed'));
        }
    };

    const openEdit = (rule: CartRule) => {
        setFormData({
            ...rule,
            startsAt: rule.startsAt ? new Date(rule.startsAt).toISOString().split('T')[0] : '',
            endsAt: rule.endsAt ? new Date(rule.endsAt).toISOString().split('T')[0] : ''
        });
        setEditId(rule.id);
        setIsEditing(true);
        setActiveTab('info');
    };

    const resetForm = () => {
        setFormData({
            name: '', description: '', code: '', priority: 1, isActive: true,
            startsAt: '', endsAt: '', minAmount: 0, totalAvailable: 1000, totalPerUser: 1,
            freeShipping: false, reductionPercent: 0, reductionAmount: 0
        });
        setIsEditing(false);
        setEditId(null);
        setActiveTab('info');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white tracking-tight">
                        <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-xl shadow-lg shadow-pink-500/20">
                            <Tag className="w-6 h-6" />
                        </div>
                        {t('admin.marketing.coupons.title')}
                    </h2>
                    <p className="text-gray-500 mt-2 ml-1 text-sm font-medium">{t('admin.marketing.coupons.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 sticky top-6 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{isEditing ? t('admin.marketing.coupons.editCoupon') : t('admin.marketing.coupons.newCoupon')}</h3>
                            {isEditing && (
                                <button
                                    onClick={resetForm}
                                    className="px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors"
                                >
                                    {t('admin.marketing.coupons.cancel')}
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 mb-6 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                            {(['info', 'conditions', 'actions'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 ${activeTab === tab
                                        ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {t(`admin.marketing.coupons.tabs.${tab}`)}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* TAB: INFO */}
                            {activeTab === 'info' && (
                                <div className="space-y-4 animate-in slide-in-from-left-2 fade-in duration-300">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t('admin.marketing.coupons.form.name')}</label>
                                        <input
                                            type="text" required placeholder="Ex: Summer Sale 2025"
                                            className="w-full bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t('admin.marketing.coupons.form.code')}</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text" required placeholder="SUMMER20"
                                                className="w-full pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm uppercase font-mono tracking-widest font-bold focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t('admin.marketing.coupons.form.description')}</label>
                                        <textarea
                                            className="w-full bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none h-24 resize-none"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the offer visible to customers..."
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.marketing.coupons.form.isActive')}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.isActive}
                                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* TAB: CONDITIONS */}
                            {activeTab === 'conditions' && (
                                <div className="space-y-4 animate-in slide-in-from-right-2 fade-in duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t('admin.marketing.coupons.form.startsAt')}</label>
                                            <input
                                                type="date"
                                                className="w-full bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                                                value={formData.startsAt || ''}
                                                onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t('admin.marketing.coupons.form.endsAt')}</label>
                                            <input
                                                type="date"
                                                className="w-full bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                                                value={formData.endsAt || ''}
                                                onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t('admin.marketing.coupons.form.minAmount')}</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-gray-500 font-bold text-sm">€</span>
                                            <input
                                                type="number" min="0" step="0.01"
                                                className="w-full pl-8 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                                                value={formData.minAmount}
                                                onChange={e => setFormData({ ...formData, minAmount: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t('admin.marketing.coupons.form.totalAvailable')}</label>
                                            <input
                                                type="number" min="1"
                                                className="w-full bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                                                value={formData.totalAvailable}
                                                onChange={e => setFormData({ ...formData, totalAvailable: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t('admin.marketing.coupons.form.totalPerUser')}</label>
                                            <input
                                                type="number" min="1"
                                                className="w-full bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                                                value={formData.totalPerUser}
                                                onChange={e => setFormData({ ...formData, totalPerUser: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: ACTIONS */}
                            {activeTab === 'actions' && (
                                <div className="space-y-4 animate-in slide-in-from-right-2 fade-in duration-300">
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800 cursor-pointer transition-all hover:shadow-md" onClick={() => setFormData({ ...formData, freeShipping: !formData.freeShipping })}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.freeShipping ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                                {formData.freeShipping && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white block">{t('admin.marketing.coupons.form.freeShipping')}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{t('admin.marketing.coupons.form.freeShippingDesc')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t('admin.marketing.coupons.form.percentDiscount')}</label>
                                        <div className="relative">
                                            <Percent className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
                                            <input
                                                type="number" min="0" max="100" step="0.1"
                                                className="w-full pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                                                value={formData.reductionPercent}
                                                onChange={e => setFormData({ ...formData, reductionPercent: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t('admin.marketing.coupons.form.amountDiscount')}</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
                                            <input
                                                type="number" min="0" step="0.01"
                                                className="w-full pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                                                value={formData.reductionAmount}
                                                onChange={e => setFormData({ ...formData, reductionAmount: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[var(--coffee-brown)] to-[#8D6E63] text-white py-3.5 rounded-xl font-bold text-sm hover:translate-y-[-2px] hover:shadow-lg transition-all flex justify-center items-center gap-2 mt-6 active:scale-95"
                            >
                                {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {isEditing ? t('admin.marketing.coupons.form.update') : t('admin.marketing.coupons.form.create')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 bg-gray-50/50 rounded-2xl animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded-full mb-3"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center h-96">
                            <div className="p-4 bg-gray-50 rounded-full mb-4 animate-bounce-slow">
                                <Tag className="w-12 h-12 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('admin.marketing.coupons.list.noRules')}</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">{t('admin.marketing.coupons.list.noRulesDesc')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {coupons.map(rule => (
                                <div key={rule.id} className={`group bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm hover:shadow-xl hover:border-pink-100 dark:hover:border-pink-900/30 transition-all duration-300 ${!rule.isActive ? 'grayscale opacity-75 bg-gray-50' : ''}`}>
                                    <div className="flex items-start gap-5">
                                        <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-50 to-rose-50 text-pink-600 rounded-2xl border border-pink-100 shadow-inner">
                                            <Percent className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">{rule.name}</h4>
                                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 group-hover:bg-pink-50 group-hover:border-pink-200 group-hover:text-pink-700 transition-colors">
                                                    <Tag className="w-3 h-3 text-gray-400 group-hover:text-pink-500" />
                                                    <span className="text-xs font-mono font-bold tracking-wider">{rule.code}</span>
                                                </div>
                                                {!rule.isActive && <span className="text-[10px] uppercase font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{t('admin.marketing.coupons.list.draft')}</span>}
                                            </div>

                                            <div className="text-sm text-gray-500 mt-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 font-medium">
                                                {Number(rule.reductionPercent) > 0 && (
                                                    <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                                                        <Percent className="w-3.5 h-3.5" />
                                                        -{Number(rule.reductionPercent)}% {t('admin.marketing.coupons.list.off')}
                                                    </span>
                                                )}
                                                {Number(rule.reductionAmount) > 0 && (
                                                    <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                                                        <DollarSign className="w-3.5 h-3.5" />
                                                        -{Number(rule.reductionAmount)} {t('admin.marketing.coupons.list.off')}
                                                    </span>
                                                )}
                                                {rule.freeShipping && (
                                                    <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                        <Check className="w-3.5 h-3.5" />
                                                        {t('admin.marketing.coupons.form.freeShipping')}
                                                    </span>
                                                )}

                                                <span className="text-gray-300 hidden md:inline">|</span>

                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {rule.startsAt ? new Date(rule.startsAt).toLocaleDateString() : t('admin.marketing.coupons.list.now')}
                                                    {' → '}
                                                    {rule.endsAt ? new Date(rule.endsAt).toLocaleDateString() : t('admin.marketing.coupons.list.forever')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 sm:mt-0 pl-16 sm:pl-0">
                                        <button
                                            onClick={() => openEdit(rule)}
                                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105 active:scale-95"
                                            title={t('admin.common.edit')}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rule.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95"
                                            title={t('admin.common.delete')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
