"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Eye, EyeOff, UploadCloud } from "lucide-react";
import Image from "next/image";

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    is_active: number; // 1 or 0
    display_order: number;
    parent_id?: number | null;
    meta_title?: string | null;
    meta_description?: string | null;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        image_url: "",
        is_active: 1,
        display_order: 0,
        parent_id: "",
        meta_title: "",
        meta_description: ""
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch {
            console.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || "",
            image_url: cat.image_url || "",
            is_active: cat.is_active,
            display_order: cat.display_order,
            parent_id: cat.parent_id !== null && cat.parent_id !== undefined ? String(cat.parent_id) : "",
            meta_title: cat.meta_title || "",
            meta_description: cat.meta_description || ""
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingCategory(null);
        setFormData({
            name: "",
            slug: "",
            description: "",
            image_url: "",
            is_active: 1,
            display_order: 0,
            parent_id: "",
            meta_title: "",
            meta_description: ""
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingCategory
            ? `/api/admin/categories/${editingCategory.id}`
            : '/api/admin/categories';

        const method = editingCategory ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    parent_id: formData.parent_id ? parseInt(String(formData.parent_id)) : null
                })
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchCategories();
            } else {
                alert("Failed to save category");
            }
        } catch {
            alert('Failed to save category');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This might affect products linked to this category.")) return;

        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCategories();
            }
        } catch {
            alert("Failed to delete");
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-[var(--coffee-brown)] dark:text-white">Categories</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your product categories and hierarchy</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--coffee-brown)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--honey-gold)]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Image</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Slug</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Order</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                        ) : filteredCategories.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-500">No categories found</td></tr>
                        ) : (
                            filteredCategories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="relative w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                                            {cat.image_url ? (
                                                <Image src={cat.image_url} alt={cat.name} fill sizes="40px" className="object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-300 text-xs">No Img</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{cat.name}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm font-mono">{cat.slug}</td>
                                    <td className="px-6 py-4 text-gray-500">{cat.display_order}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${cat.is_active
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            {cat.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No categories found</div>
                ) : (
                    filteredCategories.map((cat) => (
                        <div key={cat.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                            <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {cat.image_url ? (
                                    <Image src={cat.image_url} alt={cat.name} fill sizes="64px" className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-300 text-xs">No Img</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{cat.name}</h3>
                                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${cat.is_active
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                        {cat.is_active ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 font-mono truncate mb-2">{cat.slug}</p>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-gray-400">Order: {cat.display_order}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
                            <h3 className="text-xl font-semibold text-[var(--coffee-brown)] dark:text-white">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-4">
                            <form id="categoryForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                {/* Hierarchy Selector */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Parent Category</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                        value={formData.parent_id}
                                        onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                                    >
                                        <option value="">None (Top Level)</option>
                                        {categories
                                            .filter(c => c.id !== editingCategory?.id) // Prevent self-parenting
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Slug (optional)</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-gray-500"
                                            placeholder="auto-generated"
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Display Order</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            value={formData.display_order}
                                            onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 h-20"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Image</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                            placeholder="Image URL"
                                            value={formData.image_url}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        />
                                        <label className="flex items-center px-3 py-2 bg-gray-100 border rounded-lg cursor-pointer hover:bg-gray-200">
                                            <UploadCloud size={18} />
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
                                                    } catch { alert('Upload failed'); }
                                                    finally { setUploading(false); }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* SEO Section */}
                                <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg border border-gray-100 dark:border-zinc-700 space-y-3">
                                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">SEO Settings</h4>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-gray-500">Meta Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-600 text-sm"
                                            value={formData.meta_title}
                                            onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-gray-500">Meta Description</label>
                                        <textarea
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-600 text-sm h-16"
                                            value={formData.meta_description}
                                            onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, is_active: prev.is_active ? 0 : 1 }))}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {formData.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                        {formData.is_active ? 'Visible in Store' : 'Hidden'}
                                    </button>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-[var(--coffee-brown)] dark:bg-[var(--honey-gold)] text-white dark:text-black font-medium text-sm rounded-lg hover:opacity-90 flex items-center gap-2 transition-opacity shadow-sm"
                                    >
                                        <Save size={18} />
                                        Save Category
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div >
                </div >
            )
            }
        </div >
    );
}
