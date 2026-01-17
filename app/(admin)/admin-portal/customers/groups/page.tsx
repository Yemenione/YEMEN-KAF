"use client";

import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface CustomerGroup {
    id: number;
    name: string;
    discountPct: number;
    color: string | null;
    _count?: {
        customers: number;
    }
}

export default function CustomerGroupsPage() {
    const [groups, setGroups] = useState<CustomerGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        discountPct: 0,
        color: '#000000'
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/admin/customers/groups');
            const data = await res.json();
            setGroups(data);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/customers/groups/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (res.ok) {
                fetchGroups();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = isEditing
                ? `/api/admin/customers/groups/${isEditing}`
                : '/api/admin/customers/groups';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsEditing(null);
                setShowAddForm(false);
                setFormData({ name: '', discountPct: 0, color: '#000000' });
                fetchGroups();
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const startEdit = (group: CustomerGroup) => {
        setIsEditing(group.id);
        setFormData({
            name: group.name,
            discountPct: Number(group.discountPct),
            color: group.color || '#000000'
        });
        setShowAddForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customer Groups</h1>
                    <p className="text-gray-500 text-sm">Manage customer segments and benefits.</p>
                </div>
                {!showAddForm && (
                    <button
                        onClick={() => {
                            setIsEditing(null);
                            setFormData({ name: '', discountPct: 0, color: '#000000' });
                            setShowAddForm(true);
                        }}
                        className="bg-[var(--coffee-brown)] text-white px-4 py-2 rounded-md hover:bg-[#5a4635] flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Group
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-medium mb-4">{isEditing ? 'Edit Group' : 'New Group'}</h3>
                    <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                placeholder="e.g. VIP"
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Discount %</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.discountPct}
                                onChange={(e) => setFormData({ ...formData, discountPct: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                            />
                        </div>
                        <div className="w-20">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-full h-10 p-1 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 cursor-pointer"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-[var(--coffee-brown)] text-white px-4 py-2 rounded-md hover:bg-[#5a4635] flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Global Discount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {groups.map((group) => (
                            <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: group.color || '#ccc' }}
                                        />
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{group.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {Number(group.discountPct) > 0 ? (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                            -{Number(group.discountPct)}%
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        {group._count?.customers || 0}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => startEdit(group)}
                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(group.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && groups.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No customer groups found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
