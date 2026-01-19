"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Globe, Check, Star, Edit2 } from "lucide-react";

interface Language {
    id: number;
    name: string;
    isoCode: string;
    locale: string;
    flag: string;
    isRTL: boolean;
    isActive: boolean;
    isDefault: boolean;
}

export default function LanguagesPage() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        isoCode: '',
        locale: '',
        flag: '',
        isRTL: false,
        isDefault: false,
        isActive: true
    });

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings/languages');
            const data = await res.json();
            setLanguages(data.length ? data : []);
        } catch (error) {
            console.error('Failed to fetch languages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditing && editId
                ? `/api/admin/settings/languages/${editId}`
                : '/api/admin/settings/languages';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchLanguages();
                resetForm();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch {
            alert('Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this language?')) return;
        try {
            const res = await fetch(`/api/admin/settings/languages/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchLanguages();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch {
            alert('Delete failed');
        }
    };

    const openEdit = (lang: Language) => {
        setFormData({
            name: lang.name,
            isoCode: lang.isoCode,
            locale: lang.locale,
            flag: lang.flag || '',
            isRTL: lang.isRTL,
            isDefault: lang.isDefault,
            isActive: lang.isActive
        });
        setEditId(lang.id);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({ name: '', isoCode: '', locale: '', flag: '', isRTL: false, isDefault: false, isActive: true });
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-600" />
                Internationalization
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Form Section */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm sticky top-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">{isEditing ? 'Edit Language' : 'Add New Language'}</h3>
                            {isEditing && (
                                <button onClick={resetForm} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                    placeholder="English, Français..."
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">ISO Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="en, fr..."
                                        maxLength={2}
                                        value={formData.isoCode}
                                        onChange={e => setFormData({ ...formData, isoCode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Locale</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="en-US, fr-FR..."
                                        value={formData.locale}
                                        onChange={e => setFormData({ ...formData, locale: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Flag Emoji</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-md px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                                    placeholder="🇺🇸, 🇫🇷, 🇾🇪"
                                    value={formData.flag}
                                    onChange={e => setFormData({ ...formData, flag: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isRTL}
                                        onChange={e => setFormData({ ...formData, isRTL: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">RTL (Right-to-Left)</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Set as Default Language</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Active / Published</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[var(--coffee-brown)] text-white py-2 rounded-md font-medium text-sm hover:bg-[#5a4635] flex justify-center items-center gap-2"
                            >
                                {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {isEditing ? "Update Language" : "Add Language"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="md:col-span-2 space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading languages...</div>
                    ) : languages.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-8 text-center text-gray-500">
                            No languages defined yet. Add one to get started.
                        </div>
                    ) : (
                        languages.map(lang => (
                            <div key={lang.id} className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 flex items-center justify-between shadow-sm transition-all ${lang.isDefault ? 'border-[var(--honey-gold)] ring-1 ring-[var(--honey-gold)]' : 'border-gray-200 dark:border-zinc-800'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl bg-gray-50 w-12 h-12 flex items-center justify-center rounded-lg border">
                                        {lang.flag || '🌐'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">{lang.name}</h4>
                                            {lang.isDefault && (
                                                <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-current" /> Default
                                                </span>
                                            )}
                                            {!lang.isActive && (
                                                <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1 flex gap-3">
                                            <span className="bg-gray-100 dark:bg-zinc-800 px-2 rounded text-xs font-mono">{lang.isoCode}</span>
                                            <span className="bg-gray-100 dark:bg-zinc-800 px-2 rounded text-xs font-mono">{lang.locale}</span>
                                            {lang.isRTL && <span className="text-xs text-blue-500 font-medium">RTL</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEdit(lang)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>

                                    {!lang.isDefault && (
                                        <button
                                            onClick={() => handleDelete(lang.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
