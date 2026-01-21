"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Save, X, Eye, EyeOff, UploadCloud } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { canAccessModule, hasPermission, Permission, AdminRole } from "@/lib/rbac";
import { toast } from "sonner";

interface LocalizedString {
    en: string;
    fr: string;
    ar: string;
}

interface Category {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    display_order: number;
    is_active: number;
    meta_title: string;
    meta_description: string;
    name_translations: LocalizedString;
    description_translations: LocalizedString;
    meta_title_translations: LocalizedString;
    meta_description_translations: LocalizedString;
}

const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'French', flag: '🇫🇷' },
    { code: 'ar', label: 'Arabic', flag: '🇾🇪' }
];

export default function CategoriesPage() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [activeLang, setActiveLang] = useState('en');
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        parent_id: '',
        name: '',
        slug: '',
        description: '',
        image_url: '',
        display_order: 0,
        is_active: 1,
        meta_title: '',
        meta_description: '',
        name_translations: { en: '', fr: '', ar: '' },
        description_translations: { en: '', fr: '', ar: '' },
        meta_title_translations: { en: '', fr: '', ar: '' },
        meta_description_translations: { en: '', fr: '', ar: '' }
    });

    const role = (user?.role || 'EDITOR') as AdminRole;
    const canManage = hasPermission(role, Permission.MANAGE_CATEGORIES);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({
            parent_id: '',
            name: '',
            slug: '',
            description: '',
            image_url: '',
            display_order: 0,
            is_active: 1,
            name_translations: { en: '', fr: '', ar: '' },
            description_translations: { en: '', fr: '', ar: '' },
            meta_title_translations: { en: '', fr: '', ar: '' },
            meta_description_translations: { en: '', fr: '', ar: '' },
            meta_title: '',
            meta_description: ''
        });
        setIsModalOpen(true);
        setActiveLang('en');
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            parent_id: category.parent_id?.toString() || '',
            name: category.name,
            slug: category.slug,
            description: category.description,
            image_url: category.image_url,
            display_order: category.display_order,
            is_active: category.is_active,
            name_translations: category.name_translations || { en: category.name, fr: '', ar: '' },
            description_translations: category.description_translations || { en: category.description, fr: '', ar: '' },
            meta_title_translations: category.meta_title_translations || { en: category.meta_title, fr: '', ar: '' },
            meta_description_translations: category.meta_description_translations || { en: category.meta_description, fr: '', ar: '' },
            meta_title: category.meta_title,
            meta_description: category.meta_description
        });
        setIsModalOpen(true);
        setActiveLang('en');
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.products.confirmDelete'))) return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Category deleted");
                fetchCategories();
            }
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleAutoTranslate = async () => {
        const sourceText = formData.name_translations.en;
        if (!sourceText) {
            toast.error("Enter English name first");
            return;
        }

        setUploading(true);
        try {
            const res = await fetch('/api/admin/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: sourceText,
                    targetLangs: languages.filter(l => l.code !== 'en').map(l => l.code)
                })
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({
                    ...prev,
                    name_translations: { ...prev.name_translations, ...data.translations }
                }));
                toast.success("Translations generated!");
            }
        } catch {
            toast.error("Translation failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
        const method = editingCategory ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingCategory ? "Category updated" : "Category created");
                setIsModalOpen(false);
                fetchCategories();
            } else {
                const err = await res.json();
                toast.error(err.error || "Operation failed");
            }
        } catch {
            toast.error("Network error");
        }
    };

    const getValue = (field: 'name' | 'description' | 'meta_title' | 'meta_description') => {
        const translations = (formData as any)[`${field}_translations`];
        return (translations as any)[activeLang] || '';
    };

    const setValue = (field: 'name' | 'description' | 'meta_title' | 'meta_description', val: string) => {
        setFormData(prev => ({
            ...prev,
            [`${field}_translations`]: {
                ...(prev as any)[`${field}_translations`],
                [activeLang]: val
            },
            // Update root field if it's English
            ...(activeLang === 'en' ? { [field]: val } : {})
        }));
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Save className="w-6 h-6 text-[var(--coffee-brown)]" />
                        {t('admin.sidebar.items.categories')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Organize your product hierarchy and seasonal collections.</p>
                </div>

                {canManage && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-zinc-500/10 transition-all text-sm font-bold"
                    >
                        <Plus size={18} /> {t('admin.products.addNew')}
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
                            placeholder="Explore collections..."
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-6 py-4">{t('admin.products.image')}</th>
                                <th className="px-6 py-4">{t('admin.products.name')}</th>
                                <th className="px-6 py-4">{t('admin.products.form.slug')}</th>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4">{t('admin.common.status')}</th>
                                <th className="px-6 py-4 text-right">{t('admin.common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">{t('admin.common.loading')}</td></tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400 font-bold uppercase tracking-widest">{t('admin.common.noResults')}</td></tr>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all">
                                        <td className="px-6 py-3">
                                            <div className="relative w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-700 shadow-sm">
                                                {cat.image_url ? (
                                                    <Image src={cat.image_url} alt={cat.name} fill sizes="40px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-300 text-[10px] font-bold">NO IMG</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{cat.name}</p>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-gray-500 font-mono">{cat.slug}</td>
                                        <td className="px-6 py-3 text-sm text-gray-500 font-bold">{cat.display_order}</td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${cat.is_active
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                                                }`}>
                                                {cat.is_active ? t('admin.common.active') : t('admin.common.inactive')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleEdit(cat)}
                                                    className="p-2 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl hover:bg-[var(--coffee-brown)] hover:text-white shadow-sm transition-all group/btn"
                                                >
                                                    <Edit size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
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
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-400">{t('admin.common.noResults')}</div>
                    ) : (
                        filteredCategories.map((cat) => (
                            <div key={cat.id} className="bg-gray-50/50 dark:bg-zinc-800/30 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
                                <div className="relative w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                                    {cat.image_url ? (
                                        <Image src={cat.image_url} alt={cat.name} fill sizes="56px" className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300 text-[10px]">NO IMG</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{cat.name}</h3>
                                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg ${cat.is_active
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-zinc-100 text-zinc-400'
                                            }`}>
                                            {cat.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono truncate mb-1.5">{cat.slug}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400"># {cat.display_order}</span>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="p-1.5 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg text-blue-600 shadow-sm"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-1.5 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg text-rose-600 shadow-sm"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
                            <h3 className="text-lg font-bold text-[var(--coffee-brown)] dark:text-white">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
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

                        <div className="overflow-y-auto p-6 space-y-5">
                            <form id="categoryForm" onSubmit={handleSubmit} className="space-y-5">
                                {activeLang !== 'en' && (
                                    <button
                                        type="button"
                                        onClick={handleAutoTranslate}
                                        disabled={uploading}
                                        className="w-full py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 border border-purple-100"
                                    >
                                        ✨ AI Translate to {languages.find(l => l.code === activeLang)?.label}
                                    </button>
                                )}

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">{t('admin.products.name')} ({activeLang.toUpperCase()})</label>
                                    <input
                                        required={activeLang === 'en'}
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                                        value={getValue('name')}
                                        onChange={e => setValue('name', e.target.value)}
                                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">{t('admin.products.category')}</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                                        value={formData.parent_id}
                                        onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                                    >
                                        <option value="">None (Top Level)</option>
                                        {categories
                                            .filter(c => c.id !== editingCategory?.id)
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Slug</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold opacity-70"
                                            placeholder="auto-generated"
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Order</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                                            value={formData.display_order}
                                            onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">{t('admin.products.form.description')} ({activeLang.toUpperCase()})</label>
                                    <textarea
                                        className="w-full px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold min-h-[80px]"
                                        value={getValue('description')}
                                        onChange={e => setValue('description', e.target.value)}
                                        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Image URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 px-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-[var(--coffee-brown)]/20 transition-all outline-none text-sm font-bold"
                                            value={formData.image_url}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        />
                                        <label className="p-2.5 bg-gray-100 dark:bg-zinc-800 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors">
                                            <UploadCloud size={20} className="text-gray-500" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                disabled={uploading}
                                                onChange={async (e) => {
                                                    if (!e.target.files?.[0]) return;
                                                    setUploading(true);
                                                    const file = e.target.files[0];
                                                    const form = new FormData();
                                                    form.append('file', file);
                                                    form.append('folder', 'categories');
                                                    try {
                                                        const res = await fetch('/api/admin/media/upload', { method: 'POST', body: form });
                                                        if (res.ok) {
                                                            const data = await res.json();
                                                            setFormData(prev => ({ ...prev, image_url: data.path }));
                                                        }
                                                    } catch { toast.error('Upload failed'); }
                                                    finally { setUploading(false); }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, is_active: prev.is_active ? 0 : 1 }))}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${formData.is_active
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                                            }`}
                                    >
                                        {formData.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                        {formData.is_active ? t('admin.common.active') : t('admin.common.inactive')}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="categoryForm"
                                type="submit"
                                className="px-8 py-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-xl hover:shadow-lg transition-all text-sm font-black"
                            >
                                {editingCategory ? 'Save Changes' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
