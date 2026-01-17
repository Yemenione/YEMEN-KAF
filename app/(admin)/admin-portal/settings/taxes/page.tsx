"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Globe, Edit2, Percent, Check } from "lucide-react";

interface TaxRule {
    id: number;
    name: string;
    rate: number;
    country: string;
    priority: number;
    isActive: boolean;
}

export default function TaxesPage() {
    const [taxes, setTaxes] = useState<TaxRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        rate: 0,
        country: '',
        priority: 0,
        isActive: true
    });

    useEffect(() => {
        fetchTaxes();
    }, []);

    const fetchTaxes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings/taxes');
            const data = await res.json();
            setTaxes(data.length ? data : []);
        } catch (error) {
            console.error('Failed to fetch taxes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditing && editId
                ? `/api/admin/settings/taxes/${editId}`
                : '/api/admin/settings/taxes';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchTaxes();
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
        if (!confirm('Delete this tax rule?')) return;
        try {
            const res = await fetch(`/api/admin/settings/taxes/${id}`, { method: 'DELETE' });
            if (res.ok) fetchTaxes();
        } catch (error) {
            alert('Delete failed');
        }
    };

    const openEdit = (rule: TaxRule) => {
        setFormData({
            name: rule.name,
            rate: Number(rule.rate),
            country: rule.country,
            priority: rule.priority,
            isActive: rule.isActive
        });
        setEditId(rule.id);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({ name: '', rate: 20, country: 'FR', priority: 0, isActive: true });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Percent className="w-6 h-6" />
                </div>
                Tax Rules
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Form */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm sticky top-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">{isEditing ? 'Edit Tax Rule' : 'Add New Tax Rule'}</h3>
                            {isEditing && <button onClick={resetForm} className="text-xs text-gray-400">Cancel</button>}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Rule Name</label>
                                <input
                                    type="text" required placeholder="Standard Rate"
                                    className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Rate (%)</label>
                                    <input
                                        type="number" step="0.01" min="0" required
                                        className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.rate}
                                        onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Country Code</label>
                                    <input
                                        type="text" required maxLength={2} placeholder="FR"
                                        className="w-full border rounded-md px-3 py-2 text-sm uppercase dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Priority (Higher runs first)</label>
                                <input
                                    type="number" step="1"
                                    className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-2 pt-2">
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
                                {isEditing ? "Update Rule" : "Add Tax Rule"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    {taxes.map(tax => (
                        <div key={tax.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="text-lg bg-gray-50 w-12 h-12 flex items-center justify-center rounded-lg border font-bold text-gray-500">
                                    {tax.country}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{tax.name}</h4>
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-xs">{Number(tax.rate).toFixed(2)}%</span>
                                        {!tax.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1 flex gap-3">
                                        <span>Priority: {tax.priority}</span>
                                        <span className="text-gray-300">|</span>
                                        <span>Applies to {tax.country === 'ALL' ? 'All Countries' : tax.country}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => openEdit(tax)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(tax.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {taxes.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border border-dashed">
                            No tax rules defined.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
