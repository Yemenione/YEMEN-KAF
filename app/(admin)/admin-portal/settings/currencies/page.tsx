"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, DollarSign, Edit2, RotateCw, Check } from "lucide-react";

interface Currency {
    id: number;
    name: string;
    isoCode: string;
    symbol: string;
    exchangeRate: number;
    isDefault: boolean;
    isActive: boolean;
}

export default function CurrenciesPage() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        isoCode: '',
        symbol: '',
        exchangeRate: 1,
        isDefault: false,
        isActive: true
    });

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings/currencies');
            const data = await res.json();
            setCurrencies(data.length ? data : []);
        } catch (error) {
            console.error('Failed to fetch currencies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditing && editId
                ? `/api/admin/settings/currencies/${editId}`
                : '/api/admin/settings/currencies';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchCurrencies();
                resetForm();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            alert('Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this currency?')) return;
        try {
            const res = await fetch(`/api/admin/settings/currencies/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCurrencies();
        } catch (error) {
            alert('Delete failed');
        }
    };

    const openEdit = (curr: Currency) => {
        setFormData({
            name: curr.name,
            isoCode: curr.isoCode,
            symbol: curr.symbol,
            exchangeRate: Number(curr.exchangeRate),
            isDefault: curr.isDefault,
            isActive: curr.isActive
        });
        setEditId(curr.id);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({ name: '', isoCode: '', symbol: '', exchangeRate: 1, isDefault: false, isActive: true });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                </div>
                Currencies & Exchange Rates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Form */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm sticky top-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">{isEditing ? 'Edit Currency' : 'Add New Currency'}</h3>
                            {isEditing && <button onClick={resetForm} className="text-xs text-gray-400">Cancel</button>}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Currency Name</label>
                                <input
                                    type="text" required placeholder="Euro, US Dollar..."
                                    className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">ISO Code</label>
                                    <input
                                        type="text" required maxLength={3} placeholder="EUR"
                                        className="w-full border rounded-md px-3 py-2 text-sm uppercase dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.isoCode}
                                        onChange={e => setFormData({ ...formData, isoCode: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Symbol</label>
                                    <input
                                        type="text" required placeholder="€, $..."
                                        className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.symbol}
                                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Exchange Rate (1 Default = ? This)</label>
                                <input
                                    type="number" step="0.000001" min="0" disabled={formData.isDefault}
                                    className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 disabled:bg-gray-100 disabled:text-gray-400"
                                    value={formData.exchangeRate}
                                    onChange={e => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) })}
                                />
                                {formData.isDefault && <p className="text-[10px] text-gray-400 mt-1">Default currency always has a rate of 1.0</p>}
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={e => {
                                            const isDef = e.target.checked;
                                            setFormData({
                                                ...formData,
                                                isDefault: isDef,
                                                exchangeRate: isDef ? 1 : formData.exchangeRate
                                            });
                                        }}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Set as Base Currency</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Active</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[var(--coffee-brown)] text-white py-2 rounded-md font-medium text-sm hover:bg-[#5a4635] flex justify-center items-center gap-2"
                            >
                                {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {isEditing ? "Update Currency" : "Add Currency"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    {currencies.map(curr => (
                        <div key={curr.id} className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 flex items-center justify-between shadow-sm ${curr.isDefault ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 dark:border-zinc-800'}`}>
                            <div className="flex items-center gap-4">
                                <div className="text-xl bg-gray-50 w-12 h-12 flex items-center justify-center rounded-lg border font-bold text-gray-700">
                                    {curr.symbol}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{curr.name}</h4>
                                        <span className="bg-gray-100 dark:bg-zinc-800 px-2 rounded text-xs font-mono">{curr.isoCode}</span>
                                        {curr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">BASE</span>}
                                        {!curr.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Exchange Rate: <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{Number(curr.exchangeRate).toFixed(6)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => openEdit(curr)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                {!curr.isDefault && (
                                    <button onClick={() => handleDelete(curr.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {currencies.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border border-dashed">
                            No currencies configured. Add the base currency first due to logic constraints.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
