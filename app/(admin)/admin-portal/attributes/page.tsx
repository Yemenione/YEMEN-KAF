"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, X, GripVertical, Search, Save } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { hasPermission, Permission, AdminRole } from "@/lib/rbac";
import { toast } from "sonner";

interface AttributeValue {
    id?: number;
    name: string;
    value: string; // Hex color or text
    position: number;
    translations?: Record<string, Record<string, string>>;
}

interface Attribute {
    id: number;
    name: string; // Internal name
    publicName: string | null; // Frontend label
    type: string; // select, color, radio
    values: AttributeValue[];
    translations?: Record<string, Record<string, string>>;
}

export default function AttributesPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTranslating, setIsTranslating] = useState(false);
    const [search, setSearch] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        publicName: string;
        type: string;
        values: AttributeValue[];
        translations?: Record<string, Record<string, string>>;
    }>({
        name: "",
        publicName: "",
        type: "select",
        values: [],
        translations: {}
    });

    const [activeLang, setActiveLang] = useState('en');
    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'fr', label: 'French', flag: '🇫🇷' },
        { code: 'ar', label: 'Arabic', flag: '🇾🇪' }
    ];

    const role = (user?.role || 'EDITOR') as AdminRole;
    const canManage = hasPermission(role, Permission.MANAGE_ATTRIBUTES);

    const fetchAttributes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/attributes');
            if (res.ok) {
                const data = await res.json();
                setAttributes(data);
            }
        } catch {
            toast.error("Failed to load attributes");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAttributes();
    }, [fetchAttributes]);

    const handleEdit = (attr: Attribute) => {
        setEditingAttr(attr);
        setFormData({
            name: attr.name,
            publicName: attr.publicName || "",
            type: attr.type,
            values: attr.values.map(v => ({
                ...v,
                translations: v.translations || {}
            })),
            translations: attr.translations || {}
        });
        setActiveLang('en');
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingAttr(null);
        setFormData({
            name: "",
            publicName: "",
            type: "select",
            values: [{ name: "", value: "", position: 0, translations: {} }],
            translations: {}
        });
        setActiveLang('en');
        setIsModalOpen(true);
    };

    const getValue = (field: keyof typeof formData | string) => {
        if (activeLang === 'en') {
            // Access strictly safely if possible, or fallback to known fields used in creating
            return (formData as unknown as Record<string, unknown>)[field] as string || '';
        }
        return formData.translations?.[activeLang]?.[field] || '';
    };

    const setValue = (field: string, value: string) => {
        if (activeLang === 'en') {
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                translations: {
                    ...prev.translations,
                    [activeLang]: {
                        ...prev.translations?.[activeLang],
                        [field]: value
                    }
                }
            }));
        }
    };

    const getValueForValue = (index: number, field: keyof AttributeValue) => {
        const val = formData.values[index];
        if (!val) return '';
        if (activeLang === 'en') return (val[field] as string) || '';
        return formData.values[index].translations?.[activeLang]?.[field as string] || '';
    };

    const handleValueChange = (index: number, field: keyof AttributeValue, val: string) => {
        setFormData(prev => {
            const newValues = [...prev.values];
            if (activeLang === 'en') {
                newValues[index] = { ...newValues[index], [field]: val };
            } else {
                newValues[index] = {
                    ...newValues[index],
                    translations: {
                        ...newValues[index].translations,
                        [activeLang]: {
                            ...newValues[index].translations?.[activeLang],
                            [field]: val
                        }
                    }
                };
            }
            return { ...prev, values: newValues };
        });
    };

    const handleAutoTranslate = async () => {
        const currentName = getValue('publicName');
        if (!currentName) {
            toast.error("Enter English public name first");
            return;
        }

        setIsTranslating(true);
        try {
            const { translateContent } = await import('@/app/actions/ai');
            const targetLangs = languages.filter(l => l.code !== 'en').map(l => l.code);

            // Translate public name
            const res = await translateContent({ publicName: currentName }, targetLangs, 'en');

            if (res.data) {
                setFormData(prev => {
                    const next = { ...prev };
                    targetLangs.forEach(lang => {
                        if (res.data[lang]?.publicName) {
                            next.translations = {
                                ...next.translations,
                                [lang]: {
                                    ...next.translations?.[lang],
                                    publicName: res.data[lang].publicName
                                }
                            };
                        }
                    });
                    return next;
                });
                toast.success("Translations generated!");
            }
        } catch {
            toast.error("Translation failed");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleAddValue = () => {
        setFormData(prev => ({
            ...prev,
            values: [
                ...prev.values,
                { name: "", value: "", position: prev.values.length, translations: {} }
            ]
        }));
    };

    const handleRemoveValue = (index: number) => {
        setFormData(prev => ({
            ...prev,
            values: prev.values.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingAttr ? `/api/admin/attributes/${editingAttr.id}` : '/api/admin/attributes';
        const method = editingAttr ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingAttr ? "Attribute updated" : "Attribute created");
                setIsModalOpen(false);
                fetchAttributes();
            } else {
                toast.error("Failed to save attribute");
            }
        } catch {
            toast.error("Network error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.attributes.confirmDelete'))) return;
        try {
            const res = await fetch(`/api/admin/attributes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Attribute deleted");
                fetchAttributes();
            }
        } catch {
            toast.error("Delete failed");
        }
    };

    const filteredAttributes = attributes.filter(attr =>
        (attr.publicName || attr.name).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Save className="w-6 h-6 text-[var(--coffee-brown)]" />
                        {t('admin.attributes.title')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage options like Colors, Sizes, and Materials.</p>
                </div>

                {canManage && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-zinc-500/10 transition-all text-sm font-bold"
                    >
                        <Plus size={18} /> {t('admin.attributes.addNew')}
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/40 dark:shadow-none overflow-hidden">
                {/* Search */}
                <div className="p-4 border-b border-gray-50 dark:border-zinc-800">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--coffee-brown)] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={t('admin.attributes.searchPlaceholder')}
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-6 py-4">{t('admin.products.form.publicName')}</th>
                                <th className="px-6 py-4">{t('admin.products.form.internalName')}</th>
                                <th className="px-6 py-4">{t('admin.products.form.type')}</th>
                                <th className="px-6 py-4">{t('admin.products.form.values')}</th>
                                <th className="px-6 py-4 text-right">{t('admin.common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">{t('admin.common.loading')}</td></tr>
                            ) : filteredAttributes.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">{t('admin.common.noResults')}</td></tr>
                            ) : (
                                filteredAttributes.map((attr) => (
                                    <tr key={attr.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                        <td className="px-6 py-3">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{attr.publicName || attr.name}</p>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-gray-500 font-mono">{attr.name}</td>
                                        <td className="px-6 py-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{attr.type}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {attr.values.slice(0, 5).map(v => (
                                                    <span key={v.id} className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                                                        {attr.type === 'color' && <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: v.value }} />}
                                                        {v.name}
                                                    </span>
                                                ))}
                                                {attr.values.length > 5 && <span className="text-[10px] text-gray-400">+{attr.values.length - 5}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleEdit(attr)}
                                                    className="p-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl hover:bg-[var(--coffee-brown)] hover:text-white shadow-sm transition-all group/btn"
                                                >
                                                    <Edit size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(attr.id)}
                                                    className="p-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl hover:bg-rose-600 hover:text-white shadow-sm transition-all group/btn"
                                                >
                                                    <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 p-4">
                    {loading ? (
                        <div className="text-center py-8 text-sm text-gray-400">{t('admin.common.loading')}</div>
                    ) : filteredAttributes.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-400">{t('admin.common.noResults')}</div>
                    ) : (
                        filteredAttributes.map((attr) => (
                            <div key={attr.id} className="bg-gray-50/50 dark:bg-zinc-800/30 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{attr.publicName || attr.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{attr.name} • {attr.type}</p>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleEdit(attr)}
                                            className="p-1.5 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg text-blue-600 shadow-sm"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(attr.id)}
                                            className="p-1.5 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg text-rose-600 shadow-sm"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {attr.values.slice(0, 10).map(v => (
                                        <span key={v.id} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-[9px] font-bold text-gray-500 border border-gray-100 dark:border-zinc-700">
                                            {attr.type === 'color' && <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: v.value }} />}
                                            {v.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-inherit z-10">
                            <h3 className="text-lg font-bold text-[var(--coffee-brown)] dark:text-white">{editingAttr ? 'Edit Attribute' : 'New Attribute'}</h3>
                            <div className="flex items-center gap-2">
                                {languages.map(lang => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => setActiveLang(lang.code)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${activeLang === lang.code
                                            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white'
                                            : 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-zinc-800 dark:border-zinc-700'
                                            }`}
                                    >
                                        {lang.code.toUpperCase()}
                                    </button>
                                ))}
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 ml-2">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-6">
                            <form id="attributeForm" onSubmit={handleSubmit} className="space-y-6">
                                {activeLang !== 'en' && (
                                    <button
                                        type="button"
                                        onClick={handleAutoTranslate}
                                        disabled={isTranslating}
                                        className="w-full py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 border border-purple-100"
                                    >
                                        {isTranslating ? 'Translating...' : `✨ AI Translate to ${languages.find(l => l.code === activeLang)?.label}`}
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">{t('admin.products.form.internalName')}</label>
                                        <input
                                            required
                                            disabled={activeLang !== 'en'}
                                            className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold disabled:opacity-50"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. color"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">{t('admin.products.form.publicName')} ({activeLang.toUpperCase()})</label>
                                        <input
                                            className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                                            value={getValue('publicName')}
                                            onChange={e => setValue('publicName', e.target.value)}
                                            placeholder="e.g. Choose Color"
                                            dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t('admin.products.form.type')}</label>
                                    <div className="flex gap-4">
                                        {['select', 'color', 'radio'].map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    disabled={activeLang !== 'en'}
                                                    checked={formData.type === type}
                                                    onChange={() => setFormData({ ...formData, type })}
                                                    className="w-4 h-4 text-zinc-900 focus:ring-zinc-500"
                                                />
                                                <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900 transition-colors capitalize">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">{t('admin.products.form.values')}</h4>
                                        <button
                                            type="button"
                                            onClick={handleAddValue}
                                            className="text-[10px] font-black uppercase tracking-widest text-[var(--coffee-brown)] hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Add Value
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {formData.values.map((val, idx) => (
                                            <div key={idx} className="flex gap-3 items-center group/val">
                                                <GripVertical size={16} className="text-gray-300 cursor-move" />
                                                <div className="flex-1">
                                                    <input
                                                        className="w-full px-4 py-2 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-xs font-bold"
                                                        placeholder={`Label (${activeLang.toUpperCase()})`}
                                                        value={getValueForValue(idx, 'name')}
                                                        onChange={e => handleValueChange(idx, 'name', e.target.value)}
                                                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                                    />
                                                </div>
                                                {formData.type === 'color' && (
                                                    <input
                                                        type="color"
                                                        className="w-10 h-10 p-1 rounded-xl bg-gray-50 border-none cursor-pointer"
                                                        value={val.value || '#000000'}
                                                        onChange={e => handleValueChange(idx, 'value', e.target.value)}
                                                    />
                                                )}
                                                {activeLang === 'en' && formData.type !== 'color' && (
                                                    <div className="flex-1">
                                                        <input
                                                            className="w-full px-4 py-2 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-xs font-bold opacity-70"
                                                            placeholder="Technical Value"
                                                            value={val.value || ''}
                                                            onChange={e => handleValueChange(idx, 'value', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveValue(idx)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover/val:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-zinc-900/50">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="attributeForm"
                                type="submit"
                                className="px-8 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl hover:shadow-lg transition-all text-sm font-black"
                            >
                                {editingAttr ? 'Save Changes' : 'Create Attribute'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
