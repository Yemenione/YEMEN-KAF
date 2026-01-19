
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface TaxRule {
    id: number;
    name: string;
    rate: number;
    country: string;
    priority: number;
    isActive: boolean;
}

export default function TaxRulesPage() {
    const [rules, setRules] = useState<TaxRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        rate: 0,
        country: "FR",
        priority: 0,
        isActive: true
    });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await fetch('/api/admin/tax-rules');
            if (res.ok) setRules(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editId ? `/api/admin/tax-rules/${editId}` : '/api/admin/tax-rules';
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            setIsEditing(false);
            setEditId(null);
            setFormData({ name: "", rate: 0, country: "FR", priority: 0, isActive: true });
            fetchRules();
        } else {
            alert('Failed to save tax rule');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/admin/tax-rules/${id}`, { method: 'DELETE' });
        if (res.ok) fetchRules();
        else {
            const err = await res.json();
            alert(err.error || 'Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Tax Rules</h1>
                <button
                    onClick={() => {
                        setIsEditing(true);
                        setEditId(null);
                        setFormData({ name: "", rate: 0, country: "FR", priority: 0, isActive: true });
                    }}
                    className="bg-[var(--coffee-brown)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90"
                >
                    <Plus size={18} /> Add Tax Rule
                </button>
            </div>

            {isEditing && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border dark:border-zinc-800 shadow-sm animate-fade-in">
                    <h3 className="font-semibold mb-4">{editId ? 'Edit Tax Rule' : 'New Tax Rule'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Rule Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Standard Rate"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Rate (%)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                value={formData.rate}
                                onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Country Code</label>
                            <input
                                required
                                type="text"
                                maxLength={2}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 uppercase"
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Priority</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm border rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm bg-[var(--honey-gold)] text-black font-medium rounded-lg hover:brightness-110"
                            >
                                Save Rule
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Rate</th>
                            <th className="px-6 py-3">Country</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800">
                        {rules.map((rule) => (
                            <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                <td className="px-6 py-4 font-medium">{rule.name}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {rule.rate}%
                                    </span>
                                </td>
                                <td className="px-6 py-4">{rule.country}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditId(rule.id);
                                            setFormData(rule);
                                        }}
                                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rule.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && rules.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No tax rules found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
