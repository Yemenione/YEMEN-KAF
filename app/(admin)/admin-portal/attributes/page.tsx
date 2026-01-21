"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, GripVertical } from "lucide-react";

interface AttributeValue {
    id?: number;
    name: string;
    value: string; // Hex color or text
    position: number;
    translations?: Record<string, any>;
}

interface Attribute {
    id: number;
    name: string; // Internal name
    publicName: string | null; // Frontend label
    type: string; // select, color, radio
    values: AttributeValue[];
    translations?: Record<string, any>;
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
        translations?: Record<string, any>;
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
    const [loading, setLoading] = useState(false);

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

    const getValue = (field: string) => {
        if (activeLang === 'en') return formData[field as keyof typeof formData] as string;
        // @ts-expect-error: dynamic translation access
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
                        // @ts-expect-error: dynamic translation access
                        ...prev.translations?.[activeLang],
                        [field]: value
                    }
                }
            }));
        }
    };

    const getValueForValue = (index: number, field: keyof AttributeValue) => {
        const val = formData.values[index];
        if (activeLang === 'en') return val[field] as string;
        // @ts-expect-error: dynamic translation access
        return val.translations?.[activeLang]?.[field] || '';
    };

    const handleValueChange = (index: number, field: keyof AttributeValue, val: string) => {
        setFormData(prev => {
            const newValues = [...prev.values];
            if (activeLang === 'en') {
                // @ts-expect-error: indexing with dynamic field key
                newValues[index][field] = val;
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
        // Gather content
        const currentContent = {
            publicName: getValue('publicName'),
            values: formData.values.map((v, i) => ({ id: i, name: getValueForValue(i, 'name') }))
        };

        if (!currentContent.publicName) return alert(`Please fill in ${activeLang.toUpperCase()} Public Name first.`);

        setLoading(true);
        try {
            const { translateContent } = await import('@/app/actions/ai');
            const targetLangs = languages.filter(l => l.code !== activeLang).map(l => l.code);

            // 1. Translate Attribute Info
            const attrRes = await translateContent({ publicName: currentContent.publicName }, targetLangs, activeLang);

            // 2. Translate Values (batching might be needed for many values, but simplified here)
            // convert values to a map for translation: "key_0": "Blue", "key_1": "Red"
            const valuesMap: Record<string, string> = {};
            currentContent.values.forEach(v => { valuesMap[`val_${v.id}`] = v.name; });

            const valuesRes = await translateContent(valuesMap, targetLangs, activeLang);

            if (attrRes.data && valuesRes.data) {
                setFormData(prev => {
                    const next = { ...prev };

                    // Update Translations
                    targetLangs.forEach(lang => {
                        // Attribute
                        if (lang === 'en') {
                            next.publicName = attrRes.data[lang]?.publicName || next.publicName;
                        } else {
                            next.translations = {
                                ...next.translations,
                                [lang]: {
                                    ...next.translations?.[lang],
                                    publicName: attrRes.data[lang]?.publicName
                                }
                            };
                        }

                        // Values
                        next.values = next.values.map((v, i) => {
                            const newName = valuesRes.data[lang]?.[`val_${i}`];
                            if (!newName) return v;

                            if (lang === 'en') {
                                return { ...v, name: newName };
                            } else {
                                return {
                                    ...v,
                                    translations: {
                                        ...v.translations,
                                        [lang]: {
                                            ...v.translations?.[lang],
                                            name: newName
                                        }
                                    }
                                };
                            }
                        });
                    });

                    return next;
                });
            }

        } catch (e) {
            console.error(e);
            alert("Translation failed");
        } finally {
            setLoading(false);
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
                            <div>
                                <h3 className="text-xl font-semibold">{editingAttr ? 'Edit Attribute' : 'New Attribute'}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {languages.map(lang => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => setActiveLang(lang.code)}
                                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${activeLang === lang.code
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        {lang.flag} {lang.code.toUpperCase()}
                                    </button>
                                ))}
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 ml-4">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* AI Translate Button */}
                            {activeLang !== 'en' && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleAutoTranslate}
                                        disabled={loading}
                                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-purple-200 transition-colors flex items-center gap-1"
                                    >
                                        ✨ AI Translate to {languages.find(l => l.code === activeLang)?.label}
                                    </button>
                                </div>
                            )}

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
                                        disabled={activeLang !== 'en'}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Used in backend (English only)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Public Name ({activeLang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        placeholder="Coating Color"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={getValue('publicName')}
                                        onChange={e => setValue('publicName', e.target.value)}
                                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
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
                                            disabled={activeLang !== 'en'}
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
                                            disabled={activeLang !== 'en'}
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
                                            disabled={activeLang !== 'en'}
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
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder={`Label (${activeLang.toUpperCase()})`}
                                                    className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                                    value={getValueForValue(index, 'name')}
                                                    onChange={e => handleValueChange(index, 'name', e.target.value)}
                                                    dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                                />
                                            </div>

                                            {formData.type === 'color' && (
                                                <input
                                                    type="color"
                                                    className="w-10 h-10 p-0.5 border rounded-lg bg-transparent cursor-pointer"
                                                    value={val.value || "#000000"}
                                                    onChange={e => handleValueChange(index, 'value', e.target.value)}
                                                />
                                            )}
                                            {(formData.type === 'select' || formData.type === 'radio') && activeLang === 'en' && (
                                                <input
                                                    type="text"
                                                    placeholder="Value (technical)"
                                                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-gray-500"
                                                    value={val.value || ''}
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
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-[var(--coffee-brown)] text-white font-medium text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Attribute'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
