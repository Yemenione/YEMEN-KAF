"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, GripVertical } from "lucide-react";

interface AttributeValue {
    id?: number;
    name: string;
    value: string; // Hex color or text
    position: number;
}

interface Attribute {
    id: number;
    name: string; // Internal name
    publicName: string | null; // Frontend label
    type: string; // select, color, radio
    values: AttributeValue[];
}

export default function AttributesPage() {
    const [attributes, setAttributes] = useState<Attribute[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        publicName: string;
        type: string;
        values: AttributeValue[];
    }>({
        name: "",
        publicName: "",
        type: "select",
        values: []
    });

    const fetchAttributes = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/attributes');
            const data = await res.json();
            setAttributes(data);
        } catch (error) {
            console.error('Failed to fetch attributes', error);
        }
    }, []);

    // Fetching attributes is handled by useEffect below
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAttributes();
    }, [fetchAttributes]);

    const handleEdit = (attr: Attribute) => {
        setEditingAttr(attr);
        setFormData({
            name: attr.name,
            publicName: attr.publicName || "",
            type: attr.type,
            values: attr.values.map(v => ({ ...v }))
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingAttr(null);
        setFormData({
            name: "",
            publicName: "",
            type: "select",
            values: [{ name: "", value: "", position: 0 }]
        });
        setIsModalOpen(true);
    };

    const handleAddValue = () => {
        setFormData(prev => ({
            ...prev,
            values: [
                ...prev.values,
                { name: "", value: "", position: prev.values.length }
            ]
        }));
    };

    const handleRemoveValue = (index: number) => {
        setFormData(prev => ({
            ...prev,
            values: prev.values.filter((_, i) => i !== index)
        }));
    };

    const handleValueChange = (index: number, field: keyof AttributeValue, val: string) => {
        setFormData(prev => {
            const newValues = [...prev.values];
            // @ts-expect-error: indexing with dynamic field key
            newValues[index][field] = val;
            return { ...prev, values: newValues };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingAttr
            ? `/api/admin/attributes/${editingAttr.id}`
            : '/api/admin/attributes';

        const method = editingAttr ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchAttributes();
            } else {
                alert("Failed to save attribute");
            }
        } catch {
            alert("Error saving attribute");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this attribute? usage in products may break.")) return;

        try {
            const res = await fetch(`/api/admin/attributes/${id}`, { method: 'DELETE' });
            if (res.ok) fetchAttributes();
        } catch { alert('Failed to delete'); }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif text-[var(--coffee-brown)] dark:text-white">Product Attributes</h1>
                    <p className="text-gray-500">Manage options like Colors, Sizes, and Materials.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--coffee-brown)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus size={20} />
                    Add Attribute
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attributes.map(attr => (
                    <div key={attr.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg">{attr.publicName || attr.name}</h3>
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">{attr.name} • {attr.type}</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(attr)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(attr.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-md">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {attr.values.slice(0, 8).map(val => (
                                <span key={val.id} className="px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700 flex items-center gap-1">
                                    {attr.type === 'color' && (
                                        <span className="w-2 h-2 rounded-full border border-gray-300" style={{ backgroundColor: val.value }} />
                                    )}
                                    {val.name}
                                </span>
                            ))}
                            {attr.values.length > 8 && (
                                <span className="px-2 py-1 text-xs text-gray-400">+{attr.values.length - 8} more</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
                            <h3 className="text-xl font-semibold">{editingAttr ? 'Edit Attribute' : 'New Attribute'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Internal Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Color"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Used in backend (e.g. &quot;color_v2&quot;)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Public Name</label>
                                    <input
                                        type="text"
                                        placeholder="Coating Color"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.publicName}
                                        onChange={e => setFormData({ ...formData, publicName: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Visible to customers</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Attribute Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="select"
                                            checked={formData.type === 'select'}
                                            onChange={() => setFormData({ ...formData, type: 'select' })}
                                            className="text-[var(--coffee-brown)] focus:ring-[var(--honey-gold)]"
                                        />
                                        <span>Dropdown / Text</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="color"
                                            checked={formData.type === 'color'}
                                            onChange={() => setFormData({ ...formData, type: 'color' })}
                                            className="text-[var(--coffee-brown)] focus:ring-[var(--honey-gold)]"
                                        />
                                        <span>Color Swatch</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="radio"
                                            checked={formData.type === 'radio'}
                                            onChange={() => setFormData({ ...formData, type: 'radio' })}
                                            className="text-[var(--coffee-brown)] focus:ring-[var(--honey-gold)]"
                                        />
                                        <span>Radio Buttons</span>
                                    </label>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium">Values</h4>
                                    <button
                                        type="button"
                                        onClick={handleAddValue}
                                        className="text-sm text-[var(--coffee-brown)] font-medium hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Add Value
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.values.map((val, index) => (
                                        <div key={index} className="flex gap-3 items-center">
                                            <GripVertical size={16} className="text-gray-300 cursor-move" />
                                            <input
                                                type="text"
                                                placeholder="Label (e.g. Red)"
                                                className="flex-1 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                                value={val.name}
                                                onChange={e => handleValueChange(index, 'name', e.target.value)}
                                            />
                                            {formData.type === 'color' && (
                                                <input
                                                    type="color"
                                                    className="w-10 h-10 p-0.5 border rounded-lg bg-transparent cursor-pointer"
                                                    value={val.value || "#000000"}
                                                    onChange={e => handleValueChange(index, 'value', e.target.value)}
                                                />
                                            )}
                                            {(formData.type === 'select' || formData.type === 'radio') && (
                                                <input
                                                    type="text"
                                                    placeholder="Value (optional)"
                                                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-gray-500"
                                                    value={val.value}
                                                    onChange={e => handleValueChange(index, 'value', e.target.value)}
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveValue(index)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.values.length === 0 && (
                                        <div className="text-center py-6 text-gray-400 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-gray-200">
                                            No values added yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[var(--coffee-brown)] text-white font-medium text-sm rounded-lg hover:opacity-90"
                                >
                                    Save Attribute
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
