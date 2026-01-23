'use client';

import { useState, useEffect } from 'react';
import { Loader2, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import ImageUploader from '@/components/admin/ImageUploader';

interface Carrier {
    id: number;
    name: string;
    logo?: string;
    deliveryTime?: string;
    isActive: boolean;
    isFree: boolean;
    description?: string;
}

export default function CarriersManager() {
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Carrier>>({});

    useEffect(() => {
        fetchCarriers();
    }, []);

    const fetchCarriers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/carriers');
            if (res.ok) {
                const data = await res.json();
                setCarriers(data);
            }
        } catch {
            // console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (carrier: Carrier) => {
        setEditingId(carrier.id);
        setEditForm({ ...carrier });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async () => {
        if (!editingId) return;
        try {
            const res = await fetch('/api/admin/carriers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...editForm, id: editingId })
            });
            if (res.ok) {
                setEditingId(null);
                fetchCarriers();
            }
        } catch {
            alert('Failed to save');
        }
    };

    if (loading) return <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-[var(--coffee-brown)]" /></div>;

    return (
        <div className="border border-gray-100 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs uppercase text-gray-500 font-semibold tracking-wider border-b border-gray-100 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 w-24">Logo</th>
                            <th className="px-6 py-4">Nom</th>
                            <th className="px-6 py-4">Livraison</th>
                            <th className="px-6 py-4 text-center w-32">Statut</th>
                            <th className="px-6 py-4 text-right w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {carriers.map((carrier) => {
                            const isEditing = editingId === carrier.id;
                            return (
                                <tr key={carrier.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                    {/* Logo Column */}
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <div className="w-12 h-12">
                                                <ImageUploader
                                                    value={editForm.logo || ''}
                                                    onChange={(url) => setEditForm(prev => ({ ...prev, logo: url }))}
                                                    folder="carriers"
                                                    className="w-12 h-12 [&>div]:w-12 [&>div]:h-12 [&>div]:border-dashed [&>div]:rounded-md"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 relative bg-gray-50 dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                                                {carrier.logo ? (
                                                    <Image src={carrier.logo} alt={carrier.name} fill className="object-contain p-1" />
                                                ) : (
                                                    <ImageIcon className="w-4 h-4 text-gray-300" />
                                                )}
                                            </div>
                                        )}
                                    </td>

                                    {/* Name Column */}
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.name || ''}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full px-3 py-1.5 border rounded-md text-sm dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            />
                                        ) : (
                                            carrier.name
                                        )}
                                    </td>

                                    {/* Delivery Time Column */}
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.deliveryTime || ''}
                                                onChange={(e) => setEditForm({ ...editForm, deliveryTime: e.target.value })}
                                                className="w-full px-3 py-1.5 border rounded-md text-sm dark:bg-zinc-800 dark:border-zinc-700 focus:ring-[var(--coffee-brown)]"
                                            />
                                        ) : (
                                            carrier.deliveryTime
                                        )}
                                    </td>

                                    {/* Status Column */}
                                    <td className="px-6 py-4 text-center">
                                        {isEditing ? (
                                            <button
                                                onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${editForm.isActive
                                                    ? 'bg-green-50 text-green-600 border-green-200'
                                                    : 'bg-gray-50 text-gray-500 border-gray-200'
                                                    }`}
                                            >
                                                {editForm.isActive ? 'ACTIF' : 'INACTIF'}
                                            </button>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${carrier.isActive
                                                ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                                : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700'
                                                }`}>
                                                {carrier.isActive ? 'ACTIF' : 'INACTIF'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions Column */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        className="p-1.5 text-[var(--coffee-brown)] hover:bg-[var(--coffee-brown)]/10 rounded-md transition-colors"
                                                        title="Save"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleEdit(carrier)}
                                                    className="p-1.5 text-gray-400 hover:text-[var(--coffee-brown)] hover:bg-gray-50 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {carriers.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No carriers configured. Check database seed.
                    </div>
                )}
            </div>
        </div>
    );
}
