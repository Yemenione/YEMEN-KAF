"use client";

import { useEffect, useState } from "react";
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

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
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
    };

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
        <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                    <Tag className="w-6 h-6" />
                </div>
                {t('admin.marketing.coupons.title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Form Section */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm sticky top-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">{isEditing ? t('admin.marketing.coupons.editCoupon') : t('admin.marketing.coupons.newCoupon')}</h3>
                            {isEditing && <button onClick={resetForm} className="text-xs text-gray-400">{t('admin.marketing.coupons.cancel')}</button>}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4 border-b dark:border-zinc-800 pb-2">
                            {(['info', 'conditions', 'actions'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full ${activeTab === tab ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {t(`marketing.coupons.tabs.${tab}`)}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* TAB: INFO */}
                            {activeTab === 'info' && (
                                <div className="space-y-3 animate-in fade-in">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.marketing.coupons.form.name')}</label>
                                        <input
                                            type="text" required placeholder="Summer Sale 2025"
                                            className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.marketing.coupons.form.code')}</label>
                                        <input
                                            type="text" required placeholder="SUMMER20"
                                            className="w-full border rounded-md px-3 py-2 text-sm uppercase font-mono dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.marketing.coupons.form.description')}</label>
                                        <textarea
                                            className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 h-20"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">{t('admin.marketing.coupons.form.isActive')}</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* TAB: CONDITIONS */}
                            {activeTab === 'conditions' && (
                                <div className="space-y-3 animate-in fade-in">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.marketing.coupons.form.startsAt')}</label>
                                            <input
                                                type="date"
                                                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                                value={formData.startsAt || ''}
                                                onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.marketing.coupons.form.endsAt')}</label>
                                            <input
                                                type="date"
                                                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                                value={formData.endsAt || ''}
                                                onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.marketing.coupons.form.minAmount')}</label>
                                        <input
                                            type="number" min="0" step="0.01"
                                            className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.minAmount}
                                            onChange={e => setFormData({ ...formData, minAmount: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.marketing.coupons.form.totalAvailable')}</label>
                                            <input
                                                type="number" min="1"
                                                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                                value={formData.totalAvailable}
                                                onChange={e => setFormData({ ...formData, totalAvailable: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.marketing.coupons.form.totalPerUser')}</label>
                                            <input
                                                type="number" min="1"
                                                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                                value={formData.totalPerUser}
                                                onChange={e => setFormData({ ...formData, totalPerUser: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: ACTIONS */}
                            {activeTab === 'actions' && (
                                <div className="space-y-3 animate-in fade-in">
                                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-md">
                                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.freeShipping}
                                                onChange={e => setFormData({ ...formData, freeShipping: e.target.checked })}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm font-medium">{t('admin.marketing.coupons.form.freeShipping')}</span>
                                        </label>
                                        <p className="text-xs text-gray-400 ml-6">{t('admin.marketing.coupons.form.freeShippingDesc')}</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.marketing.coupons.form.percentDiscount')}</label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                            <input
                                                type="number" min="0" max="100" step="0.1"
                                                className="w-full pl-9 border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                                value={formData.reductionPercent}
                                                onChange={e => setFormData({ ...formData, reductionPercent: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('admin.marketing.coupons.form.amountDiscount')}</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                            <input
                                                type="number" min="0" step="0.01"
                                                className="w-full pl-9 border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                                value={formData.reductionAmount}
                                                onChange={e => setFormData({ ...formData, reductionAmount: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-[var(--coffee-brown)] text-white py-2 rounded-md font-medium text-sm hover:bg-[#5a4635] flex justify-center items-center gap-2 mt-4"
                            >
                                {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {isEditing ? t('admin.marketing.coupons.form.update') : t('admin.marketing.coupons.form.create')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="md:col-span-2 space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">{t('admin.marketing.coupons.list.loading')}</div>
                    ) : coupons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border rounded-xl p-10 text-center">
                            <Tag className="w-12 h-12 text-gray-200 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('admin.marketing.coupons.list.noRules')}</h3>
                            <p className="text-gray-500 mt-1 mb-4">{t('admin.marketing.coupons.list.noRulesDesc')}</p>
                        </div>
                    ) : (
                        coupons.map(rule => (
                            <div key={rule.id} className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all ${!rule.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 bg-pink-50 text-pink-600 rounded-lg border border-pink-100">
                                        <Percent className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">{rule.name}</h4>
                                            <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs font-mono tracking-wider border">{rule.code}</span>
                                            {!rule.isActive && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 rounded-full">{t('admin.marketing.coupons.list.draft')}</span>}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                            {Number(rule.reductionPercent) > 0 && <span className="text-green-600 font-medium">-{Number(rule.reductionPercent)}% {t('admin.marketing.coupons.list.off')}</span>}
                                            {Number(rule.reductionAmount) > 0 && <span className="text-green-600 font-medium">-{Number(rule.reductionAmount)} {t('admin.marketing.coupons.list.off')}</span>}
                                            {rule.freeShipping && <span className="text-blue-600 font-medium">+ {t('admin.marketing.coupons.form.freeShipping')}</span>}

                                            <span className="text-gray-300 hidden md:inline">|</span>

                                            <div className="flex items-center gap-1 text-xs">
                                                <Calendar className="w-3 h-3" />
                                                {rule.startsAt ? new Date(rule.startsAt).toLocaleDateString() : t('admin.marketing.coupons.list.now')}
                                                {' -> '}
                                                {rule.endsAt ? new Date(rule.endsAt).toLocaleDateString() : t('admin.marketing.coupons.list.forever')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={() => openEdit(rule)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(rule.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
