
"use client";

import { useState, useEffect } from 'react';
import { Search, Save, Globe, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TranslationSet {
    en: string;
    fr: string;
    ar: string;
}

interface TranslationsData {
    [key: string]: TranslationSet;
}

export default function TranslationsPage() {
    const [translations, setTranslations] = useState<TranslationsData>({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [saving, setSaving] = useState<string | null>(null);
    const [activeLang, setActiveLang] = useState<'en' | 'fr' | 'ar'>('en');

    useEffect(() => {
        fetchTranslations();
    }, []);

    const fetchTranslations = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/translations');
            const data = await res.json();
            setTranslations(data);
        } catch (error) {
            console.error('Failed to fetch translations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, lang: 'en' | 'fr' | 'ar', value: string) => {
        setSaving(`${key}-${lang}`);
        try {
            const res = await fetch('/api/admin/translations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, language: lang, value })
            });
            if (res.ok) {
                // Keep local state updated
                setTranslations(prev => ({
                    ...prev,
                    [key]: { ...prev[key], [lang]: value }
                }));
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(null);
        }
    };

    const filteredKeys = Object.keys(translations).filter(key =>
        key.toLowerCase().includes(filter.toLowerCase()) ||
        translations[key].en.toLowerCase().includes(filter.toLowerCase()) ||
        translations[key].fr.toLowerCase().includes(filter.toLowerCase()) ||
        translations[key].ar.toLowerCase().includes(filter.toLowerCase())
    ).sort();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Globe className="w-8 h-8 text-[var(--coffee-brown)]" />
                        Languages & Translations
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Manage all site text across English, French, and Arabic.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchTranslations}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                        title="Refresh translations"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search keys or text..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-md dark:bg-zinc-900 focus:ring-2 focus:ring-[var(--coffee-brown)] w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Stats / Groups (Optional) */}
            <div className="flex gap-4 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg w-fit">
                {(['en', 'fr', 'ar'] as const).map(lang => (
                    <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`px-6 py-2 rounded-md text-sm font-medium uppercase transition-all ${activeLang === lang
                                ? 'bg-white shadow-sm text-[var(--coffee-brown)]'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {lang === 'en' ? '🇺🇸 English' : lang === 'fr' ? '🇫🇷 French' : '🇾🇪 Arabic'}
                    </button>
                ))}
            </div>

            {/* Translation Table */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold w-1/3">Key / Path</th>
                            <th className="px-6 py-4 font-semibold uppercase">{activeLang} Translation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {loading ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <span>Loading keys...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredKeys.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                                    No translation keys match your search.
                                </td>
                            </tr>
                        ) : (
                            filteredKeys.map(key => (
                                <tr key={key} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="px-6 py-4 align-top">
                                        <div className="font-mono text-xs text-[var(--coffee-brown)] bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded w-fit">
                                            {key}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative group/input">
                                            <textarea
                                                defaultValue={translations[key][activeLang]}
                                                onBlur={(e) => {
                                                    if (e.target.value !== translations[key][activeLang]) {
                                                        handleSave(key, activeLang, e.target.value);
                                                    }
                                                }}
                                                className={`w-full p-3 border rounded-md transition-all resize-none h-20 focus:ring-2 focus:ring-[var(--coffee-brown)] outline-none ${saving === `${key}-${activeLang}`
                                                        ? 'opacity-50'
                                                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700'
                                                    }`}
                                                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                            {saving === `${key}-${activeLang}` && (
                                                <div className="absolute right-3 bottom-3">
                                                    <Loader2 className="w-4 h-4 animate-spin text-[var(--coffee-brown)]" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
