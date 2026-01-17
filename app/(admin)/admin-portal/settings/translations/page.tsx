"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Filter, Search } from "lucide-react";

interface TranslationRow {
    group: string;
    key: string;
    [languageCode: string]: string; // Dynamic keys for languages
}

interface Language {
    id: number;
    isoCode: string;
    name: string;
    flag: string;
}

export default function TranslationsPage() {
    const [translations, setTranslations] = useState<TranslationRow[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterGroup, setFilterGroup] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // State for new key modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKeyData, setNewKeyData] = useState({ group: 'frontend', key: '', value: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [langRes, transRes] = await Promise.all([
                fetch('/api/admin/settings/languages'),
                fetch('/api/admin/settings/translations')
            ]);

            const langs = await langRes.json();
            const trans = await transRes.json();

            setLanguages(langs);
            setTranslations(trans);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (group: string, key: string, language: string, value: string) => {
        try {
            // Optimistic update
            // (In a real app, maybe show a spinner per cell)

            const res = await fetch('/api/admin/settings/translations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group, key, language, value })
            });

            if (!res.ok) throw new Error('Failed to save');

            // Visual feedback could be added here (e.g. green border flash)

        } catch (error) {
            alert('Failed to save translation');
        }
    };

    const handleAddKey = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Add initial value for default language (or English)
            await handleSave(newKeyData.group, newKeyData.key, 'en', newKeyData.value); // Defaulting to 'en' for now

            setShowAddModal(false);
            setNewKeyData({ group: 'frontend', key: '', value: '' });
            fetchData(); // Reload to see new row
        } catch (error) {
            alert('Failed to add key');
        }
    };

    // Filter Logic
    const filteredTranslations = translations.filter(t => {
        const matchesGroup = filterGroup === 'All' || t.group === filterGroup;
        const matchesSearch = t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            Object.values(t).some(v => typeof v === 'string' && v.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesGroup && matchesSearch;
    });

    const groups = Array.from(new Set(translations.map(t => t.group)));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Translations</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-[var(--coffee-brown)] text-white rounded-md text-sm font-medium hover:bg-[#5a4635] flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Translation Key
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search keys or values..."
                        className="w-full pl-9 pr-4 py-2 border rounded-md text-sm dark:bg-zinc-800 dark:border-zinc-700"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        className="border rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700"
                        value={filterGroup}
                        onChange={e => setFilterGroup(e.target.value)}
                    >
                        <option value="All">All Groups</option>
                        {groups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500 uppercase font-medium border-b dark:border-zinc-700">
                            <tr>
                                <th className="px-6 py-3 w-64">Key</th>
                                {languages.map(lang => (
                                    <th key={lang.id} className="px-6 py-3 min-w-[200px]">
                                        <div className="flex items-center gap-2">
                                            <span>{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={10} className="p-8 text-center">Loading translations...</td></tr>
                            ) : filteredTranslations.length === 0 ? (
                                <tr><td colSpan={10} className="p-8 text-center text-gray-500">No translations found</td></tr>
                            ) : (
                                filteredTranslations.map((row) => (
                                    <tr key={`${row.group}-${row.key}`} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20">
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded w-fit mb-1">
                                                {row.key}
                                            </div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-widest">{row.group}</div>
                                        </td>
                                        {languages.map(lang => (
                                            <td key={lang.id} className="px-4 py-3 align-top">
                                                <textarea
                                                    className="w-full border border-transparent hover:border-gray-200 focus:border-[var(--honey-gold)] rounded px-2 py-1 bg-transparent focus:bg-white dark:focus:bg-zinc-800 transition-all text-sm resize-none h-auto min-h-[40px]"
                                                    defaultValue={row[lang.isoCode] || ''}
                                                    onBlur={(e) => {
                                                        const newVal = e.target.value;
                                                        if (newVal !== row[lang.isoCode]) {
                                                            handleSave(row.group, row.key, lang.isoCode, newVal);
                                                        }
                                                    }}
                                                    placeholder={`Enter ${lang.name} text...`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Key Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold mb-4">Add Translation Key</h3>
                        <form onSubmit={handleAddKey} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Group</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 dark:bg-zinc-800"
                                    value={newKeyData.group}
                                    onChange={e => setNewKeyData({ ...newKeyData, group: e.target.value })}
                                >
                                    <option value="frontend">Frontend</option>
                                    <option value="admin">Admin</option>
                                    <option value="messages">Messages / Errors</option>
                                    <option value="products">Products</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Key (dot.notation)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded-md px-3 py-2 dark:bg-zinc-800"
                                    placeholder="e.g. nav.home or error.login_failed"
                                    value={newKeyData.key}
                                    onChange={e => setNewKeyData({ ...newKeyData, key: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Initial Value (English)</label>
                                <textarea
                                    required
                                    className="w-full border rounded-md px-3 py-2 dark:bg-zinc-800"
                                    placeholder="Default text..."
                                    value={newKeyData.value}
                                    onChange={e => setNewKeyData({ ...newKeyData, value: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[var(--coffee-brown)] text-white rounded-md hover:bg-[#5a4635]"
                                >
                                    Add Key
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
